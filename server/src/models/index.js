/**
 * Database Models Index
 * 
 * This file initializes the database connection and loads all models.
 * It also sets up the associations between models.
 */

import { Sequelize } from 'sequelize';
import logger from '../config/logger.js';
import sequelize from '../config/database.js';

// Import model definitions
import CategoryModel from './category.js';
import ProducerModel from './producer.js';
import UnitModel from './unit.js';
import ProductModel from './product.js';
import VariantModel from './variant.js';
import StockModel from './stock.js';
import PriceModel from './price.js';
import ImageModel from './image.js';
import DocumentModel from './document.js';
import ProductPropertyModel from './product-property.js';

const env = process.env.NODE_ENV || 'development';
const config = {
  database: process.env.DB_NAME || 'alitools',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Initialize models by calling the model functions with sequelize instance
const Category = CategoryModel(sequelize);
const Producer = ProducerModel(sequelize);
const Unit = UnitModel(sequelize);
const Product = ProductModel(sequelize);
const Variant = VariantModel(sequelize);
const Stock = StockModel(sequelize);
const Price = PriceModel(sequelize);
const Image = ImageModel(sequelize);
const Document = DocumentModel(sequelize);
const ProductProperty = ProductPropertyModel(sequelize);

// Initialize models
const models = {
  Category,
  Producer,
  Unit,
  Product,
  Variant,
  Stock,
  Price,
  Image,
  Document,
  ProductProperty
};

// Set up associations using the associate method in each model
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and Sequelize instance
export { sequelize, Sequelize, models };
export default models; 