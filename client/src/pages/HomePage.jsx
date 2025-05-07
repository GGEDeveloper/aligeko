import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // Sample featured products (would come from an API in production)
  const featuredProducts = [
    {
      id: 1,
      name: 'Professional Drill Set',
      price: 199.99,
      image: 'https://placehold.co/300x300/EEE/31343C?text=Drill+Set',
      category: 'Power Tools',
    },
    {
      id: 2,
      name: 'Precision Screwdriver Kit',
      price: 49.99,
      image: 'https://placehold.co/300x300/EEE/31343C?text=Screwdriver+Kit',
      category: 'Hand Tools',
    },
    {
      id: 3,
      name: 'Industrial Safety Glasses',
      price: 29.99,
      image: 'https://placehold.co/300x300/EEE/31343C?text=Safety+Glasses',
      category: 'Safety Equipment',
    },
    {
      id: 4,
      name: 'Heavy-Duty Work Gloves',
      price: 24.99,
      image: 'https://placehold.co/300x300/EEE/31343C?text=Work+Gloves',
      category: 'Safety Equipment',
    },
  ];

  return (
    <div className="space-y-8 md:space-y-12 -mt-6 md:-mt-8">
      {/* Hero Section */}
      <section className="bg-primary-800 text-white py-10 md:py-16 px-4 md:px-8 rounded-b-lg shadow-md">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Professional Tools for Your Business
              </h1>
              <p className="text-lg text-neutral-100 max-w-lg">
                Ali Tools provides wholesale premium quality tools with competitive pricing and exceptional service.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-brand hover:bg-brand-600 text-primary-900 font-medium px-6 py-3 rounded-md shadow-md transition-all duration-200"
                >
                  Browse Products
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-medium px-6 py-3 rounded-md transition-all duration-200"
                >
                  Register Now
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <img
                  src="https://placehold.co/800x600/EEE/31343C?text=AliTools+Professional+Tools"
                  alt="Professional Tools"
                  className="w-full h-auto rounded shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/categories/power-tools" className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all text-center">
              <div className="text-2xl mb-2">🔌</div>
              <h3 className="font-bold text-primary-800">Power Tools</h3>
            </Link>
            <Link to="/categories/hand-tools" className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all text-center">
              <div className="text-2xl mb-2">🔧</div>
              <h3 className="font-bold text-primary-800">Hand Tools</h3>
            </Link>
            <Link to="/categories/safety" className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-bold text-primary-800">Safety Equipment</h3>
            </Link>
            <Link to="/categories/all" className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all text-center">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-bold text-primary-800">All Categories</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3">Featured Products</h2>
            <p className="text-primary-600 max-w-2xl mx-auto">
              Discover our selection of high-quality professional tools designed for businesses like yours.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <span className="text-xs text-brand font-medium">{product.category}</span>
                  <h3 className="font-bold text-lg mt-1 text-primary-800">{product.name}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                    <Link
                      to={`/products/${product.id}`}
                      className="bg-primary-800 hover:bg-primary-900 text-white px-3 py-2 rounded-md text-sm transition-all duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-block bg-primary-800 hover:bg-primary-900 text-white px-6 py-3 rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-neutral-100 py-12 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose AliTools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-brand-100 text-primary-800 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-800">Premium Quality</h3>
              <p className="text-primary-600">
                Our tools are sourced from trusted manufacturers, ensuring durability and performance for professional use.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-brand-100 text-primary-800 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-800">Wholesale Pricing</h3>
              <p className="text-primary-600">
                Competitive pricing for businesses with transparent volume discounts. Save more when you buy more.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-brand-100 text-primary-800 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-800">Dedicated Support</h3>
              <p className="text-primary-600">
                Our team of experts is available to assist with product selection, technical guidance, and order support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Trusted By Businesses</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
              <img src="https://placehold.co/200x80/EEE/31343C?text=Company+1" alt="Company 1" className="h-10" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
              <img src="https://placehold.co/200x80/EEE/31343C?text=Company+2" alt="Company 2" className="h-10" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
              <img src="https://placehold.co/200x80/EEE/31343C?text=Company+3" alt="Company 3" className="h-10" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
              <img src="https://placehold.co/200x80/EEE/31343C?text=Company+4" alt="Company 4" className="h-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-900 rounded-lg p-8 text-center shadow-lg my-8">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
          <p className="text-lg text-neutral-100 mb-6 max-w-3xl mx-auto">
            Join our growing network of business customers and enjoy the benefits of our B2B platform. Register today to access wholesale pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-brand hover:bg-brand-600 text-primary-900 px-6 py-3 rounded-md font-medium shadow-md transition-all duration-200"
            >
              Register Your Business
            </Link>
            <Link
              to="/contactos"
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-6 py-3 rounded-md font-medium transition-all duration-200"
            >
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 