import { expect } from 'chai';
import { Product, Category, Producer, Unit } from '../../src/models';
import sequelize from '../../src/config/database';

describe('Models', () => {
  // Clean up database after tests
  after(async () => {
    await sequelize.sync({ force: true });
  });

  describe('Product Model', () => {
    it('should create a product with valid attributes', async () => {
      const product = await Product.create({
        code: 'TEST-123',
        name: 'Test Product',
        description_short: 'A product for testing',
        vat: 23.00
      });

      expect(product).to.be.an('object');
      expect(product.id).to.exist;
      expect(product.code).to.equal('TEST-123');
      expect(product.name).to.equal('Test Product');
      expect(product.created_at).to.exist;
      expect(product.updated_at).to.exist;
    });

    it('should validate EAN code format', async () => {
      try {
        const product = await Product.create({
          code: 'TEST-456',
          name: 'Invalid EAN Product',
          ean: '123456' // Invalid - not 13 digits
        });
        // Should not reach here
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
      }
    });
  });

  describe('Category Model', () => {
    it('should create a category with valid attributes', async () => {
      const category = await Category.create({
        id: 'tools',
        name: 'Tools',
        path: '/tools'
      });

      expect(category).to.be.an('object');
      expect(category.id).to.equal('tools');
      expect(category.name).to.equal('Tools');
      expect(category.path).to.equal('/tools');
      expect(category.created_at).to.exist;
      expect(category.updated_at).to.exist;
    });
  });

  describe('Producer Model', () => {
    it('should create a producer with valid attributes', async () => {
      const producer = await Producer.create({
        name: 'Test Producer'
      });

      expect(producer).to.be.an('object');
      expect(producer.id).to.exist;
      expect(producer.name).to.equal('Test Producer');
      expect(producer.created_at).to.exist;
      expect(producer.updated_at).to.exist;
    });

    it('should enforce unique producer name', async () => {
      // Create first producer
      await Producer.create({
        name: 'Unique Producer'
      });

      try {
        // Attempt to create another with the same name
        await Producer.create({
          name: 'Unique Producer'
        });
        // Should not reach here
        expect.fail('Should have thrown unique constraint error');
      } catch (error) {
        expect(error.name).to.include('Sequelize');
      }
    });
  });

  describe('Unit Model', () => {
    it('should create a unit with valid attributes', async () => {
      const unit = await Unit.create({
        id: 'PC',
        name: 'Piece',
        moq: 1
      });

      expect(unit).to.be.an('object');
      expect(unit.id).to.equal('PC');
      expect(unit.name).to.equal('Piece');
      expect(unit.moq).to.equal(1);
      expect(unit.created_at).to.exist;
      expect(unit.updated_at).to.exist;
    });

    it('should validate minimum MOQ value', async () => {
      try {
        await Unit.create({
          id: 'BOX',
          name: 'Box',
          moq: 0 // Invalid - minimum should be 1
        });
        // Should not reach here
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('SequelizeValidationError');
      }
    });
  });

  describe('Model Associations', () => {
    before(async () => {
      // Create test data
      await Product.create({
        code: 'HAMMER-1',
        name: 'Hammer',
      });
      
      await Category.create({
        id: 'hand-tools',
        name: 'Hand Tools',
      });

      await Producer.create({
        name: 'Tool Factory'
      });

      await Unit.create({
        id: 'PC',
        name: 'Piece',
        moq: 1
      });
    });

    it('should allow adding a product to a category', async () => {
      const product = await Product.findOne({ where: { code: 'HAMMER-1' } });
      const category = await Category.findByPk('hand-tools');
      
      await product.addCategory(category);
      
      const categories = await product.getCategories();
      expect(categories).to.be.an('array');
      expect(categories.length).to.equal(1);
      expect(categories[0].id).to.equal('hand-tools');
    });

    it('should allow finding products in a category', async () => {
      const category = await Category.findByPk('hand-tools', {
        include: [{ association: 'products' }]
      });
      
      expect(category.products).to.be.an('array');
      expect(category.products.length).to.equal(1);
      expect(category.products[0].code).to.equal('HAMMER-1');
    });

    it('should allow assigning a producer to a product', async () => {
      const product = await Product.findOne({ where: { code: 'HAMMER-1' } });
      const producer = await Producer.findOne({ where: { name: 'Tool Factory' } });
      
      product.producer_id = producer.id;
      await product.save();
      
      const updatedProduct = await Product.findOne({ 
        where: { code: 'HAMMER-1' },
        include: [{ association: 'producer' }]
      });
      
      expect(updatedProduct.producer).to.be.an('object');
      expect(updatedProduct.producer.name).to.equal('Tool Factory');
    });

    it('should allow assigning a unit to a product', async () => {
      const product = await Product.findOne({ where: { code: 'HAMMER-1' } });
      const unit = await Unit.findByPk('PC');
      
      product.unit_id = unit.id;
      await product.save();
      
      const updatedProduct = await Product.findOne({ 
        where: { code: 'HAMMER-1' },
        include: [{ association: 'unit' }]
      });
      
      expect(updatedProduct.unit).to.be.an('object');
      expect(updatedProduct.unit.id).to.equal('PC');
      expect(updatedProduct.unit.name).to.equal('Piece');
    });
  });
}); 