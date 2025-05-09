# Otimização do Script de Importação do Banco de Dados

Este documento detalha as melhorias necessárias no script de importação do banco de dados (`direct-import-xml.js`) para acomodar todos os campos e relacionamentos identificados na análise da estrutura XML do GEKO.

## Avaliação do Script Atual

O script atual já implementa várias otimizações para performance, incluindo processamento em lotes (500 registros por vez), gerenciamento de memória e transações de banco de dados. No entanto, ele precisa ser expandido para:

1. Usar as definições de modelos atualizadas
2. Implementar as relações entre tabelas corretamente
3. Processar todos os dados extraídos pelo parser XML aprimorado
4. Lidar com as novas tabelas (documents, product_properties)
5. Garantir a integridade referencial entre todas as entidades

## Modificações Necessárias

### 1. Definição de Modelos Atualizados

Os modelos no script `direct-import-xml.js` precisam ser atualizados para incluir todos os campos identificados:

```javascript
// Product Model - Atualizado
class Product extends Model {}
Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  code_on_card: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ean: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  producer_code: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description_long: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_short: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_html: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vat: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'active'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  discontinued: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  category_id: {
    type: DataTypes.TEXT,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  producer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'producers',
      key: 'id'
    }
  },
  unit_id: {
    type: DataTypes.TEXT,
    allowNull: true,
    references: {
      model: 'units',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Product',
  tableName: 'products',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['ean'] },
    { fields: ['producer_code'] },
    { fields: ['category_id'] },
    { fields: ['producer_id'] },
    { fields: ['unit_id'] }
  ]
});

// Category Model - Atualizado
class Category extends Model {}
Category.init({
  id: {
    type: DataTypes.TEXT,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  path: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parent_id: {
    type: DataTypes.TEXT,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  idosell_path: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['parent_id'] }
  ]
});

// Producer Model - Atualizado
class Producer extends Model {}
Producer.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Producer',
  tableName: 'producers',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['name'] }]
});

// Variant Model - Atualizado
class Variant extends Model {}
Variant.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  gross_weight: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  size: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'Variant',
  tableName: 'variants',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['product_id'] },
    { fields: ['code'] },
    { name: 'idx_variants_product_id_code', fields: ['product_id', 'code'] }
  ]
});
```

### 2. Novas Definições de Modelos

Adicionar as definições para os novos modelos:

```javascript
// Document Model - Novo
class Document extends Model {}
Document.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Document',
  tableName: 'documents',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['product_id'] }
  ]
});

// ProductProperty Model - Novo
class ProductProperty extends Model {}
ProductProperty.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ProductProperty',
  tableName: 'product_properties',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['product_id'] },
    { fields: ['name'] }
  ]
});
```

### 3. Atualizações nas Definições Existentes

Updates menores para os modelos existentes:

```javascript
// Stock Model - Atualizado (anteriormente inventories)
class Stock extends Model {}
Stock.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'variants',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  min_order_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'Stock',
  tableName: 'stocks',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['variant_id'] }
  ]
});

// Price Model - Atualizado
class Price extends Model {}
Price.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'variants',
      key: 'id'
    }
  },
  gross_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  net_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  srp_gross: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  srp_net: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'EUR'
  },
  price_type: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'retail'
  },
  min_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'Price',
  tableName: 'prices',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['variant_id'] },
    { name: 'idx_prices_variant_price_type', fields: ['variant_id', 'price_type'] }
  ]
});
```

### 4. Inicialização de Retorno dos Modelos

Adicionar os novos modelos ao objeto de retorno:

```javascript
return {
  Product,
  Category,
  Producer,
  Unit,
  Variant,
  Stock,
  Price,
  Image,
  Document,
  ProductProperty
};
```

### 5. Processamento de Dados Extraídos

A função principal de importação precisa ser atualizada para processar os dados extraídos, incluindo as novas tabelas:

```javascript
async function importDataToDatabase(transformedData, sequelize, models) {
  console.log('========================================');
  console.log('STARTING DATABASE IMPORT');
  console.log('========================================');
  
  const stats = {
    categories: 0,
    producers: 0,
    units: 0,
    products: 0,
    variants: 0,
    stocks: 0,
    prices: 0,
    images: 0,
    documents: 0,
    productProperties: 0
  };
  
  // Use transaction to ensure data consistency
  const transaction = await sequelize.transaction();
  
  try {
    // Código existente para importar categorias, produtores, unidades...
    
    // Importar Categories em lotes
    if (transformedData.categories && transformedData.categories.length > 0) {
      console.log(`Importing ${transformedData.categories.length} categories...`);
      console.time('Categories import');
      
      // Processar em lotes para melhor performance
      const BATCH_SIZE = 500;
      for (let i = 0; i < transformedData.categories.length; i += BATCH_SIZE) {
        const batch = transformedData.categories.slice(i, i + BATCH_SIZE);
        try {
          await models.Category.bulkCreate(batch, {
            updateOnDuplicate: ['name', 'path', 'parent_id', 'idosell_path', 'updated_at'],
            transaction
          });
          stats.categories += batch.length;
        } catch (error) {
          console.error(`Error importing categories batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.categories.length)}:`, error.message);
          // Continue with next batch
        }
      }
      
      console.timeEnd('Categories import');
    }
    
    // Importar Producers em lotes
    if (transformedData.producers && transformedData.producers.length > 0) {
      console.log(`Importing ${transformedData.producers.length} producers...`);
      console.time('Producers import');
      
      // Processar em lotes para melhor performance
      const BATCH_SIZE = 500;
      
      // Verificar quais produtores já existem por nome
      const existingProducers = await models.Producer.findAll({
        attributes: ['id', 'name'],
        transaction
      });
      
      // Mapa de nomes para IDs
      const producerNameToId = {};
      existingProducers.forEach(producer => {
        producerNameToId[producer.name] = producer.id;
      });
      
      for (let i = 0; i < transformedData.producers.length; i += BATCH_SIZE) {
        const batch = transformedData.producers.slice(i, i + BATCH_SIZE);
        
        // Preparar dados para upsert
        const producersToCreate = [];
        
        batch.forEach(producer => {
          if (producerNameToId[producer.name]) {
            producer.id = producerNameToId[producer.name];
          }
          producersToCreate.push(producer);
        });
        
        try {
          await models.Producer.bulkCreate(producersToCreate, {
            updateOnDuplicate: ['description', 'website', 'updated_at'],
            transaction
          });
          stats.producers += batch.length;
        } catch (error) {
          console.error(`Error importing producers batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.producers.length)}:`, error.message);
          // Continue with next batch
        }
      }
      
      console.timeEnd('Producers import');
    }
    
    // Código similar para units...

    // Preparar mapa de código para id
    const variantCodeToId = new Map();
    const productCodeToId = new Map();
    
    // Importar Products em lotes
    if (transformedData.products && transformedData.products.length > 0) {
      console.log(`Importing ${transformedData.products.length} products...`);
      console.time('Products import');
      
      const BATCH_SIZE = 500;
      
      // Verificar quais produtos já existem por código
      const existingProducts = await models.Product.findAll({
        attributes: ['id', 'code'],
        transaction
      });
      
      existingProducts.forEach(product => {
        productCodeToId.set(product.code, product.id);
      });
      
      for (let i = 0; i < transformedData.products.length; i += BATCH_SIZE) {
        const batch = transformedData.products.slice(i, i + BATCH_SIZE);
        
        try {
          // Usar bulkCreate com updateOnDuplicate
          const createdProducts = await models.Product.bulkCreate(batch, {
            updateOnDuplicate: [
              'name', 'code_on_card', 'ean', 'producer_code',
              'description_long', 'description_short', 'description_html',
              'vat', 'delivery_date', 'url', 'status', 'rating', 'discontinued',
              'category_id', 'producer_id', 'unit_id', 'updated_at'
            ],
            returning: true,
            transaction
          });
          
          // Atualizar mapa de código para ID
          createdProducts.forEach(product => {
            productCodeToId.set(product.code, product.id);
          });
          
          stats.products += batch.length;
        } catch (error) {
          console.error(`Error importing products batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.products.length)}:`, error.message);
          // Continue with next batch
        }
      }
      
      console.timeEnd('Products import');
    }
    
    // Importar Variants em lotes, usando o mapa de produtos
    if (transformedData.variants && transformedData.variants.length > 0) {
      console.log(`Importing ${transformedData.variants.length} variants...`);
      console.time('Variants import');
      
      const BATCH_SIZE = 500;
      
      // Verificar quais variantes já existem por código
      const existingVariants = await models.Variant.findAll({
        attributes: ['id', 'code'],
        transaction
      });
      
      existingVariants.forEach(variant => {
        variantCodeToId.set(variant.code, variant.id);
      });
      
      // Processar variantes em lotes
      for (let i = 0; i < transformedData.variants.length; i += BATCH_SIZE) {
        const batch = transformedData.variants.slice(i, i + BATCH_SIZE);
        
        // Processar cada variante para adicionar product_id
        batch.forEach(variant => {
          if (variant.product_code && productCodeToId.has(variant.product_code)) {
            variant.product_id = productCodeToId.get(variant.product_code);
          }
          
          // Remover campos auxiliares não presentes no modelo
          delete variant.product_code;
        });
        
        // Filtrar apenas variantes que têm product_id válido
        const validVariants = batch.filter(variant => variant.product_id);
        
        if (validVariants.length === 0) continue;
        
        try {
          // Usar bulkCreate com updateOnDuplicate
          const createdVariants = await models.Variant.bulkCreate(validVariants, {
            updateOnDuplicate: ['name', 'weight', 'gross_weight', 'size', 'color', 'status', 'updated_at'],
            returning: true,
            transaction
          });
          
          // Atualizar mapa de código para ID
          createdVariants.forEach(variant => {
            variantCodeToId.set(variant.code, variant.id);
          });
          
          stats.variants += validVariants.length;
        } catch (error) {
          console.error(`Error importing variants batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.variants.length)}:`, error.message);
          // Continue with next batch
        }
      }
      
      console.timeEnd('Variants import');
    }
    
    // Processamento similar para stocks, prices, images...
    
    // Importar Documents em lotes (nova tabela)
    if (transformedData.documents && transformedData.documents.length > 0) {
      console.log(`Importing ${transformedData.documents.length} documents...`);
      console.time('Documents import');
      
      const BATCH_SIZE = 500;
      
      for (let i = 0; i < transformedData.documents.length; i += BATCH_SIZE) {
        const batch = transformedData.documents.slice(i, i + BATCH_SIZE);
        
        // Processar cada documento para adicionar product_id
        batch.forEach(doc => {
          if (doc.product_code && productCodeToId.has(doc.product_code)) {
            doc.product_id = productCodeToId.get(doc.product_code);
          }
          
          // Remover campos auxiliares não presentes no modelo
          delete doc.product_code;
        });
        
        // Filtrar apenas documentos que têm product_id válido
        const validDocuments = batch.filter(doc => doc.product_id);
        
        if (validDocuments.length === 0) continue;
        
        try {
          await models.Document.bulkCreate(validDocuments, {
            updateOnDuplicate: ['name', 'url', 'type', 'updated_at'],
            transaction
          });
          
          stats.documents += validDocuments.length;
        } catch (error) {
          console.error(`Error importing documents batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.documents.length)}:`, error.message);
          // Continue with next batch
        }
      }
      
      console.timeEnd('Documents import');
    }
    
    // Importar ProductProperties em lotes (nova tabela)
    if (transformedData.productProperties && transformedData.productProperties.length > 0) {
      console.log(`Importing ${transformedData.productProperties.length} product properties...`);
      console.time('Product properties import');
      
      const BATCH_SIZE = 500;
      
      for (let i = 0; i < transformedData.productProperties.length; i += BATCH_SIZE) {
        const batch = transformedData.productProperties.slice(i, i + BATCH_SIZE);
        
        // Processar cada propriedade para adicionar product_id
        batch.forEach(prop => {
          if (prop.product_code && productCodeToId.has(prop.product_code)) {
            prop.product_id = productCodeToId.get(prop.product_code);
          }
          
          // Remover campos auxiliares não presentes no modelo
          delete prop.product_code;
        });
        
        // Filtrar apenas propriedades que têm product_id válido
        const validProperties = batch.filter(prop => prop.product_id);
        
        if (validProperties.length === 0) continue;
        
        try {
          await models.ProductProperty.bulkCreate(validProperties, {
            updateOnDuplicate: ['value', 'updated_at'],
            transaction
          });
          
          stats.productProperties += validProperties.length;
        } catch (error) {
          console.error(`Error importing product properties batch ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.productProperties.length)}:`, error.message);
          // Continue with next batch
        }
      }
      
      console.timeEnd('Product properties import');
    }
    
    // Commit da transação
    await transaction.commit();
    
    console.log('========================================');
    console.log('DATABASE IMPORT COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log('Import statistics:');
    Object.entries(stats).forEach(([entity, count]) => {
      console.log(`- ${entity}: ${count}`);
    });
    
    return stats;
  } catch (error) {
    // Rollback em caso de erro
    await transaction.rollback();
    console.error('========================================');
    console.error(`DATABASE IMPORT FAILED: ${error.message}`);
    console.error('========================================');
    throw error;
  }
}
```

### 6. Principais Mudanças na Estrutura de Código

1. Mapeamento entre códigos e IDs:
   - Manter mapas para traduzir entre códigos (no XML) e IDs (no banco de dados)
   - Garantir que as relações sejam estabelecidas corretamente

2. Estratégia para registros duplicados:
   - Usar `updateOnDuplicate` para atualizar registros existentes
   - Gerenciar IDs externos vs. IDs do banco de dados

3. Tratamento de erros:
   - Adicionar tratamento de erros em nível de lote
   - Continuar processando mesmo se um lote falhar
   - Fornecer logs detalhados para facilitar a solução de problemas

4. Performance:
   - Manter o tamanho de lote otimizado (500 registros por vez)
   - Otimizar consultas para buscar apenas os dados necessários (attributes)
   - Usar índices em campos frequentemente consultados
   - Construir mapas para consultas rápidas em vez de buscar no banco de dados repetidamente

## Próximos Passos

1. Implementar as modificações descritas neste documento no arquivo `direct-import-xml.js`.
2. Criar script SQL para garantir que o esquema do banco de dados inclua todos os campos necessários.
3. Adicionar script de validação para verificar as relações após a importação.
4. Testar com arquivos XML reais do GEKO em ambientes de desenvolvimento e staging.
5. Monitorar o desempenho e otimizar conforme necessário.

## Gerenciamento de Armazenamento

A importação de dados XML para o banco de dados PostgreSQL hospedado no Neon deve considerar as limitações de armazenamento do plano Free (0.5 GB). Para otimizar o uso de armazenamento durante a importação, implementamos as seguintes estratégias:

### Verificação de Armazenamento

Antes de iniciar uma importação, o sistema verifica automaticamente o estado do armazenamento:

```javascript
import { checkAndManageStorage } from '../scripts/storage-management.js';

// Verificar armazenamento antes de prosseguir
const storageCheck = await checkAndManageStorage({
  preventImportOnCritical: true
});

if (!storageCheck.canProceed) {
  logger.error(`Importação cancelada: ${storageCheck.message}`);
  return {
    success: false,
    error: 'STORAGE_LIMIT_EXCEEDED',
    message: storageCheck.message
  };
}
```

### Opções de Importação Econômica

Quando o armazenamento está próximo do limite, o sistema adapta automaticamente as opções de importação:

```javascript
// Adaptar opções baseado no estado de armazenamento
if (storageInfo.status === 'warning') {
  options.limitProductCount = options.limitProductCount || 500;
  options.skipImages = options.skipImages !== undefined ? options.skipImages : true;
  options.truncateDescriptions = options.truncateDescriptions !== undefined ? options.truncateDescriptions : true;
}
```

### Estratégias de Limpeza

Em caso de armazenamento crítico, o sistema pode executar limpeza automática:

```javascript
const cleanupResult = await cleanupDatabase({
  keepProductCount: 100,       // Manter apenas os 100 produtos mais recentes
  purgeImages: true,           // Remover todas as imagens
  truncateDescriptions: true,  // Truncar descrições longas
  maxDescriptionLength: 200,   // Comprimento máximo para descrições
  backupBeforeCleanup: true    // Fazer backup antes de limpar
});
```

### Recomendações para Importação

Para otimizar o uso de armazenamento durante importações:

1. **Use importação seletiva**:
   - Limite o número de produtos (`limitProductCount: 200`)
   - Filtre por categorias específicas (`categoryFilter: ['tools']`)
   - Desative a importação de imagens em ambiente de desenvolvimento (`skipImages: true`)

2. **Monitore regularmente o uso de armazenamento**:
   - Execute `node storage-management.js check` semanalmente
   - Faça backup das tabelas essenciais antes da limpeza

3. **Considere a rotação de dados**:
   - Em vez de acumular produtos, substitua os antigos
   - Mantenha apenas produtos que sejam representativos para testes

Para mais detalhes, consulte a [documentação completa de otimização de armazenamento](storage-usage-optimization.md). 