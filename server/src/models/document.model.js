/**
 * Document Model
 * 
 * This model represents product-related documents like manuals, certificates, 
 * and specification sheets that are referenced in the GEKO XML data.
 */

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'URL to the document file'
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Document type (manual, certificate, etc.)'
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Document title/name'
  },
  language: {
    type: DataTypes.STRING(5),
    allowNull: true,
    comment: 'Document language code (en, pt, etc.)'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Document',
  tableName: 'documents',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['product_id'] },
    { fields: ['type'] }
  ]
});

export default Document; 