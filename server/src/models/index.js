import sequelize from '../config/database';
import User from './user.model';
import Product from './product.model';
import Category from './category.model';
import Producer from './producer.model';
import Unit from './unit.model';
import Variant from './variant.model';
import Stock from './stock.model';
import Price from './price.model';
import Image from './image.model';
import Customer from './customer.model';
import Address from './address.model';
import Order from './order.model';
import OrderItem from './order-item.model';
import Shipment from './shipment.model';
import SyncHealth from './sync-health';
import Cart from './cart.model';
import CartItem from './cart-item.model';

// Define model associations
const setupAssociations = () => {
  // User -> Customer
  User.hasOne(Customer, { foreignKey: 'user_id' });
  Customer.belongsTo(User, { foreignKey: 'user_id' });

  // Customer -> Addresses
  Customer.hasMany(Address, { foreignKey: 'customer_id' });
  Address.belongsTo(Customer, { foreignKey: 'customer_id' });

  // Customer -> Orders
  Customer.hasMany(Order, { foreignKey: 'customer_id' });
  Order.belongsTo(Customer, { foreignKey: 'customer_id' });

  // Address -> Orders (shipping and billing)
  Address.hasMany(Order, { foreignKey: 'shipping_address_id', as: 'ShippingAddress' });
  Address.hasMany(Order, { foreignKey: 'billing_address_id', as: 'BillingAddress' });
  Order.belongsTo(Address, { foreignKey: 'shipping_address_id', as: 'ShippingAddress' });
  Order.belongsTo(Address, { foreignKey: 'billing_address_id', as: 'BillingAddress' });

  // Order -> OrderItems
  Order.hasMany(OrderItem, { foreignKey: 'order_id' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

  // Order -> Shipments
  Order.hasMany(Shipment, { foreignKey: 'order_id' });
  Shipment.belongsTo(Order, { foreignKey: 'order_id' });

  // Product -> Variants
  Product.hasMany(Variant, { foreignKey: 'product_id' });
  Variant.belongsTo(Product, { foreignKey: 'product_id' });

  // Variant -> Stock
  Variant.hasMany(Stock, { foreignKey: 'variant_id' });
  Stock.belongsTo(Variant, { foreignKey: 'variant_id' });

  // Variant -> Price
  Variant.hasMany(Price, { foreignKey: 'variant_id' });
  Price.belongsTo(Variant, { foreignKey: 'variant_id' });

  // Variant -> OrderItem
  Variant.hasMany(OrderItem, { foreignKey: 'variant_id' });
  OrderItem.belongsTo(Variant, { foreignKey: 'variant_id' });

  // Product -> Images
  Product.hasMany(Image, { foreignKey: 'product_id' });
  Image.belongsTo(Product, { foreignKey: 'product_id' });

  // User -> Order (approvals and cancellations)
  User.hasMany(Order, { foreignKey: 'approved_by', as: 'ApprovedOrders' });
  User.hasMany(Order, { foreignKey: 'cancelled_by', as: 'CancelledOrders' });
  Order.belongsTo(User, { foreignKey: 'approved_by', as: 'ApprovedBy' });
  Order.belongsTo(User, { foreignKey: 'cancelled_by', as: 'CancelledBy' });

  // User -> Cart (one user has one cart)
  User.hasOne(Cart, { foreignKey: 'user_id' });
  Cart.belongsTo(User, { foreignKey: 'user_id' });

  // Cart -> CartItems
  Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
  CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

  // Variant -> CartItem
  Variant.hasMany(CartItem, { foreignKey: 'variant_id' });
  CartItem.belongsTo(Variant, { foreignKey: 'variant_id' });
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
  Variant,
  Stock,
  Price,
  Image,
  Customer,
  Address,
  Order,
  OrderItem,
  Shipment,
  SyncHealth,
  Cart,
  CartItem
};

export default {
  sequelize,
  User,
  Product,
  Category,
  Producer,
  Unit,
  Variant,
  Stock,
  Price,
  Image,
  Customer,
  Address,
  Order,
  OrderItem,
  Shipment,
  SyncHealth,
  Cart,
  CartItem
}; 