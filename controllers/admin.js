const { hashPassword, ispasswordMatch } = require("../middleware/Helper");
const admin = require("../models/admin");
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const Products = require("../models/Products");
const fs = require('fs');
const path = require('path');


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
        // const adminId = req.userid._id;
        // const adminData = await admin.findOne({ _id: adminId });
        // if (!adminData) return res.status(400).json({ success: false, message: 'Admin Not Found' });
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

module.exports = {
    getapi,
    adminRegister,
    adminLogin,
    getUsers,
    getDashboardCount,
    addProduct,
    editProduct,
    getProduct
}