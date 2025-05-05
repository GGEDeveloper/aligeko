import { Product, Category, Producer, Unit, Variant, Stock, Price, Image } from '../models';

/**
 * Get all products with pagination
 * @route GET /api/products
 */
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Producer, attributes: ['id', 'name'] },
        { model: Unit, attributes: ['id', 'name', 'moq'] },
        { model: Image, attributes: ['id', 'url'] }
      ],
      order: [['id', 'ASC']]
    });
    
    return res.status(200).json({
      products: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal server error' });
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