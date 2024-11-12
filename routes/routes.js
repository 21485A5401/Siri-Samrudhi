const express = require('express');
const router = express.Router();

// routes
const chatbot = require('../controllers/chartbot.js');
const admin = require('../controllers/admin.js');
const isLogin = require('../middleware/isLogin.js');
const multer = require('multer');
const path = require('path');


// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/'); // Specify the directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Set file name with extension
    }
});

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only image files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });


// chartbot routes
router.get('/SiriSamrudhiwebhook', chatbot.verifyWebhooks);
router.post('/SiriSamrudhiwebhook', chatbot.receiveEvents);
router.post('/testmessages', chatbot.receiveEventsTest);



router.get('/get', admin.getapi);
router.get('/getdata', admin.getapi);
router.post('/Register', admin.adminRegister);
router.post('/Login', admin.adminLogin);
router.get('/UsersList', isLogin, admin.getUsers);
router.get('/getDashboardCount', isLogin, admin.getDashboardCount);
router.post('/addProduct', upload.single('image'), admin.addProduct);
router.put('/editProduct', isLogin, upload.single('image'), admin.editProduct);
router.get('/getProduct', admin.getProduct);

module.exports = router;
