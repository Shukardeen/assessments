require("dotenv").config();
const express = require("express");
const connectdb = require("./config/connectdb");
const { User, Company } = require("./models/models");
const { checkAuthentication } = require("./middlewares/middlewares");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000;

//middlewares
app.use(express.json());
app.use(cookieParser());

//connecting to db
connectdb();

// Root route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//signup route
app.post("/signup/:role", async (req, res) => {
  try {
    const { companyName, email, tenantId, password } = req.body;
    const { role } = req.params;
    if(role !== "company") return res.json({ error: "Invalid request" });
    const company = await Company.findOne({ tenantId });
    if (company) return res.json({ error: "Company already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newCompany = await Company.create({
      companyName,
      email,
      tenantId,
      password: hashedPassword,
    });
    res.status(201).json({ message: "registered successfully", newCompany });
  } catch (error) {
    console.log("ERROR REGISTERING COMPANY :: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//login route
app.post("/login/:role", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { role } = req.params;
    let user;
    if(role !== "company" && role !== "employee") return res.json({ error: "Invalid request" });
    if(role === "company") user = await Company.findOne({ email });
    if(role === "employee") user = await User.findOne({ email });

    if (!user) return res.json({ error: "Invalid credentials" });

    const result = await bcrypt.compare(password, user.password);
    if (!result) return res.json({ error: "Invalid credentials" });

    const token = jwt.sign(email, process.env.AUTH_SECRET);
    res.cookie("token", token);
    res.cookie("role", role);
    res.status(200).json({ message: "Logged in successfully", user });
  } catch (error) {
    console.log("ERROR LOGGING IN :: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get all employees
app.get("/employee", checkAuthentication, async (req, res) => {
  try {
    const { role, tenantId } = req.user;
    if(role !== "company") return res.json({ error: "You are not authorized to perform this action" });
    const employees = await User.find({ tenantId });
    if(employees.length === 0) return res.json({ message: "no employee in the company" });
    res.json({ employees });
  } catch (error) {
    console.log("ERROR GETTING ALL EMPLOYEES  :: ", error);
    res.json({ error: "Internal server error" });
  }
});

//create employee
app.post("/employee", checkAuthentication, async (req, res) => {
  try {
    const { role } = req.user;
    if(role !== 'company') return res.json({ error: "You are not authorized to perform this action" });
    const { name, email, password } = req.body;
    const { tenantId } = req.user;
    const user = await User.findOne({ email });
    if(user) return res.json({ error: "Employee already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newEmployee = await User.create({ name, email, tenantId, password: hashedPassword });
    res.json({ message: "Employee added successfully", newEmployee });
  } catch (error) {
    console.log("ERROR ADDING EMPLOYEE :: ", error);
    res.json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
