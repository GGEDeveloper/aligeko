import { Product, Category, Producer, Unit, Variant, Stock, Price, Image } from '../models/index.js';
import sequelize from '../config/database.js';
import logger from '../config/logger.js';
import { Op } from 'sequelize';

/**
 * Get all products with pagination
 * @route GET /api/products
 */
export const getAllProducts = async (req, res) => {
  try {
    // Test and log database connection first
    try {
      await sequelize.authenticate();
      logger.info('Database connection is successful');
    } catch (dbError) {
      logger.error('Database connection error:', dbError);
      throw new Error(`Database connection failed: ${dbError.message}`);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Add query parameters for filtering
    const whereClause = {};
    const categoryFilter = req.query.category ? { name: req.query.category } : {};
    const producerFilter = req.query.producer ? { name: req.query.producer } : {};
    
    // Add search filter
    if (req.query.search) {
      whereClause.name = { [Op.like]: `%${req.query.search}%` };
    }
    
    // Add price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      whereClause.price = {};
      if (req.query.minPrice) whereClause.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) whereClause.price[Op.lte] = parseFloat(req.query.maxPrice);
    }
    
    // Log the query we're about to execute
    logger.info(`Executing product query with limit ${limit}, offset ${offset}`);
    
    // Primeiro, vamos buscar os produtos sem os relacionamentos para garantir que a consulta básica funciona
    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['id', 'ASC']]
    });
    
    // Se não houver produtos, retornar array vazio
    if (count === 0) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalItems: 0,
          totalPages: 0,
          page,
          limit
        }
      });
    }
    
    // Agora buscar os produtos com os relacionamentos
    const productIds = rows.map(p => p.id);
    const productsWithRelations = await Product.findAll({
      where: { id: productIds },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'], required: false },
        { model: Producer, as: 'producer', attributes: ['id', 'name'], required: false },
        { model: Unit, as: 'unit', attributes: ['id', 'name', 'moq'], required: false },
        { model: Image, as: 'images', attributes: ['id', 'url'], required: false }
      ]
    });
    
    // Log the response
    logger.info(`Found ${count} products, returning ${productsWithRelations.length} items`);
    
    return res.status(200).json({
      success: true,
      data: {
        items: productsWithRelations,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        page,
        limit
      }
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    if (error && error.stack) {
      console.error('Full stack:', error.stack);
    }
    // If there's a database connection error, respond with error instead of fallback mock data
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error',
      stack: error.stack,
      message: 'Failed to fetch products from database'
    });
  }
};

/**
 * Get product by ID with all relationships
 * @route GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Producer, attributes: ['id', 'name'] },
        { model: Unit, attributes: ['id', 'name', 'moq'] },
        { 
          model: Variant,
          include: [
            { model: Stock },
            { model: Price }
          ]
        },
        { model: Image, attributes: ['id', 'url'] }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new product
 * @route POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const { variants, images, ...productData } = req.body;
    
    // Create product
    const product = await Product.create(productData);
    
    // Create variants if provided
    if (variants && variants.length > 0) {
      await Promise.all(
        variants.map(async (variant) => {
          const { stock, price, ...variantData } = variant;
          
          // Create variant
          const newVariant = await Variant.create({
            ...variantData,
            product_id: product.id
          });
          
          // Create stock if provided
          if (stock) {
            await Stock.create({
              ...stock,
              variant_id: newVariant.id
            });
          }
          
          // Create price if provided
          if (price) {
            await Price.create({
              ...price,
              variant_id: newVariant.id
            });
          }
        })
      );
    }
    
    // Create images if provided
    if (images && images.length > 0) {
      await Promise.all(
        images.map(async (image) => {
          await Image.create({
            ...image,
            product_id: product.id
          });
        })
      );
    }
    
    // Fetch the created product with all associations
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Producer, attributes: ['id', 'name'] },
        { model: Unit, attributes: ['id', 'name', 'moq'] },
        { 
          model: Variant,
          include: [
            { model: Stock },
            { model: Price }
          ]
        },
        { model: Image, attributes: ['id', 'url'] }
      ]
    });
    
    return res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a product
 * @route PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { variants, images, ...productData } = req.body;
    
    // Find product
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product
    await product.update(productData);
    
    // Update variants if provided (more complex logic would be needed for a complete solution)
    // This is a simplified version
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const { id: variantId, ...variantData } = variant;
        
        if (variantId) {
          // Update existing variant
          await Variant.update(variantData, { where: { id: variantId } });
        } else {
          // Create new variant
          await Variant.create({ ...variantData, product_id: id });
        }
      }
    }
    
    // Fetch the updated product
    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Producer, attributes: ['id', 'name'] },
        { model: Unit, attributes: ['id', 'name', 'moq'] },
        { 
          model: Variant,
          include: [
            { model: Stock },
            { model: Price }
          ]
        },
        { model: Image, attributes: ['id', 'url'] }
      ]
    });
    
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find product
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete product (will cascade delete variants, stock, prices, images)
    await product.destroy();
    
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 