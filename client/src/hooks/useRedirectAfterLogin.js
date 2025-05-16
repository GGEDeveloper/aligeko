import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook personalizado para redirecionar o usuário após um login bem-sucedido
 * Verifica se há uma rota de retorno salva no estado da localização e redireciona para lá
 * Caso contrário, redireciona para o dashboard
 * 
 * @returns {Function} Função para redirecionar o usuário após o login
 */
const useRedirectAfterLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (user) => {
    // Se existe uma rota de origem no estado (geralmente definida pelo ProtectedRoute), usa ela
    const from = location.state?.from;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    // Redireciona para o dashboard correto baseado no papel do usuário
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/account', { replace: true });
    }
  };

};

export default useRedirectAfterLogin; 