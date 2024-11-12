const mongoose = require('mongoose');

const adminSchema = mongoose.Schema(
    {
        Name: {
            type: String,
        },
        Email: {
            type: String,
        },
        Password: {
            type: String,
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Admin', adminSchema);