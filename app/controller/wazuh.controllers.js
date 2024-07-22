require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execProm = util.promisify(exec);
const {Command} = require("../models");
const axios = require('axios');

// const ossecConfigPath = '/var/ossec/etc/ossec.conf';
const sshAddScript = path.resolve(__dirname, './response/ssh-add.sh');
const webAddScript = path.resolve(__dirname, './response/web-add.sh');
const sshRemScript = path.resolve(__dirname, './response/ssh-rem.sh');
const webRemScript = path.resolve(__dirname, './response/web-rem.sh');

const user = process.env.WAZUH_USER;
const password = process.env.WAZUH_PASSWORD;
const serverURL = process.env.WAZUH_SERVER;
const basicAuth = Buffer.from(`${user}:${password}`).toString('base64');
const loginHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${basicAuth}`
};


const getToken = async () => {
    try {
        const loginUrl = `${serverURL}/security/user/authenticate`;
        const response = await axios.post(loginUrl, {}, { headers: loginHeaders, httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });
        return response.data.data.token;
    } catch (error) {
        console.error('Error getting token:', error);
        throw error;
    }
};

// Endpoint untuk menambah agent
const addAgent = async (name,ip) => {
    try {
        const token = await getToken();
        const requestsHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const payload = {
            name: name,
            ip: ip
        };
        const addAgentUrl = `${serverURL}/agents/?wait_for_complete=true`;

        const response = await axios.post(addAgentUrl, payload, { headers: requestsHeaders, httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });
        return {
            status:true,
            msg:"Berhasil menambahkan agent!",
            data:response.data.data
        };
    } catch (error) {
        console.error('Error adding agent:', error);
        return {
            status:false,
            msg:error.response.data.detail+". *"+error.response.data.remediation+"*"
        };
    }
};

const getAgent = async(agent_id)=>{
    try{
        const token = await getToken();
        const requestsHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const addAgentUrl = `${serverURL}/agents`;
        const response = await axios.get(addAgentUrl, { headers: requestsHeaders, httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });
        const searchID = response.data.data.affected_items.find(item=>item.id===agent_id)
        if(searchID){
            return {
                status:true,
                msg:"Berhasil mendapatkan agent!",
                data:searchID
            };
        }
        return {
            status:false,
            msg:"Data tidak di temukan!"
        }
    }catch(error){
        console.log(error);
        return {
            status:false,
            msg:error.response.data.detail+". *"+error.response.data.remediation+"*"
        };
    }
}

const addActiveResponse = async (agent_id, configChoice, levelResponse, delayResponse) => {
    try {
        // Check agent data first
        const agentData = await getAgent(agent_id);
        if (!agentData.status) {
            return {
                status: false,
                msg: agentData.msg
            };
        }
        console.log(agent_id, configChoice, levelResponse, delayResponse);

        const addResponseDatabase = await Command.findOrCreate({
            where : {
                id_agent:agent_id,
                command:configChoice,
            },
            defaults:{
                id_agent:agent_id,
                level:levelResponse,
                command:configChoice,
                delay:delayResponse
            }
        });
        if(!addResponseDatabase[1]){
            return {
                status: true,
                msg: 'Active Response yang anda masukan sudah dimasukan sebelumnya!'
            };
        }

        if (configChoice == 1) {
            try {
                await execProm(`sudo bash ${sshAddScript} ${agent_id} ${levelResponse} ${delayResponse}`);
                console.log("lewat");
            } catch (error) {
                console.error(`Error executing ssh-add.sh: ${error.message}`);
            }
        } else if (configChoice == 2) {
            try {
                await execProm(`sudo bash ${webAddScript} ${agent_id} ${levelResponse} ${delayResponse}`);
                console.log("lewat");
            } catch (error) {
                console.error(`Error executing web-add.sh: ${error.message}`);
            }
        }

        return {
            status: true,
            msg: 'Berhasil menambahkan active response'
        };
    } catch (error) {
        console.error('Error adding active response:', error);
        return {
            status: false,
            msg: 'Error adding active response'
        };
    }
};

  
  // Fungsi untuk menghapus konfigurasi active-response
  const deleteActiveResponse = async (agent_id, configChoice) => {
    try {
        // Check agent data first
        const agentData = await getAgent(agent_id);
        if (!agentData.status) {
            return {
                status: false,
                msg: agentData.msg
            };
        }

        // Find the active response entry
        const activeResponse = await Command.findOne({
            where: {
                id_agent: agent_id,
                command: configChoice,
            }
        });
        console.log(activeResponse);

        if (!activeResponse) {
            return {
                status: false,
                msg: 'Active Response tidak ditemukan!'
            };
        }

        

        // Execute the corresponding bash script to remove the configuration
        if (configChoice == 1) {
            try {
                await execProm(`sudo bash ${sshRemScript} ${agent_id} ${activeResponse.dataValues.level} ${activeResponse.dataValues.delay}`);
                console.log("ssh-rem.sh executed");
            } catch (error) {
                console.error(`Error executing ssh-rem.sh: ${error.message}`);
            }
        } else if (configChoice == 2) {
            try {
                await execProm(`sudo bash ${webRemScript} ${agent_id} ${activeResponse.dataValues.level} ${activeResponse.dataValues.delay}`);
                console.log("web-rem.sh executed");
            } catch (error) {
                console.error(`Error executing web-rem.sh: ${error.message}`);
            }
        }

        await Command.destroy({
            where: {
                id_agent: agent_id,
                command: configChoice,
            }
        });

        return {
            status: true,
            msg: 'Berhasil menghapus active response'
        };
    } catch (error) {
        console.error('Error deleting active response:', error);
        return {
            status: false,
            msg: 'Error deleting active response'
        };
    }
};

module.exports={
    addAgent,
    getAgent,
    addActiveResponse,
    deleteActiveResponse
}