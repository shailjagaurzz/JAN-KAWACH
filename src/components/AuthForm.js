import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const AuthForm = ({ 
  title, 
  subtitle, 
  alternativeText, 
  alternativeLink, 
  alternativeLinkText,
  onSubmit, 
  children,
  submitText = 'Submit',
  loading = false 
}) => {
  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {subtitle}{' '}
          <Link to={alternativeLink} className="font-medium text-brown-primary hover:text-brown-secondary">
            {alternativeLinkText}
          </Link>
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          {children}
        </div>

        <div>
          <Button 
            type="submit" 
            variant="primary" 
            size="md"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : submitText}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;