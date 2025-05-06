import React from 'react';
import { Container, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductsList from '../../components/products/ProductsList';
import AdminLayout from '../../components/layouts/AdminLayout';

const ProductsManagementPage = () => {
  return (
    <AdminLayout>
      <Container fluid className="py-3">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin' }}>
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Produtos</Breadcrumb.Item>
        </Breadcrumb>
        
        <ProductsList />
      </Container>
    </AdminLayout>
  );
};

export default ProductsManagementPage; 