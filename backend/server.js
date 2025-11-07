require('dotenv').config();
console.log("VT Key loaded:", !!process.env.VIRUSTOTAL_API_KEY);

const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const fs = require('fs');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaint');
const vaultRoutes = require('./routes/vault');
const reportRoutes = require('./routes/report');
const blacklistRoutes = require('./routes/blacklist');
const fraudDetectionRoutes = require('./routes/fraudDetection');
const analyticsRoutes = require('./routes/analytics');
// Missing routes - add fraud detection routes
const threatMonitor = require('./services/threatMonitor');

const Post = require('./models/post');
const Vault = require('./models/vault');
const ReportedEntity = require('./models/ReportedEntity');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files so frontend can link to them
app.use('/uploads', express.static('uploads'));
app.use('/vault_uploads', express.static('vault_uploads'));

// Basic health endpoint so a browser or curl can confirm server is up
app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Backend server is running' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/fraud', fraudDetectionRoutes);
app.use('/api/analytics', analyticsRoutes);

// DB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket setup
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// =================== QR VALIDATION ROUTES ===================
app.post('/api/validate-qr-image', upload.single('qrImage'), async (req, res) => {
    if (!req.file) return res.status(400).json({ valid: false, message: 'No image uploaded.' });
    const imagePath = req.file.path;

    try {
        const image = await Jimp.read(imagePath);
        const qr = new QrCode();

        qr.callback = async (error, value) => {
            try { fs.unlinkSync(imagePath); } catch (e) {}

            if (error || !value || !value.result) {
                return res.json({ valid: false, message: 'Could not decode QR code.' });
            }

            const qrData = value.result.trim();
            const urlPattern = /^https?:\/\/[\S]+$/i;
            const isURL = urlPattern.test(qrData);

            if (!isURL) return res.json({ valid: true, type: 'text', message: 'Valid QR code (plain text).', data: qrData });

            try {
                const submitRes = await axios.post('https://www.virustotal.com/api/v3/urls', new URLSearchParams({ url: qrData }).toString(), { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } });
                const analysisId = submitRes.data.data.id;
                const analysisRes = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } });
                const stats = analysisRes.data.data.attributes.stats;
                const malicious = stats.malicious || 0;
                res.json({ valid: true, type: 'url', url: qrData, maliciousReports: malicious, message: malicious > 0 ? '⚠️ Suspicious link.' : '✅ Safe QR code link.' });
            } catch (err) {
                console.error('VirusTotal error (image):', err.response?.data || err.message);
                res.json({ valid: true, type: 'url', url: qrData, message: 'Could not verify with VirusTotal.' });
            }
        };

        qr.decode(image.bitmap);
    } catch (err) {
        console.error(err);
        try { fs.unlinkSync(imagePath); } catch (e) {}
        res.json({ valid: false, message: 'Error processing image.' });
    }
});

// JSON QR validation endpoint
app.post('/api/validate-qr', async (req, res) => {
    const { qr } = req.body;
    if (!qr) return res.status(400).json({ valid: false, message: 'No QR data provided.' });
    const qrData = String(qr).trim();
    const urlPattern = /^https?:\/\/[\S]+$/i;
    const isURL = urlPattern.test(qrData);
    if (!isURL) return res.json({ valid: true, type: 'text', message: 'Valid QR code (plain text).', data: qrData });

    try {
        const submitRes = await axios.post('https://www.virustotal.com/api/v3/urls', new URLSearchParams({ url: qrData }).toString(), { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } });
        const analysisId = submitRes.data.data.id;
        const analysisRes = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } });
        const stats = analysisRes.data.data.attributes.stats;
        const malicious = stats.malicious || 0;
        res.json({ valid: true, type: 'url', url: qrData, maliciousReports: malicious, message: malicious > 0 ? '⚠️ Suspicious link.' : '✅ Safe QR code link.' });
    } catch (err) {
        console.error('VirusTotal error (json):', err.response?.data || err.message);
        res.json({ valid: true, type: 'url', url: qrData, message: 'Could not verify with VirusTotal.' });
    }
});

// =================== POSTS ===================
app.post(['/api/post', '/api/posts'], verifyToken, async (req, res) => {
    try {
        const { title, content, anonymous, category } = req.body;
        const userId = req.user.id;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Content is required.' });
        }

        const postData = {
            content: content.trim(),
            category: category || 'general',
            anonymous: !!anonymous
        };

        // Add title if provided
        if (title && title.trim()) {
            postData.title = title.trim();
        }

        // Add author if not anonymous
        if (!anonymous) {
            postData.author = userId;
        }

        const newPost = new Post(postData);
        await newPost.save();
        
        // Populate author data for response
        await newPost.populate('author', 'name email');
        
        res.json({ 
            success: true, 
            message: 'Post created successfully!', 
            post: newPost 
        });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ success: false, message: 'Server error creating post.' });
    }
});

app.get(['/api/post', '/api/posts'], async (req, res) => {
    try {
        const { category, limit = 20, skip = 0 } = req.query;
        
        // Build query
        const query = { isVisible: true };
        if (category && category !== 'all') {
            query.category = category;
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('author', 'name email')
            .select('-reports'); // Don't include reports in public response

        // Format posts for frontend
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            content: post.content,
            category: post.category,
            anonymous: post.anonymous,
            author: post.anonymous ? null : post.author,
            likes: post.likes?.length || 0,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        if (req.path.endsWith('/posts')) {
            return res.json({ success: true, posts: formattedPosts, total: formattedPosts.length });
        }
        return res.json(formattedPosts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ success: false, message: 'Error fetching posts.' });
    }
});

// Like/Unlike post
app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();
        res.json({ 
            success: true, 
            liked: likeIndex === -1, 
            likesCount: post.likes.length 
        });
    } catch (err) {
        console.error('Error toggling like:', err);
        res.status(500).json({ success: false, message: 'Error updating like status' });
    }
});

// Report post
app.post('/api/posts/:id/report', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (!post.reports.includes(userId)) {
            post.reports.push(userId);
            await post.save();
            
            // Hide post if it has too many reports (can be configurable)
            if (post.reports.length >= 5) {
                post.isVisible = false;
                await post.save();
            }
        }

        res.json({ success: true, message: 'Post reported successfully' });
    } catch (err) {
        console.error('Error reporting post:', err);
        res.status(500).json({ success: false, message: 'Error reporting post' });
    }
});

// Alias for frontend: get vault files using token
app.get('/api/vault/files', verifyToken, async (req, res) => {
    try {
        const files = await Vault.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, files });
    } catch (err) {
        console.error('Error fetching vault files:', err);
        res.status(500).json({ success: false, message: 'Error fetching vault files.' });
    }
});

// scanNotification utility
async function scanNotification(sender, message) {
    const reports = await ReportedEntity.find({ value: sender });
    if (reports.length > 0) {
        reports.forEach(report => {
            const alert = { sender, message: '⚠️ Suspicious sender detected!', type: report.type, reportedAt: new Date() };
            console.log(alert);
            io.emit('alert', alert);
        });
    }
}

// =================== MESSAGE MONITORING ===================
// POST /api/monitor/message - Check message against blacklist and send SMS if needed
app.post('/api/monitor/message', verifyToken, async (req, res) => {
    try {
        const { senderValue, senderType, messageContent } = req.body;
        const recipientUserId = req.user.id;

        if (!senderValue) {
            return res.status(400).json({ success: false, message: 'Sender value is required' });
        }

        const result = await threatMonitor.monitorMessage(
            senderValue, 
            senderType, 
            messageContent, 
            recipientUserId
        );

        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error monitoring message:', error);
        res.status(500).json({ success: false, message: 'Error monitoring message' });
    }
});

// POST /api/monitor/check-threat - Just check if source is blacklisted (no SMS)
app.post('/api/monitor/check-threat', verifyToken, async (req, res) => {
    try {
        const { senderValue, senderType } = req.body;

        if (!senderValue) {
            return res.status(400).json({ success: false, message: 'Sender value is required' });
        }

        const threat = await threatMonitor.checkThreat(senderValue, senderType);
        
        res.json({ 
            success: true, 
            isThreat: !!threat, 
            threat: threat || null 
        });
    } catch (error) {
        console.error('Error checking threat:', error);
        res.status(500).json({ success: false, message: 'Error checking threat' });
    }
});

// PUT /api/user/phone - Update user's phone number for SMS notifications
app.put('/api/user/phone', verifyToken, async (req, res) => {
    try {
        const { phone } = req.body;
        const userId = req.user.id;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const user = await threatMonitor.updateUserPhone(userId, phone);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Phone number updated successfully' });
    } catch (error) {
        console.error('Error updating phone:', error);
        res.status(500).json({ success: false, message: 'Error updating phone number' });
    }
});

// Start server
const PORT = process.env.PORT || 3001; // Changed to 3001 to test
console.log(`Starting server on port ${PORT}...`);
console.log(`Environment PORT: ${process.env.PORT}`);
console.log(`Using PORT: ${PORT}`);

const server = http.listen(PORT, 'localhost', () => { // Explicitly bind to localhost
    console.log(`✅ Server + Socket.IO running on localhost:${PORT}`);
    console.log(`✅ Server accessible at: http://localhost:${PORT}`);
    console.log(`✅ Test the API: curl http://localhost:${PORT}/`);
    console.log(`✅ Server address:`, server.address());
});

server.on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    console.error('❌ Error details:', err.message);
    console.error('❌ Error code:', err.code);
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('❌ Try using a different port or close the application using this port');
    }
    if (err.code === 'EACCES') {
        console.error(`❌ Permission denied on port ${PORT}`);
        console.error('❌ Try running as administrator or use a port > 1024');
    }
});
