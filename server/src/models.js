// Centraliza exports dos modelos principais para compatibilidade com imports antigos
import models, { sequelize, Sequelize } from './models/index.js';
import Customer from './models/customer.model.js';
import Order from './models/order.model.js';
import User from './models/user.model.js';
import Cart from './models/cart.model.js';
import CartItem from './models/cart-item.model.js';
import OrderItem from './models/order-item.model.js';
import Address from './models/address.model.js';
import CompanyInfo from './models/companyInfo.js';
import Document from './models/document.model.js';
import Image from './models/image.model.js';
import Price from './models/price.model.js';
import Category from './models/category.model.js';
import Product from './models/product.model.js';
import Stock from './models/stock.js';
import Variant from './models/variant.js';
import Producer from './models/producer.model.js';
import Unit from './models/unit.model.js';
import Shipment from './models/shipment.model.js';

export {
  models,
  sequelize,
  Sequelize,
  Customer,
  Order,
  User,
  Cart,
  CartItem,
  OrderItem,
  Address,
  CompanyInfo,
  Document,
  Image,
  Price,
  Category,
  Product,
  Variant,
  Stock,
  Producer,
  Unit,
  Shipment
};

// Para compatibilidade default
export default {
  models,
  sequelize,
  Sequelize,
  Customer,
  Order,
  User,
  Cart,
  CartItem,
  OrderItem,
  Address,
  CompanyInfo,
  Document,
  Image,
  Price,
  Category,
  Product,
  Variant,
  Stock,
  Producer,
  Unit,
  Shipment
};
