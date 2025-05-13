import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Elegant animated shape component for decorative UI elements
 * Simulated version of the motion-based component without framer-motion dependency
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional classes for positioning
 * @param {number} props.delay - Animation delay in seconds
 * @param {number} props.width - Width of the shape in pixels
 * @param {number} props.height - Height of the shape in pixels
 * @param {number} props.rotate - Rotation angle in degrees
 * @param {string} props.gradient - CSS gradient string for background
 * @returns {JSX.Element} Elegant animated shape element
 */
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white-08",
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState(0);

  // Simulate appearance animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [delay]);

  // Simulate floating animation
  React.useEffect(() => {
    let animationFrame;
    let startTime;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Create a sinusoidal movement (0 to 15px and back)
      const movement = Math.sin(elapsed / 2000) * 15;
      setPosition(movement);
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const shapeStyle = {
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${rotate}deg)`,
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 1.2s ease, transform 2.4s ease',
  };

  const innerStyle = {
    transform: `translateY(${position}px)`,
    width: `${width}px`,
    height: `${height}px`,
  };

  const gradientClass = gradient === "from-white-08" 
    ? "bg-gradient-to-r from-white/[0.08] to-transparent" 
    : gradient;
    
  return (
    <div 
      className={cn("absolute", className)}
      style={shapeStyle}
    >
      <div 
        style={innerStyle}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            gradientClass,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </div>
    </div>
  );
}

export default ElegantShape; 