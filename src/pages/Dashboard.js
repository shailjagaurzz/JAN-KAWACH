import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-cream flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b-4 border-brown-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-4xl font-bold text-brown-primary tracking-wider">
                  JAN - KAWACH
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Main content area */}
          <main className="flex-1 px-8 py-8">
            <div className="max-w-4xl">
              <div className="space-y-6 text-gray-800">
                <p className="text-lg leading-relaxed">
                  Jan - Kawach helps you report scams, blackmail, fraud, or any security threats 
                  you come across. It also keeps you informed with real-time alerts about unsafe 
                  vendors, fake websites, or ongoing cyber incidents in your area.
                </p>

                <p className="text-lg leading-relaxed">
                  You can securely store evidence like chats, screenshots, or documents, get 
                  step-by-step help on what to do if you're a victim, and even share your story 
                  anonymously to warn others.
                </p>

                <p className="text-lg leading-relaxed font-semibold">
                  Our goal is simple — to build a community that protects each other and takes 
                  action against digital and real-world malpractice.
                </p>

                <div className="space-y-2 mt-8">
                  <p className="text-lg font-bold text-gray-900">Stay aware. Stay protected.</p>
                  <p className="text-lg font-bold text-gray-900">Together, we make the internet safer.</p>
                </div>

                <div className="mt-12 flex items-center space-x-4">
                  <span className="text-brown-secondary text-lg">Not Logged in yet?...</span>
                  <Link 
                    to="/login" 
                    className="bg-brown-primary hover:bg-brown-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;