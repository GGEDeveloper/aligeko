import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';

// Create an in-memory SQLite database for testing
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Load models
const modelsDir = path.join(__dirname, '../../src/models');
const modelFiles = fs.readdirSync(modelsDir)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js');

// Initialize models with test database
for (const file of modelFiles) {
  const model = require(path.join(modelsDir, file));
  model.init(sequelize);
}

// Set up model associations
Object.keys(sequelize.models).forEach(modelName => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

export default sequelize; 