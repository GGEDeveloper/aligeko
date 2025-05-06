import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useExportCustomersDataMutation } from '../../store/api/customerApi';
import { toast } from 'react-toastify';

const CustomersExport = ({ selectedCustomers, allCustomers, filters }) => {
  // State
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportScope, setExportScope] = useState(selectedCustomers.length > 0 ? 'selected' : 'filtered');
  const [includeOrders, setIncludeOrders] = useState(false);
  const [includeAddresses, setIncludeAddresses] = useState(false);
  
  // Export mutation
  const [exportCustomers, { isLoading, isError, error }] = useExportCustomersDataMutation();
  
  // Handle export
  const handleExport = async () => {
    try {
      // Determine which customer IDs to export
      let customerIds = [];
      
      if (exportScope === 'selected') {
        customerIds = selectedCustomers;
      } else if (exportScope === 'filtered') {
        // Pass filters to the backend
        customerIds = null; // null means use filters
      } else {
        // all customers
        customerIds = null;
        filters = {}; // empty filters means all customers
      }
      
      const response = await exportCustomers({
        format: exportFormat,
        customerIds,
        filters: exportScope !== 'selected' ? filters : undefined,
        include: {
          orders: includeOrders,
          addresses: includeAddresses
        }
      }).unwrap();
      
      // Create download link for the exported file
      if (response.downloadUrl) {
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.setAttribute('download', response.filename || `customers-export.${exportFormat}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Exportação de ${response.count} clientes concluída com sucesso.`);
      } else {
        toast.error('Erro ao gerar arquivo de exportação.');
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Erro ao exportar dados dos clientes. Por favor, tente novamente.');
    }
  };
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-light">
        <Card.Title className="mb-0">Exportar Dados de Clientes</Card.Title>
      </Card.Header>
      <Card.Body>
        {isError && (
          <Alert variant="danger" className="mb-3">
            Erro ao exportar dados: {error?.data?.message || 'Erro desconhecido'}
          </Alert>
        )}
        
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Escopo da Exportação</Form.Label>
                <Form.Select 
                  value={exportScope} 
                  onChange={(e) => setExportScope(e.target.value)}
                  disabled={isLoading}
                >
                  {selectedCustomers.length > 0 && (
                    <option value="selected">
                      Clientes Selecionados ({selectedCustomers.length})
                    </option>
                  )}
                  <option value="filtered">Clientes Filtrados</option>
                  <option value="all">Todos os Clientes</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Formato de Exportação</Form.Label>
                <Form.Select 
                  value={exportFormat} 
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="csv">CSV (.csv)</option>
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="mb-3">
            <Form.Label>Incluir Dados Adicionais</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check 
                type="checkbox"
                id="include-orders"
                label="Histórico de Pedidos"
                checked={includeOrders}
                onChange={(e) => setIncludeOrders(e.target.checked)}
                disabled={isLoading}
              />
              <Form.Check 
                type="checkbox"
                id="include-addresses"
                label="Endereços"
                checked={includeAddresses}
                onChange={(e) => setIncludeAddresses(e.target.checked)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="d-grid">
            <Button 
              variant="primary" 
              onClick={handleExport}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Exportar Dados
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

CustomersExport.propTypes = {
  selectedCustomers: PropTypes.array.isRequired,
  allCustomers: PropTypes.array,
  filters: PropTypes.object
};

CustomersExport.defaultProps = {
  selectedCustomers: [],
  filters: {}
};

export default CustomersExport; 