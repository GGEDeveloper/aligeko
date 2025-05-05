import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

/**
 * Componente de rota protegida que verifica se o usuário está autenticado
 * Redireciona para a página de login se não estiver autenticado
 */
const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redireciona para login enquanto preserva a URL original para redirecionamento após login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Permite acesso à rota protegida
  return <Outlet />;
};

export default ProtectedRoute; 