import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook personalizado para redirecionar o usuário após um login bem-sucedido
 * Verifica se há uma rota de retorno salva no estado da localização e redireciona para lá
 * Caso contrário, redireciona para o dashboard apropriado baseado no papel do usuário
 * 
 * @returns {Function} Função para redirecionar o usuário após o login
 */
const useRedirectAfterLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (user) => {
    console.log('Redirecting after login for user:', user);
    
    // Se existe uma rota de origem no estado (geralmente definida pelo ProtectedRoute), usa ela
    const from = location.state?.from?.pathname;
    
    // Check if we're coming from a protected route
    const isProtectedRoute = location.state?.from?.state?.isProtected;
    
    if (from && !from.includes('/auth')) {
      console.log('Redirecting to protected route:', from);
      // For protected routes, we need to preserve the original state
      navigate(from, { 
        replace: true,
        state: location.state?.from?.state 
      });
      return;
    }
    
    // Redireciona para o dashboard correto baseado no papel do usuário
    if (user?.role === 'admin') {
      console.log('Redirecting to admin dashboard');
      navigate('/admin/dashboard', { replace: true });
    } else if (user?.role === 'customer') {
      console.log('Redirecting to customer account');
      navigate('/account', { replace: true });
    } else {
      console.log('No specific role, redirecting to home');
      navigate('/', { replace: true });
    }
  };
};

export default useRedirectAfterLogin; 