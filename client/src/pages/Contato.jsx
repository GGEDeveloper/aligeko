import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Contato() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    axios.get('/api/company-info')
      .then(res => {
        setInfo(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSent(true); // Simulação de envio
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Contato</h1>
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
      <h2>Envie uma mensagem</h2>
      {sent ? <div>Mensagem enviada!</div> : (
        <form onSubmit={handleSubmit}>
          <label>Nome:<input name="nome" value={form.nome} onChange={handleChange} /></label><br />
          <label>Email:<input name="email" value={form.email} onChange={handleChange} /></label><br />
          <label>Mensagem:<textarea name="mensagem" value={form.mensagem} onChange={handleChange} /></label><br />
          <button type="submit">Enviar</button>
        </form>
      )}
    </div>
  );
} 