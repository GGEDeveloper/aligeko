import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">AliTools</h3>
            <p className="text-gray-300 mb-2">
              Your trusted partner for wholesale tools.
            </p>
            <p className="text-gray-300">
              Quality. Reliability. Service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white">
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <i className="fas fa-map-marker-alt mr-2"></i> Lisbon, Portugal
              </li>
              <li>
                <i className="fas fa-phone mr-2"></i> +351 123 456 789
              </li>
              <li>
                <i className="fas fa-envelope mr-2"></i> info@alitools.com
              </li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-white hover:text-blue-400">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-blue-400">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-blue-400">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-blue-400">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {currentYear} AliTools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 