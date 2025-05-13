import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsHouseDoor, BsPerson, BsBriefcase, BsChatDots, BsQuestionCircle, BsFileText } from 'react-icons/bs';
import { cn } from "../../utils/cn";

/**
 * NavItem interface definition
 * @typedef {Object} NavItem
 * @property {string} name - The name of the navigation item
 * @property {string} url - The URL to link to
 * @property {Function} icon - The icon component to render (React Icons or similar)
 */

/**
 * TubelightNavbar component with glowing tubelight effect
 * 
 * @param {Object} props - Component props
 * @param {NavItem[]} props.items - Navigation items to display
 * @param {string} props.className - Additional class names
 * @param {boolean} props.inHeader - Whether the navbar is in the header
 */
export function TubelightNavbar({ items = defaultItems, className = "", inHeader = false }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(items[0].name);
  const [isMobile, setIsMobile] = useState(false);

  // Set active tab based on current URL on initial load
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingItem = items.find(item => currentPath.startsWith(item.url));
    if (matchingItem) {
      setActiveTab(matchingItem.name);
    }
  }, [location.pathname, items]);

  // Track window size for responsive display
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // If inHeader is true, use different styling to fit within header
  if (inHeader) {
    return (
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(to right, #1A1A1A, #2A2A2A)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderTop: '1px solid #333',
          borderBottom: '1px solid #333',
        }}
      >
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center' // Centralizar as categorias
        }}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setActiveTab(item.name)}
                style={{
                  position: 'relative',
                  padding: '0.9rem 1.25rem',
                  color: isActive ? '#FFCC00' : 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease',
                  borderBottom: isActive ? '2px solid #FFCC00' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#FFCC00';
                    e.currentTarget.style.borderBottomColor = '#FFCC00';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }
                }}
              >
                {isMobile ? <Icon size={14} /> : null}
                <span>{item.name}</span>
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      width: '100%',
                      height: '2px',
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '25%',
                        width: '50%',
                        height: '2px',
                        backgroundColor: '#FFCC00',
                        boxShadow: '0 0 10px #FFCC00, 0 0 5px #FFCC00',
                        borderRadius: '1px',
                      }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Original floating TubelightNavbar implementation for use elsewhere
  return (
    <div
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50",
        isMobile ? "bottom-0 mb-6" : "top-0 pt-6", 
        className
      )}
      style={{
        position: 'fixed',
        bottom: isMobile ? 0 : 'auto',
        top: isMobile ? 'auto' : 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        marginBottom: isMobile ? '1.5rem' : 0,
        paddingTop: isMobile ? 0 : '1.5rem',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.25rem',
        borderRadius: '9999px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.name)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                transition: 'color 0.2s ease',
                color: isActive ? '#FFCC00' : 'rgba(255, 255, 255, 0.8)',
                backgroundColor: isActive ? 'rgba(26, 26, 26, 0.9)' : 'transparent',
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <span style={{ display: isMobile ? 'none' : 'inline' }}>{item.name}</span>
              <span style={{ display: isMobile ? 'inline' : 'none' }}>
                <Icon size={18} />
              </span>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    backgroundColor: 'rgba(255, 204, 0, 0.05)',
                    borderRadius: '9999px',
                    zIndex: -1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '2rem',
                      height: '0.25rem',
                      backgroundColor: '#FFCC00',
                      borderTopLeftRadius: '9999px',
                      borderTopRightRadius: '9999px',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        width: '3rem',
                        height: '1.5rem',
                        backgroundColor: 'rgba(255, 204, 0, 0.2)',
                        borderRadius: '9999px',
                        filter: 'blur(8px)',
                        top: '-0.5rem',
                        left: '-0.5rem',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        width: '2rem',
                        height: '1.5rem',
                        backgroundColor: 'rgba(255, 204, 0, 0.2)',
                        borderRadius: '9999px',
                        filter: 'blur(8px)',
                        top: '-0.25rem',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        width: '1rem',
                        height: '1rem',
                        backgroundColor: 'rgba(255, 204, 0, 0.2)',
                        borderRadius: '9999px',
                        filter: 'blur(4px)',
                        top: 0,
                        left: '0.5rem',
                      }}
                    />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Default navigation items - can be overridden via props
const defaultItems = [
  { name: 'Home', url: '/', icon: BsHouseDoor },
  { name: 'Produtos', url: '/products', icon: BsBriefcase },
  { name: 'Sobre', url: '/sobre-nos', icon: BsFileText },
  { name: 'Contato', url: '/contato', icon: BsChatDots },
  { name: 'Ajuda', url: '/ajuda', icon: BsQuestionCircle },
];

/**
 * TubelightNavbarDemo component to show the navbar in action
 */
export function TubelightNavbarDemo() {
  const navItems = [
    { name: 'Home', url: '/', icon: BsHouseDoor },
    { name: 'Sobre', url: '/sobre-nos', icon: BsPerson },
    { name: 'Produtos', url: '/products', icon: BsBriefcase },
    { name: 'Contactos', url: '/contato', icon: BsChatDots },
    { name: 'Ajuda', url: '/ajuda', icon: BsQuestionCircle }
  ];

  return <TubelightNavbar items={navItems} />;
} 