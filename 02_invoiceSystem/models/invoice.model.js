const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  items: [itemSchema],
  discount: {
    type: Number,   //in percentage (30 for 30%)
    default: 0
  },
  tax: {
    type: Number,   //in percentage (18 for 18%),
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;