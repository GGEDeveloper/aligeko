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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto py-16 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                Professional Tools for Your Business
              </h1>
              <p className="text-xl md:text-2xl text-neutral-100 max-w-lg">
                Ali Tools provides wholesale premium quality tools with competitive pricing and exceptional service.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-brand text-primary hover:bg-brand-600 transition-smooth px-8 py-4 rounded-md font-medium text-lg shadow-md"
                >
                  Browse Products
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent hover:bg-primary-800 transition-smooth border-2 border-white px-8 py-4 rounded-md font-medium text-lg"
                >
                  Register Now
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="w-full max-w-lg bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                <img
                  src="https://placehold.co/800x600/EEE/31343C?text=AliTools+Professional+Tools"
                  alt="Professional Tools"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <Link to="/categories/power-tools" className="category-card">
              <div className="text-4xl mb-3">🔌</div>
              <h3 className="font-bold text-lg text-primary">Power Tools</h3>
            </Link>
            <Link to="/categories/hand-tools" className="category-card">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="font-bold text-lg text-primary">Hand Tools</h3>
            </Link>
            <Link to="/categories/safety" className="category-card">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-bold text-lg text-primary">Safety Equipment</h3>
            </Link>
            <Link to="/categories/all" className="category-card">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-bold text-lg text-primary">All Categories</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-primary-600 max-w-2xl mx-auto">
              Discover our selection of high-quality professional tools designed for businesses like yours.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <span className="text-sm text-brand font-medium">{product.category}</span>
                  <h3 className="font-bold text-lg mt-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                    <Link
                      to={`/products/${product.id}`}
                      className="bg-primary hover:bg-primary-800 text-white px-3 py-1 rounded-md text-sm transition-smooth"
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
              className="inline-block bg-primary hover:bg-primary-800 text-white px-6 py-2 rounded-md font-medium transition-smooth shadow-hover"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-neutral-200 py-16 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AliTools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card">
              <div className="bg-brand-100 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
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
              <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
              <p className="text-primary-600">
                Our tools are sourced from trusted manufacturers, ensuring durability and performance for professional use.
              </p>
            </div>
            <div className="feature-card">
              <div className="bg-brand-100 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
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
              <h3 className="text-xl font-bold mb-3">Wholesale Pricing</h3>
              <p className="text-primary-600">
                Competitive pricing for businesses with transparent volume discounts. Save more when you buy more.
              </p>
            </div>
            <div className="feature-card">
              <div className="bg-brand-100 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Dedicated Support</h3>
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
          <h2 className="text-3xl font-bold mb-12">Trusted By Businesses</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center items-center opacity-70">
            <div className="shadow-hover">
              <img src="https://placehold.co/200x80/EEE/31343C?text=Company+1" alt="Company 1" className="h-12" />
            </div>
            <div className="shadow-hover">
              <img src="https://placehold.co/200x80/EEE/31343C?text=Company+2" alt="Company 2" className="h-12" />
            </div>
            <div className="shadow-hover">
              <img src="https://placehold.co/200x80/EEE/31343C?text=Company+3" alt="Company 3" className="h-12" />
            </div>
            <div className="shadow-hover">
              <img src="https://placehold.co/200x80/EEE/31343C?text=Company+4" alt="Company 4" className="h-12" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-primary to-primary-800 rounded-lg p-12 text-center shadow-xl">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl text-neutral-100 mb-10 max-w-3xl mx-auto">
            Join our growing network of business customers and enjoy the benefits of our B2B platform. Register today to access wholesale pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-brand hover:bg-brand-600 text-primary px-8 py-4 rounded-md font-medium text-lg shadow-md transition-smooth"
            >
              Register Your Business
            </Link>
            <Link
              to="/contact"
              className="bg-transparent hover:bg-primary-800 text-white border-2 border-white px-8 py-4 rounded-md font-medium text-lg transition-smooth"
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