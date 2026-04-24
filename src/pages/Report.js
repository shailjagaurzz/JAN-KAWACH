import React, { useContext, useState } from 'react';
import Navbar from '../components/Navbar';
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
    <div className="min-h-screen relative overflow-hidden px-4 py-8">
      <div className="hero-orb h-56 w-56 bg-cyan-300/35 -top-10 -left-12" />
      <div className="hero-orb h-64 w-64 bg-amber-300/35 top-20 -right-16" />
      <Navbar />
      <div className="max-w-2xl mx-auto mt-8 glass-panel rounded-3xl p-6 md:p-8 reveal-up">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Report Entity</h2>
      <p className="text-slate-600 mb-6">Add a number, email, or URL to the community safety network.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Type (e.g. scam, fraud)"
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl bg-white/90 focus:ring-2 focus:ring-cyan-500 outline-none"
          required
        />
        <input
          type="text"
          placeholder="Value (e.g. phone, email, url)"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl bg-white/90 focus:ring-2 focus:ring-cyan-500 outline-none"
          required
        />
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl bg-white/90 focus:ring-2 focus:ring-cyan-500 outline-none"
        />
        <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-4 py-3 font-semibold shadow-lg shadow-cyan-600/25">
          Report
        </button>
      </form>
      <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>
      </div>
    </div>
  );
}

export default Report;
