const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        UserName: {
            type: String,
        },
        MobileNumber: {
            type: String,
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);