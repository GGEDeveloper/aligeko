import { Customer, User, Address } from '../models.js';
import { Op } from 'sequelize';

/**
 * Get all customers with pagination
 * @route GET /api/customers
 */
export const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Customer.findAndCountAll({
      limit,
      offset,
      include: [
        { 
          model: User, 
          attributes: ['id', 'name', 'email', 'role', 'is_active'] 
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json({
      customers: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get customer by ID with all relationships
 * @route GET /api/customers/:id
 */
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id, {
      include: [
        { 
          model: User, 
          attributes: ['id', 'name', 'email', 'role', 'is_active'] 
        },
        { 
          model: Address
        }
      ]
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new customer
 * @route POST /api/customers
 */
export const createCustomer = async (req, res) => {
  try {
    const { user_id, addresses, ...customerData } = req.body;
    
    // Verificar se o usuário existe
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verificar se já existe um customer para este user_id
    const existingCustomer = await Customer.findOne({ where: { user_id } });
    if (existingCustomer) {
      return res.status(409).json({ message: 'This user already has a customer profile' });
    }
    
    // Criar o customer
    const customer = await Customer.create({
      ...customerData,
      user_id
    });
    
    // Criar endereços se fornecidos
    if (addresses && addresses.length > 0) {
      await Promise.all(
        addresses.map(async (address) => {
          await Address.create({
            ...address,
            customer_id: customer.id
          });
        })
      );
    }
    
    // Buscar o customer criado com os relacionamentos
    const createdCustomer = await Customer.findByPk(customer.id, {
      include: [
        { 
          model: User, 
          attributes: ['id', 'name', 'email', 'role', 'is_active'] 
        },
        { 
          model: Address
        }
      ]
    });
    
    return res.status(201).json(createdCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a customer
 * @route PUT /api/customers/:id
 */
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { addresses, ...customerData } = req.body;
    
    // Verificar se o customer existe
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Atualizar o customer
    await customer.update(customerData);
    
    // Buscar o customer atualizado com os relacionamentos
    const updatedCustomer = await Customer.findByPk(id, {
      include: [
        { 
          model: User, 
          attributes: ['id', 'name', 'email', 'role', 'is_active'] 
        },
        { 
          model: Address
        }
      ]
    });
    
    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a customer
 * @route DELETE /api/customers/:id
 */
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o customer existe
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Excluir o customer (irá excluir em cascata endereços)
    await customer.destroy();
    
    return res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add an address to a customer
 * @route POST /api/customers/:id/addresses
 */
export const addAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const addressData = req.body;
    
    // Verificar se o customer existe
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Se for definido como endereço padrão de um tipo, desmarcar outros endereços padrão desse tipo
    if (addressData.is_default && addressData.type) {
      await Address.update(
        { is_default: false },
        { 
          where: { 
            customer_id: id,
            type: addressData.type,
            is_default: true
          } 
        }
      );
    }
    
    // Criar o endereço
    const address = await Address.create({
      ...addressData,
      customer_id: id
    });
    
    return res.status(201).json(address);
  } catch (error) {
    console.error('Error adding address:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update an address
 * @route PUT /api/customers/:customerId/addresses/:addressId
 */
export const updateAddress = async (req, res) => {
  try {
    const { customerId, addressId } = req.params;
    const addressData = req.body;
    
    // Verificar se o endereço existe e pertence ao customer
    const address = await Address.findOne({
      where: {
        id: addressId,
        customer_id: customerId
      }
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found or does not belong to this customer' });
    }
    
    // Se for definido como endereço padrão de um tipo, desmarcar outros endereços padrão desse tipo
    if (addressData.is_default && addressData.type) {
      await Address.update(
        { is_default: false },
        { 
          where: { 
            customer_id: customerId,
            type: addressData.type,
            is_default: true,
            id: { [Op.ne]: addressId } // Excluir este endereço da atualização
          } 
        }
      );
    }
    
    // Atualizar o endereço
    await address.update(addressData);
    
    return res.status(200).json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete an address
 * @route DELETE /api/customers/:customerId/addresses/:addressId
 */
export const deleteAddress = async (req, res) => {
  try {
    const { customerId, addressId } = req.params;
    
    // Verificar se o endereço existe e pertence ao customer
    const address = await Address.findOne({
      where: {
        id: addressId,
        customer_id: customerId
      }
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found or does not belong to this customer' });
    }
    
    // Excluir o endereço
    await address.destroy();
    
    return res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 