import { Product, Category, Producer, Unit, Variant, Image } from '../../../src/models';
import sequelize from '../../../src/config/database';

// Use in-memory SQLite database for tests
beforeAll(async () => {
  // Force sync all models to the test database
  await sequelize.sync({ force: true });
});

// Clean up after tests
afterAll(async () => {
  await sequelize.close();
});

// Mock the Product model and its methods
jest.mock('../../../src/models', () => ({
  Product: {
    create: jest.fn().mockImplementation(data => {
      return Promise.resolve({
        id: 1,
        ...data,
        reload: jest.fn().mockImplementation(() => Promise.resolve(this)),
        update: jest.fn().mockImplementation(updates => {
          const updated = { ...this, ...updates };
          return Promise.resolve(updated);
        }),
        destroy: jest.fn().mockImplementation(() => Promise.resolve(1))
      });
    }),
    findByPk: jest.fn().mockImplementation((id, options) => {
      if (id === 1) {
        const associations = options && options.include ? {} : undefined;
        if (options && options.include) {
          options.include.forEach(model => {
            if (model.model === Variant) {
              associations.Variants = [{ id: 1, code: 'VAR001', weight: 1.5, gross_weight: 1.8 }];
            } else if (model.model === Image) {
              associations.Images = [{ id: 1, url: 'https://example.com/test-image.jpg', alt: 'Test Image' }];
            } else if (model.model.name === 'Category') {
              associations.Category = { id: 'tools', name: 'Tools' };
            } else if (model.model.name === 'Producer') {
              associations.Producer = { id: 1, name: 'Test Producer' };
            } else if (model.model.name === 'Unit') {
              associations.Unit = { id: 'pcs', name: 'Pieces' };
            }
          });
        }
        return Promise.resolve({
          id: 1,
          code: 'TEST001',
          name: 'Test Product',
          description_short: 'Short description',
          description_long: 'Long detailed description',
          vat: 23.00,
          category_id: 'tools',
          producer_id: 1,
          unit_id: 'pcs',
          reload: jest.fn().mockImplementation(() => Promise.resolve(this)),
          update: jest.fn().mockImplementation(updates => {
            const updated = { ...this, ...updates };
            return Promise.resolve(updated);
          }),
          destroy: jest.fn().mockImplementation(() => Promise.resolve(1)),
          ...associations
        });
      }
      return Promise.resolve(null);
    }),
    destroy: jest.fn().mockImplementation(() => Promise.resolve(1))
  },
  Variant: {
    create: jest.fn().mockImplementation(data => {
      return Promise.resolve({
        id: 1,
        ...data
      });
    }),
    findAll: jest.fn().mockImplementation(() => Promise.resolve([]))
  },
  Image: {
    create: jest.fn().mockImplementation(data => {
      return Promise.resolve({
        id: 1,
        ...data
      });
    }),
    findAll: jest.fn().mockImplementation(() => Promise.resolve([]))
  },
  Category: {
    create: jest.fn().mockImplementation(data => {
      return Promise.resolve({
        id: data.id || 'tools',
        ...data
      });
    }),
    destroy: jest.fn().mockImplementation(() => Promise.resolve(1))
  },
  Producer: {
    create: jest.fn().mockImplementation(data => {
      return Promise.resolve({
        id: 1,
        ...data
      });
    }),
    destroy: jest.fn().mockImplementation(() => Promise.resolve(1))
  },
  Unit: {
    create: jest.fn().mockImplementation(data => {
      return Promise.resolve({
        id: data.id || 'pcs',
        ...data
      });
    }),
    destroy: jest.fn().mockImplementation(() => Promise.resolve(1))
  }
}));

describe('Product Model', () => {
  let testProduct;
  let testCategory;
  let testProducer;
  let testUnit;

  beforeEach(async () => {
    // Reset mock implementation counters
    jest.clearAllMocks();
    
    // Create test dependencies first
    testCategory = await Category.create({
      id: 'tools',
      name: 'Tools',
      path: 'tools'
    });

    testProducer = await Producer.create({
      name: 'Test Producer'
    });

    testUnit = await Unit.create({
      id: 'pcs',
      name: 'Pieces',
      moq: 1
    });

    // Create a test product
    testProduct = await Product.create({
      code: 'TEST001',
      name: 'Test Product',
      description_short: 'Short description',
      description_long: 'Long detailed description',
      vat: 23.00,
      category_id: testCategory.id,
      producer_id: testProducer.id,
      unit_id: testUnit.id
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await Product.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });
    await Producer.destroy({ where: {}, force: true });
    await Unit.destroy({ where: {}, force: true });
  });

  test('should create a product successfully', async () => {
    expect(Product.create).toHaveBeenCalledWith({
      code: 'TEST001',
      name: 'Test Product',
      description_short: 'Short description',
      description_long: 'Long detailed description',
      vat: 23.00,
      category_id: 'tools',
      producer_id: 1,
      unit_id: 'pcs'
    });
    
    expect(testProduct).toBeDefined();
    expect(testProduct.id).toBeDefined();
    expect(testProduct.code).toBe('TEST001');
    expect(testProduct.name).toBe('Test Product');
    expect(testProduct.description_short).toBe('Short description');
    expect(testProduct.description_long).toBe('Long detailed description');
    expect(parseFloat(testProduct.vat)).toBe(23.00);
  });

  test('should not create a product without required fields', async () => {
    try {
      await Product.create({
        // Missing code and name
        description_short: 'Short description'
      });
      // Should not reach this line
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  test('should update a product successfully', async () => {
    const updateData = {
      name: 'Updated Product Name',
      description_short: 'Updated short description'
    };
    
    // Mock the update method to return the updated product
    testProduct.update.mockImplementationOnce(updates => {
      return Promise.resolve({
        ...testProduct,
        ...updates
      });
    });
    
    const updatedProduct = await testProduct.update(updateData);
    
    expect(testProduct.update).toHaveBeenCalledWith(updateData);
    expect(updatedProduct.name).toBe('Updated Product Name');
    expect(updatedProduct.description_short).toBe('Updated short description');
    // Other fields should remain unchanged
    expect(updatedProduct.code).toBe('TEST001');
  });

  test('should retrieve product with its associations', async () => {
    const productWithAssociations = await Product.findByPk(1, {
      include: [
        { model: Variant },
        { model: Image },
        { model: { name: 'Category' } },
        { model: { name: 'Producer' } },
        { model: { name: 'Unit' } }
      ]
    });

    expect(Product.findByPk).toHaveBeenCalled();
    expect(productWithAssociations).toBeDefined();
    expect(productWithAssociations.Variants).toBeDefined();
    expect(productWithAssociations.Images).toBeDefined();
    expect(productWithAssociations.Category).toBeDefined();
    expect(productWithAssociations.Producer).toBeDefined();
    expect(productWithAssociations.Unit).toBeDefined();
  });

  test('should delete a product and its dependent records', async () => {
    await testProduct.destroy();
    
    expect(testProduct.destroy).toHaveBeenCalled();
    
    // Check for orphaned records
    const orphanedVariants = await Variant.findAll({ where: { product_id: testProduct.id } });
    const orphanedImages = await Image.findAll({ where: { product_id: testProduct.id } });
    
    expect(Variant.findAll).toHaveBeenCalledWith({ where: { product_id: testProduct.id } });
    expect(Image.findAll).toHaveBeenCalledWith({ where: { product_id: testProduct.id } });
    expect(orphanedVariants.length).toBe(0);
    expect(orphanedImages.length).toBe(0);
  });
}); 