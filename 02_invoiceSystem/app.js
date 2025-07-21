require("dotenv").config();
const express = require("express");
const connectdb = require("./config/connectdb");
const { Invoice, Customer } = require("./models/models");
const app = express();
const PORT = 3000;

//middlewares
app.use(express.json());
// app.use(cookieParser());

//connecting to db
connectdb();

//create customer
app.post("/customer", async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const customer = await Customer.findOne({ email });
    if (customer) return res.json({ error: "User already exists" });
    const newCustomer = await Customer.create({ name, email, mobile });
    res.json({ message: "Customer created successfully", newCustomer });
  } catch (error) {
    console.log("ERROR CREATING CUSTOMER :: ", error);
    res.json({ error: "Internal server error" });
  }
});

//create invoice
app.post("/invoice", async (req, res) => {
  try {
    const { customerId, items, discount, tax } = req.body;
    const invoice = await Invoice.create({
      customerId,
      discount,
      items,
      tax,
    });

    res.json({ message: "Invoice generated", invoice });
  } catch (error) {
    console.log("ERROR GENERATING INVOICE :: ", error);
    res.json({ error: "Internal server error" });
  }
});

//get all invoices
app.get("/invoice", async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("customerId", "name email");
    res.json({ invoices });
  } catch (error) {
    console.log("ERROR GETTING ALL INVOICES :: ", error);
    res.json({ error: "Internal server error" });
  }
});

//get dues
app.get("/total-due", async (req, res) => {
  try {
    const result = await Invoice.aggregate([
      {
        $addFields: {
          subtotal: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $multiply: ["$$item.price", "$$item.quantity"] },
              }
            }
          }
        }
      },
      {
        $addFields: {
          discountedAmount: {
            $divide: [{ $multiply: ["$subtotal", "$discount"] }, 100],
          }
        }
      },
      {
        $addFields: {
          taxedAmount: {
            $divide: [{ $multiply: ["$subtotal", "$tax"] }, 100]
          }
        }
      },
      {
        $addFields: {
          total: {
            $add: [{ $subtract: ["$subtotal", "$discountedAmount"]}, "$taxedAmount"]
          }
        }
      },
      {
        $group: {
          _id: "$customerId",
          totalDue: { $sum: "$total" }
        }
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $unwind: "$customer"
      },
      {
        $project: {
          _id: 0,
          customerId: "$customer._id",
          customerName: "$customer.name",
          totalDue: 1
        }
      }
    ]);

    res.json({ success: true, data: result });
  } catch (error) {
    console.log("ERROR CALCULATING TOTAL DUE :: ", error);
    res.json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
