const express = require('express');
const multer = require('multer');
const path = require('path');
const PDFDocument = require('pdfkit');
const sanitizeHtml = require('sanitize-html');
const { v4: uuidv4 } = require('uuid');
const Complaint = require('../models/complaint');
const { verifyToken: auth } = require('../middleware/auth');
const fs = require('fs');

const router = express.Router();

// Multer setup for multiple files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, PDF, TXT, DOC, DOCX allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  }
});

// File a new complaint with blockchain evidence support
router.post('/file', upload.array('files', 5), async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      category, 
      priority = 'medium',
      incidentDate,
      location,
      description,
      evidenceDescription,
      officialType = 'cybercrime',
      preferredContact = 'email',
      blockchainEvidence, // New field for blockchain evidence IDs
      officialContact // New field for official contact info
    } = req.body;

    // Check if this is a test mode submission
    const isTestMode = testMode === 'true' || testMode === true;

    // Parse blockchain evidence if provided
    let parsedBlockchainEvidence = [];
    if (blockchainEvidence) {
      try {
        parsedBlockchainEvidence = JSON.parse(blockchainEvidence);
      } catch (error) {
        console.error('Error parsing blockchain evidence:', error);
      }
    }

    // Parse official contact if provided
    let parsedOfficialContact = {};
    if (officialContact) {
      try {
        parsedOfficialContact = JSON.parse(officialContact);
      } catch (error) {
        console.error('Error parsing official contact:', error);
      }
    }

    if (!category || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category and description are required.' 
      });
    }

    if (description.length < 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description must be at least 50 characters long.' 
      });
    }

    // Log complaint attempt for accountability
    const accountabilityLog = {
      userId: req.user.id,
      userEmail: req.user.email,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
      category,
      description: description.substring(0, 100) + '...', // Log first 100 chars for review
      officialType: officialType || 'police',
      isTestMode: isTestMode
    };
    
    if (isTestMode) {
      console.log('🧪 TEST COMPLAINT FILING:', JSON.stringify(accountabilityLog, null, 2));
    } else {
      console.log('🔍 LIVE COMPLAINT FILING ATTEMPT:', JSON.stringify(accountabilityLog, null, 2));
    }

    // Sanitize user input
    const safeDescription = sanitizeHtml(description);
    const safeEvidenceDescription = evidenceDescription ? sanitizeHtml(evidenceDescription) : '';

    // Process uploaded files
    const filePaths = req.files ? req.files.map(file => file.path) : [];

    // Generate unique complaint ID
    const complaintId = uuidv4();

    const complaint = new Complaint({
      complaintId,
      name: name || 'Anonymous',
      email,
      phone,
      category,
      priority,
      incidentDate: incidentDate || null,
      location: location || '',
      description: safeDescription,
      evidenceDescription: safeEvidenceDescription,
      filePaths,
      status: isTestMode ? 'test_submission' : 'submitted',
      submittedAt: new Date(),
      officialType: officialType || 'police',
      officialContact: parsedOfficialContact,
      blockchainEvidence: parsedBlockchainEvidence,
      isTestMode: isTestMode,
      // Accountability tracking
      accountabilityLog: {
        userId: req.user.id,
        userEmail: req.user.email,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        submissionTimestamp: new Date(),
        verificationStatus: 'pending'
      }
    });

    // Generate comprehensive PDF summary
    const pdfPath = `uploads/complaint_${complaintId}.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    // PDF Header
    doc.fontSize(20).text('CYBER SECURITY COMPLAINT REPORT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Complaint ID: ${complaintId}`, { align: 'right' });
    doc.text(`Date Filed: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Personal Information
    doc.fontSize(14).text('COMPLAINANT INFORMATION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Name: ${complaint.name}`);
    doc.text(`Email: ${complaint.email || 'Not provided'}`);
    doc.text(`Phone: ${complaint.phone || 'Not provided'}`);
    doc.moveDown();

    // Incident Details
    doc.fontSize(14).text('INCIDENT DETAILS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Category: ${complaint.category}`);
    doc.text(`Priority: ${complaint.priority.toUpperCase()}`);
    doc.text(`Incident Date: ${complaint.incidentDate ? new Date(complaint.incidentDate).toLocaleDateString() : 'Not specified'}`);
    doc.text(`Location/Platform: ${complaint.location || 'Not specified'}`);
    doc.moveDown();

    // Description
    doc.fontSize(14).text('DETAILED DESCRIPTION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(safeDescription, { width: 500, align: 'justify' });
    doc.moveDown();

    // Evidence Description
    if (safeEvidenceDescription) {
      doc.fontSize(14).text('EVIDENCE DESCRIPTION', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(safeEvidenceDescription, { width: 500, align: 'justify' });
      doc.moveDown();
    }

    // Attached Files
    if (filePaths.length > 0) {
      doc.fontSize(14).text('ATTACHED EVIDENCE FILES', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      filePaths.forEach((filePath, index) => {
        doc.text(`${index + 1}. ${path.basename(filePath)}`);
      });
      doc.moveDown();
    }

    // Footer
    doc.fontSize(8);
    doc.text('This is a system-generated report. Please keep your complaint ID for future reference.', { align: 'center' });
    doc.text('For urgent matters, contact National Cyber Crime Helpline: 1930', { align: 'center' });
    
    doc.end();

    complaint.pdfPath = pdfPath;
    await complaint.save();

    // Send email notification (if email provided)
    if (email) {
      // TODO: Implement email notification system
      console.log(`Email notification should be sent to: ${email}`);
    }

    res.json({ 
      success: true, 
      message: 'Complaint filed successfully! You will receive updates via email.', 
      complaint: {
        _id: complaint._id,
        complaintId: complaint.complaintId,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        submittedAt: complaint.submittedAt
      }
    });
  } catch (err) {
    console.error('Error filing complaint:', err);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size too large. Maximum 10MB per file allowed.' 
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Too many files. Maximum 5 files allowed.' 
      });
    }
    
    if (err.message.includes('Invalid file type')) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

// Get complaint by ID
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOne({
      $or: [
        { _id: id },
        { complaintId: id }
      ]
    }).select('-filePaths -pdfPath'); // Exclude file paths for security

    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found.' 
      });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    console.error('Error fetching complaint:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching complaint.' 
    });
  }
});

// Search complaints by category or keyword
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query required.' });

    const complaints = await Complaint.find({
      $or: [
        { category: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
      ],
    }).select('-filePaths -pdfPath');

    res.json({ success: true, complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error searching complaints.' });
  }
});

// Forward complaint to official portal
router.post('/forward-to-official', auth, async (req, res) => {
  try {
    const { officialType, complaintData, officialContact } = req.body;

    console.log(`Forwarding complaint to ${officialType} portal...`);

    // Simulate official portal integration
    // In a real implementation, you would integrate with actual government APIs
    let forwardResult = {};

    switch (officialType) {
      case 'cybercrime':
        // Forward to National Cyber Crime Reporting Portal
        forwardResult = await forwardToCyberCrimePortal(complaintData, officialContact);
        break;
      case 'police':
        // Forward to State Police Portal
        forwardResult = await forwardToPolicePortal(complaintData, officialContact);
        break;
      case 'cbi':
        // Forward to CBI Portal
        forwardResult = await forwardToCBIPortal(complaintData, officialContact);
        break;
      case 'banking':
        // Forward to RBI Banking Ombudsman
        forwardResult = await forwardToBankingPortal(complaintData, officialContact);
        break;
      default:
        throw new Error('Unknown official type');
    }

    res.json({
      success: true,
      message: 'Complaint successfully forwarded to official portal',
      officialReferenceId: forwardResult.referenceId,
      redirectUrl: forwardResult.redirectUrl,
      status: forwardResult.status
    });

  } catch (error) {
    console.error('Error forwarding complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to forward complaint to official portal',
      error: error.message
    });
  }
});

// Helper functions for forwarding to different portals
async function forwardToCyberCrimePortal(complaintData, officialContact) {
  try {
    // This would integrate with the actual cybercrime.gov.in API
    // For now, we'll simulate the process
    
    console.log('Forwarding to Cyber Crime Portal...');
    console.log('Complaint Data:', JSON.stringify(complaintData, null, 2));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a simulated reference ID
    const referenceId = `CC${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    return {
      referenceId,
      status: 'submitted',
      redirectUrl: 'https://cybercrime.gov.in/',
      message: 'Successfully submitted to National Cyber Crime Reporting Portal'
    };
  } catch (error) {
    throw new Error(`Cyber Crime Portal forwarding failed: ${error.message}`);
  }
}

async function forwardToPolicePortal(complaintData, officialContact) {
  try {
    console.log('Forwarding to Police Portal...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const referenceId = `POL${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    return {
      referenceId,
      status: 'submitted',
      redirectUrl: 'https://citizen.mahapolice.gov.in/Citizen/MH/PublicComplaint.aspx',
      message: 'Successfully submitted to State Police Portal'
    };
  } catch (error) {
    throw new Error(`Police Portal forwarding failed: ${error.message}`);
  }
}

async function forwardToCBIPortal(complaintData, officialContact) {
  try {
    console.log('Forwarding to CBI Portal...');
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const referenceId = `CBI${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    return {
      referenceId,
      status: 'submitted',
      redirectUrl: 'https://www.cbi.gov.in/',
      message: 'Successfully submitted to CBI Portal'
    };
  } catch (error) {
    throw new Error(`CBI Portal forwarding failed: ${error.message}`);
  }
}

async function forwardToBankingPortal(complaintData, officialContact) {
  try {
    console.log('Forwarding to Banking Portal...');
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const referenceId = `BNK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    return {
      referenceId,
      status: 'submitted',
      redirectUrl: 'https://sachet.rbi.org.in/',
      message: 'Successfully submitted to RBI Banking Ombudsman'
    };
  } catch (error) {
    throw new Error(`Banking Portal forwarding failed: ${error.message}`);
  }
}

module.exports = router;
