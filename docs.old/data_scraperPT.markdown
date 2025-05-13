# Processo de Scraping e Importação de Dados XML

Este documento descreve o processo de extração de dados de arquivos XML da API GEKO e sua importação para o banco de dados PostgreSQL no projeto **Ali Tools B2B E-commerce**.

---

## 1. Fluxo Geral

1. **Parsing do XML**:
   - Usar a biblioteca `xml.etree.ElementTree` em Python para parsear os arquivos XML.
   - Extrair dados de elementos como `<product>`, `<category>`, `<producer>`, `<unit>`, `<sizes>`, `<stock>`, `<prices>` e `<images>`.
2. **Transformação**:
   - Mapear os campos do XML para as colunas das tabelas definidas em `docs/database_schema.md`.
   - Normalizar dados:
     - Remover espaços em branco desnecessários (trim).
     - Converter tipos de dados (e.g., strings para números).
     - Escapar conteúdo HTML em campos como `<description_long>` para evitar injeção de código.
   - Validar formatos (e.g., EAN com regex, URLs válidas).
3. **Inserção no PostgreSQL**:
   - Usar Sequelize para inserções em lote ou consultas SQL parametrizadas para maior segurança.
   - Aplicar a cláusula `ON CONFLICT DO NOTHING` para evitar duplicatas em tabelas como `products` e `categories`.
   - Registrar erros de parsing ou inserção usando a biblioteca Winston, conforme especificado em `rules.backend.logging`.

## 2. Implementação

- **Ferramentas**:
  - **Python**: Para parsing de XML com `xml.etree.ElementTree`.
  - **Node.js**: Para integração com o backend via Sequelize.
  - **Sequelize**: ORM para inserções no PostgreSQL.
  - **Winston**: Para logging de erros e eventos.
- **Exemplo de Código**:
  ```python
  import xml.etree.ElementTree as ET
  import logging
  from sequelize import Sequelize, Model, DataTypes

  # Configuração do logger
  logger = logging.getLogger('xml_parser')
  logger.setLevel(logging.INFO)

  # Parsing do XML
  tree = ET.parse('geko_data.xml')
  root = tree.getroot()

  # Configuração do Sequelize
  sequelize = Sequelize('postgres://user:pass@localhost:5432/alitools')

  # Modelo de Produto
  class Product(Model):
      pass

  Product.init({
      id: { type: DataTypes.INTEGER, primaryKey: True, autoIncrement: True },
      code: { type: DataTypes.STRING, allowNull: False },
      name: { type: DataTypes.STRING, allowNull: False },
      # Outros campos conforme database_schema.md
  }, { sequelize, modelName: 'product' })

  # Processar produtos
  for product in root.findall('product'):
      try:
          data = {
              'code': product.get('code'),
              'name': product.find('description/name').text,
              # Outros campos
          }
          Product.create(data, { ignoreDuplicates: True })
          logger.info(f'Produto {data["code"]} inserido com sucesso.')
      except Exception as e:
          logger.error(f'Erro ao processar produto {data["code"]}: {str(e)}')
  ```
- **Cronograma**:
  - **Semana 1**: Configuração do parser XML e testes iniciais com dados de amostra.
  - **Semana 2**: Implementação da lógica de transformação e inserção no PostgreSQL.
  - **Semana 3**: Testes com dados reais da API GEKO e ajustes de desempenho.

## 3. Considerações

- **Tratamento de Erros**:
  - Capturar e registrar erros de XML malformado, campos ausentes ou falhas de conexão com o banco.
  - Implementar retries com backoff exponencial para falhas temporárias (conforme `rules.b2b_specific.integration.geko_api.retry_strategy`).
- **Validação de Dados**:
  - Usar regex para validar EAN (ex.: `^\d{13}$`).
  - Verificar URLs com bibliotecas como `urllib.parse`.
- **Desempenho**:
  - Processar arquivos XML em lotes para reduzir sobrecarga.
  - Usar índices recomendados em `database_schema.md` para acelerar consultas.
- **Testes**:
  - Criar testes unitários para o parser XML (cobertura mínima de 80%, conforme `rules.testing.coverage.unit`).
  - Testar a importação com dados reais da API GEKO em um ambiente de staging.
- **Integração com API GEKO**:
  - Sincronizar dados a cada 30 minutos, conforme `rules.b2b_specific.integration.geko_api.sync_frequency`.
  - Usar estratégia incremental para atualizações (conforme `rules.b2b_specific.integration.geko_api.sync_strategy`).

## 4. Próximos Passos

- Configurar um job agendado (e.g., usando `node-cron`) para automatizar a sincronização.
- Implementar monitoramento de saúde da sincronização, conforme `rules.b2b_specific.integration.geko_api.monitoring`.
- Documentar o processo de importação no `README.md` do repositório, conforme `rules.documentation.requireReadme`.

---