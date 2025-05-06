import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

/**
 * Main layout wrapper component for AliTools B2B e-commerce platform
 * Includes header, main content area, and footer
 */
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-200">
      {/* Header with fixed positioning */}
      <Header />
      
      {/* Main content area with proper spacing */}
      <main className="flex-grow relative z-10 pt-0">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout; 