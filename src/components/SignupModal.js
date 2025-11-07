import React, { useState, useContext } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { AuthContext } from '../App';
import { apiFetch } from '../api';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token and update auth context
        setToken(data.token);
        localStorage.setItem('token', data.token);
        
        // Reset form and close modal
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        onClose();
        
        // Show success message (optional)
        console.log('Signup successful:', data.message);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <Input
          label="Full Name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
        />
        
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Create a password (min 6 characters)"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
        
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />

        {/* <div className="flex items-center">
          <input
            id="agree-terms"
            name="agree-terms"
            type="checkbox"
            required
            className="h-4 w-4 text-brown-primary focus:ring-brown-primary border-gray-300 rounded"
          />
          <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Button 
              variant="outline" 
              size="sm" 
              className="!p-0 !border-0 !bg-transparent text-brown-primary hover:text-brown-secondary underline !transform-none !shadow-none"
            >
              Terms and Conditions
            </Button>
          </label>
        </div> */}

        <Button 
          type="submit" 
          variant="primary" 
          size="md" 
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="font-medium text-brown-primary hover:text-brown-secondary"
            disabled={loading}
          >
            Sign in
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SignupModal;