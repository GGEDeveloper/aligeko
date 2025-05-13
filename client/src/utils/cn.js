/**
 * A utility function to combine multiple class names together
 * This is a simple implementation similar to the clsx/classnames libraries
 * 
 * @param {...string} classes - Class names to be combined
 * @returns {string} - Combined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default cn; 