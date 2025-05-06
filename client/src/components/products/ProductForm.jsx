import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Container, 
  Form, 
  Button, 
  Row, 
  Col, 
  Card, 
  Alert,
  Spinner,
  Tab,
  Nav,
  Tabs
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  useCreateProductMutation, 
  useUpdateProductMutation,
  useUploadProductImageMutation
} from '../../store/api/productApi';

// Validation schema using Yup
const productValidationSchema = Yup.object({
  name: Yup.string()
    .required('Nome do produto é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome não pode ter mais de 255 caracteres'),
  description_short: Yup.string()
    .required('Descrição curta é obrigatória')
    .max(500, 'Descrição curta não pode ter mais de 500 caracteres'),
  description_long: Yup.string()
    .max(5000, 'Descrição longa não pode ter mais de 5000 caracteres'),
  code: Yup.string()
    .required('Código do produto é obrigatório')
    .max(50, 'Código não pode ter mais de 50 caracteres'),
  code_on_card: Yup.string()
    .max(50, 'Código no catálogo não pode ter mais de 50 caracteres'),
  ean: Yup.string()
    .matches(/^\d{13}$/, 'EAN deve ter 13 dígitos numéricos')
    .nullable(),
  producer_code: Yup.string()
    .max(50, 'Código do produtor não pode ter mais de 50 caracteres'),
  vat: Yup.number()
    .min(0, 'VAT não pode ser negativo')
    .max(100, 'VAT não pode ser maior que 100%'),
  category_id: Yup.string()
    .required('Categoria é obrigatória'),
  producer_id: Yup.string()
    .required('Produtor é obrigatório'),
  unit_id: Yup.string()
    .required('Unidade é obrigatória')
});

const ProductForm = ({ product, categories, producers, units, onSuccess }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  
  // RTK Query mutations
  const [createProduct, { isLoading: isCreating, error: createError }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating, error: updateError }] = useUpdateProductMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();
  
  // Determine if we're in edit mode
  const isEditMode = !!product?.id;
  
  // Initialize form with Formik
  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      description_short: product?.description_short || '',
      description_long: product?.description_long || '',
      description_html: product?.description_html || '',
      code: product?.code || '',
      code_on_card: product?.code_on_card || '',
      ean: product?.ean || '',
      producer_code: product?.producer_code || '',
      vat: product?.vat || 23,
      url: product?.url || '',
      category_id: product?.category_id || '',
      producer_id: product?.producer_id || '',
      unit_id: product?.unit_id || ''
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values) => {
      try {
        let result;
        
        if (isEditMode) {
          // Update existing product
          result = await updateProduct({
            id: product.id,
            ...values
          }).unwrap();
        } else {
          // Create new product
          result = await createProduct(values).unwrap();
        }
        
        // Handle image uploads if there are any
        if (images.length > 0 && result.id) {
          await handleImageUpload(result.id);
        }
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Redirect to product detail page
        navigate(`/admin/products/${result.id}`);
      } catch (error) {
        console.error('Failed to save product:', error);
      }
    }
  });
  
  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };
  
  // Handle image upload
  const handleImageUpload = async (productId) => {
    try {
      setUploadError(null);
      
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append('image', images[i]);
        
        await uploadImage({
          id: productId,
          formData
        }).unwrap();
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }
    } catch (error) {
      setUploadError('Falha ao fazer upload das imagens');
      console.error('Image upload failed:', error);
    }
  };
  
  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">{isEditMode ? 'Editar Produto' : 'Novo Produto'}</h4>
        </Card.Header>
        <Card.Body>
          {(createError || updateError) && (
            <Alert variant="danger">
              {createError?.data?.message || updateError?.data?.message || 'Erro ao salvar o produto'}
            </Alert>
          )}
          
          <Form onSubmit={formik.handleSubmit}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="basic" title="Informações Básicas">
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="name">
                      <Form.Label>Nome do Produto*</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.name && formik.errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="code">
                      <Form.Label>Código do Produto*</Form.Label>
                      <Form.Control
                        type="text"
                        name="code"
                        value={formik.values.code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.code && formik.errors.code}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.code}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="code_on_card">
                      <Form.Label>Código no Catálogo</Form.Label>
                      <Form.Control
                        type="text"
                        name="code_on_card"
                        value={formik.values.code_on_card}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.code_on_card && formik.errors.code_on_card}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.code_on_card}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="ean">
                      <Form.Label>EAN (Código de Barras)</Form.Label>
                      <Form.Control
                        type="text"
                        name="ean"
                        value={formik.values.ean}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.ean && formik.errors.ean}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.ean}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group controlId="category_id">
                      <Form.Label>Categoria*</Form.Label>
                      <Form.Select
                        name="category_id"
                        value={formik.values.category_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.category_id && formik.errors.category_id}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories?.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.category_id}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="producer_id">
                      <Form.Label>Produtor*</Form.Label>
                      <Form.Select
                        name="producer_id"
                        value={formik.values.producer_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.producer_id && formik.errors.producer_id}
                      >
                        <option value="">Selecione um produtor</option>
                        {producers?.map(producer => (
                          <option key={producer.id} value={producer.id}>
                            {producer.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.producer_id}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="unit_id">
                      <Form.Label>Unidade*</Form.Label>
                      <Form.Select
                        name="unit_id"
                        value={formik.values.unit_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.unit_id && formik.errors.unit_id}
                      >
                        <option value="">Selecione uma unidade</option>
                        {units?.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.unit_id}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="vat">
                      <Form.Label>VAT (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="vat"
                        value={formik.values.vat}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.vat && formik.errors.vat}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.vat}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="producer_code">
                      <Form.Label>Código do Produtor</Form.Label>
                      <Form.Control
                        type="text"
                        name="producer_code"
                        value={formik.values.producer_code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.producer_code && formik.errors.producer_code}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.producer_code}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="description" title="Descrições">
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="description_short">
                      <Form.Label>Descrição Curta*</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description_short"
                        value={formik.values.description_short}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.description_short && formik.errors.description_short}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.description_short}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="description_long">
                      <Form.Label>Descrição Longa</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        name="description_long"
                        value={formik.values.description_long}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.description_long && formik.errors.description_long}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.description_long}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="description_html">
                      <Form.Label>Descrição HTML</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        name="description_html"
                        value={formik.values.description_html}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.description_html && formik.errors.description_html}
                      />
                      <Form.Text className="text-muted">
                        Este campo aceita HTML para formatação avançada.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="url">
                      <Form.Label>URL Externa do Produto</Form.Label>
                      <Form.Control
                        type="url"
                        name="url"
                        value={formik.values.url}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.url && formik.errors.url}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="images" title="Imagens">
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="productImages">
                      <Form.Label>Upload de Imagens</Form.Label>
                      <Form.Control
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Form.Text className="text-muted">
                        Você pode selecionar múltiplas imagens para upload. Formatos aceitos: JPG, PNG, GIF.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                {uploadError && (
                  <Alert variant="danger">{uploadError}</Alert>
                )}
                
                {isUploading && (
                  <div className="mt-3">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Fazendo upload... {uploadProgress}%
                  </div>
                )}
                
                {isEditMode && product?.images && product.images.length > 0 && (
                  <div className="mt-4">
                    <h5>Imagens Existentes</h5>
                    <Row className="mt-3">
                      {product.images.map((image, index) => (
                        <Col xs={6} md={3} key={index} className="mb-3">
                          <Card>
                            <Card.Img
                              variant="top"
                              src={image.url}
                              alt={image.alt || `Imagem ${index + 1}`}
                              className="product-image-thumb"
                              style={{ height: '150px', objectFit: 'cover' }}
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Tab>
            </Tabs>
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/admin/products')}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isCreating || isUpdating || isUploading}
              >
                {(isCreating || isUpdating) && (
                  <Spinner 
                    as="span" 
                    animation="border" 
                    size="sm" 
                    role="status" 
                    aria-hidden="true" 
                    className="me-2"
                  />
                )}
                {isEditMode ? 'Atualizar Produto' : 'Criar Produto'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductForm; 