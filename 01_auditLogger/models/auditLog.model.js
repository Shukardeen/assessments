const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    operationType: {
        type: String,
        required: true
    },
    collectionAffected: {
        type: String,
        required: true
    },
    oldData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    newData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
module.exports = AuditLog;