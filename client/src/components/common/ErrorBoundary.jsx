import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado</h1>
            <p className="text-gray-700 mb-4">
              Desculpe, ocorreu um erro ao carregar a aplicação. Por favor, tente recarregar a página.
              Se o problema persistir, entre em contato com o suporte.
            </p>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
              <p className="font-medium text-gray-800">Detalhes do erro:</p>
              <pre className="text-xs text-gray-600 mt-2">
                {this.state.error && this.state.error.toString()}
              </pre>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-blue-600">Ver stack trace</summary>
                <pre className="bg-gray-200 p-2 mt-2 rounded overflow-auto">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
