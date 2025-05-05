import sequelize from '../config/database';
import User from './user.model';
import Product from './product.model';
import Category from './category.model';
import Producer from './producer.model';
import Unit from './unit.model';
// Import other models here
// import Order from './order.model';
// import Customer from './customer.model';

// Define model associations
const setupAssociations = () => {
  // Product and Category associations (many-to-many)
  Product.belongsToMany(Category, { 
    through: 'product_categories',
    foreignKey: 'product_id',
    otherKey: 'category_id',
    as: 'categories'
  });
  
  Category.belongsToMany(Product, { 
    through: 'product_categories',
    foreignKey: 'category_id',
    otherKey: 'product_id',
    as: 'products'
  });
  
  // Product belongs to Producer
  Product.belongsTo(Producer, {
    foreignKey: 'producer_id',
    as: 'producer'
  });
  
  // Producer has many Products
  Producer.hasMany(Product, {
    foreignKey: 'producer_id',
    as: 'products'
  });
  
  // Product belongs to Unit
  Product.belongsTo(Unit, {
    foreignKey: 'unit_id',
    as: 'unit'
  });
  
  // Unit has many Products
  Unit.hasMany(Product, {
    foreignKey: 'unit_id',
    as: 'products'
  });
  
  // Example: User.hasMany(Order);
  // Example: Order.belongsTo(User);
};

// Initialize associations
setupAssociations();

// Export models
export {
  User,
  Product,
  Category,
  Producer,
  Unit,
  // Export other models
  // Order,
  // Customer
};

export default {
  sequelize,
  User,
  Product,
  Category,
  Producer,
  Unit,
  // Order,
  // Customer
}; 