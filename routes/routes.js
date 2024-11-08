const express = require('express');
const router = express.Router();

const chatbot = require('../controllers/chartbot.js');


router.get('/SiriSamrudhiwebhook', chatbot.verifyWebhooks);
router.post('/SiriSamrudhiwebhook', chatbot.receiveEvents);
router.post('/testmessages', chatbot.receiveEventsTest);

module.exports = router;
