import React from 'react';

const PreferencesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Preferências</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Configurações de Notificação</h2>
        <p className="text-gray-600 mb-4">Gerenciar preferências de notificação e comunicação.</p>
        <div className="space-y-4">
          <div className="flex items-center">
            <input type="checkbox" id="email-notifications" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
            <label htmlFor="email-notifications" className="ml-2 text-gray-700">Receber notificações por e-mail</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="promo-emails" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
            <label htmlFor="promo-emails" className="ml-2 text-gray-700">Receber ofertas e promoções</label>
          </div>
        </div>
      </div>
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Preferências de Idioma</h2>
        <select className="block w-full p-2 border border-gray-300 rounded-md">
          <option>Português (Brasil)</option>
          <option>English (US)</option>
          <option>Español</option>
        </select>
      </div>
    </div>
  );
};

export default PreferencesPage;
