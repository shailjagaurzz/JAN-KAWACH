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
    <div className="min-h-screen relative overflow-hidden">
      <div className="hero-orb h-52 w-52 bg-cyan-300/45 -top-10 -left-12" />
      <div className="hero-orb h-64 w-64 bg-amber-300/45 top-32 -right-16" />
      <div className="hero-orb h-56 w-56 bg-emerald-300/35 bottom-6 left-1/3" />

      <Navbar 
        onLoginClick={() => setShowLoginModal(true)}
        onSignupClick={() => setShowSignupModal(true)}
      />
      
      {/* Hero Section */}
      <section className="py-16 md:py-20 px-5 md:px-8 text-center relative z-10 reveal-up">
        <div className="max-w-5xl mx-auto glass-panel rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 brand-gradient-text">
            JAN - KAWACH
          </h1>
          <p className="text-cyan-800 font-semibold text-base md:text-xl mb-7">
            Your Digital Security Guardian
          </p>
          
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Protecting Communities from 
            <span className="brand-gradient-text"> Digital Threats</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Join thousands of users in creating a safer digital environment through collaborative threat reporting and real-time security alerts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-5">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-left">
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 hover-lift">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Coverage</p>
              <p className="text-lg font-bold text-slate-900">24/7 Threat Monitoring</p>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 hover-lift">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Community</p>
              <p className="text-lg font-bold text-slate-900">Collaborative Reporting</p>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 hover-lift">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Evidence</p>
              <p className="text-lg font-bold text-slate-900">Secure Digital Vault</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-5 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
            How Jan-Kawach Protects You
          </h3>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12">
            Purpose-built safety modules that keep your team informed, connected, and protected.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresLoading ? (
              // simple skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-lg h-44" />
              ))
            ) : (
              features.map((feature, index) => (
                <Link key={index} to={feature.link} className="group feature-reveal">
                  <div className="glass-panel rounded-2xl p-6 cursor-pointer border-2 border-transparent hover:border-cyan-200 hover-lift">
                    <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">{feature.icon}</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-700 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 text-cyan-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
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
      <section className="py-16 px-5 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center glass-panel rounded-3xl p-8 md:p-10 border border-slate-200/80">
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-xl leading-relaxed mb-8 text-slate-700">
              To build a community that protects each other and takes action against digital and real-world malpractice.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover-lift">
                <h4 className="font-bold text-lg mb-2 text-slate-900">Stay Aware</h4>
                <p className="text-slate-600">Get informed about latest threats</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover-lift">
                <h4 className="font-bold text-lg mb-2 text-slate-900">Stay Protected</h4>
                <p className="text-slate-600">Use our tools to safeguard yourself</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover-lift">
                <h4 className="font-bold text-lg mb-2 text-slate-900">Stay Connected</h4>
                <p className="text-slate-600">Together, we make the internet safer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 pb-16 px-5 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center glass-panel rounded-3xl p-8 border border-slate-200/80">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Ready to Join Our Security Community?
            </h3>
            <p className="text-slate-700 mb-6">
              Start protecting yourself and others from digital threats today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <span className="text-cyan-800 text-lg font-semibold">Not a member yet?</span>
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