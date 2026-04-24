const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/classify', async (req, res) => {
    const { complaint_text } = req.body;

    if (!complaint_text) {
        return res.status(400).json({ error: "No complaint_text provided" });
    }

    try {
        const response = await axios.post('http://localhost:5000/predict', {
            complaint_text
        });

        res.json({ category: response.data.category });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error calling Python model" });
    }
});

module.exports = router;
