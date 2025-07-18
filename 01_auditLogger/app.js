require("dotenv").config();
const express = require("express");
const connectdb = require("./config/connectdb");
const { User, Post } = require("./models/models");
const { auditLogger, checkAuthentication } = require("./middlewares/middlewares");
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
app.post("/signup", auditLogger("users"), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) return res.json({ error: "User already exists" });
    req.oldData = {};
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    req.newData = newUser;
    req.user = newUser;
    res.status(201).json({ message: "registered successfully", newUser });
  } catch (error) {
    console.log("ERROR REGISTERING USER :: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ error: "Invalid credentials" });

    const result = await bcrypt.compare(password, user.password);
    if (!result) return res.json({ error: "Invalid credentials" });

    const token = jwt.sign(email, process.env.AUTH_SECRET);
    res.cookie("token", token);
    res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    console.log("ERROR LOGGING IN :: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//add post
app.post("/post", checkAuthentication, auditLogger("posts"), async (req, res) => {
    try {
        const { title, content } = req.body;
        const author = req.user._id;
        const newPost = await Post.create({
            title,
            content,
            author
        });
        req.newData = newPost;
        res.status(201).json({ message: "Post created successfully", newPost });
    } catch (error) {
        console.log("ERROR CREATING POST :: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//update post
app.put("/post/:id", checkAuthentication, auditLogger("posts"), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const post = await Post.findById(id);
        if(!post) return res.json({ error: "Invalid request" });
        req.oldData = post;
        post.title = title;
        post.content = content;
        await post.save();
        req.newData = post;
        res.status(200).json({ message: "Post updated successfully", post }); 
    } catch (error) {
        console.log("ERROR UPDATING POST ::", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//delete post
app.delete("/post/:id", checkAuthentication, auditLogger("posts"), async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByIdAndDelete(id);
        if(!post) return res.json({ error: "Invalid request" });
        req.oldData = post;
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("ERROR DELETING POST :: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
