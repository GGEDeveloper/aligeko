import React, { useEffect, useState } from 'react';
import axios from 'axios';

const initialState = {
  address: '',
  phone: '',
  email: '',
  businessHours: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  whatsapp: ''
};

export default function CompanyInfoConfig() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/company-info')
      .then(res => {
        setForm(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    try {
      await axios.put('/api/company-info', form);
      setSuccess(true);
    } catch (err) {
      setError('Erro ao salvar.');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Configuração de Informações da Empresa</h2>
      <form onSubmit={handleSubmit}>
        <label>Endereço:<input name="address" value={form.address} onChange={handleChange} /></label><br />
        <label>Telefone:<input name="phone" value={form.phone} onChange={handleChange} /></label><br />
        <label>Email:<input name="email" value={form.email} onChange={handleChange} /></label><br />
        <label>Horário:<input name="businessHours" value={form.businessHours} onChange={handleChange} /></label><br />
        <label>Facebook:<input name="facebook" value={form.facebook} onChange={handleChange} /></label><br />
        <label>Instagram:<input name="instagram" value={form.instagram} onChange={handleChange} /></label><br />
        <label>LinkedIn:<input name="linkedin" value={form.linkedin} onChange={handleChange} /></label><br />
        <label>WhatsApp:<input name="whatsapp" value={form.whatsapp} onChange={handleChange} /></label><br />
        <button type="submit">Salvar</button>
      </form>
      {success && <div>Salvo com sucesso!</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
} 