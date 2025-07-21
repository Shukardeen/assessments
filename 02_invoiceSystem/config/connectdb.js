const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/invoiceSystem");
        console.log("connect to db");
    } catch (error) {
        console.log("ERROR CONNECTING DATABASE :: ", error);
    }
}

module.exports = connectdb;