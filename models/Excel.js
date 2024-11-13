const mongoose = require('mongoose');

const excelSchema = mongoose.Schema(
    {
        PHONE_NUMBER: {
            type: String,
        },
        TEMPLATE_NAME: {
            type: String,
        },
        EXCEL_FILE_NAME: {
            type: String,
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Excel', excelSchema);