import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

/**
 * AdminBreadcrumbs - A component to show breadcrumb navigation in admin pages
 * @param {Object} props
 * @param {Array} props.items - Custom breadcrumb items to override default ones
 * @param {string} props.currentPageTitle - The title of the current page
 * @param {Object} props.customRoot - Custom root item data (link and text)
 */
const AdminBreadcrumbs = ({ items, currentPageTitle, customRoot }) => {
  const location = useLocation();
  
  // If custom items were provided, use those
  if (items && items.length > 0) {
    return (
      <Breadcrumb className="mb-4">
        {items.map((item, index) => (
          <Breadcrumb.Item
            key={index}
            active={index === items.length - 1}
            linkAs={index !== items.length - 1 ? Link : undefined}
            linkProps={index !== items.length - 1 ? { to: item.link } : undefined}
          >
            {item.text}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  }
  
  // Otherwise, generate breadcrumbs from the current path
  const paths = location.pathname.split('/').filter(path => path);
  const rootItem = customRoot || { text: 'Dashboard', link: '/admin' };
  
  // Generate breadcrumb items from path segments
  const breadcrumbItems = paths.map((path, index) => {
    // Skip the first "admin" path since we have a default root item
    if (path === 'admin' && index === 0) return null;
    
    // Format the path for display
    let formattedPath = path
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // For numeric IDs, show a different label
    if (/^\d+$/.test(path)) {
      formattedPath = `Item #${path}`;
    }
    
    // For URL params like :id, use the current page title if provided
    if (index === paths.length - 1 && path.match(/^\d+$/) && currentPageTitle) {
      formattedPath = currentPageTitle;
    }
    
    // Calculate the path up to this segment
    const linkPath = ['', ...paths.slice(0, index + 1)].join('/');
    
    // Determine if this is the last (active) item
    const isLast = index === paths.length - 1;
    
    return {
      text: formattedPath,
      link: linkPath,
      active: isLast
    };
  }).filter(item => item); // Filter out any null items
  
  return (
    <Breadcrumb className="mb-4">
      {/* Root item (Dashboard) */}
      <Breadcrumb.Item
        linkAs={breadcrumbItems.length > 0 ? Link : undefined}
        linkProps={breadcrumbItems.length > 0 ? { to: rootItem.link } : undefined}
        active={breadcrumbItems.length === 0}
      >
        {rootItem.text}
      </Breadcrumb.Item>
      
      {/* Path-based items */}
      {breadcrumbItems.map((item, index) => (
        <Breadcrumb.Item
          key={index}
          linkAs={!item.active ? Link : undefined}
          linkProps={!item.active ? { to: item.link } : undefined}
          active={item.active}
        >
          {item.text}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default AdminBreadcrumbs; 