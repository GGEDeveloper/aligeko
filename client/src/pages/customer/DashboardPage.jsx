import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  ProgressBar
} from 'react-bootstrap';
import { 
  FiUser, 
  FiShoppingBag, 
  FiMapPin, 
  FiHeart, 
  FiShoppingCart, 
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiStar
} from 'react-icons/fi';
import { 
  useGetCustomerByIdQuery,
  useGetCustomerOrdersQuery,
  useGetCustomerAddressesQuery,
  useGetCustomerSavedCartsQuery,
  useGetCustomerWishlistQuery
} from '../../store/api/customerApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

// Componente de Estatística do Painel
const StatCard = ({ icon, title, value, color, progress, link, linkText }) => (
  <Card className="h-100 border-0 shadow-sm">
    <Card.Body className="d-flex flex-column">
      <div className="d-flex align-items-center mb-3">
        <div className={`bg-${color}-light rounded-circle p-2 me-3`}>
          {React.cloneElement(icon, { className: `text-${color}`, size: 20 })}
        </div>
        <div>
          <h6 className="text-muted mb-0">{title}</h6>
          <h3 className="mb-0">{value}</h3>
        </div>
      </div>
      {progress && (
        <div className="mt-auto">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">Progresso</small>
            <small className="font-weight-bold">{progress}%</small>
          </div>
          <ProgressBar now={progress} variant={color} className="mb-2" style={{ height: '4px' }} />
        </div>
      )}
      {link && (
        <Button variant="link" className="p-0 mt-2 text-decoration-none" as={Link} to={link}>
          {linkText} <i className="fas fa-arrow-right ms-1"></i>
        </Button>
      )}
    </Card.Body>
  </Card>
);

// Componente de Card de Pedido Recente
const OrderCard = ({ order }) => (
  <div className="border rounded p-3 mb-3">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div>
        <h6 className="mb-0">Pedido #{order.id}</h6>
        <small className="text-muted">{new Date(order.created_at).toLocaleDateString('pt-BR')}</small>
      </div>
      <Badge bg={order.status === 'completed' ? 'success' : order.status === 'processing' ? 'info' : 'warning'}>
        {order.status === 'completed' ? 'Concluído' : order.status === 'processing' ? 'Em Processamento' : 'Pendente'}
      </Badge>
    </div>
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <p className="mb-0 fw-bold">R$ {order.total.toFixed(2).replace('.', ',')}</p>
        <small className="text-muted">{order.items_count} itens</small>
      </div>
      <Button variant="outline-primary" size="sm">Detalhes</Button>
    </div>
  </div>
);

// Componente de Card de Endereço
const AddressCard = ({ address }) => (
  <div className="border rounded p-3 mb-3">
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div>
        <h6 className="mb-1">{address.label}</h6>
        <p className="text-muted small mb-1">
          {address.street}, {address.number}<br />
          {address.neighborhood}, {address.city} - {address.state}<br />
          CEP: {address.postal_code.replace(/(\d{5})(\d{3})/, '$1-$2')}
        </p>
      </div>
      {address.is_default && (
        <Badge bg="primary" className="mb-2">
          Principal
        </Badge>
      )}
    </div>
    <Button variant="outline-secondary" size="sm" className="w-100">
      Editar Endereço
    </Button>
  </div>
);

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

  // Dados para os cards de estatísticas
  const statsData = [
    { 
      icon: <FiShoppingBag />, 
      title: 'Pedidos', 
      value: orders?.length || 0, 
      color: 'primary',
      progress: 75,
      link: '/account/orders',
      linkText: 'Ver pedidos'
    },
    { 
      icon: <FiHeart />, 
      title: 'Desejos', 
      value: wishlist?.items?.length || 0, 
      color: 'danger',
      link: '/account/wishlist',
      linkText: 'Ver desejos'
    },
    { 
      icon: <FiShoppingCart />, 
      title: 'Carrinhos', 
      value: savedCarts?.length || 0, 
      color: 'warning',
      link: '/cart',
      linkText: 'Ver carrinhos'
    },
    { 
      icon: <FiStar />, 
      title: 'Fidelidade', 
      value: 'Ouro', 
      color: 'info',
      progress: 65,
      link: '/account/rewards',
      linkText: 'Ver benefícios'
    }
  ];

  return (
    <div className="bg-light min-vh-100">
      <div className="bg-primary bg-gradient text-white py-4 mb-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Olá, {customer?.first_name}!</h1>
              <p className="mb-0">Bem-vindo de volta ao seu painel de controle</p>
            </div>
            <div className="d-flex">
              <Button variant="light" className="me-2" onClick={() => navigate('/account/orders')}>
                <FiClock className="me-1" /> Histórico
              </Button>
              <Button variant="outline-light" onClick={() => navigate('/account/profile')}>
                <FiUser className="me-1" /> Minha Conta
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mb-5">
        {/* Cards de Estatísticas */}
        <Row className="g-4 mb-4">
          {statsData.map((stat, index) => (
            <Col md={6} lg={3} key={index}>
              <StatCard {...stat} />
            </Col>
          ))}
        </Row>

        <Row className="g-4">
          {/* Seção de Pedidos Recentes */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <FiShoppingBag className="me-2 text-primary" />
                  Seus Pedidos Recentes
                </h5>
              </Card.Header>
              <Card.Body>
                {isLoadingOrders ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : orders?.length > 0 ? (
                  <>
                    {orders.slice(0, 3).map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                    <div className="text-end mt-3">
                      <Button 
                        variant="link" 
                        as={Link} 
                        to="/account/orders"
                        className="text-decoration-none"
                      >
                        Ver todos os pedidos <i className="fas fa-arrow-right ms-1"></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <FiShoppingCart size={48} className="text-muted mb-3" />
                    <h5>Nenhum pedido encontrado</h5>
                    <p className="text-muted">Acompanhe seus pedidos recentes aqui</p>
                    <Button variant="primary" onClick={() => navigate('/shop')}>
                      Começar a Comprar
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Seção de Endereços e Ações Rápidas */}
          <Col lg={4}>
            {/* Endereços */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <FiMapPin className="me-2 text-danger" />
                  Seus Endereços
                </h5>
              </Card.Header>
              <Card.Body>
                {isLoadingAddresses ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : addresses?.length > 0 ? (
                  <>
                    {addresses.slice(0, 2).map((address) => (
                      <AddressCard key={address.id} address={address} />
                    ))}
                    <div className="text-end">
                      <Button 
                        variant="link" 
                        as={Link} 
                        to="/account/addresses"
                        className="text-decoration-none p-0"
                      >
                        Gerenciar endereços <i className="fas fa-arrow-right ms-1"></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-3">
                    <FiMapPin size={36} className="text-muted mb-2" />
                    <p className="text-muted mb-3">Nenhum endereço cadastrado</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate('/account/addresses/new')}
                    >
                      Adicionar Endereço
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Ações Rápidas */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0">Ações Rápidas</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-primary" 
                    className="text-start d-flex align-items-center"
                    onClick={() => navigate('/account/profile')}
                  >
                    <FiUser className="me-2" /> Editar Perfil
                  </Button>
                  <Button 
                    variant="outline-success" 
                    className="text-start d-flex align-items-center"
                    onClick={() => navigate('/account/change-password')}
                  >
                    <FiUser className="me-2" /> Alterar Senha
                  </Button>
                  <Button 
                    variant="outline-warning" 
                    className="text-start d-flex align-items-center"
                    onClick={() => navigate('/account/notifications')}
                  >
                    <FiUser className="me-2" /> Notificações
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Seção de Produtos Recentemente Visualizados */}
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0">Produtos Recentemente Visualizados</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center py-5">
                  <FiClock size={48} className="text-muted mb-3" />
                  <p className="text-muted">Seus produtos visualizados recentemente aparecerão aqui</p>
                  <Button variant="outline-primary" onClick={() => navigate('/shop')}>
                    Continuar Comprando
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage;
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
