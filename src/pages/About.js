import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-4">About this App</h1>

        <p className="text-gray-700 mb-4">
          Welcome! This application is a community safety and collaboration platform where users can:
        </p>

        <h2 className="text-xl font-semibold mt-4">What you can do</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Create community posts and share updates (optionally anonymously).</li>
          <li>File complaints with an optional attachment; a PDF summary is generated for each complaint.</li>
          <li>Validate QR codes using your camera or by uploading images. Links in QR codes are scanned for safety.</li>
          <li>Store sensitive files securely in an encrypted e-Vault accessible only to you.</li>
          <li>Receive real-time alerts for reported entities via live notifications.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">How to use (quick start)</h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2">
          <li>Sign up or log in from the Auth page to access protected features (posts, vault, complaints).</li>
          <li>Visit "Posts" to view or create community posts. Use the text box and Post button to share.</li>
          <li>To file a complaint, go to "Complaint", fill category & description, attach a file if needed, and submit.</li>
          <li>Use "Validate QR" to scan QR codes; the app will show whether the embedded link is safe.</li>
          <li>To store files securely, open "Vault" and upload. Files are encrypted server-side before storage.</li>
        </ol>

        <h2 className="text-xl font-semibold mt-6">Privacy & Security</h2>
        <p className="text-gray-700 mb-2">We take privacy seriously:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Authentication uses JWT tokens — keep your token private.</li>
          <li>Vault files are encrypted on the server before being stored in the vault.</li>
          <li>QR links are optionally scanned via VirusTotal (requires a valid API key on the server) to detect malicious URLs.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Need help or feedback?</h2>
        <p className="text-gray-700">If you find bugs or want to suggest features, open an issue in the repository or contact support@example.com.</p>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brown-primary hover:bg-brown-secondary text-white font-medium px-4 py-2 rounded shadow"
            aria-label="Back to Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
