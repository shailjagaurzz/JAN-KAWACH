import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import Section from '../components/Section';
import PageLayout from '../components/PageLayout';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: "🛡️",
      title: "Report Threats",
      description: "Quickly report scams, fraud, and security threats to protect your community"
    },
    {
      icon: "📱",
      title: "Real-time Alerts",
      description: "Get instant notifications about unsafe vendors and ongoing cyber incidents"
    },
    {
      icon: "🗃️",
      title: "Secure Evidence Storage",
      description: "Store screenshots, chats, and documents securely as evidence"
    },
    {
      icon: "🤝",
      title: "Community Support",
      description: "Share experiences anonymously and get help from our community"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <PageLayout showSidebar={true} Sidebar={Sidebar}>
      <Header 
        title="JAN - KAWACH" 
        subtitle="Your Digital Security Guardian" 
        centered={true} 
      />
      
      {/* Hero Section */}
      <Section 
        padding="lg" 
        className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        maxWidth="4xl"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
          Protecting Communities from 
          <span className="text-brown-primary"> Digital Threats</span>
        </h2>
        
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          Join thousands of users in creating a safer digital environment through collaborative threat reporting and real-time security alerts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button to="/signup" variant="primary" size="lg">
            Get Started Free
          </Button>
          <Button to="/login" variant="secondary" size="lg">
            Sign In
          </Button>
        </div>
      </Section>

      {/* Features Section */}
      <Section padding="lg">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How Jan-Kawach Protects You
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Section>

      {/* Mission Statement */}
      <Section background="gradient" padding="lg" maxWidth="4xl">
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
      </Section>

      {/* Call to Action */}
      <Section background="cream" padding="default" maxWidth="4xl">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join Our Security Community?
          </h3>
          <p className="text-gray-700 mb-6">
            Start protecting yourself and others from digital threats today.
          </p>
          <div className="flex justify-center items-center space-x-4">
            <span className="text-brown-secondary text-lg font-medium">Not a member yet?</span>
            <Button to="/signup" variant="primary" size="md">
              Join Now
            </Button>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Dashboard;