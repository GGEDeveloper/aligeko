---
trigger: manual
description:
globs:
---
# 3D-to-2D Fallback Patterns

This rule documents the standard patterns for implementing reliable 3D visualizations with appropriate 2D fallbacks in the AliTools B2B E-commerce platform, based on our experience with the Hero3DLogo component.

## Overview

Modern web applications often benefit from rich 3D visualizations, but these come with significant complexity and potential compatibility issues. This rule provides guidelines for:
- Determining when to use 3D vs 2D visualizations
- Implementing progressive enhancement
- Creating robust fallback mechanisms
- Ensuring cross-browser compatibility
- Optimizing performance

## Case Study: Hero3DLogo Component

Our Hero3DLogo component initially used Three.js (via React Three Fiber) and GSAP for complex 3D animations, but encountered persistent errors in production:

```javascript
// Original error in production
Uncaught TypeError: Cannot read properties of undefined (reading 'S')
```

This error occurred during Three.js WebGL renderer initialization, despite multiple attempts at defensive programming.

### Solution Applied

We replaced the complex 3D implementation with a reliable 2D alternative that:
1. Removed dependencies on Three.js and related libraries
2. Used pure CSS and vanilla JavaScript for animations
3. Maintained the modern aesthetic with simpler techniques
4. Ensured reliability across all browsers and environments

## When to Use 3D vs 2D Visualizations

### ✅ DO: Use 3D visualizations when:
- The 3D aspect provides significant user value (product visualization, interactive models)
- Performance testing confirms good results across target devices
- You have resources to implement and test thorough fallback mechanisms
- The target audience likely has modern, capable browsers

```javascript
// Example: Product 3D visualization with clear business value
function Product3DViewer({ product }) {
  const [fallbackMode, setFallbackMode] = useState(false);
  
  // Feature detection
  useEffect(() => {
    if (!hasWebGLSupport() || !hasRequiredBrowserFeatures()) {
      setFallbackMode(true);
    }
  }, []);
  
  if (fallbackMode) {
    return <Product2DFallback product={product} />;
  }
  
  return <Canvas>
    {/* Three.js implementation */}
  </Canvas>;
}
```

### ❌ DON'T: Use 3D visualizations when:
- They're purely decorative or could be achieved with simpler techniques
- Target audience includes users with older browsers or less capable devices
- You can't implement proper feature detection and fallbacks
- Loading performance is critical (3D libraries add significant bundle size)

## Progressive Enhancement Patterns

### ✅ DO: Implement feature detection before initialization

```javascript
// Feature detection helpers
function hasWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

function hasRequiredBrowserFeatures() {
  return (
    'requestAnimationFrame' in window &&
    'querySelector' in document &&
    'addEventListener' in window
  );
}
```

### ✅ DO: Design the 2D fallback first, then enhance with 3D

```javascript
// Base component is always 2D, enhancement adds 3D
const FeatureVisualizer = () => {
  const [enhancementLoaded, setEnhancementLoaded] = useState(false);
  
  useEffect(() => {
    if (hasWebGLSupport()) {
      // Dynamic import of 3D enhancement
      import('./ThreeDEnhancement')
        .then(() => setEnhancementLoaded(true))
        .catch(() => {
          // Log error but continue with 2D fallback
          console.error('Could not load 3D enhancement');
        });
    }
  }, []);
  
  return (
    <div className="feature-visualizer">
      {enhancementLoaded ? (
        <ThreeDEnhancement />
      ) : (
        <TwoDVisualization />
      )}
    </div>
  );
};
```

### ❌ DON'T: Assume 3D capabilities will be available

```javascript
// WRONG: No feature detection or fallback
const BadImplementation = () => {
  useEffect(() => {
    // This can crash if WebGL is not supported
    const renderer = new THREE.WebGLRenderer();
    // ...more code that assumes WebGL availability
  }, []);
  
  return <div id="3d-container"></div>;
};
```

## Performance Considerations

### ✅ DO: Load 3D libraries dynamically

```javascript
// Dynamic import only when needed
const EnhancedVisualization = () => {
  const [ThreeComponent, setThreeComponent] = useState(null);
  
  useEffect(() => {
    if (hasWebGLSupport()) {
      // Only load the heavy libraries when needed
      import('@react-three/fiber').then(({ Canvas }) => {
        import('@react-three/drei').then(({ OrbitControls }) => {
          setThreeComponent(() => ({ children }) => (
            <Canvas>
              <OrbitControls />
              {children}
            </Canvas>
          ));
        });
      });
    }
  }, []);
  
  if (ThreeComponent) {
    return (
      <ThreeComponent>
        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </ThreeComponent>
    );
  }
  
  return <div className="fallback-visualization">2D Fallback</div>;
};
```

### ✅ DO: Optimize 3D scenes and monitor performance

- Use appropriate level-of-detail (LOD) techniques
- Implement simpler geometries when possible
- Monitor and limit frame rate for consistent performance
- Use performance profiling tools to identify bottlenecks

### ❌ DON'T: Include 3D libraries in your main bundle

```javascript
// WRONG: Including Three.js in main bundle even if not needed
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// This forces all users to download heavy libraries
```

## CSS/JS Animation Techniques that Simulate 3D Effects

Based on our Hero3DLogo implementation, here are effective techniques for creating "pseudo-3D" effects with CSS and vanilla JavaScript:

### ✅ DO: Use CSS transforms for 3D-like effects

```css
.rotating-element {
  transform-style: preserve-3d;
  animation: rotate 6s ease-in-out infinite;
}

@keyframes rotate {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}
```

### ✅ DO: Combine multiple animations for complex effects

From our Hero3DLogo component:

```javascript
// Complex animation with plain JavaScript
useEffect(() => {
  let frame;
  let startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    // Creates a smooth oscillation between 0 and 1 for glow effect
    const newIntensity = (Math.sin(elapsed / 1000) + 1) / 2;
    setGlowIntensity(newIntensity);
    frame = requestAnimationFrame(animate);
  };
  
  animate();
  
  // Cleanup on unmount
  return () => {
    if (frame) cancelAnimationFrame(frame);
  };
}, []);
```

```css
/* Use CSS for floating effect */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.floating-logo {
  animation: float 6s ease-in-out infinite;
}
```

### ✅ DO: Use layered elements for depth effect

```jsx
// Layered elements with different animation speeds create depth
<div className="scene">
  <div className="background-layer">
    {/* Slow-moving background particles */}
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="particle particle-slow" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`
      }} />
    ))}
  </div>
  
  <div className="midground-layer">
    {/* Medium-speed elements */}
  </div>
  
  <div className="foreground-layer">
    {/* Fast-moving elements */}
  </div>
</div>
```

### ✅ DO: Use radial gradients for glow effects

From our Hero3DLogo component:

```jsx
// Dynamic glow effect
<div style={{
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: `radial-gradient(circle, rgba(255, 204, 0, ${glowOpacity}) 0%, rgba(255, 204, 0, 0) 70%)`,
  filter: `blur(${glowRadius}px)`,
  opacity: 0.8,
  transition: 'all 0.3s ease'
}} />
```

## Testing Requirements for 3D Components

### ✅ DO: Test in a matrix of browsers and devices

Minimum testing matrix:
- Modern browsers: Chrome, Firefox, Safari, Edge
- Mobile browsers: iOS Safari, Android Chrome
- Older versions of major browsers (at least n-1)
- Low-powered devices

### ✅ DO: Test with WebGL disabled

```javascript
// Testing function to simulate WebGL unavailability
function simulateNoWebGL() {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  
  HTMLCanvasElement.prototype.getContext = function(contextType, ...rest) {
    if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      return null;
    }
    return originalGetContext.call(this, contextType, ...rest);
  };
}
```

### ✅ DO: Implement error boundaries around 3D components

```jsx
class ThreeDErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D component failed:', error, errorInfo);
    // Log to your error tracking system
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Could not load 3D visualization</div>;
    }
    return this.props.children;
  }
}

// Usage
<ThreeDErrorBoundary fallback={<TwoDFallback />}>
  <ThreeDComponent />
</ThreeDErrorBoundary>
```

## Browser Compatibility Detection

### ✅ DO: Implement thorough browser capability checks

```javascript
// Comprehensive WebGL capability check
function checkWebGLCapabilities() {
  // Basic availability check
  if (!hasWebGLSupport()) {
    return { supported: false, reason: 'WebGL not supported' };
  }
  
  // Check for specific capabilities
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return { supported: false, reason: 'Could not create WebGL context' };
    }
    
    // Check for required extensions
    const requiredExtensions = ['OES_texture_float', 'ANGLE_instanced_arrays'];
    const missingExtensions = requiredExtensions.filter(ext => !gl.getExtension(ext));
    
    if (missingExtensions.length > 0) {
      return { 
        supported: false, 
        reason: `Missing required extensions: ${missingExtensions.join(', ')}` 
      };
    }
    
    // Check hardware capabilities
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    
    if (maxTextureSize < 2048 || (maxViewportDims && maxViewportDims[0] < 1024)) {
      return { 
        supported: false, 
        reason: 'Hardware capabilities below requirements' 
      };
    }
    
    return { supported: true };
  } catch (e) {
    return { supported: false, reason: `Error in capability check: ${e.message}` };
  }
}
```

### ✅ DO: Consider device performance, not just feature support

```javascript
// Estimate device performance
function estimateDevicePerformance() {
  // Check hardware concurrency (CPU cores)
  const cpuPower = navigator.hardwareConcurrency || 1;
  
  // Check device memory if available
  const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
  
  // Simple score calculation
  const performanceScore = cpuPower * (memory / 4);
  
  // Performance categories
  if (performanceScore < 1) return 'low';
  if (performanceScore < 4) return 'medium';
  return 'high';
}

// Usage example
function shouldEnable3D() {
  const webGL = checkWebGLCapabilities();
  const performance = estimateDevicePerformance();
  
  // Only enable 3D on capable devices with good performance
  return webGL.supported && (performance === 'high' || performance === 'medium');
}
```

## Hero3DLogo Implementation Comparison

### Original 3D Implementation (Simplified)

```jsx
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, PresentationControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import logoModelPath from '../../assets/models/logo.glb';

// Model component with animations
function Logo3D() {
  const modelRef = useRef();
  const { nodes, materials } = useGLTF(logoModelPath);
  
  useEffect(() => {
    // GSAP animation
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });
    timeline.to(modelRef.current.rotation, { 
      y: Math.PI * 2, 
      duration: 20,
      ease: 'power1.inOut'
    });
    
    return () => timeline.kill();
  }, []);
  
  useFrame((state) => {
    // Additional per-frame animations
    const t = state.clock.getElapsedTime();
    modelRef.current.position.y = Math.sin(t) * 0.2;
  });
  
  return (
    <primitive
      ref={modelRef}
      object={nodes.logoMesh}
      material={materials.logoMaterial}
      position={[0, 0, 0]}
      scale={1.5}
    />
  );
}

// Main component with 3D canvas
function Hero3DLogo() {
  return (
    <section className="hero-section">
      <div className="content">
        <h1>Ferramentas Profissionais para o Seu Negócio</h1>
        <p>A Ali Tools fornece ferramentas de qualidade premium com preços competitivos.</p>
        <div className="cta-buttons">
          <a href="/products" className="primary-btn">Ver Produtos</a>
          <a href="/register" className="secondary-btn">Registrar Agora</a>
        </div>
      </div>
      
      <div className="logo-container">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
          >
            <Float
              speed={1.5}
              rotationIntensity={1.0}
              floatIntensity={2.0}
            >
              <Logo3D />
            </Float>
          </PresentationControls>
        </Canvas>
      </div>
    </section>
  );
}

export default Hero3DLogo;
```

### Current 2D Implementation (Simplified)

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import logoImage from '../../assets/logos/png/symbol/alitools_symbol_fullcolor_256px.png';

// Simple 2D component with similar visual effect but more reliable
const Hero2DFallback = () => {
  // State for animating the logo glow
  const [glowIntensity, setGlowIntensity] = useState(0);
  
  // Simple animation effect with vanilla JavaScript
  useEffect(() => {
    let frame;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      // Creates a smooth oscillation between 0 and 1 for glow
      const newIntensity = (Math.sin(elapsed / 1000) + 1) / 2;
      setGlowIntensity(newIntensity);
      frame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup on unmount
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  
  // Calculate CSS values for glow effect
  const glowRadius = Math.floor(20 + glowIntensity * 15);
  const glowOpacity = 0.5 + glowIntensity * 0.3;
  
  return (
    <section style={{ 
      backgroundColor: '#1A1A1A', 
      color: 'white', 
      borderRadius: '0.75rem', 
      overflow: 'hidden', 
      position: 'relative', 
      padding: '3rem 1rem',
      marginTop: '1rem',
      height: '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Logo with animated glow effect */}
      <div style={{
        position: 'absolute',
        right: '5%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '300px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 204, 0, ${glowOpacity}) 0%, rgba(255, 204, 0, 0) 70%)`,
          filter: `blur(${glowRadius}px)`,
          opacity: 0.8,
          transition: 'all 0.3s ease'
        }} />
        <img 
          src={logoImage} 
          alt="Ali Tools Logo" 
          style={{
            width: '200px',
            height: '200px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
            animation: 'float 6s ease-in-out infinite'
          }}
        />
      </div>
      
      {/* Decorative particles */}
      {Array.from({ length: 20 }).map((_, index) => (
        <div 
          key={index}
          style={{
            position: 'absolute',
            width: Math.random() * 8 + 2 + 'px',
            height: Math.random() * 8 + 2 + 'px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 204, 0, 0.4)',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.2,
            animation: `particle-float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      
      {/* Text content */}
      <div style={{ 
        maxWidth: '32rem',
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        padding: '2rem',
        borderRadius: '0.75rem',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: 'clamp(1.875rem, 4vw, 3.5rem)',
          fontWeight: 'bold',
          marginBottom: '0.75rem',
          lineHeight: '1.2',
          color: 'white'
        }}>
          Ferramentas Profissionais para o Seu Negócio
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: '#e5e5e5',
          marginBottom: '2rem'
        }}>
          A Ali Tools fornece ferramentas de qualidade premium com preços competitivos para distribuidores e revendedores.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <Link 
            to="/products" 
            style={{ 
              backgroundColor: '#FFCC00', 
              color: '#1A1A1A', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.375rem', 
              fontWeight: '500', 
              transition: 'background-color 0.3s', 
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5B800'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCC00'}
          >
            Ver Produtos <BsArrowRight style={{ marginLeft: '0.5rem' }} />
          </Link>
          <Link 
            to="/auth/register" 
            style={{ 
              backgroundColor: 'transparent', 
              border: '2px solid #FFCC00', 
              color: '#FFCC00', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.375rem', 
              fontWeight: '500', 
              transition: 'background-color 0.3s', 
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Registrar Agora
          </Link>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          
          @keyframes particle-float {
            0%, 100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(20px, 10px);
            }
            50% {
              transform: translate(10px, 20px);
            }
            75% {
              transform: translate(-10px, 10px);
            }
          }
        `}
      </style>
    </section>
  );
};

// Main component now just returns the safe fallback
const Hero3DLogo = () => {
  return <Hero2DFallback />;
};

export default Hero3DLogo;
```

## Implementation Decision Tree

Use this decision tree to determine which approach is most appropriate:

1. Is the 3D visualization essential to the user experience?
   - **Yes**: Continue to step 2
   - **No**: Use 2D implementation only
   
2. Will the target audience have modern browsers and hardware?
   - **Yes**: Continue to step 3
   - **No**: Use 2D implementation with optional 3D enhancement

3. Do you have resources to implement proper fallbacks and testing?
   - **Yes**: Continue to step 4
   - **No**: Use 2D implementation only

4. Is loading performance critical for this component?
   - **Yes**: Use 2D implementation with lazy-loaded 3D enhancement
   - **No**: Implement 3D with proper fallbacks and feature detection

## Conclusion

3D visualizations can enhance the user experience when implemented correctly, but they come with significant complexity and potential failure points. The Hero3DLogo case demonstrates that sometimes the most reliable approach is to create a simpler but visually similar implementation using standard web technologies.

Always consider:
- The actual business/UX value of the 3D implementation
- The complexity cost vs. benefit tradeoff
- The reliability requirements for the component
- The target audience's technical environment

When in doubt, start with a solid 2D implementation and progressively enhance with 3D features for capable environments.

## Related Rules

- [error_tracking.mdc](mdc:.cursor/rules/error_tracking.mdc) - See entry for Hero3DLogo component error
- [performance_optimization.mdc](mdc:.cursor/rules/performance_optimization.mdc) - General performance guidelines

## External References

- [Three.js Documentation](mdc:https://threejs.org/docs/)
- [React Three Fiber](mdc:https://docs.pmnd.rs/react-three-fiber)
- [MDN CSS Animations](mdc:https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations)
- [WebGL Compatibility Table](mdc:https://caniuse.com/webgl)

---

*Last updated: 2025-06-12*
