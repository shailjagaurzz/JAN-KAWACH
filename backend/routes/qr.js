const express = require('express');
const router = express.Router();
const multer = require('multer');
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const fs = require('fs');
const axios = require('axios');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('qrImage'), async (req, res) => {
    const imagePath = req.file.path;

    try {
        const image = await Jimp.read(imagePath);
        const qr = new QrCode();

        qr.callback = async (error, value) => {
            fs.unlinkSync(imagePath);

            if (error || !value || !value.result) {
                return res.json({ valid: false, message: 'Could not decode QR code.' });
            }

            const qrData = value.result.trim();
            console.log("Decoded QR Data:", qrData);

            const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
            const isURL = urlPattern.test(qrData);

            if (!isURL) {
                return res.json({ valid: true, type: 'text', message: 'Valid QR code (plain text).', data: qrData });
            }

            // VirusTotal scan
            try {
                const submitRes = await axios.post(
                    'https://www.virustotal.com/api/v3/urls',
                    new URLSearchParams({ url: qrData }).toString(),
                    { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } }
                );

                const analysisId = submitRes.data.data.id;
                const analysisRes = await axios.get(
                    `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
                    { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } }
                );

                const stats = analysisRes.data.data.attributes.stats;
                const malicious = stats.malicious || 0;

                res.json({
                    valid: true,
                    type: 'url',
                    url: qrData,
                    maliciousReports: malicious,
                    message: malicious > 0 ? '⚠️ Suspicious link detected.' : '✅ Safe link.'
                });
            } catch (vtErr) {
                console.error('VirusTotal error:', vtErr.response?.data || vtErr.message);
                res.json({ valid: true, type: 'url', url: qrData, message: 'Could not verify with VirusTotal.' });
            }
        };

        qr.decode(image.bitmap);
    } catch (err) {
        console.error(err);
        fs.unlinkSync(imagePath);
        res.json({ valid: false, message: 'Error processing image.' });
    }
});

module.exports = router;
