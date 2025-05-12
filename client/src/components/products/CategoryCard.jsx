import React from 'react';
import { BsTools, BsLightningFill, BsGear, BsTree, BsShield } from 'react-icons/bs';

/**
 * Map icon names to their respective React components
 */
const iconMap = {
  'tools': <BsTools size={20} />,
  'lightning': <BsLightningFill size={20} />,
  'gear': <BsGear size={20} />,
  'tree': <BsTree size={20} />,
  'shield': <BsShield size={20} />
};

/**
 * CategoryCard component for displaying a product category
 * 
 * @param {Object} props
 * @param {Object} props.category - Category data object
 * @param {boolean} props.isActive - Whether this category is currently active/selected
 * @param {Function} props.onClick - Click handler function
 * @returns {JSX.Element}
 */
const CategoryCard = ({ category, isActive, onClick }) => {
  // Get the appropriate icon - use customIcon if available, otherwise use the iconMap
  const renderIcon = () => {
    if (category.customIcon) {
      return category.customIcon;
    }
    return iconMap[category.icon] || <BsTools size={20} />;
  };

  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer rounded-lg p-4 flex flex-col items-center text-center transition-all ${
        isActive 
          ? 'bg-yellow-100 border-2 border-yellow-400' 
          : 'bg-white border border-gray-200 hover:shadow-md hover:border-yellow-300'
      }`}
    >
      <div className={`p-3 rounded-full mb-3 w-10 h-10 flex items-center justify-center ${
        isActive 
          ? 'bg-yellow-400 text-white' 
          : 'bg-gray-100 text-gray-700'
      }`}>
        {renderIcon()}
      </div>
      <h3 className="font-semibold mb-1">{category.name}</h3>
      <p className="text-xs text-gray-500">{category.description}</p>
    </div>
  );
};

export default CategoryCard; 