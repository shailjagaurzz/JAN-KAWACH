import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';

const Dashboard = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { token } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const [featuresLoading, setFeaturesLoading] = useState(true);

  // Simulate loading features and then set to false
  useEffect(() => {
    const timer = setTimeout(() => {
      setFeaturesLoading(false);
    }, 500); // Half second delay for loading effect
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: "🛡️",
      title: "Report Threats",
      description: "Quickly report scams, fraud, and security threats to protect your community",
      link: "/report"
    },
    {
      icon: "🚫",
      title: "Security Blacklist",
      description: "Add threatening numbers, emails, URLs and get SMS alerts when they contact you",
      link: "/blacklist"
    },
    {
      icon: "🔍",
      title: "Threat Checker",
      description: "Check if emails, phone numbers, or URLs are blacklisted before interacting",
      link: "/threat-checker"
    },
    {
      icon: "📱",
      title: "Real-time Alerts",
      description: "Get instant SMS notifications about blacklisted sources contacting you",
      link: "/blacklist"
    },
    {
      icon: "🗃️",
      title: "Secure Evidence Storage",
      description: "Store screenshots, chats, and documents securely as evidence",
      link: "/vault"
    },
    {
      icon: "🤝",
      title: "Community Support",
      description: "Share experiences anonymously and get help from our community",
      link: "/posts"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <Navbar 
        onLoginClick={() => setShowLoginModal(true)}
        onSignupClick={() => setShowSignupModal(true)}
      />
      
      {/* Hero Section */}
      <section className="py-16 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-brown-primary tracking-wider mb-4">
            JAN - KAWACH
          </h1>
          <p className="text-brown-secondary font-medium text-xl mb-8">
            Your Digital Security Guardian
          </p>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Protecting Communities from 
            <span className="text-brown-primary"> Digital Threats</span>
          </h2>
          
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Join thousands of users in creating a safer digital environment through collaborative threat reporting and real-time security alerts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            {token ? (
              <Link to="/posts">
                <Button variant="primary" size="lg">
                  🚀 Visit Community Posts
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  onClick={() => setShowSignupModal(true)} 
                  variant="primary" 
                  size="lg"
                >
                  Get Started Free
                </Button>
                <Button 
                  onClick={() => setShowLoginModal(true)} 
                  variant="secondary" 
                  size="lg"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How Jan-Kawach Protects You
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresLoading ? (
              // simple skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-lg h-44" />
              ))
            ) : (
              features.map((feature, index) => (
                <Link key={index} to={feature.link} className="group">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 cursor-pointer border-2 border-transparent group-hover:border-brown-primary">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brown-primary transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 text-brown-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more →
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-gradient-to-r from-brown-primary to-brown-secondary text-white py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-xl leading-relaxed mb-8">
              To build a community that protects each other and takes action against digital and real-world malpractice.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-bold text-lg mb-2">Stay Aware</h4>
                <p>Get informed about latest threats</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-bold text-lg mb-2">Stay Protected</h4>
                <p>Use our tools to safeguard yourself</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-bold text-lg mb-2">Stay Connected</h4>
                <p>Together, we make the internet safer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-cream py-12 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join Our Security Community?
            </h3>
            <p className="text-gray-700 mb-6">
              Start protecting yourself and others from digital threats today.
            </p>
            <div className="flex justify-center items-center space-x-4">
              <span className="text-brown-secondary text-lg font-medium">Not a member yet?</span>
              <Button 
                onClick={() => setShowSignupModal(true)} 
                variant="primary" 
                size="md"
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

export default Dashboard;