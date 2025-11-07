import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { apiFetch } from '../api';
import Navbar from '../components/Navbar';

function Vault() {
  const { token, user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    tags: '',
    associatedCase: ''
  });
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      // Show file preview info
      setMessage(`Selected: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    setLoading(true);
    setMessage('');
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('tags', formData.tags);
      uploadFormData.append('associatedCase', formData.associatedCase);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const res = await apiFetch('/api/vault/upload', {
        method: 'POST',
        body: uploadFormData
      }, token);
      
      const data = await res.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (data.success) {
        setMessage(`Evidence secured to blockchain! Evidence ID: ${data.evidence.evidenceId}`);
        setFile(null);
        setFormData({ description: '', tags: '', associatedCase: '' });
        document.getElementById('file-input').value = '';
        fetchFiles();
        
        setTimeout(() => {
          setUploadProgress(0);
        }, 2000);
      } else {
        setMessage(data.message || 'Upload failed');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    if (!token) return;
    
    try {
      const res = await apiFetch('/api/vault/files', {
        method: 'GET'
      }, token);
      
      const data = await res.json();
      
      if (data.success) {
        setFiles(data.files || []);
        setBlockchainStats(data.blockchainStats);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const verifyEvidence = async (evidenceId) => {
    try {
      setVerificationStatus(prev => ({ ...prev, [evidenceId]: 'verifying' }));
      
      const res = await apiFetch(`/api/vault/verify/${evidenceId}`, {
        method: 'GET'
      }, token);
      
      const data = await res.json();
      
      if (data.success) {
        setVerificationStatus(prev => ({ 
          ...prev, 
          [evidenceId]: data.overallStatus 
        }));
        
        setMessage(`Verification complete: ${data.overallStatus}`);
      } else {
        setVerificationStatus(prev => ({ ...prev, [evidenceId]: 'error' }));
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus(prev => ({ ...prev, [evidenceId]: 'error' }));
      setMessage('Verification error');
    }
  };

  const downloadEvidence = async (evidenceId, fileName) => {
    try {
      const res = await fetch(`/api/vault/download/${evidenceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        setMessage(`Downloaded: ${fileName}`);
      } else {
        const errorData = await res.json();
        setMessage(errorData.message || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Download failed');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    return '📎';
  };

  const getVerificationBadge = (file) => {
    const status = verificationStatus[file.evidenceId] || file.integrityStatus;
    
    switch (status) {
      case 'verified':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Verified</span>;
      case 'corrupted':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">❌ Corrupted</span>;
      case 'verifying':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">🔄 Verifying...</span>;
      case 'error':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">⚠️ Error</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">🔗 Blockchain</span>;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brown-primary mb-4">🔒 Secure Evidence Vault</h2>
            <p className="text-gray-600">Please log in to access the blockchain evidence vault</p>
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
              🔗 Blockchain Evidence Vault
            </h1>
            <p className="text-gray-600 text-lg">
              Immutable, tamper-proof evidence storage powered by blockchain technology
            </p>
          </div>

          {/* Blockchain Stats Dashboard */}
          {blockchainStats && (
            <div className="bg-white rounded-lg shadow-xl p-6 mb-8 border-t-4 border-blue-600">
              <h3 className="text-xl font-bold mb-6 flex items-center text-blue-900">
                <span className="mr-3">📊</span>
                Blockchain Network Status
                <span className="ml-auto">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    blockchainStats.chainValid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className="mr-1">{blockchainStats.chainValid ? '✅' : '❌'}</span>
                    {blockchainStats.chainValid ? 'SECURE' : 'WARNING'}
                  </span>
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {blockchainStats.totalBlocks}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Blocks</div>
                  <div className="text-xs text-gray-500 mt-1">In Blockchain</div>
                </div>
                <div className="text-center bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {blockchainStats.evidenceBlocks}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Evidence Files</div>
                  <div className="text-xs text-gray-500 mt-1">Secured</div>
                </div>
                <div className="text-center bg-purple-50 rounded-lg p-4">
                  <div className={`text-3xl font-bold mb-2 ${blockchainStats.chainValid ? 'text-green-600' : 'text-red-600'}`}>
                    {blockchainStats.chainValid ? '🔒' : '⚠️'}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Chain Integrity</div>
                  <div className={`text-xs mt-1 ${blockchainStats.chainValid ? 'text-green-600' : 'text-red-600'}`}>
                    {blockchainStats.chainValid ? 'Verified' : 'Compromised'}
                  </div>
                </div>
                <div className="text-center bg-orange-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {blockchainStats.difficulty}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Security Level</div>
                  <div className="text-xs text-gray-500 mt-1">Mining Difficulty</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                📤 Upload Evidence
              </h3>
              
              <form onSubmit={handleUpload} className="space-y-6">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brown-primary transition-colors">
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                      required
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-gray-600">
                        Click to select evidence file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supported: Images, Videos, Audio, PDF, Documents (Max 50MB)
                      </p>
                    </label>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploadProgress > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Securing to blockchain...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brown-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent resize-none"
                    placeholder="Describe the evidence and its relevance..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                    placeholder="cybercrime, fraud, evidence, screenshot"
                  />
                </div>

                {/* Associated Case */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Associated Case/Complaint ID
                  </label>
                  <input
                    type="text"
                    name="associatedCase"
                    value={formData.associatedCase}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                    placeholder="Link to complaint or case reference"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full bg-gradient-to-r from-brown-primary to-brown-secondary text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Securing to Blockchain...
                    </div>
                  ) : (
                    '🔗 Secure Evidence to Blockchain'
                  )}
                </button>
              </form>
            </div>

            {/* Evidence List */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                📋 Evidence Vault
              </h3>
              
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="text-gray-500">No evidence files yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Upload your first piece of evidence to secure it on the blockchain
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {files.map((file) => (
                    <div key={file._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xl">{getFileIcon(file.mimeType)}</span>
                            <h4 className="font-medium text-gray-900 truncate">
                              {file.fileName}
                            </h4>
                            {getVerificationBadge(file)}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📅 {new Date(file.uploadedAt).toLocaleDateString()}</p>
                            <p>🔗 Block #{file.blockIndex}</p>
                            <p>💾 {(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                            <p>🆔 {file.evidenceId}</p>
                            
                            {file.description && (
                              <p className="text-xs text-gray-500 mt-2 italic">
                                "{file.description}"
                              </p>
                            )}
                            
                            {file.tags && file.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {file.tags.map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => verifyEvidence(file.evidenceId)}
                          disabled={verificationStatus[file.evidenceId] === 'verifying'}
                          className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          🔍 Verify
                        </button>
                        
                        <button
                          onClick={() => downloadEvidence(file.evidenceId, file.fileName)}
                          className="flex-1 bg-green-600 text-white text-sm py-2 px-3 rounded hover:bg-green-700 transition-colors"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.includes('secured') || message.includes('verified') || message.includes('Downloaded')
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.includes('secured') || message.includes('verified') || message.includes('Downloaded') ? (
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
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

export default Vault;
