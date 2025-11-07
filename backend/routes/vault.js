// routes/vault.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Vault = require('../models/vault');
const { verifyToken } = require('../middleware/auth');
const EvidenceBlockchain = require('../blockchain/EvidenceBlockchain');

// Initialize blockchain instance (in production, this should be persistent)
let evidenceChain = new EvidenceBlockchain();

// File storage setup with enhanced security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'vault_uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a secure filename with timestamp and random hash
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const secureFilename = `${timestamp}-${hash}${ext}`;
    cb(null, secureFilename);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Allow common evidence file types
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4', 'video/avi', 'video/mov',
    'audio/mp3', 'audio/wav', 'audio/ogg'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed for evidence storage'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Helper function to calculate file hash
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// Helper function to determine evidence type
const getEvidenceType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/') || 
      mimeType.includes('document')) return 'document';
  return 'other';
};

// Upload evidence file to blockchain
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Calculate file hash for integrity verification
    const fileHash = await calculateFileHash(req.file.path);
    
    // Check if file already exists (duplicate detection)
    const existingFile = await Vault.findOne({ fileHash });
    if (existingFile) {
      // Remove the uploaded duplicate
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: 'This file already exists in the evidence vault',
        existingFile: {
          fileName: existingFile.fileName,
          uploadedAt: existingFile.uploadedAt,
          evidenceId: existingFile.evidenceId
        }
      });
    }

    // Get metadata from request
    const { description, tags, associatedCase } = req.body;
    const evidenceType = getEvidenceType(req.file.mimetype);

    // Create evidence data for blockchain
    const evidenceData = evidenceChain.createEvidenceData(
      req.file.originalname,
      fileHash,
      req.file.size,
      req.user.id,
      {
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        associatedCase,
        evidenceType,
        mimeType: req.file.mimetype,
        originalPath: req.file.path
      }
    );

    // Add evidence to blockchain
    const evidenceBlock = evidenceChain.addEvidenceBlock(evidenceData);

    // Save to database with blockchain reference
    const vaultItem = new Vault({
      user: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileHash: fileHash,
      mimeType: req.file.mimetype,
      blockchainHash: evidenceBlock.hash,
      blockIndex: evidenceBlock.index,
      evidenceId: evidenceData.evidenceId,
      evidenceType: evidenceType,
      tags: evidenceData.metadata.tags,
      description: description || '',
      associatedCase: associatedCase || ''
    });

    await vaultItem.save();

    res.json({ 
      success: true, 
      message: 'Evidence uploaded and secured to blockchain successfully!', 
      evidence: {
        id: vaultItem._id,
        evidenceId: evidenceData.evidenceId,
        fileName: req.file.originalname,
        blockIndex: evidenceBlock.index,
        blockHash: evidenceBlock.hash,
        verified: true
      }
    });
  } catch (err) {
    console.error('Evidence upload error:', err);
    
    // Clean up uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading evidence to blockchain vault.' 
    });
  }
});

// Get user's evidence files with blockchain verification
router.get('/files', verifyToken, async (req, res) => {
  try {
    const vaultFiles = await Vault.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-filePath'); // Don't expose file paths

    // Verify each file's blockchain integrity
    const verifiedFiles = vaultFiles.map(file => {
      const verification = evidenceChain.verifyFileIntegrity(file.fileHash);
      
      return {
        ...file.toObject(),
        blockchainVerification: verification,
        integrityStatus: verification.verified ? 'verified' : 'corrupted'
      };
    });

    res.json({ 
      success: true, 
      files: verifiedFiles,
      blockchainStats: evidenceChain.getBlockchainStats()
    });
  } catch (err) {
    console.error('Error fetching evidence:', err);
    res.status(500).json({ success: false, message: 'Error fetching evidence files.' });
  }
});

// Verify specific evidence integrity
router.get('/verify/:evidenceId', verifyToken, async (req, res) => {
  try {
    const evidence = await Vault.findOne({ 
      evidenceId: req.params.evidenceId, 
      user: req.user.id 
    });

    if (!evidence) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evidence not found' 
      });
    }

    // Verify blockchain integrity
    const verification = evidenceChain.verifyFileIntegrity(evidence.fileHash);
    
    // Verify file still exists and hasn't been modified
    let fileIntegrity = false;
    if (fs.existsSync(evidence.filePath)) {
      const currentFileHash = await calculateFileHash(evidence.filePath);
      fileIntegrity = (currentFileHash === evidence.fileHash);
    }

    // Update verification record
    evidence.integrityChecks.push({
      checkedAt: new Date(),
      status: (verification.verified && fileIntegrity) ? 'verified' : 'corrupted',
      details: verification.message
    });
    
    await evidence.save();

    res.json({
      success: true,
      evidence: evidence.evidenceId,
      fileName: evidence.fileName,
      blockchainVerification: verification,
      fileIntegrity: fileIntegrity,
      overallStatus: (verification.verified && fileIntegrity) ? 'verified' : 'corrupted',
      verificationHistory: evidence.integrityChecks
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying evidence integrity' 
    });
  }
});

// Download evidence file (with access logging)
router.get('/download/:evidenceId', verifyToken, async (req, res) => {
  try {
    const evidence = await Vault.findOne({ 
      evidenceId: req.params.evidenceId, 
      user: req.user.id 
    });

    if (!evidence) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evidence not found' 
      });
    }

    // Verify integrity before download
    const verification = evidenceChain.verifyFileIntegrity(evidence.fileHash);
    
    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        message: 'Evidence integrity compromised. Download blocked.',
        verification
      });
    }

    // Check if file exists
    if (!fs.existsSync(evidence.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Evidence file not found on disk'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${evidence.fileName}"`);
    res.setHeader('Content-Type', evidence.mimeType);
    
    // Stream the file
    const fileStream = fs.createReadStream(evidence.filePath);
    fileStream.pipe(res);

    // Log access (in production, you might want to log this to a separate audit log)
    console.log(`Evidence accessed: ${evidence.evidenceId} by user ${req.user.id} at ${new Date()}`);

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading evidence' 
    });
  }
});

// Get blockchain statistics
router.get('/blockchain/stats', verifyToken, async (req, res) => {
  try {
    const stats = evidenceChain.getBlockchainStats();
    const userEvidenceCount = await Vault.countDocuments({ user: req.user.id });
    
    res.json({
      success: true,
      blockchainStats: stats,
      userEvidenceCount,
      systemStatus: {
        chainValid: stats.chainValid,
        totalEvidence: stats.evidenceBlocks,
        securityLevel: stats.chainValid ? 'High' : 'Compromised'
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blockchain statistics' 
    });
  }
});

// Export blockchain (for backup/audit purposes)
router.get('/blockchain/export', verifyToken, async (req, res) => {
  try {
    // Only allow admins or for user's own evidence
    const userEvidence = evidenceChain.getEvidenceByUserId(req.user.id);
    
    res.json({
      success: true,
      userEvidence,
      exportedAt: new Date().toISOString(),
      blockchainValid: evidenceChain.validateChain()
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error exporting blockchain data' 
    });
  }
});

// Note: Delete functionality is intentionally removed for evidence integrity
// Evidence should be immutable once added to the blockchain

module.exports = router;
