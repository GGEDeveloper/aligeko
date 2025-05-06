import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  Button, 
  Form, 
  Badge, 
  Spinner, 
  Alert, 
  InputGroup,
  Row,
  Col
} from 'react-bootstrap';
import { 
  useGetCustomerTagsQuery,
  useAddCustomerTagMutation,
  useRemoveCustomerTagMutation,
  useGetAvailableTagsQuery
} from '../../store/api/customerApi';

const CustomerTags = ({ customerId }) => {
  // State for new tag form
  const [tagName, setTagName] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  
  // RTK Query hooks
  const { 
    data: tags,
    isLoading,
    isError,
    error,
    refetch
  } = useGetCustomerTagsQuery(customerId);
  
  const { data: availableTags, isLoading: isLoadingAvailableTags } = useGetAvailableTagsQuery();
  const [addTag, { isLoading: isAdding }] = useAddCustomerTagMutation();
  const [removeTag, { isLoading: isRemoving }] = useRemoveCustomerTagMutation();
  
  // Handle adding a tag
  const handleAddTag = async (e) => {
    e.preventDefault();
    
    if (!tagName.trim()) return;
    
    try {
      await addTag({
        customerId,
        name: tagName,
        value: tagValue.trim() || null
      }).unwrap();
      
      setTagName('');
      setTagValue('');
      setShowTagInput(false);
      refetch();
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };
  
  // Handle adding a predefined tag
  const handleAddPredefinedTag = async (tag) => {
    try {
      await addTag({
        customerId,
        name: tag.name,
        value: tag.value || null
      }).unwrap();
      
      refetch();
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };
  
  // Handle removing a tag
  const handleRemoveTag = async (tagId) => {
    try {
      await removeTag({
        customerId,
        tagId
      }).unwrap();
      
      refetch();
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };
  
  // Get available tags that are not already assigned to the customer
  const getUnusedTags = () => {
    if (!availableTags || !tags) return [];
    
    const currentTagNames = tags.map(tag => tag.name);
    return availableTags.filter(tag => !currentTagNames.includes(tag.name));
  };
  
  // Format tag display
  const formatTagDisplay = (tag) => {
    return tag.value ? `${tag.name}: ${tag.value}` : tag.name;
  };
  
  // Get background color for a tag
  const getTagColor = (tagName) => {
    // Simple hash function to generate a color based on the tag name
    const hash = tagName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      'primary', 'secondary', 'success', 'danger', 
      'warning', 'info', 'dark'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  return (
    <div>
      {/* Current Tags */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Tags Atuais</Card.Title>
          
          {isLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Carregando tags...</span>
            </div>
          ) : isError ? (
            <Alert variant="danger">
              Erro ao carregar tags: {error?.data?.message || 'Erro desconhecido'}
            </Alert>
          ) : tags && tags.length > 0 ? (
            <div className="mb-3">
              {tags.map(tag => (
                <Badge 
                  key={tag.id} 
                  bg={getTagColor(tag.name)}
                  className="me-2 mb-2 p-2"
                >
                  {formatTagDisplay(tag)}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-2 text-white"
                    onClick={() => handleRemoveTag(tag.id)}
                    disabled={isRemoving}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <Alert variant="info">
              Nenhuma tag atribuída a este cliente.
            </Alert>
          )}
          
          {/* Add Tag Button */}
          <Button 
            variant="outline-primary" 
            className="mt-2"
            onClick={() => setShowTagInput(true)}
            disabled={showTagInput}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Adicionar Tag Personalizada
          </Button>
        </Card.Body>
      </Card>
      
      {/* New Tag Form */}
      {showTagInput && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Adicionar Nova Tag</Card.Title>
            <Form onSubmit={handleAddTag}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome da Tag</Form.Label>
                    <Form.Control
                      type="text"
                      value={tagName}
                      onChange={(e) => setTagName(e.target.value)}
                      placeholder="Ex: VIP, B2B, Segmento..."
                      required
                      disabled={isAdding}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Valor (opcional)</Form.Label>
                    <Form.Control
                      type="text"
                      value={tagValue}
                      onChange={(e) => setTagValue(e.target.value)}
                      placeholder="Ex: Nível 1, Bronze..."
                      disabled={isAdding}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex gap-2">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!tagName.trim() || isAdding}
                >
                  {isAdding ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Salvando...
                    </>
                  ) : (
                    'Adicionar Tag'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    setShowTagInput(false);
                    setTagName('');
                    setTagValue('');
                  }}
                  disabled={isAdding}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      {/* Available Tags */}
      <Card>
        <Card.Body>
          <Card.Title>Tags Disponíveis</Card.Title>
          
          {isLoadingAvailableTags ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Carregando tags disponíveis...</span>
            </div>
          ) : availableTags && availableTags.length > 0 ? (
            <div>
              <p className="text-muted">Clique em uma tag para adicioná-la a este cliente:</p>
              <div>
                {getUnusedTags().map((tag, index) => (
                  <Badge 
                    key={index} 
                    bg={getTagColor(tag.name)}
                    className="me-2 mb-2 p-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleAddPredefinedTag(tag)}
                  >
                    {formatTagDisplay(tag)}
                    <i className="bi bi-plus-circle ms-2"></i>
                  </Badge>
                ))}
                
                {getUnusedTags().length === 0 && (
                  <p className="text-muted fst-italic">
                    Todas as tags disponíveis já foram atribuídas a este cliente.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Alert variant="info">
              Nenhuma tag predefinida disponível. Você pode criar uma nova tag personalizada.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

CustomerTags.propTypes = {
  customerId: PropTypes.string.isRequired
};

export default CustomerTags; 