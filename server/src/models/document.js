/**
 * Document Model
 * 
 * This model represents product-related documents like manuals, certificates, 
 * and specification sheets that are referenced in the GEKO XML data.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Document model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Document model
 */
const Document = (sequelize) => {
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
        model: 'Products',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pdf'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'en'
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
    tableName: 'documents',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'url']
      }
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

export default Document; 