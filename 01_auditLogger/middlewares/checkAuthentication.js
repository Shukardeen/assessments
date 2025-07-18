const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const checkAuthentication = async (req, res, next) => {
    try {
        // console.log(req.cookies);
        const { token } = req.cookies;
        if(!token) return res.json({ error: "Unauthorized access" });
        const decoded = jwt.decode(token);
        const user = await User.findOne({ email: decoded });
        req.user = user;
        next();
    } catch (error) {
        console.log("ERROR CHECKING AUTHENTICATION :: ", error);
        res.json({ error: "Internal server error" });
    }
}

module.exports = checkAuthentication;