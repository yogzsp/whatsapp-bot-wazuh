const route = require('express').Router()
const {getDataWazuh} = require('../controller/message.controller');

route.post('/notif', getDataWazuh);


module.exports = route