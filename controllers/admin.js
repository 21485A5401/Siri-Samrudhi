const { hashPassword, ispasswordMatch } = require("../middleware/Helper");
const admin = require("../models/admin");
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const Products = require("../models/Products");
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const dotenv = require("dotenv");
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const Excel = require("../models/Excel");
const xlsx = require('xlsx');
const { default: axios } = require("axios");
dotenv.config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/");
    },
    filename: function (req, file, cb) {
        const uuid = uuidv4();
        // const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
        cb(null, `excel-${uuid}.xlsx`);
    }
});

const upload = multer({ storage: storage });


const getapi = async (req, res) => {
    try {
        res.status(200).json("This Is get API")
    } catch (error) {
        console.log(error);
    }
}
// admin Register
const adminRegister = async (req, res) => {
    try {
        const { Name, Email, Password } = req.body;
        await admin.create({ Name, Email, Password: await hashPassword(Password) });
        res.status(200).json("Admin Registered Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    /*
    #swagger.tags = ['Admin']
    */
}
//Admin Login
const adminLogin = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const adminData = await admin.findOne({ Email });
        if (!adminData) return res.status(400).json({ success: false, message: "Email Not Found" });
        const isMatch = await ispasswordMatch(Password, adminData.Password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid Password" });
        const token = jwt.sign({ _id: adminData._id }, process.env.JWT_ACCESS_TOKEN);
        return res.status(200).json({ success: true, message: "Login Successfully", token });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    /*
    #swagger.tags = ['Admin']
    */
}

//get Dashboard List
const getDashboardCount = async (req, res) => {
    try {
        const adminId = req.userid._id;
        const adminData = await admin.findOne({ _id: adminId });
        if (!adminData) return res.status(400).json({ success: false, message: 'Admin Not Found' });
        const users = await User.countDocuments({});
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    /*
    #swagger.tags = ['Admin']
    */
}

//get Users List
const getUsers = async (req, res) => {
    try {
        const adminId = req.userid._id;
        const adminData = await admin.findOne({ _id: adminId });
        if (!adminData) return res.status(400).json({ success: false, message: 'Admin Not Found' });
        const users = await User.find({}).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    /*
    #swagger.tags = ['Admin']
    */
}

//add product api
const addProduct = async (req, res) => {
    try {
        const adminId = req.userid._id;
        const adminData = await admin.findOne({ _id: adminId });
        if (!adminData) return res.status(400).json({ success: false, message: 'Admin Not Found' });
        const { description } = req.body;
        console.log(req.file);
        console.log(description);

        await Products.create({
            image: req.file.filename,
            description: description
        });
        return res.status(200).json({ success: true, message: "Product created successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
    /*
    #swagger.tags = ['Admin']
    */
}
//edit product api


const editProduct = async (req, res) => {
    try {
        const adminId = req.userid._id;
        const adminData = await admin.findOne({ _id: adminId });
        if (!adminData) return res.status(400).json({ success: false, message: 'Admin Not Found' });

        const { id, description } = req.body;
        const product = await Products.findOne({ _id: id });

        if (!product) return res.status(400).json({ success: false, message: 'Product Not Found' });

        // If there is an old image and a new one is uploaded, delete the old image
        if (req.file && product.image) {
            const oldImagePath = path.join(__dirname, '..', 'public', product.image); // Assuming 'uploads' is the folder where images are stored

            // Check if the old image exists and delete it
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.log('Error deleting old image:', err);
                } else {
                    console.log('Old image deleted:', product.image);
                }
            });
        }

        // Update the product with the new image and description
        await Products.findOneAndUpdate({ _id: id }, {
            image: req.file ? req.file.filename : product.image, // Use the new file if available, else keep the old one
            description: description
        });

        return res.status(200).json({ success: true, message: "Product Updated successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Server Error', error });
    }

    /*
    #swagger.tags = ['Admin']
    */
};


//get product api
const getProduct = async (req, res) => {
    try {
        const adminId = req.userid._id;
        const adminData = await admin.findOne({ _id: adminId });
        if (!adminData) return res.status(400).json({ success: false, message: 'Admin Not Found' });
        const products = await Products.find();
        return res.status(200).json({ success: true, products });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
    /*
    #swagger.tags = ['Admin']
    */
}

const getUsersExcelDownload = async (req, res) => {
    try {
        // Retrieve the admin data for authorization (optional)
        const adminId = req.userid._id;
        const adminData = await admin.findOne({ _id: adminId });
        if (!adminData) return res.status(400).json({ success: false, message: 'Admin Not Found' });

        // Retrieve users from the database
        const users = await User.find({}).sort({ createdAt: -1 });

        // If the user wants an Excel file
        if (req.query.download === 'true') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Users');

            // Define columns for the Excel sheet
            worksheet.columns = [
                { header: 'ID', key: '_id', width: 36 },
                { header: 'Name', key: 'UserName', width: 30 },
                { header: 'Mobile Mumber', key: 'MobileNumber', width: 40 },
                { header: 'Created At', key: 'createdAt', width: 20, style: { numFmt: 'yyyy-mm-dd hh:mm:ss' } },
            ];

            // Add rows to the worksheet from the users data
            users.forEach(user => {
                worksheet.addRow({
                    _id: user._id,
                    UserName: user.UserName,
                    MobileNumber: user.MobileNumber,
                    createdAt: user.createdAt,
                });
            });

            // Set response headers to indicate it's a downloadable file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=users-list.xlsx');

            // Write the Excel file to the response
            await workbook.xlsx.write(res);
            res.end();  // End the response to finish the download process
        } else {
            // If not downloading, return the user list in JSON format
            return res.status(200).json({ success: true, users });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }

    /*
    #swagger.tags = ['Admin']
    */
};

const prepareSampleTemplate = (recipient, components, templateName) => {
    const data = {
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "template",
        "template": {
            "name": templateName,
            "language": {
                "code": "en_US"
            },

        }
    };
    return JSON.stringify(data);
}

const sendMessage = async (data) => {
    var config = {
        method: "post",
        url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
        headers: {
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: data
    }

    return axios(config)
}

//getting templates
const templates = async (req, res) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v20.0/${process.env.WhatsApp_Business_Account_ID}/message_templates`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            }
        });
        // Use only the response data, which can be safely serialized to JSON
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
    /*
    #swagger.tags = ['Admin']
    */

}

//send bulk messages for public
const sendBulkMessage = async (req, res) => {
    try {
        upload.single('Numbers')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'File upload failed', error: err.message });
            }

            const reqdata = req.body;
            console.log(reqdata);
            

            const id = req?.userid?._id;

            let workbook_response;
            let save_excel;

            if (req.file) {
                const workbook = xlsx.readFile(`./public/${req?.file?.filename}`);
                let workbook_sheet = workbook.SheetNames;
                workbook_response = xlsx.utils.sheet_to_json(workbook.Sheets[workbook_sheet[0]]);
                save_excel = `${process.env.DOMAIN_URL}public/${req?.file?.filename}`
            }


            // console.log("Workbook data:", workbook_response);
            const recipients = Array.isArray(workbook_response) ? workbook_response : [{ Number: workbook_response.Number }];
            // console.log('recipients',recipients);

            const responses = [];
            const dataEntries = [];
            const invalid_numbers = [];

            for (let i = 0; i < recipients.length; i++) {
                const currentRecipient = recipients[i].PHONE_NUMBER;
                console.log(currentRecipient);
                console.log("number", currentRecipient);
                // Validate the recipient number
                // const validPrefixes = ['9', '8', '7', '6'];
                // const recipientString = currentRecipient.toString();
                // if (recipientString.length !== 10 || !validPrefixes.includes(recipientString.charAt(0))) {
                //     console.error(`Invalid mobile number: ${currentRecipient}`);
                //     invalid_numbers.push(currentRecipient);
                //     continue;
                // }

                const prepareSchema = prepareSampleTemplate(currentRecipient, "Hi", reqdata.TemplateName);
                const response = await sendMessage(prepareSchema);

                const data = await Excel.create({
                    PHONE_NUMBER: currentRecipient,
                    TEMPLATE_NAME: reqdata.TemplateName,
                    EXCEL_FILE_NAME: save_excel
                });
                
                responses.push(response.data);
                dataEntries.push(data);
            }

            return res.status(200).json({ success: true, message: 'Messages sent successfully', responses, data: dataEntries, invalid_numbers });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    /*
    #swagger.tags = ['Admin']
    */
}

//get Users List
const getbulkmessages = async (req, res) => {
    try {
        const adminId = req.userid._id;
        const adminData = await admin.findOne({ _id: adminId });
        if (!adminData) return res.status(400).json({ success: false, message: 'Admin Not Found' });
        const excel = await Excel.find({}).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, excel });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    /*
    #swagger.tags = ['Admin']
    */
}

module.exports = {
    getapi,
    adminRegister,
    adminLogin,
    getUsers,
    getDashboardCount,
    addProduct,
    editProduct,
    getProduct,
    getUsersExcelDownload,
    sendBulkMessage,
    templates,
    getbulkmessages
}