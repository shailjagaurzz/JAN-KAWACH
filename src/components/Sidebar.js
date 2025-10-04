import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Know about the app', path: '/' },
    { name: 'Login', path: '/login' },
    { name: 'Signup', path: '/signup' },
    { name: 'Posts', path: '/posts' },
    { name: 'Blacklist', path: '/blacklist' },
    { name: 'Validate QR', path: '/validate-qr' },
    { name: 'E-vault', path: '/e-vault' },
  ];

  return (
    <aside className="w-80 bg-brown-primary shadow-lg">
      <div className="p-6">
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="block text-white text-lg hover:text-cream transition-colors duration-200 py-3 px-4 rounded hover:bg-brown-secondary"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;