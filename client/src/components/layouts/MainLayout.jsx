import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import ShrinkingHeader from '../ui/ShrinkingHeader';
import FooterSection from '../ui/FooterSection';
import { TubelightNavbar } from '../ui/TubelightNavbar';
import { BsHouseDoor, BsBriefcase, BsFileText, BsChatDots, BsQuestionCircle } from 'react-icons/bs';

/**
 * Main layout component that wraps the main content of the application
 * with a consistent header, navigation, and footer.
 * Updated to ensure footer is always displayed.
 * 
 * @param {Object} props - The props passed to the component
 * @param {boolean} props.isAdmin - Whether the layout should display admin controls
 */
const MainLayout = ({ isAdmin = false }) => {
  // Define navigation items for the tubelight navbar
  const navItems = [
    { name: 'Home', url: '/', icon: BsHouseDoor },
    { name: 'Produtos', url: '/products', icon: BsBriefcase },
    { name: 'Sobre', url: '/sobre-nos', icon: BsFileText },
    { name: 'Contato', url: '/contato', icon: BsChatDots },
    { name: 'Ajuda', url: '/ajuda', icon: BsQuestionCircle },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh'
    }}>
      {/* Estrutura com Header que contém o TubelightNavbar */}
      <div>
        {/* Shrinking header com scroll animation */}
        <ShrinkingHeader isAdmin={isAdmin} />
        
        {/* TubelightNavbar inserido no header */}
        <TubelightNavbar items={navItems} inHeader={true} />
      </div>
      
      {/* Main content */}
      <main style={{ 
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8F8F8'
      }}>
        <Outlet />
      </main>
      
      {/* Footer always included */}
      <FooterSection />
    </div>
  );
};

MainLayout.propTypes = {
  isAdmin: PropTypes.bool
};

export default MainLayout; 