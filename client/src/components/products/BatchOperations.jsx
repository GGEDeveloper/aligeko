import React, { useState } from 'react';
import { 
  Button, 
  ButtonGroup, 
  Dropdown, 
  Badge, 
  Form,
  Modal,
  Spinner,
  Alert
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { 
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation
} from '../../store/api/productApi';

const BatchOperations = ({ selectedItems, onOperationComplete, onClearSelection }) => {
  // State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState(null);
  
  // RTK Query hooks
  const [bulkUpdateProducts, { isLoading: isUpdating }] = useBulkUpdateProductsMutation();
  const [bulkDeleteProducts, { isLoading: isDeleting }] = useBulkDeleteProductsMutation();
  
  // Handle status change operation
  const handleStatusChange = async () => {
    try {
      setError(null);
      
      await bulkUpdateProducts({
        ids: selectedItems,
        data: { status: newStatus }
      }).unwrap();
      
      // Close modal and notify parent
      setShowStatusModal(false);
      onOperationComplete('status_updated', selectedItems.length);
      onClearSelection();
    } catch (err) {
      setError(err?.data?.message || 'Erro ao atualizar o status dos produtos');
      console.error('Failed to update status:', err);
    }
  };
  
  // Handle bulk delete operation
  const handleDelete = async () => {
    try {
      setError(null);
      
      await bulkDeleteProducts({
        ids: selectedItems
      }).unwrap();
      
      // Close modal and notify parent
      setShowDeleteModal(false);
      onOperationComplete('deleted', selectedItems.length);
      onClearSelection();
    } catch (err) {
      setError(err?.data?.message || 'Erro ao excluir os produtos');
      console.error('Failed to delete products:', err);
    }
  };
  
  // If no items selected, show disabled state
  if (!selectedItems.length) {
    return (
      <div className="d-flex align-items-center mb-4">
        <Dropdown as={ButtonGroup} disabled>
          <Button variant="outline-secondary" disabled>
            Ações em Lote
          </Button>
          <Dropdown.Toggle split variant="outline-secondary" id="dropdown-split-basic" disabled />
          <Dropdown.Menu>
            {/* Disabled menu items */}
          </Dropdown.Menu>
        </Dropdown>
        <span className="text-muted ms-3">Selecione produtos para habilitar ações em lote</span>
      </div>
    );
  }
  
  return (
    <>
      <div className="d-flex align-items-center mb-4">
        <Dropdown as={ButtonGroup}>
          <Button variant="primary" onClick={() => setShowStatusModal(true)}>
            Alterar Status
          </Button>
          <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setShowStatusModal(true)}>
              <i className="bi bi-tag me-2"></i>
              Alterar Status
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
              <i className="bi bi-trash me-2"></i>
              Excluir Selecionados
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        
        <Badge bg="primary" className="ms-3">
          {selectedItems.length} {selectedItems.length === 1 ? 'produto selecionado' : 'produtos selecionados'}
        </Badge>
        
        <Button variant="link" className="ms-auto" onClick={onClearSelection}>
          Limpar Seleção
        </Button>
      </div>
      
      {/* Status Change Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Alterar Status dos Produtos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <p>
            Você está prestes a alterar o status de <strong>{selectedItems.length}</strong> {selectedItems.length === 1 ? 'produto' : 'produtos'}.
          </p>
          
          <Form.Group controlId="newStatus">
            <Form.Label>Novo Status</Form.Label>
            <Form.Select 
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
            >
              <option value="">Selecione um Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="draft">Rascunho</option>
              <option value="out_of_stock">Fora de Estoque</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleStatusChange}
            disabled={isUpdating || !newStatus}
          >
            {isUpdating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Atualizando...
              </>
            ) : (
              'Atualizar Status'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <p>
            Você está prestes a excluir <strong>{selectedItems.length}</strong> {selectedItems.length === 1 ? 'produto' : 'produtos'}.
          </p>
          <p className="text-danger fw-bold">
            Esta ação não pode ser desfeita!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Excluindo...
              </>
            ) : (
              'Excluir Produtos'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

BatchOperations.propTypes = {
  selectedItems: PropTypes.array.isRequired,
  onOperationComplete: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired
};

export default BatchOperations; 