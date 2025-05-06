import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, refreshSession, selectIsAuthenticated, selectSessionExpiry } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

// Constants for session timeout behavior
const REFRESH_INTERVAL = 60000; // Check every minute
const WARNING_THRESHOLD = 5 * 60 * 1000; // Show warning 5 minutes before expiry
const INACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

const SessionManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const sessionExpiry = useSelector(selectSessionExpiry);
  
  // Refs to store timer IDs
  const checkTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);
  
  // Reset inactivity timer on user activity
  const handleUserActivity = () => {
    lastActivityRef.current = Date.now();
    
    // If the user becomes active after warning was shown, extend session
    if (warningShownRef.current && isAuthenticated) {
      extendSession();
      warningShownRef.current = false;
    }
  };
  
  // Handle session expiration
  const handleSessionExpiry = () => {
    toast.error('Sua sessão expirou. Por favor, faça login novamente.');
    dispatch(logout());
    navigate('/auth/login');
  };
  
  // Show warning about session expiry
  const showExpiryWarning = () => {
    if (!warningShownRef.current && isAuthenticated) {
      warningShownRef.current = true;
      
      // Calculate minutes remaining
      const remainingMs = sessionExpiry - Date.now();
      const minutesRemaining = Math.ceil(remainingMs / 60000);
      
      // Show toast with auto-close disabled for important message
      toast.warn(
        <div>
          <p>Sua sessão expirará em aproximadamente {minutesRemaining} minutos.</p>
          <button 
            className="btn btn-sm btn-primary mt-2"
            onClick={() => {
              extendSession();
              toast.dismiss();
            }}
          >
            Estender Sessão
          </button>
        </div>,
        { 
          autoClose: false,
          closeOnClick: false,
          draggable: false
        }
      );
      
      // Set timer to force logout when session actually expires
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      
      logoutTimerRef.current = setTimeout(() => {
        handleSessionExpiry();
      }, remainingMs);
    }
  };
  
  // Extend the current session
  const extendSession = () => {
    if (isAuthenticated) {
      dispatch(refreshSession());
      warningShownRef.current = false;
      
      // Clear existing timers
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      
      toast.success('Sua sessão foi estendida com sucesso.');
    }
  };
  
  // Check session status periodically
  const checkSessionStatus = () => {
    if (!isAuthenticated || !sessionExpiry) return;
    
    const currentTime = Date.now();
    const timeRemaining = sessionExpiry - currentTime;
    
    // Check for inactivity timeout (15 minutes of inactivity)
    const inactivityThreshold = 15 * 60 * 1000; // 15 minutes
    const inactivityTime = currentTime - lastActivityRef.current;
    
    if (inactivityTime >= inactivityThreshold) {
      // User has been inactive for too long
      toast.info('Sua sessão foi encerrada devido à inatividade.');
      handleSessionExpiry();
      return;
    }
    
    // Schedule warning before session expires
    if (timeRemaining <= WARNING_THRESHOLD && !warningShownRef.current) {
      showExpiryWarning();
    }
    
    // Handle expired session
    if (timeRemaining <= 0) {
      handleSessionExpiry();
    }
  };
  
  // Register activity listeners
  useEffect(() => {
    // Set up activity event listeners
    const registerActivityListeners = () => {
      INACTIVITY_EVENTS.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });
    };
    
    // Remove activity event listeners
    const unregisterActivityListeners = () => {
      INACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
    
    // Only track activity when user is authenticated
    if (isAuthenticated) {
      registerActivityListeners();
      
      // Initial check
      checkSessionStatus();
      
      // Set up regular interval to check session status
      checkTimerRef.current = setInterval(checkSessionStatus, REFRESH_INTERVAL);
      
      // Set up warning timer if session expiry exists
      if (sessionExpiry) {
        const timeToWarning = Math.max(0, sessionExpiry - Date.now() - WARNING_THRESHOLD);
        
        warningTimerRef.current = setTimeout(() => {
          showExpiryWarning();
        }, timeToWarning);
      }
    }
    
    // Cleanup function
    return () => {
      unregisterActivityListeners();
      
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [isAuthenticated, sessionExpiry]);
  
  // Component doesn't render anything
  return null;
};

export default SessionManager; 