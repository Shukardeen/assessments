const jwt = require("jsonwebtoken");
const { User, Company } = require("../models/models");

const checkAuthentication = async (req, res, next) => {
    try {
        const { token, role } = req.cookies;
        if(!token) return res.json({ error: "Unauthorized access" });
        const decoded = jwt.decode(token);
        let user;
        if(role && role === "company") user = await Company.findOne({ email: decoded });
        if(role && role === "employee") user = await User.findOne({ email: decoded });
        req.user = user;
        next();
    } catch (error) {
        console.log("ERROR CHECKING AUTHENTICATION :: ", error);
        res.json({ error: "Internal server error" });
    }
}

module.exports = checkAuthentication;