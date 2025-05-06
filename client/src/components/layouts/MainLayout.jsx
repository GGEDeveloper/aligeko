import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-200" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <div className="sticky top-0 z-50 w-full" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
        <Header />
      </div>
      <main className="flex-grow w-full relative z-10 pt-2" style={{ display: 'block', visibility: 'visible', opacity: 1, flex: '1 1 auto' }}>
        <div className="space-y-6 md:space-y-8" style={{ display: 'block', visibility: 'visible' }}>
          <Outlet />
        </div>
      </main>
      <div className="relative z-20 w-full" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout; 