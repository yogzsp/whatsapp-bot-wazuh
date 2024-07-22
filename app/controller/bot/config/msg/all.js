const {Agent} = require("../../../../models");
const { addAgent, getAgent, addActiveResponse, deleteActiveResponse } = require("../../../wazuh.controllers");
const listPackages = `List package yang tersedia saat ini :\n*LINUX*:\n1. DEB amd64\n2. DEB aarch64\n3. RPM amd64\n4. RPM aarch64`
require('dotenv').config();
const wazuhServer = process.env.WAZUH_SERVER_IP;

const allChatMember = async(ctrl)=>{
    switch(ctrl.prefix){
        case "/new-agent":
            try{
                const dataAgent = ctrl.value ? (ctrl.value).split(" "):" ";
                
                if(dataAgent.length!=3){
                    ctrl.kirimPesan(`Hi, perintah untuk membuat agent baru adalah : \n*/new-agent <NO URUT PACKAGE> <NAMA AGENT SERVER> <IP SERVER ANDA>* \ncontoh : */new_agent 1 serverWazuh 8.8.8.8* \nuntuk melihat list package adalah dengan mengirimkan pesan */packages* pada bot atau bisa melihatnya disini : \n${listPackages}`)
                }else{
                    if(parseInt(dataAgent[0]) < 5 && parseInt(dataAgent[0]) > 0){
                        const statusPenambahan = await addAgent(dataAgent[1]+"_"+ctrl.idUser,dataAgent[2]);
                        console.log(statusPenambahan);
                        if(statusPenambahan.status){
                            const idAgent = statusPenambahan.data.id;
                            let perintahTerminal
                            switch(dataAgent[0]){
                                case "1":
                                    perintahTerminal = `sudo wget -O - https://raw.githubusercontent.com/yogzsp/wazuh/a8e55638545403a512554f3d24164cfe97b05eee/wazuh_agent_deb_amd64.sh | sudo bash -s -- ${wazuhServer} ${statusPenambahan.data.key}`;
                                    break;
                                case "2":
                                    perintahTerminal = `sudo wget -O - https://github.com/yogzsp/wazuh/blob/a8e55638545403a512554f3d24164cfe97b05eee/wazuh_agent_deb_aarch64.sh | sudo bash -s -- ${wazuhServer} ${statusPenambahan.data.key}`;
                                    break;
                                case "3":
                                    perintahTerminal = `sudo wget -O - https://github.com/yogzsp/wazuh/blob/a8e55638545403a512554f3d24164cfe97b05eee/wazuh_agent_rpm_amd64.sh | sudo bash -s -- ${wazuhServer} ${statusPenambahan.data.key}`;
                                    break;
                                case "4":
                                    perintahTerminal = `sudo wget -O - https://github.com/yogzsp/wazuh/blob/a8e55638545403a512554f3d24164cfe97b05eee/wazuh_agent_rpm_aarch64.sh | sudo bash -s -- ${wazuhServer} ${statusPenambahan.data.key}`;
                                    break;
                            }
                            const agentDatabase = Agent.create({
                                number:ctrl.no,
                                agent:idAgent
                            });
                            ctrl.kirimPesan(`Berhasil menambahkan agent, data agent anda adalah : \n1. Nama Agent : ${dataAgent[1]}\n2. ID Agent : ${idAgent}\nMasukan perintah berikut pada terminal Linux anda untuk menghubungkan server anda kedalam server SIEM kami! : \n\n*${"`"+perintahTerminal+"`"}*\n\nKirimkan pesan /status <ID AGENT>`);
                        }else{
                            ctrl.kirimPesan(statusPenambahan.msg.replace("_"+ctrl.idUser,""));
                        }
                    }else{
                        ctrl.kirimPesan(`Hi, perintah untuk membuat agent baru adalah : \n*/new_agent <NO URUT PACKAGE> <NAMA AGENT SERVER> <IP SERVER ANDA>* \ncontoh : */new_agent 1 serverWazuh 8.8.8.8* \nuntuk melihat list package adalah dengan mengirimkan pesan */packages* pada bot atau bisa melihatnya disini : \n${listPackages}`)
                    }
                }
            }catch(error){
                console.log(error);
                ctrl.kirimPesan(`Hi, perintah untuk membuat agent baru adalah : \n*/new-agent <NO URUT PACKAGE> <NAMA AGENT SERVER> <IP SERVER ANDA>* \ncontoh : */new-agent 1 8.8.8.8* \nuntuk melihat list package adalah dengan mengirimkan pesan */packages* pada bot atau bisa melihatnya disini : \n${listPackages}`)
            }
            break;
        // mengaktifkan active response
        case "/add-response":
            try{
                const dataAgent = ctrl.value ? (ctrl.value).split(" "):" ";
                
                if(dataAgent.length != 4){
                    ctrl.kirimPesan(`Hi, perintah untuk membuat menambahkan active response adalah : \n*/add-response <ID AGENT> <NO URUT RESPONSE> <LEVEL ALERT MINIMAL> <DETIK WAKTU BLOCKIR>* \ncontoh : */add-response 001 1 3 60* \n\nLIST URUT RESPONSE\n1. Untuk memblockir IP Penyerang dari anomali pada SSH\n2. Untuk memblockir IP penyerang dari serangan pada website seperti SQL Injection, XSS, File Inclusion dan lainnya.`)
                }else{
                    if(parseInt(dataAgent[2]) < 16 && parseInt(dataAgent[2]) > 2){
                        const agentData = await getAgent(dataAgent[0])
                        if(agentData.status){
                            console.log(agentData.status)
                            const addResponse = await addActiveResponse(dataAgent[0],dataAgent[1],dataAgent[2],dataAgent[3]);
                            console.log(addActiveResponse)
                            if(addResponse.status){
                                ctrl.kirimPesan(addResponse.msg);
                            }else{
                                ctrl.kirimPesan(`Gagal menambahkan Active Response. perintah untuk membuat menambahkan active response adalah : \n*/add-response <ID AGENT> <NO URUT RESPONSE> <LEVEL ALERT MINIMAL> <DETIK WAKTU BLOCKIR>* \ncontoh : */add-response 001 1 3 60* \n\nLIST URUT RESPONSE\n1. Untuk memblockir IP Penyerang dari anomali pada SSH\n2. Untuk memblockir IP penyerang dari serangan pada website seperti SQL Injection, XSS, File Inclusion dan lainnya.`)
                            }
                        }else{
                            ctrl.kirimPesan("Agent tidak di temukan!");
                        }
                    }else{
                    }
                }
            }catch(error){
                console.log(error);
                ctrl.kirimPesan(`Hi, perintah untuk membuat menambahkan active response adalah : \n*/add-response <ID AGENT> <NO URUT RESPONSE> <LEVEL ALERT MINIMAL> <DETIK WAKTU BLOCKIR>* \ncontoh : */add-response 001 1 3 60* \n\nLIST URUT RESPONSE\n1. Untuk memblockir IP Penyerang dari anomali pada SSH\n2. Untuk memblockir IP penyerang dari serangan pada website seperti SQL Injection, XSS, File Inclusion dan lainnya.`)
            }
            break;
        case "/del-response":
            try{
                const dataAgent = ctrl.value ? (ctrl.value).split(" "):" ";
                
                if(dataAgent.length != 2){
                    ctrl.kirimPesan(`Hi, perintah untuk membuat menghapus active response adalah : \n*/del-response <ID AGENT> <NO URUT RESPONSE>* \ncontoh : */del-response 001 1* \n\nLIST URUT RESPONSE\n1. Untuk memblockir IP Penyerang dari anomali pada SSH\n2. Untuk memblockir IP penyerang dari serangan pada website seperti SQL Injection, XSS, File Inclusion dan lainnya.`)
                }else{
                    const agentData = await getAgent(dataAgent[0])
                    if(agentData.status){
                        console.log(agentData.status)
                        const deleteResponse = await deleteActiveResponse(dataAgent[0],dataAgent[1]);
                        console.log(deleteResponse)
                        if(deleteResponse.status){
                            ctrl.kirimPesan(deleteResponse.msg);
                        }else{
                            ctrl.kirimPesan(`Gagal menghapus Active Response. perintah untuk membuat menambahkan active response adalah : \n*/add-response <ID AGENT> <NO URUT RESPONSE> <LEVEL ALERT MINIMAL> <DETIK WAKTU BLOCKIR>* \ncontoh : */add-response 001 1 3 60* \n\nLIST URUT RESPONSE\n1. Untuk memblockir IP Penyerang dari anomali pada SSH\n2. Untuk memblockir IP penyerang dari serangan pada website seperti SQL Injection, XSS, File Inclusion dan lainnya.`)
                        }
                    }else{
                        ctrl.kirimPesan("Agent tidak di temukan!");
                    }
                }
            }catch(error){
                console.log(error);
                ctrl.kirimPesan(`Hi, perintah untuk membuat menghapus active response adalah : \n*/del-response <ID AGENT> <NO URUT RESPONSE>* \ncontoh : */del-response 001 1* \n\nLIST URUT RESPONSE\n1. Untuk memblockir IP Penyerang dari anomali pada SSH\n2. Untuk memblockir IP penyerang dari serangan pada website seperti SQL Injection, XSS, File Inclusion dan lainnya.`)
            }
            break;
        case "/packages":
            ctrl.kirimPesan(listPackages);
            break;
        case "/status":
            const agentData = await getAgent(ctrl.value)
            if(agentData.status){
                console.log(agentData)
                if(agentData.data.status != "never_connected"){
                    let kalimat = `ID: ${agentData.data.id}\nName: ${agentData.data.name.split("_").splice(0)[0]}\nStatus: ${agentData.data.status}\nDisconnection Time: ${agentData.data.disconnection_time}\nLast Keep Alive: ${agentData.data.lastKeepAlive}\nIP: ${agentData.data.ip}\nDate Added: ${agentData.data.dateAdd}\nManager: ${agentData.data.manager}\nNode Name: ${agentData.data.node_name}\nWazuh Version: ${agentData.data.version}\nGroup Config Status: ${agentData.data.group_config_status}\nOS Name: ${agentData.data.os.name}\nOS Version: ${agentData.data.os.version}\nOS Codename: ${agentData.data.os.codename}\nOS Architecture: ${agentData.data.os.arch}\nPlatform: ${agentData.data.os.platform}\nUname: ${agentData.data.os.uname}\nConfig Sum: ${agentData.data.configSum}\nMerged Sum: ${agentData.data.mergedSum}\nGroup: ${agentData.data.group.join(", ")}\nRegister IP: ${agentData.data.registerIP}\nStatus Code: ${agentData.data.status_code}`;
                    ctrl.kirimPesan(kalimat);
                }else{
                    let kalimat = `ID: ${agentData.data.id}\nName: ${agentData.data.name.split("_").splice(0)[0]}\nStatus: ${agentData.data.status}\nDate Added: ${agentData.data.dateAdd}\nIP: ${agentData.data.ip}\nRegister IP: ${agentData.data.registerIP}\nNode Name: ${agentData.data.node_name}\nStatus Code: ${agentData.data.status_code}\nGroup Config Status: ${agentData.data.group_config_status}`;
                    ctrl.kirimPesan(kalimat);
                }
            }else{
                ctrl.kirimPesan("Agent tidak di temukan!");
            }
            break;
        case "/respone":
            const dataAgent = ctrl.value ? (ctrl.value).split(" "):" ";
            const listRespone = `Daftar respone yang tersedia : \n1. *default-firewall-drop*: Memblokir alamat IP dengan menambahkan aturan ke firewall sistem default.\n2. *firewall-drop*: Memblokir alamat IP dengan menambahkan aturan ke firewall tertentu (misalnya, iptables).\n3. *ipfw* : Menggunakan firewall ipfw untuk memblokir alamat IP.\n4. *npf*: Menggunakan NetBSD Packet Filter (NPF) untuk memblokir alamat IP.\n5. *host-deny* : Menambahkan alamat IP ke file /etc/hosts.deny untuk memblokirnya.\n6. *firewalld-drop* : Memblokir alamat IP menggunakan firewalld.`
                
            if(dataAgent.length!=2){
                const responeNumber = dataAgent[1];
                const agentID = dataAgent[0];
                const agentData = await getAgent(agentID);
                if(agentData.status){
                    switch(responeNumber){
                        case "1":
                            break
                        case "2":
                            break
                        case "3":
                            break
                        case "4":
                            break
                        case "5":
                            break
                        default:            
                            ctrl.kirimPesan(listRespone);
                            break
                    }
                }else{
                    ctrl.kirimPesan("Agent tidak di temukan!");
                }
            }else{
                ctrl.kirimPesan("Hi, perintah untuk menerapkan respone ke agent adalah /respone <ID AGENT ANDA> <NO URUT RESPONE>. Contoh : */respone 001 1*.\n\n"+listRespone);
            }
            break;
        default:
            
            break;
    }
}

exports.allChat = async(ctrl)=>{
    switch(ctrl.grup){
        case true:
            allChatMember(ctrl)
            break
        case false:
            allChatMember(ctrl)
            break
    }
}