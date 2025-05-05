import React from 'react';
import { Link } from 'react-router-dom';

const RegisterSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro Realizado com Sucesso!
          </h2>
          
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Obrigado por se registrar no AliTools B2B.
            </p>
            <p className="mt-2 text-gray-600">
              Sua solicitação de conta foi recebida e está em análise pela nossa equipe.
              Você receberá um e-mail quando sua conta for aprovada.
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-3">O que acontece agora?</h3>
          
          <ul className="space-y-3 text-gray-600">
            <li className="flex">
              <svg className="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Nossa equipe verificará os dados fornecidos.</span>
            </li>
            <li className="flex">
              <svg className="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Você receberá um e-mail de confirmação quando sua conta for aprovada.</span>
            </li>
            <li className="flex">
              <svg className="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Após a aprovação, você poderá fazer login e começar a fazer pedidos.</span>
            </li>
          </ul>
        </div>
        
        <div className="flex items-center justify-center">
          <Link 
            to="/" 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccessPage; 