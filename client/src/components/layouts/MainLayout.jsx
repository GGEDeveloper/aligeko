import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-200" style={{ display: 'flex !important', flexDirection: 'column !important', minHeight: '100vh !important', width: '100% !important' }}>
      <div className="sticky top-0 z-50 w-full" style={{ display: 'block !important', visibility: 'visible !important', opacity: '1 !important' }}>
        <Header />
      </div>
      <main className="flex-grow w-full relative z-10 pt-2" style={{ display: 'block !important', visibility: 'visible !important', opacity: '1 !important', flex: '1 1 auto !important' }}>
        <div className="space-y-6 md:space-y-8" style={{ display: 'block !important', visibility: 'visible !important', opacity: '1 !important' }}>
          <Outlet />
        </div>
      </main>
      <div className="relative z-20 w-full" style={{ display: 'block !important', visibility: 'visible !important', opacity: '1 !important' }}>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout; 