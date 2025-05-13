# Diretrizes de Branding para Migração da AlimamedeTools para AliTools

Este documento descreve o processo de investigação inicial dos estilos visuais (cores, logotipos, tipografia, etc.) usados pela **AlimamedeTools** e as diretrizes para a migração para a nova identidade visual da **AliTools**, garantindo consistência, modernidade e alinhamento com tendências de design de 2025.

---

## 1. Objetivo

O objetivo é analisar a identidade visual atual da AlimamedeTools e propor uma nova identidade para a AliTools que seja:
- **Consistente**: Alinhada com as regras de estilo do projeto (e.g., `rules.style` no `.cursorrules`).
- **Moderna**: Incorpora tendências de design de 2025, como minimalismo, cores bold e responsividade.
- **Reconhecível**: Mantém elementos-chave da AlimamedeTools para preservar a familiaridade com clientes existentes, enquanto atualiza a marca para um público B2B mais amplo.
- **Adaptável**: Funciona em diferentes plataformas (web, mobile, impressão) e contextos (e.g., tamanhos pequenos em telas móveis).

---

## 2. Processo de Investigação Inicial

O agente deve realizar uma análise detalhada dos elementos visuais da AlimamedeTools antes de iniciar a migração. As etapas incluem:

### 2.1. Coleta de Materiais Visuais
- **Fontes**:
  - Website oficial da AlimamedeTools (se disponível).
  - Materiais de marketing (e.g., catálogos, folhetos, embalagens).
  - Logotipos existentes (primário, secundário, variações).
  - Presença em redes sociais ou plataformas de e-commerce.
- **Ferramentas**:
  - Usar o servidor `puppeteer` ou `playwright` (conforme `agent_behavior.senior_developer_practices.mcp_server_usage`) para capturar capturas de tela ou extrair ativos visuais de websites.
  - Analisar paletas de cores com ferramentas como Adobe Color ou Coolors.

### 2.2. Documentação dos Elementos Visuais
- **Logotipos**:
  - Identificar o logotipo primário e variações (e.g., monocromático, com fundo, ícone isolado).
  - Analisar tipografia (fontes serifadas ou sans-serif, peso, estilo).
  - Verificar responsividade (legibilidade em tamanhos pequenos).
- **Paleta de Cores**:
  - Extrair cores principais e secundárias (em formato hex, conforme `rules.style.colorFormat`).
  - Identificar se há uso de gradientes, cores neutras ou tons vibrantes.
- **Tipografia**:
  - Documentar fontes usadas (e.g., nome da fonte, peso, tamanhos).
  - Verificar se há fontes personalizadas ou fontes padrão (e.g., Google Fonts).
- **Ícones e Elementos Gráficos**:
  - Analisar ícones, ilustrações ou padrões gráficos.
  - Verificar consistência no estilo (e.g., flat, minimalista, detalhado).
- **Outros Elementos**:
  - Avaliar o uso de espaçamento (e.g., zonas de exclusão ao redor do logotipo).
  - Identificar diretrizes de marca existentes, se disponíveis.

### 2.3. Relatório de Investigação
- **Formato**: Documento em Markdown, salvo como `docs/alimamedetools_branding_analysis.md`.
- **Conteúdo**:
  - Lista de logotipos com imagens ou descrições.
  - Paleta de cores com códigos hex.
  - Fontes identificadas e exemplos de uso.
  - Análise de pontos fortes e fracos da identidade atual (e.g., legibilidade, modernidade, consistência).
  - Recomendações iniciais para a migração.

---

## 3. Diretrizes para Migração da Identidade Visual

Com base na investigação, o agente deve propor uma nova identidade visual para a AliTools, seguindo estas diretrizes:

### 3.1. Logotipos
- **Estilo**: Adotar um design minimalista com linhas limpas e formas simples, conforme tendências de 2025. Exemplos incluem logotipos de marcas como PayPal e Lamborghini, que adotaram designs bold e minimalistas.[](https://designshack.net/articles/inspiration/logo-design-trends/)
- **Variações**:
  - Criar pelo menos quatro variações de logotipo: primário, secundário, monocromático e ícone isolado.[](https://selahcreativeco.com/blog/4-logo-variations-every-brand-needs)
  - Garantir responsividade para diferentes plataformas (web, mobile, impressão).
- **Tipografia**: Preferir fontes sans-serif para modernidade e legibilidade, conforme `rules.style` e exemplos de marcas como Google e Uber.[](https://looka.com/logo-styles/modern-logos/)
- **Zona de Exclusão**: Definir uma zona de exclusão ao redor do logotipo (mínimo de metade da largura do logotipo), conforme práticas de marcas como Spotify e Medium.[](https://venngage.com/blog/brand-style-guide/)

### 3.2. Paleta de Cores
- **Quantidade**: Limitar a paleta a 1-2 cores principais e 1-2 cores secundárias para manter a simplicidade, conforme recomendado para logotipos modernos.[](https://looka.com/logo-styles/modern-logos/)
- **Estilo**:
  - Considerar cores bold para destacar a marca em plataformas digitais.
  - Incluir tons neutros (e.g., preto, branco) para versatilidade.
  - Explorar tons terrosos ou inspirados na natureza para alinhamento com sustentabilidade, se aplicável ao setor de ferramentas.[](https://www.wix.com/blog/logo-design-trends)
- **Formato**: Usar códigos hex, conforme `rules.style.colorFormat`.
- **Exemplo Proposto** (a ser validado após investigação):
  - Primária: #1E3A8A (azul escuro, confiável).
  - Secundária: #F97316 (laranja, energia).
  - Neutra: #FFFFFF (branco), #1F2937 (cinza escuro).

### 3.3. Tipografia
- **Fontes**: Escolher fontes sans-serif modernas (e.g., Inter, Roboto) para consistência com a estética do frontend (React.js com Tailwind CSS).
- **Tamanhos**:
  - Definir tamanhos mínimos para legibilidade (e.g., 12px para telas pequenas).
  - Usar unidades relativas (`rem`, `em`) conforme `rules.style.unitPreference`.
- **Pesos**: Incluir variações (regular, bold) para hierarquia visual.

### 3.4. Ícones e Elementos Gráficos
- **Estilo**: Adotar um estilo flat ou minimalista, com linhas consistentes (e.g., espessura uniforme).
- **Temas**: Incorporar elementos relacionados a ferramentas (e.g., formas geométricas, ícones de martelo ou chave de fenda) para reforçar a identidade do setor.
- **Formatos**: Garantir suporte para SVG para escalabilidade, conforme práticas de ferramentas como MakeBrand LogoMaker.[](https://makebrand.io/logomaker)

### 3.5. Guia de Estilo de Marca
- **Criação**: Desenvolver um guia de estilo de marca (brand style guide) para a AliTools, conforme recomendado por Venngage.[](https://venngage.com/blog/brand-style-guide/)
- **Conteúdo**:
  - Logotipos (variações, uso correto, uso incorreto).
  - Paleta de cores (códigos hex, usos primários e secundários).
  - Tipografia (fontes, tamanhos, pesos).
  - Ícones e elementos gráficos (estilo, exemplos).
  - Regras de espaçamento e layout (e.g., zonas de exclusão, margens).
  - Exemplos de aplicação (e.g., website, cartões de visita, catálogos).
- **Formato**: Documento em Markdown, salvo como `docs/alitools_brand_style_guide.md`.
- **Prazo**: Concluir o guia antes da fase de execução do MVP, conforme `project_phases.execution`.

---

## 4. Tendências de Design para 2025

A nova identidade visual da AliTools deve incorporar tendências de design de logotipos e branding para 2025, incluindo:
- **Minimalismo Bold**: Designs simples com cores fortes e tipografia sans-serif, como visto em rebrands de PayPal e Lamborghini.[](https://designshack.net/articles/inspiration/logo-design-trends/)
- **Responsividade**: Logotipos com variações para diferentes tamanhos e plataformas, garantindo legibilidade em telas pequenas.[](https://www.wix.com/blog/logo-design-trends)[](https://designshack.net/articles/inspiration/logo-design-trends/)
- **Cores Inspiradas na Natureza**: Uso de tons terrosos ou orgânicos para transmitir sustentabilidade, se alinhado com os valores da marca.[](https://www.wix.com/blog/logo-design-trends)
- **Espaço Negativo**: Incorporar elementos criativos no espaço negativo do logotipo, como visto em rebrands recentes de Reddit e Bolt.[](https://designshack.net/articles/inspiration/logo-design-trends/)
- **Consistência**: Criar um guia de estilo claro para garantir uso uniforme, conforme práticas de marcas como Facebook e Spotify.[](https://venngage.com/blog/brand-style-guide/)

---

## 5. Cronograma

- **Semana 1**:
  - Coleta de materiais visuais da AlimamedeTools.
  - Análise inicial de logotipos, cores e tipografia.
- **Semana 2**:
  - Documentação do relatório de investigação (`docs/alimamedetools_branding_analysis.md`).
  - Proposta inicial da nova identidade visual da AliTools.
- **Semana 3**:
  - Desenvolvimento do guia de estilo de marca (`docs/alitools_brand_style_guide.md`).
  - Validação com a equipa de marketing e stakeholders.

---

## 6. Considerações

- **Preservação da Identidade**: Manter elementos reconhecíveis da AlimamedeTools (e.g., cores principais, formas do logotipo) para evitar alienação de clientes existentes, conforme práticas de rebranding graduais como a da FedEx.[](https://www.themmachine.com/20-examples-of-rebranding-evolution/)
- **Ferramentas de Design**:
  - Usar ferramentas de IA como Looka ou MakeBrand LogoMaker para gerar conceitos iniciais, se necessário.[](https://makebrand.io/logomaker)[](https://looka.com/)
  - Validar designs com ferramentas de teste de responsividade (e.g., Figma, Adobe XD).
- **Testes**:
  - Testar a legibilidade do logotipo em diferentes tamanhos e fundos.
  - Realizar testes de usabilidade com mockups no frontend (React.js) para garantir integração com Tailwind CSS.
- **Documentação**:
  - Atualizar o `README.md` do repositório com uma seção sobre branding, conforme `rules.documentation.requireReadme`.
  - Incluir o guia de estilo na lista de documentos obrigatórios em `rules.documentation.required_documents`.

---

## 7. Próximos Passos

- Iniciar a investigação imediatamente, usando as ferramentas e fontes listadas.
- Submeter o relatório de investigação para revisão pela equipa de marketing.
- Iterar sobre os designs propostos com base no feedback dos stakeholders.
- Integrar a nova identidade visual no frontend durante a fase de execução do MVP.

---