const express = require('express');
const router = express.Router();

const chatbot = require('../controllers/chartbot.js');
const admin = require('../controllers/admin.js');


router.get('/SiriSamrudhiwebhook', chatbot.verifyWebhooks);
router.post('/SiriSamrudhiwebhook', chatbot.receiveEvents);
router.post('/testmessages', chatbot.receiveEventsTest);



router.get('/get', admin.getapi);
router.get('/getData', admin.getapi);

module.exports = router;
