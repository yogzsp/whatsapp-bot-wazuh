// inisilisialisasi bot
require('dotenv').config();

const {PORT, HOSTNAME} = process.env

const venom = require('venom-bot');
// const { teks } = require('./bot/chat');
const { Control } = require("./bot/config/msg/config");
const pesan = require('./bot/config/msg/index');
const {Agent} = require("../models");
const { getAgent } = require('./wazuh.controllers');
var client;

venom
  .create({
    session: 'yogi-bot'
  })
  .then((options) => {
    monitoringChat(options)
    client = options;
    console.log(`Server telah berjalan :  http://${HOSTNAME}:${PORT}`)
  })
  .catch((erro) => {
    console.log(erro);
  });

//   konfigurasi untuk chat masuk
const monitoringChat = async function(client){
    client.onMessage( async(message) => {
       const ctrl = new Control(message,client);
       pesan.allChat(ctrl);
    });
}


// controllernya
const getDataWazuh = async(req, res)=>{
    const wazuhData = req.body.data;
    const typeData = req.body.type;
    try{
        const dataUser = await Agent.findOne({
            where:{
                agent:wazuhData['agent_id']
            }
        })
        if(!dataUser){
            res.status(404).json({
                status:false,
                msg:"Agent tidak di temukan!"
            })
        }
        let msg;
        const pengguna = dataUser.dataValues
        console.log(wazuhData);
        console.log(pengguna)
        if(typeData === "block"){
            msg = `*WAZUH BLOCK NOTIFICATION*\n- *Title*: ${wazuhData.title}\n- Level: ${wazuhData.level}\n- IP SRC: ${wazuhData.attacker}\n- Groups: ${wazuhData.groups}\n- *Agent*: ${wazuhData.agent_name.split("_")[0]} (${wazuhData.agent_id})\n\n${wazuhData.desc}`
        }else{
            msg = `*WAZUH ALERT NOTIFICATION*\n- *Title*: ${wazuhData.title}\n- Level: ${wazuhData.level}\n- IP SRC: ${wazuhData.attacker}\n- Groups: ${wazuhData.groups}\n- *Agent*: ${wazuhData.agent_name.split("_")[0]} (${wazuhData.agent_id})\n\n${wazuhData.desc}`
        }
        // console.log(number,msg);
        await client.sendText(pengguna.number,msg);
        res.status(200).json({
            status:true,
            msg:"Pesan berhasil di kirim!"
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            status:false,
            msg:error
        })
    }
}

const tester = async(req,res)=>{
    try{
        const data = req.body;
        const agent = await getAgent(data.id);
        res.status(200).json(agent);
    }catch(error){
        res.status(500).json({
            status:false,
            error
        })
    }
}

module.exports = {
    getDataWazuh,
    tester
}