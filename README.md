# WHATSAPP-BOT-WAZUH
Hi, ini adalah project Whatsapp Bot yang saya buat menggunakan library venom-bot. project ini bertujuan untuk melakukan monitoring terhadap serangan-serangan yang ada pada server dan melakukan otomatisasi terhadap active-response pada Wazuh. Project ini masih dalam tahap pengembangan pada active-response yang akan digunakan. Anda dapat menginstall program ini pada server anda yang sudah terinstall dengan Wazuh Server.
```bash
git clone https://github.com/yogzsp/whatsapp-bot-wazuh.git
cd whatsapp-bot-wazuh
npm install
```
Pastikan anda telah melakukan cloning project ini pada server anda dan mengatur program ini agar bisa berjalan secara root pada server. Project ini memerlukan database mysql dengan data yang bisa anda konfigurasi sendiri pada direktori **./app/config/config.json**.
```bash
vim ./app/config/config.json
```
setelah itu anda bisa menjalankan perintah untuk melakukan re-configure pada databasenya dengan menjalankannya pada terminal. setelah itu anda bisa menggunakan program ini dengan menjalankan perintahnya juga pada terminal.
```bash
npm run start:db
npm start
```