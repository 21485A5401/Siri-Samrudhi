const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        image: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('product', productSchema);