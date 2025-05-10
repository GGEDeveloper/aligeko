# Próximos Passos para Implementação do Sistema de Importação XML do GEKO

Este documento apresenta os próximos passos imediatos para a implementação do sistema completo de importação XML do GEKO, focando nas ações concretas que devem ser realizadas nos próximos dias para avançar com a Tarefa 24.

## Ações Imediatas (Próximos 2-3 dias)

### 1. Concluir a Análise da Estrutura XML (Subtarefa 24.1)

- [ ] Analisar pelo menos 10 produtos completos do arquivo XML para garantir cobertura de todos os casos
- [ ] Verificar a presença de estruturas não identificadas na análise inicial
- [ ] Criar exemplos XML de referência para cada tipo de estrutura encontrada
- [ ] Finalizar o documento de mapeamento XML para banco de dados
- [ ] Verificar se existem campos XML multi-valorados que precisam de tratamento especial

### 2. Iniciar as Melhorias no Esquema do Banco de Dados (Subtarefa 24.2)

- [ ] Criar script SQL para verificar o esquema atual e identificar campos faltantes:
  ```sql
  -- Salvar como server/src/scripts/check-current-schema.sql
  SELECT 
    table_name, 
    column_name, 
    data_type 
  FROM 
    information_schema.columns 
  WHERE 
    table_schema = 'public' 
  ORDER BY 
    table_name, 
    ordinal_position;
  ```
- [ ] Implementar as alterações no modelo `product.model.js`:
  ```javascript
  // Adicionar campos como EAN, producer_code, description_html, etc.
  ```
- [ ] Implementar as alterações no modelo `category.model.js`:
  ```javascript
  // Adicionar parent_id e idosell_path
  ```
- [ ] Implementar as alterações no modelo `producer.model.js`:
  ```javascript
  // Adicionar description e website
  ```
- [ ] Implementar o novo modelo `document.model.js`
- [ ] Implementar o novo modelo `product-property.model.js`

### 3. Iniciar as Melhorias no Parser XML (Subtarefa 24.3)

- [ ] Criar o utilitário melhorado de validação de dados em `server/src/utils/data-validator.js`
- [ ] Expandir o método `_processProduct` para extrair todos os campos
- [ ] Implementar o novo método `_processDocuments`
- [ ] Implementar o novo método `_processProperties`
- [ ] Adicionar tratamento para múltiplos formatos de XML

## Plano para a Semana (Próximos 5-7 dias)

### 1. Concluir as Melhorias no Esquema e no Parser (Subtarefas 24.2 e 24.3)

- [ ] Finalizar todos os modelos do banco de dados
- [ ] Criar script de migração SQL para aplicar as alterações no esquema
- [ ] Concluir todas as melhorias no parser XML
- [ ] Testar o parser com diferentes amostras de XML
- [ ] Implementar mecanismo de log detalhado no parser

### 2. Iniciar a Otimização da Lógica de Importação (Subtarefa 24.4)

- [ ] Atualizar as definições de modelos no script `direct-import-xml.js`
- [ ] Implementar o mapeamento de IDs para todas as relações
- [ ] Atualizar a lógica de importação para todas as entidades
- [ ] Implementar mecanismo para preservar relações existentes

### 3. Iniciar o Tratamento de Erros e Validação (Subtarefa 24.5)

- [ ] Criar sistema de validação para formatos específicos (EAN, URLs, datas)
- [ ] Implementar registro detalhado de erros
- [ ] Criar mecanismo de recuperação para falhas parciais

## Verificações Regulares

Durante a implementação, as seguintes verificações devem ser realizadas regularmente:

1. **Verifique a qualidade do código:**
   - Mantenha o estilo de código consistente com o resto do projeto
   - Documente as funções e métodos claramente
   - Mantenha a cobertura de testes adequada

2. **Verifique a performance:**
   - Monitore o uso de memória durante a importação
   - Verifique o tempo de processamento para diferentes tamanhos de arquivo
   - Identifique gargalos e otimize conforme necessário

3. **Verifique a qualidade dos dados:**
   - Garanta que todos os campos sejam corretamente importados
   - Verifique a integridade das relações entre tabelas
   - Confirme que a sanitização de dados está funcionando adequadamente

## Recursos e Referências

- Arquivo XML de exemplo: `geko_products_en.xml`
- Documentação do parser atual: `server/src/utils/geko-xml-parser.js`
- Modelos de banco de dados: `server/src/models/`
- Script de importação atual: `server/src/scripts/direct-import-xml.js`

## Reporte de Progresso

Atualize o status das tarefas no TaskMaster à medida que forem concluídas:

```bash
# Por exemplo, para marcar a subtarefa 24.1 como concluída
npx taskmaster set-status 24.1 done
```

Documente qualquer problema ou decisão importante durante a implementação para referência futura. 