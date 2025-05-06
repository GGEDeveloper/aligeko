import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Temporary mock data - would come from API in real implementation
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];

const recentOrders = [
  { id: '1001', customer: 'TechCorp Ltd', date: '2023-06-01', amount: 2580.00, status: 'Completed' },
  { id: '1002', customer: 'BuildIt Inc', date: '2023-06-01', amount: 1750.50, status: 'Processing' },
  { id: '1003', customer: 'ElecParts Co', date: '2023-05-31', amount: 890.25, status: 'Pending' },
  { id: '1004', customer: 'MechaniX', date: '2023-05-30', amount: 3200.75, status: 'Completed' },
  { id: '1005', customer: 'ToolMasters', date: '2023-05-30', amount: 1250.00, status: 'Processing' },
];

const AdminDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalSales: 145220.50,
    totalOrders: 328,
    totalCustomers: 84,
    totalProducts: 1260
  });

  // In a real implementation, we would fetch this data from APIs
  useEffect(() => {
    // fetchDashboardStats().then(data => setStats(data));
  }, []);

  // Status badge color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'Processing': return 'warning';
      case 'Pending': return 'info';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h4 className="mb-0">Bem-vindo, {user?.name || 'Administrador'}!</h4>
              <p className="text-muted">Aqui está um resumo das suas atividades</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-cash-coin text-primary fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Vendas Totais</h6>
                <h4 className="mb-0">R$ {stats.totalSales.toLocaleString('pt-BR')}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-cart-check text-success fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Pedidos</h6>
                <h4 className="mb-0">{stats.totalOrders}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <i className="bi bi-people text-info fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Clientes</h6>
                <h4 className="mb-0">{stats.totalCustomers}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <i className="bi bi-box-seam text-warning fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Produtos</h6>
                <h4 className="mb-0">{stats.totalProducts}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Chart & Quick Actions */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4 mb-lg-0">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title">Vendas Mensais</h5>
                <select className="form-select form-select-sm w-auto">
                  <option>Últimos 6 meses</option>
                  <option>Último ano</option>
                  <option>Último trimestre</option>
                </select>
              </div>
              
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#4c5ce2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4">Ações Rápidas</h5>
              <div className="d-grid gap-2">
                <Button as={Link} to="/admin/products/new" variant="outline-primary" className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-plus-lg me-2"></i> Novo Produto
                </Button>
                <Button as={Link} to="/admin/orders/new" variant="outline-success" className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-cart-plus me-2"></i> Novo Pedido
                </Button>
                <Button as={Link} to="/admin/customers/new" variant="outline-info" className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-person-plus me-2"></i> Novo Cliente
                </Button>
                <Button as={Link} to="/admin/reports" variant="outline-secondary" className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-file-earmark-bar-graph me-2"></i> Relatórios
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title">Pedidos Recentes</h5>
                <Button as={Link} to="/admin/orders" variant="link" className="text-decoration-none">
                  Ver Todos <i className="bi bi-arrow-right"></i>
                </Button>
              </div>
              
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                        <td>R$ {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td>
                          <Badge bg={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button as={Link} to={`/admin/orders/${order.id}`} variant="link" size="sm" className="text-decoration-none">
                            <i className="bi bi-eye"></i> Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboardPage; 