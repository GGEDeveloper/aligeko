import React, { useState } from 'react';
import { Container, Breadcrumb, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import AdminLayout from '../../components/layouts/AdminLayout';
import { toast } from 'react-toastify';
import ProductImageManagement from '../../components/products/ProductImageManagement';

// Import API queries for the product and related data
import { useGetProductByIdQuery } from '../../store/api/productApi';
import { useGetCategoriesQuery } from '../../store/api/categoryApi';
import { useGetAllProducersQuery } from '../../store/api/producerApi';
import { useGetAllUnitsQuery } from '../../store/api/unitApi';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch the product to edit
  const { 
    data: product, 
    isLoading: isLoadingProduct, 
    error: productError,
    isError: isProductError,
    refetch
  } = useGetProductByIdQuery(id);
  
  // Fetch required data for the form
  const { data: categories, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: producers, isLoading: isLoadingProducers } = useGetAllProducersQuery();
  const { data: units, isLoading: isLoadingUnits } = useGetAllUnitsQuery();
  
  // Combined loading state
  const isLoading = isLoadingProduct || isLoadingCategories || isLoadingProducers || isLoadingUnits;
  
  const [activeTab, setActiveTab] = useState('basic');
  
  const handleSuccess = (updatedProduct) => {
    toast.success('Produto atualizado com sucesso!');
    navigate(`/admin/products/${updatedProduct.id}`);
  };
  
  return (
    <AdminLayout>
      <Container fluid className="py-3">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin' }}>
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin/products' }}>
            Produtos
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Editar Produto</Breadcrumb.Item>
        </Breadcrumb>
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          id="product-edit-tabs"
          className="mb-4"
        >
          <Tab eventKey="basic" title="Informações Básicas">
            {isLoading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : isProductError ? (
              <Alert variant="danger">
                {productError?.data?.message || `Não foi possível carregar o produto (ID: ${id})`}
              </Alert>
            ) : (
              <ProductForm 
                product={product}
                categories={categories || []}
                producers={producers || []}
                units={units || []}
                onSuccess={handleSuccess}
              />
            )}
          </Tab>
          
          <Tab 
            eventKey="images" 
            title="Imagens"
            disabled={!product?.id}
          >
            {product?.id ? (
              <ProductImageManagement 
                productId={product.id}
                images={product.images || []}
                onImagesUpdated={() => refetch()}
              />
            ) : (
              <Alert variant="info">
                Salve o produto primeiro para poder gerenciar as imagens.
              </Alert>
            )}
          </Tab>
        </Tabs>
      </Container>
    </AdminLayout>
  );
};

export default EditProductPage; 