import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App';
import { apiFetch } from '../api';
import Navbar from '../components/Navbar';

function Complaint() {
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('file-complaint');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    category: '',
    priority: 'medium',
    incidentDate: '',
    location: '',
    description: '',
    evidenceDescription: '',
    officialType: 'cybercrime', // New field for official selection
    preferredContact: 'email' // New field for contact preference
  });
  const [files, setFiles] = useState([]);
  const [evidenceFiles, setEvidenceFiles] = useState([]); // Blockchain evidence
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const [blockchainStats, setBlockchainStats] = useState(null);

  // Official contact information
  const officialContacts = {
    cybercrime: {
      title: "Cyber Crime Helpline",
      phone: "1930",
      email: "complaints@cybercrime.gov.in",
      website: "www.cybercrime.gov.in",
      complaintPortal: "https://cybercrime.gov.in/",
      apiEndpoint: "https://cybercrime.gov.in/api/complaints",
      description: "For all cyber crime related complaints",
      hours: "24x7 Available"
    },
    police: {
      title: "Local Police Station",
      phone: "100",
      email: "contact@police.gov.in", 
      website: "www.police.gov.in",
      complaintPortal: "https://citizen.mahapolice.gov.in/Citizen/MH/PublicComplaint.aspx",
      apiEndpoint: "https://www.police.gov.in/api/complaints",
      description: "For general crime and emergency situations",
      hours: "24x7 Available"
    },
    cbi: {
      title: "Central Bureau of Investigation",
      phone: "011-24368000",
      email: "complaints@cbi.gov.in",
      website: "www.cbi.gov.in",
      complaintPortal: "https://www.cbi.gov.in/",
      apiEndpoint: "https://www.cbi.gov.in/api/complaints",
      description: "For serious and interstate crimes",
      hours: "Office Hours: 9 AM - 6 PM"
    },
    banking: {
      title: "Banking Fraud Helpline",
      phone: "155260",
      email: "support@bankingfraud.gov.in",
      website: "www.rbi.org.in",
      complaintPortal: "https://sachet.rbi.org.in/",
      apiEndpoint: "https://www.rbi.org.in/api/complaints",
      description: "For banking and financial fraud",
      hours: "24x7 Available"
    }
  };

  // Cyber security complaint categories
  const categories = [
    'Online Financial Fraud',
    'Identity Theft',
    'Cyberbullying/Harassment',
    'Phishing/Email Scam',
    'Social Media Crime',
    'Online Trading Fraud',
    'Dating/Matrimonial Fraud',
    'Job Fraud',
    'Data Breach',
    'Ransomware Attack',
    'Website Defacement',
    'Fake News/Misinformation',
    'Online Child Exploitation',
    'Cryptocurrency Fraud',
    'Other Cyber Crime'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4', 'audio/mp3'];
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (!validTypes.includes(file.type)) {
        setMessage('Please select valid file types (JPG, PNG, GIF, PDF, TXT, DOC, DOCX, MP4, MP3)');
        return false;
      }
      
      if (file.size > maxSize) {
        setMessage(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      
      return true;
    });
    
    setFiles(validFiles);
    if (validFiles.length !== selectedFiles.length) {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Upload evidence to blockchain vault
  const uploadEvidenceToBlockchain = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiFetch('/api/vault/upload', {
        method: 'POST',
        body: formData
      }, token);

      if (response.ok) {
        const result = await response.json();
        return {
          fileName: file.name,
          blockIndex: result.blockIndex,
          hash: result.hash,
          timestamp: result.timestamp
        };
      }
      throw new Error('Failed to upload to blockchain');
    } catch (error) {
      console.error('Error uploading to blockchain:', error);
      throw error;
    }
  };

  // Forward complaint to official portal
  const forwardComplaintToOfficialPortal = async (complaint, official, blockchainEvidence) => {
    try {
      setMessage('🚀 Forwarding complaint to official portal...');
      
      // Prepare complaint data for official portal
      const officialComplaintData = {
        complainantName: complaint.name || formData.name,
        email: complaint.email || formData.email,
        phone: complaint.phone || formData.phone,
        category: complaint.category || formData.category,
        priority: complaint.priority || formData.priority,
        incidentDate: complaint.incidentDate || formData.incidentDate,
        location: complaint.location || formData.location,
        description: complaint.description || formData.description,
        evidenceDescription: complaint.evidenceDescription || formData.evidenceDescription,
        blockchainEvidenceHashes: blockchainEvidence.map(e => e.hash),
        localComplaintId: complaint._id || complaint.complaintId,
        submittedAt: new Date().toISOString(),
        source: 'JAN-KAWACH_PLATFORM'
      };

      // Forward to our backend which will handle the official API integration
      const forwardResponse = await apiFetch('/api/complaint/forward-to-official', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          officialType: formData.officialType,
          complaintData: officialComplaintData,
          officialContact: official
        })
      }, token);

      if (forwardResponse.ok) {
        const forwardResult = await forwardResponse.json();
        setMessage(prevMessage => 
          prevMessage + `\n\n✅ Successfully forwarded to ${official.title}!\n` +
          `📝 Official Reference: ${forwardResult.officialReferenceId || 'Pending'}\n` +
          `🌐 Portal: ${official.complaintPortal}`
        );
        
        // Optional: Open official portal in new tab for user verification
        if (forwardResult.redirectUrl || official.complaintPortal) {
          setTimeout(() => {
            window.open(forwardResult.redirectUrl || official.complaintPortal, '_blank');
          }, 2000);
        }
      } else {
        throw new Error('Failed to forward to official portal');
      }
    } catch (error) {
      console.error('Error forwarding to official portal:', error);
      setMessage(prevMessage => 
        prevMessage + `\n\n⚠️ Complaint saved locally but forwarding to ${official.title} encountered an issue.\n` +
        `🔗 You can manually submit at: ${official.complaintPortal}`
      );
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    setEvidenceLoading(true);

    // Validation
    if (!formData.category || !formData.description) {
      setMessage('Please fill in all required fields.');
      setLoading(false);
      setEvidenceLoading(false);
      return;
    }

    if (!formData.legalAcknowledgment) {
      setMessage('❌ You must acknowledge the legal disclaimer and confirm the information is true before filing a complaint.');
      setLoading(false);
      setEvidenceLoading(false);
      return;
    }

    if (formData.description.length < 50) {
      setMessage('Please provide a more detailed description (minimum 50 characters).');
      setLoading(false);
      setEvidenceLoading(false);
      return;
    }

    try {
      // Step 1: Upload evidence to blockchain first
      const blockchainEvidenceIds = [];
      if (files.length > 0) {
        setMessage('Securing evidence to blockchain...');
        
        for (let i = 0; i < files.length; i++) {
          try {
            const evidenceData = await uploadEvidenceToBlockchain(files[i]);
            blockchainEvidenceIds.push(evidenceData);
            setMessage(`Secured ${i + 1}/${files.length} evidence files to blockchain...`);
          } catch (error) {
            console.error(`Error uploading evidence ${files[i].name}:`, error);
            // Continue with other files even if one fails
          }
        }
      }

      setEvidenceLoading(false);
      setMessage('Filing complaint with authorities...');

      // Step 2: Submit complaint with blockchain evidence references
      const complaintData = new FormData();
      Object.keys(formData).forEach(key => {
        complaintData.append(key, formData[key]);
      });
      
      // Add blockchain evidence IDs
      complaintData.append('blockchainEvidence', JSON.stringify(blockchainEvidenceIds));
      
      // Add official contact information
      const selectedOfficial = officialContacts[formData.officialType];
      complaintData.append('officialContact', JSON.stringify(selectedOfficial));
      
      // Append regular files for backward compatibility
      files.forEach(file => {
        complaintData.append('files', file);
      });

      const res = await apiFetch('/api/complaint/file', { 
        method: 'POST', 
        body: complaintData 
      }, token);
      
      const data = await res.json();
      
      if (data.success) {
        setIsSuccess(true);
        setComplaintId(data.complaint._id);
        
        // Create comprehensive success message
        let successMessage = `Complaint filed successfully!\n\n`;
        
        successMessage += `🆔 Complaint ID: ${data.complaint._id}\n`;
        successMessage += `🏛️ Filed with: ${selectedOfficial.title}\n`;
        successMessage += `📞 Contact: ${selectedOfficial.phone}\n`;
        successMessage += `📧 Email: ${selectedOfficial.email}\n\n`;
        
        if (blockchainEvidenceIds.length > 0) {
          successMessage += `🔗 Blockchain Evidence Secured:\n`;
          blockchainEvidenceIds.forEach((evidence, index) => {
            successMessage += `   ${index + 1}. ${evidence.fileName} (Block #${evidence.blockIndex})\n`;
          });
          successMessage += `\n✅ All evidence is tamper-proof and cryptographically verified.\n`;
        }
        
        successMessage += `\n📋 Your complaint has been automatically forwarded to the appropriate authorities.`;
        
        setMessage(successMessage);
        setEvidenceFiles(blockchainEvidenceIds);
        
        // Step 3: Forward complaint to official portal
        await forwardComplaintToOfficialPortal(data.complaint, selectedOfficial, blockchainEvidenceIds);
        
        // Reset form
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          category: '',
          priority: 'medium',
          incidentDate: '',
          location: '',
          description: '',
          evidenceDescription: '',
          officialType: 'cybercrime',
          preferredContact: 'email'
        });
        setFiles([]);
        
        // Switch to tracking tab
        setTimeout(() => {
          setActiveTab('track-complaint');
        }, 3000);
        
      } else {
        setMessage(data.message || 'Error filing complaint. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setMessage('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    }
    
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brown-primary mb-4">Please Login</h1>
            <p className="text-gray-600">You need to be logged in to file a complaint.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-brown-primary mb-4">
              🏛️ Cyber Crime Complaint Center
            </h1>
            <p className="text-gray-600 text-lg">
              File complaints directly with authorities and secure evidence using blockchain technology
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('file-complaint')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'file-complaint'
                    ? 'bg-brown-primary text-white border-b-2 border-brown-primary'
                    : 'text-gray-600 hover:text-brown-primary'
                }`}
              >
                📝 File Complaint
              </button>
              <button
                onClick={() => setActiveTab('officials-contact')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'officials-contact'
                    ? 'bg-brown-primary text-white border-b-2 border-brown-primary'
                    : 'text-gray-600 hover:text-brown-primary'
                }`}
              >
                📞 Official Contacts
              </button>
              <button
                onClick={() => setActiveTab('track-complaint')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'track-complaint'
                    ? 'bg-brown-primary text-white border-b-2 border-brown-primary'
                    : 'text-gray-600 hover:text-brown-primary'
                }`}
              >
                🔍 Track Complaint
              </button>
              <button
                onClick={() => setActiveTab('evidence-vault')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'evidence-vault'
                    ? 'bg-brown-primary text-white border-b-2 border-brown-primary'
                    : 'text-gray-600 hover:text-brown-primary'
                }`}
              >
                🔗 Evidence Vault
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'file-complaint' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Emergency Notice */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Emergency Situations</h3>
                    <p className="text-sm text-red-700 mt-1">
                      For immediate threats or ongoing attacks, contact Cyber Crime Helpline: <strong>1930</strong>
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Official Selection */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Authority to File Complaint With *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(officialContacts).map(([key, official]) => (
                      <label key={key} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="officialType"
                          value={key}
                          checked={formData.officialType === key}
                          onChange={handleInputChange}
                          className="mt-1 text-brown-primary focus:ring-brown-primary"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{official.title}</div>
                          <div className="text-sm text-gray-600">{official.description}</div>
                          <div className="text-xs text-blue-600">📞 {official.phone}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Legal Disclaimer and Verification */}
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-red-800 mb-3">⚖️ LEGAL DISCLAIMER & ACCOUNTABILITY</h3>
                  <div className="space-y-3 text-sm text-red-700">
                    <div className="bg-red-100 p-3 rounded border-l-4 border-red-500">
                      <p className="font-semibold">🚨 WARNING: Filing False Complaints is a Criminal Offense</p>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• <strong>Section 182 IPC:</strong> False information to public servant - Up to 6 months imprisonment</li>
                        <li>• <strong>Section 211 IPC:</strong> False charge of offense - Up to 2 years imprisonment</li>
                        <li>• <strong>Section 500 IPC:</strong> Defamation charges if naming innocent parties</li>
                        <li>• <strong>IT Act 2000:</strong> Cyber defamation and false cyber crime reports</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-100 p-3 rounded border-l-4 border-yellow-500">
                      <p className="font-semibold">🔒 SYSTEM ACCOUNTABILITY MEASURES:</p>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• All complaints are logged with your verified identity and IP address</li>
                        <li>• Blockchain evidence ensures tamper-proof audit trail</li>
                        <li>• False complaints are automatically flagged and reported to authorities</li>
                        <li>• Your complaint history is permanently recorded for verification</li>
                        <li>• Cross-verification with government databases for identity validation</li>
                      </ul>
                    </div>

                    <div className="flex items-start space-x-3 mt-4">
                      <input
                        type="checkbox"
                        id="legalAcknowledgment"
                        checked={formData.legalAcknowledgment || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, legalAcknowledgment: e.target.checked }))}
                        className="mt-1 text-red-600 focus:ring-red-500"
                        required
                      />
                      <label htmlFor="legalAcknowledgment" className="text-sm font-medium text-red-800">
                        I acknowledge that I understand the legal consequences of filing a false complaint. 
                        I certify that all information provided is true and accurate to the best of my knowledge. 
                        I understand that this complaint will be permanently recorded and may be used as evidence in legal proceedings.
                      </label>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incident Date
                    </label>
                    <input
                      type="date"
                      name="incidentDate"
                      value={formData.incidentDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complaint Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Platform (Optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                    placeholder="e.g., WhatsApp, Facebook, Website URL, City, etc."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent resize-none"
                    placeholder="Please provide a detailed description of the incident including:
• What happened?
• When did it occur?
• How were you affected?
• Any suspicious links, phone numbers, or email addresses
• Financial loss amount (if any)
• Steps you have already taken"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 50 characters ({formData.description.length}/50)
                  </p>
                </div>

                {/* Blockchain Evidence Upload */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    🔗 Blockchain Evidence Vault
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Tamper-Proof
                    </span>
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Evidence Files (Will be secured to blockchain)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brown-primary transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="evidence-upload"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx,.mp4,.mp3"
                      />
                      <label htmlFor="evidence-upload" className="cursor-pointer">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload evidence files to blockchain
                        </p>
                        <p className="text-xs text-gray-500">
                          Supported: Images, Videos, Audio, PDF, Documents (Max 50MB each)
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          🔒 Files will be cryptographically secured and tamper-proof
                        </p>
                      </label>
                    </div>

                    {/* Evidence Upload Progress */}
                    {evidenceLoading && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
                          <span className="text-blue-800 font-medium">Securing evidence to blockchain...</span>
                        </div>
                      </div>
                    )}

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Evidence Files Ready for Blockchain:</p>
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">🔗 Blockchain Ready</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evidence Description
                    </label>
                    <textarea
                      name="evidenceDescription"
                      value={formData.evidenceDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent resize-none"
                      placeholder="Describe the evidence you are attaching and its relevance to the complaint..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-brown-primary to-brown-secondary text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                        {evidenceLoading ? 'Securing Evidence to Blockchain...' : 'Filing Complaint with Authorities...'}
                      </div>
                    ) : (
                      '🏛️ File Complaint with Blockchain Evidence'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Officials Contact Tab */}
          {activeTab === 'officials-contact' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-brown-primary mb-6">📞 Official Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(officialContacts).map(([key, official]) => (
                  <div key={key} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{official.title}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600">📞</span>
                        <span className="font-medium">Phone:</span>
                        <a 
                          href={`tel:${official.phone}`} 
                          className="text-blue-800 font-bold hover:text-blue-600 underline cursor-pointer"
                        >
                          {official.phone}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">📧</span>
                        <span className="font-medium">Email:</span>
                        <a 
                          href={`mailto:${official.email}`} 
                          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {official.email}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600">🌐</span>
                        <span className="font-medium">Website:</span>
                        <a 
                          href={official.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {official.website}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-600">⏰</span>
                        <span className="font-medium">Hours:</span>
                        <span>{official.hours}</span>
                      </div>
                      <p className="text-gray-600 mt-3 italic">{official.description}</p>
                      
                      {/* Direct Submit Button */}
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => window.open(official.complaintPortal, '_blank')}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium"
                        >
                          🚀 Direct Submit to {official.title}
                        </button>
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, officialType: key }));
                            setActiveTab('file-complaint');
                          }}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium"
                        >
                          📝 Use JAN-KAWACH Auto-Forward
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-800 mb-2">📋 Important Notes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• For emergencies, always call 100 (Police) or 1930 (Cyber Crime)</li>
                  <li>• Keep all evidence and documentation ready before contacting</li>
                  <li>• Note down complaint numbers for tracking</li>
                  <li>• Follow up if no response within stated timeframes</li>
                </ul>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-800 mb-3">🌐 Additional Working Complaint Portals:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-700 mb-1">National Cyber Crime:</h5>
                    <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      cybercrime.gov.in
                    </a>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-1">Banking Fraud:</h5>
                    <a href="https://sachet.rbi.org.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      RBI Sachet Portal
                    </a>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-1">Consumer Complaints:</h5>
                    <a href="https://consumerhelpline.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      National Consumer Helpline
                    </a>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-1">Women Safety:</h5>
                    <a href="https://wcd.nic.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      Women & Child Development
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Track Complaint Tab */}
          {activeTab === 'track-complaint' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-brown-primary mb-6">🔍 Track Your Complaint</h2>
              
              {complaintId ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Recently Filed Complaint</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Complaint ID:</span>
                        <span className="ml-2 text-green-800 font-bold">{complaintId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Filed & Under Review</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Authority:</span>
                        <span className="ml-2">{officialContacts[formData.officialType]?.title}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Evidence Files:</span>
                        <span className="ml-2 text-green-600 font-medium">{evidenceFiles.length} Blockchain Secured</span>
                      </div>
                    </div>
                    
                    {evidenceFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">🔗 Blockchain Evidence:</h4>
                        <div className="space-y-2">
                          {evidenceFiles.map((evidence, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                              <div className="flex items-center space-x-2">
                                <span className="text-blue-600">📎</span>
                                <span className="text-sm font-medium">{evidence.fileName}</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Block #{evidence.blockIndex}</span>
                              </div>
                              <span className="text-xs text-gray-500">ID: {evidence.evidenceId}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Recent Complaints</h3>
                  <p className="text-gray-500 mb-6">File a complaint to track its status here</p>
                  <button
                    onClick={() => setActiveTab('file-complaint')}
                    className="bg-brown-primary text-white px-6 py-2 rounded-lg hover:bg-brown-secondary transition-colors"
                  >
                    File New Complaint
                  </button>
                </div>
              )}

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-800 mb-3">📊 Complaint Status Guide:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Filed</span>
                      <span>Complaint received and acknowledged</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Under Review</span>
                      <span>Being examined by authorities</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Investigation</span>
                      <span>Active investigation in progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Resolved</span>
                      <span>Case closed with resolution</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Vault Tab */}
          {activeTab === 'evidence-vault' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-brown-primary mb-6">🔗 Blockchain Evidence Vault Status</h2>
              
              {blockchainStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{blockchainStats.totalBlocks}</div>
                    <div className="text-sm text-gray-600">Total Blocks</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{blockchainStats.evidenceBlocks}</div>
                    <div className="text-sm text-gray-600">Evidence Files</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${blockchainStats.chainValid ? 'text-green-600' : 'text-red-600'}`}>
                      {blockchainStats.chainValid ? '✅' : '❌'}
                    </div>
                    <div className="text-sm text-gray-600">Chain Integrity</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{blockchainStats.difficulty}</div>
                    <div className="text-sm text-gray-600">Security Level</div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔒 Blockchain Security Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <span><strong>Immutable Storage:</strong> Evidence cannot be modified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">🔐</span>
                      <span><strong>Cryptographic Proof:</strong> SHA-256 hash verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">⛓️</span>
                      <span><strong>Blockchain Security:</strong> Tamper-proof evidence chain</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-600">📋</span>
                      <span><strong>Audit Trail:</strong> Complete access history</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">🚫</span>
                      <span><strong>Duplicate Prevention:</strong> Automatic detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">⚖️</span>
                      <span><strong>Legal Ready:</strong> Court-admissible evidence</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab('file-complaint')}
                  className="bg-gradient-to-r from-brown-primary to-brown-secondary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  🔗 Upload Evidence to Blockchain
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              isSuccess 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {isSuccess ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <pre className="text-sm font-medium whitespace-pre-wrap">{message}</pre>
                  {isSuccess && complaintId && (
                    <p className="text-sm mt-2">
                      You will receive updates via email. Save your complaint ID for reference.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🆘 Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">National Cyber Crime Helpline:</p>
                <p>📞 1930 (24x7 Toll Free)</p>
              </div>
              <div>
                <p className="font-medium">Email Support:</p>
                <p>📧 complaints@cybercrime.gov.in</p>
              </div>
              <div>
                <p className="font-medium">Online Portal:</p>
                <p>🌐 www.cybercrime.gov.in</p>
              </div>
              <div>
                <p className="font-medium">Response Time:</p>
                <p>⏱️ 24-48 hours for acknowledgment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper functions
  useEffect(() => {
    const fetchBlockchainStats = async () => {
      if (!token) return;
      
      try {
        const res = await apiFetch('/api/vault/blockchain/stats', {
          method: 'GET'
        }, token);
        
        const data = await res.json();
        if (data.success) {
          setBlockchainStats(data.blockchainStats);
        }
      } catch (error) {
        console.error('Error fetching blockchain stats:', error);
      }
    };

    fetchBlockchainStats();
  }, [token]);
}

export default Complaint;
