/**
 * Database Models Index
 * 
 * This file initializes the database connection and loads all models.
 * It also sets up the associations between models.
 */

import { Sequelize } from 'sequelize';
import logger from '../config/logger.js';

// Import model definitions
import Product from './product.js';
import Category from './category.js';
import Producer from './producer.js';
import Unit from './unit.js';
import Variant from './variant.js';
import Stock from './stock.js';
import Price from './price.js';
import Image from './image.js';
import Document from './document.js';
import ProductProperty from './product-property.js';

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

// Initialize Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool
  }
);

// Initialize models
const models = {
  Product: Product(sequelize),
  Category: Category(sequelize),
  Producer: Producer(sequelize),
  Unit: Unit(sequelize),
  Variant: Variant(sequelize),
  Stock: Stock(sequelize),
  Price: Price(sequelize),
  Image: Image(sequelize),
  Document: Document(sequelize),
  ProductProperty: ProductProperty(sequelize)
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and Sequelize instance
export { sequelize, Sequelize, models };
export default models; 