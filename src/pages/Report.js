import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';

function Report() {
  const { token } = useContext(AuthContext);
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ type, value, reason }),
    });
    const data = await res.json();
    setMessage(data.message || (data.success ? 'Reported!' : 'Error'));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Report Entity</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Type (e.g. scam, fraud)"
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Value (e.g. phone, email, url)"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Report
        </button>
      </form>
      <p className="mt-2 text-green-600">{message}</p>
    </div>
  );
}

export default Report;
