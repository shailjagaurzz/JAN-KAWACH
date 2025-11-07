import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

const ValidateQR = () => {
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  // Validate QR code using backend
  const validateWithBackend = async (text) => {
    setLoading(true);
    try {
      const res = await fetch('/api/validate-qr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qr: text }) });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ valid: false, message: 'Server error. Try again.' });
    }
    setLoading(false);
  };

  const handleValidate = (e) => {
    e.preventDefault();
    validateWithBackend(qrInput);
  };

  const handleScan = (data) => {
    if (data) {
      setQrInput(data);
      validateWithBackend(data);
      setCameraActive(false); // Stop camera after scan
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Validate QR</h2>
        <form onSubmit={handleValidate} className="mb-4">
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={qrInput}
            onChange={e => setQrInput(e.target.value)}
            placeholder="Paste or enter QR code here"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Validating...' : 'Validate QR'}
          </button>
        </form>
        <div className="mb-4">
          {cameraActive && (
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={(result, error) => {
                if (!!result) {
                  handleScan(result?.text);
                }
              }}
              style={{ width: '100%' }}
            />
          )}
          <div className="text-xs text-gray-500 text-center mt-2">Scan QR code using your camera</div>
        </div>
        {result && (
          <div className={`text-center font-semibold ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
            {result.message}
            {result.type === 'url' && result.url && (
              <div className="mt-2 text-sm text-gray-700">
                <span>URL: </span>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{result.url}</a>
              </div>
            )}
            {result.data && result.type !== 'url' && (
              <div className="mt-2 text-sm text-gray-700">Decoded Data: {result.data}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidateQR;
