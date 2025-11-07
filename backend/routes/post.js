const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const auth = require('../middleware/auth');

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Create post (protected)
router.post('/', auth, upload.single('image'), async (req, res) => {
    const { title, content, anonymous, category } = req.body;
    
    // Require either content or image
    if (!content && !req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide either content or an image.' 
        });
    }

    try {
        const postData = {
            title: title || '',
            content: content || '',
            anonymous: anonymous === 'true',
            category: category || 'general',
            author: req.user.id
        };

        // Add image URL if file was uploaded
        if (req.file) {
            postData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const newPost = new Post(postData);
        await newPost.save();
        
        // Populate author info for response
        await newPost.populate('author', 'name email');
        
        res.json({ 
            success: true, 
            message: 'Post created successfully!',
            post: newPost
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ isVisible: true })
            .sort({ createdAt: -1 })
            .populate('author', 'name email');
        res.json({ success: true, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching posts.' });
    }
});

module.exports = router;
