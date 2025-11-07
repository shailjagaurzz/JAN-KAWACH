import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setEmailSent(true);
      console.log(`Reset link sent to: ${email}`);
      // Here you can call your backend API to send the actual reset email
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-white to-cream px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        {!emailSent ? (
          <>
            <h1 className="text-3xl font-bold text-brown-primary mb-6 text-center">
              Forgot Password
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Enter your registered email, and we’ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-primary focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brown-primary hover:bg-brown-secondary text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brown-primary mb-4">Check your email!</h1>
            <p className="text-gray-600">
              A password reset link has been sent to <span className="font-medium">{email}</span>.
            </p>
            <a 
              href="/" 
              className="text-brown-primary hover:text-brown-secondary font-medium underline mt-4 block"
            >
              ← Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
