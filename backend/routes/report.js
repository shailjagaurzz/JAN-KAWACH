const express = require('express');
const router = express.Router();
const ReportedEntity = require('../models/ReportedEntity');
const User = require('../models/user'); 

// POST /api/report
router.post('/', async (req, res) => {
    try {
        const { reporter, type, value, reason } = req.body;

        if (!reporter || !type || !value) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        // Check if already reported
        const existing = await ReportedEntity.findOne({ value });
        if (existing) {
            return res.json({ success: true, message: "Already reported." });
        }

        const report = new ReportedEntity({ reporter, type, value, reason });
        await report.save();

        res.json({ success: true, message: "Reported successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error reporting entity." });
    }
});

module.exports = router;
