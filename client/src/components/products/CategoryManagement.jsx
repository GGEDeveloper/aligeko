import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  ListGroup, 
  Badge,
  Modal,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from '../../store/api/categoryApi';

const CategoryManagement = () => {
  // State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  
  // RTK Query hooks
  const { data: categories, isLoading, refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      parent_id: '',
      is_active: true
    });
    setErrors({});
  };
  
  // Open add modal
  const handleAddClick = () => {
    resetFormData();
    setShowAddModal(true);
  };
  
  // Open edit modal
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
      is_active: category.is_active === undefined ? true : category.is_active
    });
    setErrors({});
    setShowEditModal(true);
  };
  
  // Open delete modal
  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da categoria é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Create category
  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      await createCategory(formData).unwrap();
      setShowAddModal(false);
      resetFormData();
      refetch();
    } catch (err) {
      if (err.data?.errors) {
        setErrors(err.data.errors);
      } else {
        setErrors({ general: err.data?.message || 'Erro ao criar categoria' });
      }
    }
  };
  
  // Update category
  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    try {
      await updateCategory({
        id: selectedCategory.id,
        ...formData
      }).unwrap();
      setShowEditModal(false);
      resetFormData();
      refetch();
    } catch (err) {
      if (err.data?.errors) {
        setErrors(err.data.errors);
      } else {
        setErrors({ general: err.data?.message || 'Erro ao atualizar categoria' });
      }
    }
  };
  
  // Delete category
  const handleDelete = async () => {
    try {
      await deleteCategory(selectedCategory.id).unwrap();
      setShowDeleteModal(false);
      refetch();
    } catch (err) {
      setErrors({ general: err.data?.message || 'Erro ao excluir categoria' });
    }
  };
  
  // Render nested categories recursively
  const renderCategories = (items = [], parentId = null, level = 0) => {
    const filtered = items.filter(item => 
      (parentId === null && !item.parent_id) || 
      (item.parent_id === parentId)
    );
    
    if (filtered.length === 0) return null;
    
    return filtered.map(category => (
      <React.Fragment key={category.id}>
        <ListGroup.Item className="d-flex justify-content-between align-items-center" 
          style={{ paddingLeft: `${level * 20 + 16}px` }}>
          <div>
            <span className="me-2">{category.name}</span>
            {!category.is_active && (
              <Badge bg="secondary" pill>Inativo</Badge>
            )}
            {category.product_count > 0 && (
              <Badge bg="info" pill className="ms-1">
                {category.product_count} produtos
              </Badge>
            )}
          </div>
          <div>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-1"
              onClick={() => handleEditClick(category)}
            >
              <i className="bi bi-pencil"></i>
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => handleDeleteClick(category)}
              disabled={category.product_count > 0}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </ListGroup.Item>
        {renderCategories(items, category.id, level + 1)}
      </React.Fragment>
    ));
  };
  
  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Gerenciamento de Categorias</h5>
        <Button variant="light" size="sm" onClick={handleAddClick}>
          <i className="bi bi-plus-circle me-2"></i>
          Nova Categoria
        </Button>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
          </div>
        ) : categories && categories.length > 0 ? (
          <ListGroup variant="flush">
            {renderCategories(categories)}
          </ListGroup>
        ) : (
          <div className="text-center py-4">
            <p className="mb-3">Nenhuma categoria cadastrada.</p>
            <Button variant="primary" onClick={handleAddClick}>
              <i className="bi bi-plus-circle me-2"></i>
              Criar Primeira Categoria
            </Button>
          </div>
        )}
      </Card.Body>
      
      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nova Categoria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors.general && (
            <Alert variant="danger" className="mb-3">
              {errors.general}
            </Alert>
          )}
          
          <Form>
            <Form.Group className="mb-3" controlId="categoryName">
              <Form.Label>Nome *</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="categoryDescription">
              <Form.Label>Descrição</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="categoryParent">
              <Form.Label>Categoria Pai</Form.Label>
              <Form.Select
                name="parent_id"
                value={formData.parent_id}
                onChange={handleInputChange}
                isInvalid={!!errors.parent_id}
              >
                <option value="">Nenhuma (Categoria Raiz)</option>
                {categories && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.parent_id}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="categoryActive">
              <Form.Check 
                type="checkbox"
                label="Categoria Ativa"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Criando...
              </>
            ) : (
              'Criar Categoria'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Categoria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors.general && (
            <Alert variant="danger" className="mb-3">
              {errors.general}
            </Alert>
          )}
          
          <Form>
            <Form.Group className="mb-3" controlId="editCategoryName">
              <Form.Label>Nome *</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="editCategoryDescription">
              <Form.Label>Descrição</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="editCategoryParent">
              <Form.Label>Categoria Pai</Form.Label>
              <Form.Select
                name="parent_id"
                value={formData.parent_id}
                onChange={handleInputChange}
                isInvalid={!!errors.parent_id}
              >
                <option value="">Nenhuma (Categoria Raiz)</option>
                {categories && categories
                  .filter(c => c.id !== selectedCategory?.id)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                }
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.parent_id}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Categoria pai não pode ser a própria categoria ou uma subcategoria dela.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="editCategoryActive">
              <Form.Check 
                type="checkbox"
                label="Categoria Ativa"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Category Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errors.general && (
            <Alert variant="danger" className="mb-3">
              {errors.general}
            </Alert>
          )}
          
          <p>
            Tem certeza que deseja excluir a categoria <strong>{selectedCategory?.name}</strong>?
          </p>
          <p className="text-danger">
            Esta ação não pode ser desfeita!
          </p>
          {selectedCategory?.product_count > 0 && (
            <Alert variant="warning">
              Esta categoria possui {selectedCategory.product_count} produtos associados. Remova os produtos da categoria antes de excluí-la.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting || (selectedCategory?.product_count > 0)}
          >
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Excluindo...
              </>
            ) : (
              'Excluir Categoria'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default CategoryManagement; 