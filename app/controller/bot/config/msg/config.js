class Control{
    constructor(data,client) {
        this.id=data.id;
        this.tipe=data.type;
        this.no=data.from;
        this.idUser=(data.from).replace("@","-");
        this.body=data.body;
        this.nama=data.sender.pushname;
        this.chat=data.content;
        this.grup=data.isGroupMsg;
        this.client=client;
        this.value = data.content.split(' ').splice(1).join(' ');
        this.valueKecil = (data.content).toLowerCase().split(' ').splice(1).join(' ');
        this.prefix = (data.content).toLowerCase().split(' ').splice(0)[0];
        this.bot = "mada"
        this.ig = "https://instagram.com/yogisryprn/"
        this.copyright = `\n\n*Made by : ${this.ig}*`
    }

    kirimPesan(pesan){
        this.client.reply(
            this.no,
            pesan,
            this.id
          ).then((result) => {
            //   console.log('Result: ', result); //return object success
          }).catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
          });
    }

    kirimFotoBS4(file){
        this.client.sendImageFromBase64(this.no, file, "Mada bot")
        .then((result) => {
        //   console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }

    kirimFoto(file, capt){
        this.client.sendImage(this.no, file, "Mada bot",capt)
        .then((result) => {
        //   console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }
}

module.exports = {
    Control
}