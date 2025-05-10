# Melhoria no Esquema do Banco de Dados para Importação XML

Este documento detalha as alterações necessárias nos modelos do banco de dados para acomodar todos os campos identificados na análise da estrutura XML do GEKO.

## Avaliação dos Modelos Atuais

Após analisar os modelos existentes no sistema e compará-los com os campos identificados no XML, foram identificadas várias lacunas que precisam ser preenchidas para garantir uma importação completa dos dados.

## Alterações Necessárias por Tabela

### 1. Tabela: products

**Modelo atual**: `server/src/models/product.model.js`

O modelo atual já inclui vários campos necessários, mas precisa de alguns ajustes.

**Campos existentes que estão corretos**:
- id (INTEGER, autoincrement, primary key)
- code (TEXT)
- code_on_card (TEXT)
- ean (TEXT)
- producer_code (TEXT)
- name (TEXT)
- description_long (TEXT)
- description_short (TEXT)
- description_html (TEXT)
- vat (DECIMAL)
- delivery_date (DATE)
- url (TEXT)
- created_at, updated_at (TIMESTAMP)

**Campos que precisam ser adicionados**:
- category_id (TEXT, referência à tabela categories)
- producer_id (INTEGER, referência à tabela producers)
- unit_id (TEXT, referência à tabela units)
- status (TEXT, para rastrear o status do produto)
- rating (DECIMAL, para classificações/avaliações)
- discontinued (BOOLEAN, para produtos descontinuados)

**Implementação sugerida**:

```javascript
// Adicionar ao model product.model.js
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
}
```

### 2. Tabela: categories

**Modelo atual**: `server/src/models/category.model.js`

O modelo atual tem os campos básicos, mas faltam alguns campos identificados no XML.

**Campos existentes que estão corretos**:
- id (TEXT, primary key)
- name (TEXT)
- path (TEXT)
- created_at, updated_at (TIMESTAMP)

**Campos que precisam ser adicionados**:
- parent_id (TEXT, referência à própria tabela categories)
- idosell_path (TEXT, caminho alternativo encontrado no XML)

**Implementação sugerida**:

```javascript
// Adicionar ao model category.model.js
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
```

### 3. Tabela: producers

**Modelo atual**: `server/src/models/producer.model.js`

O modelo atual é muito básico e precisa de campos adicionais para informações completas do produtor.

**Campos existentes que estão corretos**:
- id (INTEGER, autoincrement, primary key)
- name (TEXT)
- created_at, updated_at (TIMESTAMP)

**Campos que precisam ser adicionados**:
- description (TEXT)
- website (TEXT)

**Implementação sugerida**:

```javascript
// Adicionar ao model producer.model.js
description: {
  type: DataTypes.TEXT,
  allowNull: true
},
website: {
  type: DataTypes.TEXT,
  allowNull: true
}
```

### 4. Tabela: units

**Modelo atual**: `server/src/models/unit.model.js`

O modelo atual parece suficiente para os dados identificados no XML.

**Campos existentes que estão corretos**:
- id (TEXT, primary key)
- name (TEXT)
- moq (INTEGER)
- created_at, updated_at (TIMESTAMP)

**Campos que precisam ser adicionados**: Nenhum

### 5. Tabela: variants

**Modelo atual**: `server/src/models/variant.model.js`

O modelo atual tem os campos básicos, mas faltam alguns campos para informações completas da variante.

**Campos existentes que estão corretos**:
- id (INTEGER, autoincrement, primary key)
- product_id (INTEGER, referência à tabela products)
- code (TEXT)
- weight (DECIMAL)
- gross_weight (DECIMAL)
- created_at, updated_at (TIMESTAMP)

**Campos que precisam ser adicionados**:
- name (TEXT, para descrição da variante)
- size (TEXT, para dimensões)
- color (TEXT, para informação de cor)
- status (TEXT, para status da variante)

**Implementação sugerida**:

```javascript
// Adicionar ao model variant.model.js
name: {
  type: DataTypes.TEXT,
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
```

### 6. Tabela: prices

Não foi analisado o modelo atual, mas com base na análise do XML, são necessários os seguintes campos:

**Campos necessários**:
- id (INTEGER, autoincrement, primary key)
- variant_id (INTEGER, referência à tabela variants)
- gross_price (DECIMAL)
- net_price (DECIMAL)
- srp_gross (DECIMAL)
- srp_net (DECIMAL)
- currency (TEXT)
- price_type (TEXT)
- min_quantity (INTEGER)
- created_at, updated_at (TIMESTAMP)

### 7. Tabela: stocks

Não foi analisado o modelo atual, mas com base na análise do XML, são necessários os seguintes campos:

**Campos necessários**:
- id (INTEGER, autoincrement, primary key)
- variant_id (INTEGER, referência à tabela variants)
- quantity (INTEGER)
- available (BOOLEAN)
- min_order_quantity (INTEGER)
- created_at, updated_at (TIMESTAMP)

### 8. Tabela: images

Não foi analisado o modelo atual, mas com base na análise do XML, são necessários os seguintes campos:

**Campos necessários**:
- id (INTEGER, autoincrement, primary key)
- product_id (INTEGER, referência à tabela products)
- url (TEXT)
- is_main (BOOLEAN)
- order (INTEGER)
- created_at, updated_at (TIMESTAMP)

### 9. Nova Tabela: documents

Esta tabela ainda não existe e precisa ser criada para armazenar documentos relacionados aos produtos.

**Campos necessários**:
- id (INTEGER, autoincrement, primary key)
- product_id (INTEGER, referência à tabela products)
- name (TEXT)
- url (TEXT)
- type (TEXT)
- created_at, updated_at (TIMESTAMP)

**Implementação sugerida**:

```javascript
// Novo arquivo: document.model.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Document extends Model {}

Document.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
    {
      name: 'idx_documents_product_id',
      fields: ['product_id']
    }
  ]
});

export default Document;
```

### 10. Nova Tabela: product_properties

Esta tabela ainda não existe e precisa ser criada para armazenar propriedades adicionais dos produtos.

**Campos necessários**:
- id (INTEGER, autoincrement, primary key)
- product_id (INTEGER, referência à tabela products)
- name (TEXT)
- value (TEXT)
- created_at, updated_at (TIMESTAMP)

**Implementação sugerida**:

```javascript
// Novo arquivo: product-property.model.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ProductProperty extends Model {}

ProductProperty.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
    {
      name: 'idx_product_properties_product_id',
      fields: ['product_id']
    },
    {
      name: 'idx_product_properties_name',
      fields: ['name']
    }
  ]
});

export default ProductProperty;
```

## Script SQL para Modificação do Banco de Dados

Além de atualizar os modelos Sequelize, é necessário executar um script SQL para adicionar as colunas e tabelas necessárias ao banco de dados existente.

```sql
-- Atualizações na tabela 'products'
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS producer_id INTEGER REFERENCES producers(id),
ADD COLUMN IF NOT EXISTS unit_id TEXT REFERENCES units(id),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS discontinued BOOLEAN DEFAULT FALSE;

-- Atualizações na tabela 'categories'
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS idosell_path TEXT;

-- Atualizações na tabela 'producers'
ALTER TABLE producers 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Atualizações na tabela 'variants'
ALTER TABLE variants 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Criar tabela 'documents' se não existir
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_product_id ON documents(product_id);

-- Criar tabela 'product_properties' se não existir
CREATE TABLE IF NOT EXISTS product_properties (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  name TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_product_properties_product_id ON product_properties(product_id);
CREATE INDEX IF NOT EXISTS idx_product_properties_name ON product_properties(name);
```

## Próximos Passos

1. Implementar as alterações nos modelos existentes.
2. Criar os novos modelos (documents e product_properties).
3. Executar o script SQL para atualizar o esquema do banco de dados.
4. Atualizar quaisquer associações no arquivo de índice dos modelos (index.js).
5. Garantir que as alterações sejam refletidas na lógica de importação do XML. 