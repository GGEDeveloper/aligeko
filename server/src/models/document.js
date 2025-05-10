/**
 * Document Model
 * 
 * This model represents product-related documents like manuals, certificates, 
 * and specification sheets that are referenced in the GEKO XML data.
 */

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Document = sequelize.define('Document', {
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
    }
  }, {
    tableName: 'documents',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['type'] }
    ]
  });

  // Define associations
  Document.associate = (models) => {
    Document.belongsTo(models.Product, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE'
    });
  };

  return Document;
}; 