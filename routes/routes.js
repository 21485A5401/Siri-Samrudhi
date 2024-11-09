const express = require('express');
const router = express.Router();

// routes
const chatbot = require('../controllers/chartbot.js');
const admin = require('../controllers/admin.js');



// chartbot routes
router.get('/SiriSamrudhiwebhook', chatbot.verifyWebhooks);
router.post('/SiriSamrudhiwebhook', chatbot.receiveEvents);
router.post('/testmessages', chatbot.receiveEventsTest);



router.get('/get', admin.getapi);
router.get('/getdata', admin.getapi);

module.exports = router;
