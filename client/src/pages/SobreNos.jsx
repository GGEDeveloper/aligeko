import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SobreNos() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/company-info')
      .then(res => {
        setInfo(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Sobre Nós</h1>
      <p>Bem-vindo à AliTools! Somos especialistas em ferramentas e produtos de proteção para o setor B2B.</p>
      <h2>Informações da Empresa</h2>
      {info ? (
        <ul>
          <li><b>Endereço:</b> {info.address}</li>
          <li><b>Telefone:</b> {info.phone}</li>
          <li><b>Email:</b> {info.email}</li>
          <li><b>Horário:</b> {info.businessHours}</li>
          {info.facebook && <li><b>Facebook:</b> <a href={info.facebook}>{info.facebook}</a></li>}
          {info.instagram && <li><b>Instagram:</b> <a href={info.instagram}>{info.instagram}</a></li>}
          {info.linkedin && <li><b>LinkedIn:</b> <a href={info.linkedin}>{info.linkedin}</a></li>}
          {info.whatsapp && <li><b>WhatsApp:</b> {info.whatsapp}</li>}
        </ul>
      ) : (
        <div>Informações não disponíveis.</div>
      )}
      {/* Outras seções da página podem ser mantidas aqui */}
    </div>
  );
} 