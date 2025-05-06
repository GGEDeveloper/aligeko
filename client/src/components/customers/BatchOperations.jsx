import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Button, Modal, Spinner, Form, Alert } from 'react-bootstrap';
import {
  useBatchUpdateCustomerStatusMutation,
  useBatchDeleteCustomersMutation
} from '../../store/api/customerApi';

const BatchOperations = ({ selectedCustomers, onSuccess }) => {
  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToSet, setStatusToSet] = useState('active');
  const [error, setError] = useState(null);
  
  // RTK Query mutations
  const [batchUpdateStatus, { isLoading: isUpdatingStatus }] = useBatchUpdateCustomerStatusMutation();
  const [batchDelete, { isLoading: isDeleting }] = useBatchDeleteCustomersMutation();
  
  // Handle batch status update
  const handleBatchStatusUpdate = async () => {
    setError(null);
    try {
      await batchUpdateStatus({
        customerIds: selectedCustomers,
        status: statusToSet
      }).unwrap();
      
      setShowStatusModal(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.data?.message || 'Erro ao atualizar status dos clientes');
    }
  };
  
  // Handle batch delete
  const handleBatchDelete = async () => {
    setError(null);
    try {
      await batchDelete({
        customerIds: selectedCustomers
      }).unwrap();
      
      setShowDeleteModal(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.data?.message || 'Erro ao excluir clientes');
    }
  };
  
  return (
    <>
      <Card className="bg-light mb-4">
        <Card.Body>
          <Row className="g-2 align-items-center">
            <Col>
              <h6 className="mb-0">
                {selectedCustomers.length} {selectedCustomers.length === 1 ? 'cliente selecionado' : 'clientes selecionados'}
              </h6>
              <small className="text-muted">Selecione uma ação para executar em lote</small>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                size="sm" 
                className="me-2"
                onClick={() => setShowStatusModal(true)}
              >
                <i className="bi bi-toggle-on me-1"></i>
                Atualizar Status
              </Button>
              
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <i className="bi bi-trash me-1"></i>
                Excluir
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Error display */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Atualizar Status de Clientes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Você está prestes a atualizar o status de {selectedCustomers.length} 
            {selectedCustomers.length === 1 ? ' cliente' : ' clientes'}.
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Novo Status</Form.Label>
            <Form.Select
              value={statusToSet}
              onChange={(e) => setStatusToSet(e.target.value)}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="pending">Pendente</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleBatchStatusUpdate}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
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
          <p>
            Você está prestes a excluir <strong>{selectedCustomers.length}</strong> 
            {selectedCustomers.length === 1 ? ' cliente' : ' clientes'}.
          </p>
          <p className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Esta ação não pode ser desfeita. Todos os dados dos clientes, incluindo endereços e associações de pedidos, serão removidos permanentemente.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleBatchDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Excluindo...
              </>
            ) : (
              'Excluir Clientes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

BatchOperations.propTypes = {
  selectedCustomers: PropTypes.array.isRequired,
  onSuccess: PropTypes.func
};

export default BatchOperations; 