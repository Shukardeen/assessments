const { AuditLog } = require("../models/models");

const auditLogger = (collectionName) => {
    return async (req, res, next) => {
        res.on('finish', async () => {
            if(res.statusCode >= 200 && res.statusCode <=300) {
                const newLog = new AuditLog({
                    userId: req.user._id,
                    operationType: req.method,
                    collectionAffected: collectionName,
                    oldData: req.oldData || {},
                    newData: req.newData || {}
                });
                await newLog.save()
                req.user = null;
                // console.log("user in req after audit saved", req.user);
            }
        });
        next();
    }
}

module.exports = auditLogger;