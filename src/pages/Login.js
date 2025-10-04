import React, { useState } from 'react';
import Header from '../components/Header';
import AuthForm from '../components/AuthForm';
import Input from '../components/Input';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import Sidebar from '../components/Sidebar';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  return (
    <PageLayout showSidebar={true} Sidebar={Sidebar}>
      <Header title="JAN - KAWACH" />
      
      <div className="flex items-center justify-center px-8 py-8 min-h-full">
        <AuthForm
          title="Sign in to your account"
          subtitle="Or"
          alternativeLink="/signup"
          alternativeLinkText="create a new account"
          onSubmit={handleSubmit}
          submitText="Sign in"
        >
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
            autoComplete="current-password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-brown-primary focus:ring-brown-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Button 
                variant="outline" 
                size="sm" 
                className="!p-0 !border-0 !bg-transparent text-brown-primary hover:text-brown-secondary underline !transform-none !shadow-none"
              >
                Forgot your password?
              </Button>
            </div>
          </div>
        </AuthForm>
      </div>
    </PageLayout>
  );
};

export default Login;