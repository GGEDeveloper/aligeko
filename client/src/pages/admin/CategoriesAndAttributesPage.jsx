import React from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import CategoryManagement from '../../components/products/CategoryManagement';
import ProductAttributesManagement from '../../components/products/ProductAttributesManagement';
import AdminBreadcrumbs from '../../components/layouts/AdminBreadcrumbs';

const CategoriesAndAttributesPage = () => {
  // Custom breadcrumbs for this page
  const breadcrumbItems = [
    { text: 'Dashboard', link: '/admin' },
    { text: 'Produtos', link: '/admin/products' },
    { text: 'Categorias e Atributos', link: '/admin/products/categories-attributes', active: true }
  ];
  
  return (
    <Container className="py-4">
      <AdminBreadcrumbs items={breadcrumbItems} />
      
      <Tabs
        defaultActiveKey="categories"
        id="categories-attributes-tabs"
        className="mb-4"
      >
        <Tab eventKey="categories" title="Categorias">
          <CategoryManagement />
        </Tab>
        <Tab eventKey="attributes" title="Atributos">
          <ProductAttributesManagement />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default CategoriesAndAttributesPage; 