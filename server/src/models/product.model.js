import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Product extends Model {}

Product.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  code_on_card: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ean: {
    type: DataTypes.TEXT,
    allowNull: true,
    unique: true,
    validate: {
      is: /^\d{13}$/
    }
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
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
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
  underscored: true, // Use snake_case for table fields
  freezeTableName: true,
  indexes: [
    {
      name: 'idx_products_name',
      fields: ['name']
    }
  ]
});

export default Product; 