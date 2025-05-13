/**
 * Utility functions for animations and motion effects
 */

/**
 * Creates a reusable animation for floating elements
 * @param {number} duration - Animation duration in seconds
 * @param {number} delay - Animation delay in seconds
 * @param {number} yOffset - Vertical movement amount in pixels
 * @returns {Object} Animation configuration object
 */
export const floatingAnimation = (duration = 3, delay = 0, yOffset = 15) => {
  return {
    y: [0, yOffset, 0],
    transition: {
      duration,
      delay,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror"
    }
  };
};

/**
 * Creates a fade-in animation from top with rotation
 * @param {number} delay - Animation delay in seconds
 * @param {number} initialY - Initial vertical offset
 * @param {number} initialRotate - Initial rotation in degrees
 * @param {number} targetRotate - Target rotation in degrees
 * @returns {Object} Animation configuration object
 */
export const fadeInFromTop = (
  delay = 0, 
  initialY = -50,
  initialRotate = -15,
  targetRotate = 0
) => {
  return {
    initial: {
      opacity: 0,
      y: initialY,
      rotate: initialRotate,
    },
    animate: {
      opacity: 1,
      y: 0,
      rotate: targetRotate,
    },
    transition: {
      duration: 1.2,
      delay,
      ease: [0.23, 0.86, 0.39, 0.96],
    }
  };
};

/**
 * Creates a staggered animation for child elements
 * @param {number} staggerDelay - Delay between each child animation
 * @param {number} initialDelay - Initial delay before animations start
 * @returns {Object} Animation configuration object
 */
export const staggerChildren = (staggerDelay = 0.1, initialDelay = 0.2) => {
  return {
    animate: {
      transition: {
        delayChildren: initialDelay,
        staggerChildren: staggerDelay,
      }
    }
  };
};

/**
 * Creates a shimmer/gradient animation 
 * @param {number} duration - Animation duration in seconds
 * @returns {Object} Animation configuration object
 */
export const shimmerAnimation = (duration = 2) => {
  return {
    backgroundPosition: ["0% 0%", "100% 100%"],
    transition: {
      duration,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "linear"
    }
  };
}; 