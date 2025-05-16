import React from 'react';

export default function Ajuda() {
  // FAQs with questions and answers
  const faqs = [
    {
      question: 'Como faço para criar uma conta?',
      answer: 'Para criar uma conta, clique no link "Registrar" no canto superior direito da página. Preencha o formulário de registro com suas informações e clique em "Criar Conta".'
    },
    {
      question: 'Como faço um pedido?',
      answer: 'Para fazer um pedido, navegue até a página de produtos, adicione os itens desejados ao carrinho, e então prossiga para o checkout. Siga as instruções para finalizar seu pedido.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos cartões de crédito, transferências bancárias e pagamento por boleto. Para clientes corporativos, também oferecemos opções de faturamento direto conforme contrato.'
    },
    {
      question: 'Como acompanho meus pedidos?',
      answer: 'Após fazer login, acesse seu painel na área "Minha Conta" e clique em "Meus Pedidos" para ver o status de todos os seus pedidos recentes.'
    },
    {
      question: 'Qual o prazo de entrega?',
      answer: 'O prazo de entrega varia de acordo com sua localização e disponibilidade dos produtos. Normalmente, entregamos entre 3-5 dias úteis para capitais e 5-10 dias úteis para o interior.'
    },
    {
      question: 'Como cancelar um pedido?',
      answer: 'Para cancelar um pedido, entre em contato conosco por telefone ou email o mais rápido possível. Pedidos já em processo de envio podem não ser elegíveis para cancelamento.'
    },
    {
      question: 'Qual a política de devolução?',
      answer: 'Aceitamos devoluções em até 7 dias após o recebimento, desde que os produtos estejam em perfeito estado e em suas embalagens originais. Entre em contato conosco para iniciar o processo.'
    }
  ];

  return (
    <>      {/* Hero/banner topo */}
      <section className="py-16 bg-neutral-900 text-center">
        <h1 className="text-4xl font-extrabold text-yellow-500 mb-4 tracking-tight">Central de Ajuda</h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
          Bem-vindo à nossa Central de Ajuda. Aqui você encontrará respostas para as perguntas mais frequentes.
          Se não encontrar o que procura, <a href="/contato" className="text-yellow-400 underline">entre em contato</a>.
        </p>
      </section>
      {/* FAQ Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-yellow-600">Perguntas Frequentes</h2>
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{faq.question}</h3>
                <p className="text-gray-700 text-base">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-yellow-700">Precisa de mais ajuda?</h2>
          <p className="mb-4 text-gray-700">
            Nossa equipe de suporte está disponível para ajudá-lo em horário comercial.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="/contato" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-xl transition duration-200 text-lg">Entrar em Contato</a>
            <a href="tel:+351963965903" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-xl transition duration-200 text-lg">Ligar para Suporte</a>
          </div>
        </div>
      </section>
    
    </>
  );
}