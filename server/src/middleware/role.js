/**
 * Middleware para verificar se o usuário é admin
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware para verificar se o usuário é manager
 */
export const isManager = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Manager or Admin role required.' });
    }

    next();
  } catch (error) {
    console.error('Error in isManager middleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware para verificar se o usuário é sales
 */
export const isSales = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.role !== 'sales' && req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Sales, Manager or Admin role required.' });
    }

    next();
  } catch (error) {
    console.error('Error in isSales middleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware para verificar se o usuário é customer ou role superior
 */
export const isCustomer = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Todos os tipos de usuário (incluindo customer) podem acessar
    next();
  } catch (error) {
    console.error('Error in isCustomer middleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware para verificar se o usuário é dono do recurso
 * Requer um paramId e uma função para buscar o objeto
 */
export const isResourceOwner = (paramId, getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Admin, manager e sales podem acessar qualquer recurso
      if (['admin', 'manager', 'sales'].includes(req.user.role)) {
        return next();
      }

      const resourceId = req.params[paramId];
      if (!resourceId) {
        return res.status(400).json({ message: 'Resource ID not provided' });
      }

      const ownerId = await getResourceOwnerId(resourceId);
      
      // Se não encontrou o recurso
      if (ownerId === null) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Verifica se o usuário é dono do recurso
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You do not own this resource.' });
      }

      next();
    } catch (error) {
      console.error('Error in isResourceOwner middleware:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};