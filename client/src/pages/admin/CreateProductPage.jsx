import React, { useState } from 'react';
import { Container, Alert, Tabs, Tab, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminBreadcrumbs from '../../components/layouts/AdminBreadcrumbs';
import { toast } from 'react-toastify';
import ProductImageManagement from '../../components/products/ProductImageManagement';

// Import API queries for categories, producers, and units
import { useGetCategoriesQuery } from '../../store/api/categoryApi';
import { useGetAllProducersQuery } from '../../store/api/producerApi';
import { useGetAllUnitsQuery } from '../../store/api/unitApi';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [createdProductId, setCreatedProductId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Define custom breadcrumbs for this page
  const breadcrumbItems = [
    { text: 'Dashboard', link: '/admin' },
    { text: 'Produtos', link: '/admin/products' },
    { text: 'Novo Produto', link: '/admin/products/new', active: true }
  ];
  
  // Fetch required data for the form
  const { data: categories, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: producers, isLoading: isLoadingProducers } = useGetAllProducersQuery();
  const { data: units, isLoading: isLoadingUnits } = useGetAllUnitsQuery();
  
  // Combined loading state
  const isLoading = isLoadingCategories || isLoadingProducers || isLoadingUnits;
  
  const handleSuccess = (product) => {
    toast.success('Produto criado com sucesso!');
    setCreatedProductId(product.id);
    // Don't navigate away immediately, allow user to add images
    // navigate(`/admin/products/${product.id}`);
  };
  
  return (
    <AdminLayout>
      <Container fluid className="py-3">
        <AdminBreadcrumbs items={breadcrumbItems} />
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          id="product-create-tabs"
          className="mb-4"
        >
          <Tab eventKey="basic" title="Informações Básicas">
            {isLoading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : (
              <ProductForm 
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
            disabled={!createdProductId} 
          >
            {createdProductId ? (
              <div>
                <Alert variant="success" className="mb-4">
                  <Alert.Heading>Produto criado com sucesso!</Alert.Heading>
                  <p>Agora você pode adicionar imagens para o produto. Quando terminar, clique em "Ir para detalhes" para ver o produto completo.</p>
                  <hr />
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="outline-success" 
                      onClick={() => navigate(`/admin/products/${createdProductId}`)}
                    >
                      Ir para detalhes
                    </Button>
                  </div>
                </Alert>
                
                <ProductImageManagement 
                  productId={createdProductId}
                  images={[]}
                  onImagesUpdated={() => {
                    toast.success('Imagens atualizadas com sucesso!');
                  }}
                />
              </div>
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

export default CreateProductPage; 