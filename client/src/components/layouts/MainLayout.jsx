import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-200">
      <div className="sticky top-0 z-50 w-full">
        <Header />
      </div>
      <main className="flex-grow w-full relative z-10 pt-2">
        <Outlet />
      </main>
      <div className="relative z-20 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout; 