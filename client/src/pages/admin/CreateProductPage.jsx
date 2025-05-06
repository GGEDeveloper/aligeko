import React, { useEffect, useState } from 'react';
import { Container, Breadcrumb } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import AdminLayout from '../../components/layouts/AdminLayout';
import { toast } from 'react-toastify';

// Import API queries for categories, producers, and units
import { useGetAllCategoriesQuery } from '../../store/api/categoryApi';
import { useGetAllProducersQuery } from '../../store/api/producerApi';
import { useGetAllUnitsQuery } from '../../store/api/unitApi';

const CreateProductPage = () => {
  const navigate = useNavigate();
  
  // Fetch required data for the form
  const { data: categories, isLoading: isLoadingCategories } = useGetAllCategoriesQuery();
  const { data: producers, isLoading: isLoadingProducers } = useGetAllProducersQuery();
  const { data: units, isLoading: isLoadingUnits } = useGetAllUnitsQuery();
  
  // Combined loading state
  const isLoading = isLoadingCategories || isLoadingProducers || isLoadingUnits;
  
  const handleSuccess = (product) => {
    toast.success('Produto criado com sucesso!');
    navigate(`/admin/products/${product.id}`);
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
          <Breadcrumb.Item active>Novo Produto</Breadcrumb.Item>
        </Breadcrumb>
        
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
      </Container>
    </AdminLayout>
  );
};

export default CreateProductPage; 