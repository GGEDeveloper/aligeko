import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-blue-700 text-white rounded-lg overflow-hidden">
        <div className="container mx-auto py-12 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Quality Tools for Professional Businesses
              </h1>
              <p className="text-xl text-blue-100">
                Ali Tools provides premium quality tools for professional businesses 
                with competitive wholesale pricing and exceptional service.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-white text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-md font-medium"
                >
                  Browse Products
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent hover:bg-blue-800 border-2 border-white px-6 py-3 rounded-md font-medium"
                >
                  Register Now
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <img
                  src="https://placehold.co/600x400/EEE/31343C?text=AliTools+Professional+Tools"
                  alt="Professional Tools"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AliTools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Our tools are sourced from trusted manufacturers, ensuring durability and performance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Wholesale Pricing</h3>
              <p className="text-gray-600">
                Competitive pricing for businesses with transparent volume discounts.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Dedicated Support</h3>
              <p className="text-gray-600">
                Our team of experts is available to assist with product selection and order support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing network of business customers and enjoy the benefits of our B2B platform.
          </p>
          <Link
            to="/register"
            className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-medium text-lg"
          >
            Register Your Business
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 