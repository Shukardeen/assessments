const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    tenantId: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: "company"
    },
    password: {
        type: String,
        required: true
    }
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;