import React, { useState } from 'react';
import Header from '../components/Header';
import AuthForm from '../components/AuthForm';
import Input from '../components/Input';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import Sidebar from '../components/Sidebar';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Signup attempt:', formData);
  };

  return (
    <PageLayout showSidebar={true} Sidebar={Sidebar}>
      <Header title="JAN - KAWACH" />
      
      <div className="flex items-center justify-center px-8 py-8 min-h-full">
        <AuthForm
          title="Create your account"
          subtitle="Or"
          alternativeLink="/login"
          alternativeLinkText="sign in to your existing account"
          onSubmit={handleSubmit}
          submitText="Create Account"
        >
          <Input
            label="Full Name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
          />
          
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
          
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <div className="flex items-center">
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
          </div>
        </AuthForm>
      </div>
    </PageLayout>
  );
};

export default Signup;