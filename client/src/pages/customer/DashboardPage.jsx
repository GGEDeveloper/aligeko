import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import CustomerNotes from '../../components/customers/CustomerNotes';
import CustomerTags from '../../components/customers/CustomerTags';
import { 
  useGetCustomerByIdQuery,
  useGetCustomerOrdersQuery,
  useGetCustomerAddressesQuery,
  useGetCustomerSavedCartsQuery,
  useGetCustomerWishlistQuery
} from '../../store/api/customerApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

const DashboardPage = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  
  // RTK Query hooks
  const { 
    data: customer, 
    isLoading,
    isError,
    error
  } = useGetCustomerByIdQuery(user?.id);
  
  const { 
    data: orders,
    isLoading: isLoadingOrders
  } = useGetCustomerOrdersQuery(user?.id);
  
  const { 
    data: addresses,
    isLoading: isLoadingAddresses
  } = useGetCustomerAddressesQuery(user?.id);
  
  const { 
    data: savedCarts,
    isLoading: isLoadingSavedCarts
  } = useGetCustomerSavedCartsQuery(user?.id);
  
  const { 
    data: wishlist,
    isLoading: isLoadingWishlist
  } = useGetCustomerWishlistQuery(user?.id);

  if (isLoading) {
    return (
      <Container className="py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Erro ao carregar dados da conta. Por favor, tente novamente mais tarde.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Minha Conta</h1>
      
      <Row>
        {/* Informações Pessoais */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Informações Pessoais</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Nome:</strong> {customer?.first_name} {customer?.last_name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email:</strong> {customer?.email}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Telefone:</strong> {customer?.phone}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Data de Cadastro:</strong> {customer?.created_at?.split('T')[0]}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Status:</strong>
                  <Badge bg={customer?.status === 'active' ? 'success' : 'warning'}>
                    {customer?.status === 'active' ? 'Ativo' : 'Pendente'}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/account/profile')}
              >
                Editar Perfil
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Últimos Pedidos */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Últimos Pedidos</h5>
            </Card.Header>
            <Card.Body>
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id}>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>R$ {order.total.toFixed(2)}</td>
                      <td>
                        <Badge bg={order.status === 'completed' ? 'success' : order.status === 'processing' ? 'info' : 'warning'}>
                          {order.status === 'completed' ? 'Concluído' : order.status === 'processing' ? 'Em Processamento' : 'Pendente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/account/orders')}
              >
                Ver Todos os Pedidos
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Endereços */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Endereços</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {addresses?.map((address) => (
                  <ListGroup.Item key={address.id}>
                    <strong>{address.label}</strong>
                    <p className="mb-1">
                      {address.street}, {address.number}<br />
                      {address.neighborhood}, {address.city} - {address.state}<br />
                      {address.postal_code}
                    </p>
                    {address.is_default && (
                      <Badge bg="primary" className="mb-2">
                        Principal
                      </Badge>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/account/addresses')}
              >
                Gerenciar Endereços
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Carrinhos Salvos e Lista de Desejos */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Carrinhos Salvos</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {savedCarts?.map((cart) => (
                  <ListGroup.Item key={cart.id}>
                    <strong>{cart.name}</strong>
                    <p className="mb-1">
                      {cart.items.length} item(s) - R$ {cart.total.toFixed(2)}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => navigate(`/cart/${cart.id}`)}
                      >
                        Ver Carrinho
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate(`/cart/${cart.id}/checkout`)}
                      >
                        Finalizar Compra
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/account/saved-carts')}
              >
                Ver Todos os Carrinhos
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Lista de Desejos</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {wishlist?.map((item) => (
                  <ListGroup.Item key={item.product_id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{item.product.name}</strong>
                        <p className="mb-1">
                          R$ {item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => navigate(`/products/${item.product_id}`)}
                      >
                        Ver Produto
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/account/wishlist')}
              >
                Ver Lista Completa
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notificações e Tags */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Notificações</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {/* Implementar notificações aqui */}
                <ListGroup.Item>
                  Nenhuma notificação recente
                </ListGroup.Item>
              </ListGroup>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/account/notifications')}
              >
                Ver Todas as Notificações
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Tags e Preferências</h5>
            </Card.Header>
            <Card.Body>
              <CustomerTags customerId={user?.id} />
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/account/preferences')}
              >
                Gerenciar Preferências
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Anotações e Histórico */}
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Anotações e Histórico</h5>
            </Card.Header>
            <Card.Body>
              <CustomerNotes customerId={user?.id} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
