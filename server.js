const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
const path = require('path');

app.use(cors())

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// routes
const messageRoutes = require("./app/routes/message.routes");


app.use('/api', messageRoutes)

const {PORT, HOSTNAME} = process.env

app.listen(PORT, () => {
  console.log(`Tunggu proses selesai!`)
})
