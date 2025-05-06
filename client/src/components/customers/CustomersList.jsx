import React from 'react';
import PropTypes from 'prop-types';
import { Table, Form, Badge, Button, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CustomersList = ({
  customers,
  totalPages,
  currentPage,
  onPageChange,
  onCustomerSelect,
  onSelectAll,
  selectedCustomers,
  sortInfo,
  onSortChange
}) => {
  // Check if all customers on current page are selected
  const areAllSelected = customers.length > 0 && 
    customers.every(customer => selectedCustomers.includes(customer.id));
  
  // Handle "select all" checkbox change
  const handleSelectAllChange = (e) => {
    onSelectAll(e.target.checked);
  };
  
  // Handle individual customer selection
  const handleCustomerSelect = (customerId, e) => {
    onCustomerSelect(customerId, e.target.checked);
  };
  
  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );
    
    // First page
    items.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        1
      </Pagination.Item>
    );
    
    // Ellipsis if needed
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }
    
    // Pages around current page
    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }
    
    // Last page if there are more than 1 page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    
    return items;
  };
  
  // Render sorting indicator
  const renderSortIndicator = (field) => {
    if (sortInfo.field === field) {
      return sortInfo.order === 'asc' ? ' ↑' : ' ↓';
    }
    return null;
  };
  
  return (
    <div>
      <Table responsive hover className="align-middle">
        <thead>
          <tr>
            <th className="text-center" style={{ width: '40px' }}>
              <Form.Check
                type="checkbox"
                checked={areAllSelected}
                onChange={handleSelectAllChange}
                aria-label="Select all customers"
              />
            </th>
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => onSortChange('name')}
              className={sortInfo.field === 'name' ? 'text-primary' : ''}
            >
              Nome{renderSortIndicator('name')}
            </th>
            <th>Email</th>
            <th>Empresa</th>
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => onSortChange('orders_count')}
              className={sortInfo.field === 'orders_count' ? 'text-primary' : ''}
            >
              Pedidos{renderSortIndicator('orders_count')}
            </th>
            <th>Status</th>
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => onSortChange('created_at')}
              className={sortInfo.field === 'created_at' ? 'text-primary' : ''}
            >
              Cadastro{renderSortIndicator('created_at')}
            </th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td className="text-center">
                <Form.Check
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={(e) => handleCustomerSelect(customer.id, e)}
                  aria-label={`Select customer ${customer.name}`}
                />
              </td>
              <td>
                <Link to={`/admin/customers/${customer.id}`} className="text-decoration-none">
                  {customer.name}
                </Link>
              </td>
              <td>{customer.email}</td>
              <td>{customer.company || '-'}</td>
              <td>{customer.orders_count || 0}</td>
              <td>
                {customer.status === 'active' && <Badge bg="success">Ativo</Badge>}
                {customer.status === 'inactive' && <Badge bg="secondary">Inativo</Badge>}
                {customer.status === 'pending' && <Badge bg="warning" text="dark">Pendente</Badge>}
              </td>
              <td>{new Date(customer.created_at).toLocaleDateString('pt-BR')}</td>
              <td className="text-end">
                <Link to={`/admin/customers/${customer.id}/edit`} className="me-2">
                  <Button size="sm" variant="outline-primary">
                    <i className="bi bi-pencil"></i>
                  </Button>
                </Link>
                <Link to={`/admin/customers/${customer.id}`}>
                  <Button size="sm" variant="outline-secondary">
                    <i className="bi bi-eye"></i>
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>{renderPaginationItems()}</Pagination>
        </div>
      )}
    </div>
  );
};

CustomersList.propTypes = {
  customers: PropTypes.array.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onCustomerSelect: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  selectedCustomers: PropTypes.array.isRequired,
  sortInfo: PropTypes.shape({
    field: PropTypes.string.isRequired,
    order: PropTypes.string.isRequired
  }).isRequired,
  onSortChange: PropTypes.func.isRequired
};

export default CustomersList; 