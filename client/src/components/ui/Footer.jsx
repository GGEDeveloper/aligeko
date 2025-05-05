import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">AliTools</h3>
            <p className="text-neutral-200 mb-2">
              Your trusted partner for wholesale tools.
            </p>
            <p className="text-neutral-200">
              Quality. Reliability. Service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-200 hover:text-white transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-neutral-200 hover:text-white transition-smooth">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-200 hover:text-white transition-smooth">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-200 hover:text-white transition-smooth">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-neutral-200 hover:text-white transition-smooth">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-neutral-200 hover:text-white transition-smooth">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-neutral-200 hover:text-white transition-smooth">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-neutral-200 hover:text-white transition-smooth">
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-2 text-neutral-200">
              <li>
                <i className="bi bi-geo-alt mr-2"></i> Lisbon, Portugal
              </li>
              <li>
                <i className="bi bi-telephone mr-2"></i> +351 123 456 789
              </li>
              <li>
                <i className="bi bi-envelope mr-2"></i> info@alitools.com
              </li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-white hover:text-secondary-300 transition-smooth">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary-300 transition-smooth">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary-300 transition-smooth">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary-300 transition-smooth">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-600 mt-8 pt-6 text-center text-neutral-300">
          <p>&copy; {currentYear} AliTools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 