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
  
  return () => {
    // Verifica se existe uma rota de origem no estado (geralmente definida pelo ProtectedRoute)
    const from = location.state?.from || '/dashboard';
    
    // Redireciona para a rota apropriada
    navigate(from, { replace: true });
  };
};

export default useRedirectAfterLogin; 