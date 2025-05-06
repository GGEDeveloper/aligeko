import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Tab, 
  Nav, 
  Table, 
  Badge,
  ListGroup,
  Alert,
  Spinner,
  Modal
} from 'react-bootstrap';
import AdminLayout from '../../components/layouts/AdminLayout';
import CustomerNotes from '../../components/customers/CustomerNotes';
import CustomerTags from '../../components/customers/CustomerTags';
import { 
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerOrdersQuery,
  useGetCustomerAddressesQuery
} from '../../store/api/customerApi';
import { toast } from 'react-toastify';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // RTK Query hooks
  const { 
    data: customer, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetCustomerByIdQuery(id);
  
  const { 
    data: orders, 
    isLoading: isLoadingOrders 
  } = useGetCustomerOrdersQuery(id);
  
  const { 
    data: addresses,
    isLoading: isLoadingAddresses 
  } = useGetCustomerAddressesQuery(id);
  
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();
  
  // Handle status change
  const handleStatusChange = async (status) => {
    try {
      await updateCustomer({
        id,
        status
      }).unwrap();
      
      toast.success(`Status do cliente atualizado para ${status === 'active' ? 'ativo' : 'inativo'}`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Erro ao atualizar status do cliente');
    }
  };
  
  // Handle customer deletion
  const handleDelete = async () => {
    try {
      await deleteCustomer(id).unwrap();
      toast.success('Cliente excluído com sucesso');
      navigate('/admin/customers');
    } catch (err) {
      toast.error(err?.data?.message || 'Erro ao excluir cliente');
    }
  };
  
  // Custom breadcrumbs for AdminLayout
  const breadcrumbItems = [
    { text: 'Dashboard', link: '/admin' },
    { text: 'Clientes', link: '/admin/customers' },
    { text: customer?.name || `Cliente #${id}`, link: `/admin/customers/${id}`, active: true }
  ];
  
  // Loading state
  if (isLoading) {
    return (
      <AdminLayout breadcrumbItems={breadcrumbItems}>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      </AdminLayout>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <AdminLayout breadcrumbItems={breadcrumbItems}>
        <Alert variant="danger">
          Erro ao carregar cliente: {error?.data?.message || 'Erro desconhecido'}
        </Alert>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout breadcrumbItems={breadcrumbItems}>
      <Container fluid className="py-3">
        {/* Header */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Detalhes do Cliente</h4>
            <div>
              {customer.status === 'active' ? (
                <Button 
                  variant="warning" 
                  className="me-2"
                  onClick={() => handleStatusChange('inactive')}
                  disabled={isUpdating}
                >
                  <i className="bi bi-pause-circle me-2"></i>
                  Desativar
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  className="me-2"
                  onClick={() => handleStatusChange('active')}
                  disabled={isUpdating}
                >
                  <i className="bi bi-play-circle me-2"></i>
                  Ativar
                </Button>
              )}
              
              <Link to={`/admin/customers/${id}/edit`}>
                <Button variant="light" className="me-2">
                  <i className="bi bi-pencil me-2"></i>
                  Editar
                </Button>
              </Link>
              
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                <i className="bi bi-trash me-2"></i>
                Excluir
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={8}>
                <h2 className="mb-3">{customer.name}</h2>
                <div className="mb-4">
                  <Badge bg={customer.status === 'active' ? 'success' : 'secondary'} className="me-2">
                    {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {customer.type === 'business' && <Badge bg="primary">B2B</Badge>}
                </div>
                <p className="mb-1">
                  <strong className="me-2">Email:</strong> {customer.email}
                </p>
                {customer.phone && (
                  <p className="mb-1">
                    <strong className="me-2">Telefone:</strong> {customer.phone}
                  </p>
                )}
                {customer.company && (
                  <p className="mb-1">
                    <strong className="me-2">Empresa:</strong> {customer.company}
                  </p>
                )}
                {customer.tax_id && (
                  <p className="mb-1">
                    <strong className="me-2">CNPJ/CPF:</strong> {customer.tax_id}
                  </p>
                )}
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h5 className="card-title">Informações da Conta</h5>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Total de Pedidos</span>
                        <Badge bg="primary" pill>
                          {customer.orders_count || 0}
                        </Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Data de Cadastro</span>
                        <span>{new Date(customer.created_at).toLocaleDateString('pt-BR')}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Último Login</span>
                        <span>
                          {customer.last_login_at 
                            ? new Date(customer.last_login_at).toLocaleDateString('pt-BR') 
                            : 'Nunca'}
                        </span>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {/* Detailed Tabs */}
        <Tab.Container id="customer-tabs" defaultActiveKey="orders">
          <Row className="mb-4">
            <Col>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="orders">Pedidos</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="addresses">Endereços</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="notes">Anotações</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="tags">Segmentação</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
          <Row>
            <Col>
              <Tab.Content>
                {/* Orders Tab */}
                <Tab.Pane eventKey="orders">
                  {isLoadingOrders ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2">Carregando pedidos...</span>
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Nº Pedido</th>
                          <th>Data</th>
                          <th>Valor Total</th>
                          <th>Status</th>
                          <th>Forma de Pagamento</th>
                          <th className="text-end">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>
                              <Link to={`/admin/orders/${order.id}`} className="text-decoration-none">
                                #{order.order_number || order.id}
                              </Link>
                            </td>
                            <td>{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                            <td>
                              R$ {parseFloat(order.total_amount).toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2 
                              })}
                            </td>
                            <td>
                              {order.status === 'completed' && <Badge bg="success">Concluído</Badge>}
                              {order.status === 'processing' && <Badge bg="primary">Em Processamento</Badge>}
                              {order.status === 'pending' && <Badge bg="warning" text="dark">Pendente</Badge>}
                              {order.status === 'cancelled' && <Badge bg="danger">Cancelado</Badge>}
                            </td>
                            <td>{order.payment_method}</td>
                            <td className="text-end">
                              <Link to={`/admin/orders/${order.id}`}>
                                <Button size="sm" variant="outline-primary">
                                  <i className="bi bi-eye"></i>
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">
                      Nenhum pedido realizado por este cliente.
                    </Alert>
                  )}
                </Tab.Pane>
                
                {/* Addresses Tab */}
                <Tab.Pane eventKey="addresses">
                  {isLoadingAddresses ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2">Carregando endereços...</span>
                    </div>
                  ) : addresses && addresses.length > 0 ? (
                    <Row className="g-4">
                      {addresses.map(address => (
                        <Col md={6} key={address.id}>
                          <Card>
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="card-title mb-0">
                                  {address.name || address.type}
                                </h5>
                                {address.is_default && (
                                  <Badge bg="success">Principal</Badge>
                                )}
                              </div>
                              <p className="mb-1">{address.street}, {address.number}</p>
                              {address.complement && (
                                <p className="mb-1">{address.complement}</p>
                              )}
                              <p className="mb-1">
                                {address.neighborhood}, {address.city} - {address.state}
                              </p>
                              <p className="mb-1">CEP: {address.zip_code}</p>
                              
                              <div className="mt-3">
                                <Button 
                                  size="sm" 
                                  variant="outline-primary" 
                                  className="me-2"
                                  as={Link}
                                  to={`/admin/customers/${id}/addresses/${address.id}/edit`}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button size="sm" variant="outline-danger">
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info">
                      Nenhum endereço cadastrado para este cliente.
                    </Alert>
                  )}
                  
                  <div className="mt-3">
                    <Button 
                      variant="primary"
                      as={Link}
                      to={`/admin/customers/${id}/addresses/new`}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Adicionar Endereço
                    </Button>
                  </div>
                </Tab.Pane>
                
                {/* Notes Tab */}
                <Tab.Pane eventKey="notes">
                  <CustomerNotes customerId={id} />
                </Tab.Pane>
                
                {/* Tags Tab */}
                <Tab.Pane eventKey="tags">
                  <CustomerTags customerId={id} />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir o cliente <strong>{customer.name}</strong>?</p>
          <p className="text-danger">Esta ação não pode ser desfeita. Todos os dados do cliente serão removidos permanentemente.</p>
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
              'Excluir Cliente'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default CustomerDetailPage; 