import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  Row, 
  Col, 
  Button,
  Form,
  Image,
  Spinner,
  Alert,
  Modal,
  Badge,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useSetPrimaryImageMutation 
} from '../../store/api/productApi';

const ProductImageManagement = ({ productId, images, onImagesUpdated }) => {
  // State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // RTK Query hooks
  const [uploadImages, { isLoading: isUploading }] = useUploadProductImagesMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteProductImageMutation();
  const [setPrimaryImage, { isLoading: isSettingPrimary }] = useSetPrimaryImageMutation();
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    
    // Generate previews
    const newPreviews = [];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === files.length) {
          setPreviewImages(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Clear selected files
  const handleClearSelection = () => {
    setSelectedFiles([]);
    setPreviewImages([]);
  };
  
  // Upload selected files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('productId', productId);
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      // Upload images
      await uploadImages({
        productId,
        formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      }).unwrap();
      
      // Reset state
      setSelectedFiles([]);
      setPreviewImages([]);
      setUploading(false);
      setUploadProgress(0);
      
      // Notify parent component
      if (onImagesUpdated) {
        onImagesUpdated();
      }
    } catch (error) {
      setUploadError(error?.data?.message || 'Erro ao fazer upload das imagens');
      setUploading(false);
    }
  };
  
  // Open delete confirmation modal
  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setShowDeleteModal(true);
  };
  
  // Delete image
  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;
    
    try {
      await deleteImage({
        productId,
        imageId: imageToDelete.id
      }).unwrap();
      
      setShowDeleteModal(false);
      setImageToDelete(null);
      
      // Notify parent component
      if (onImagesUpdated) {
        onImagesUpdated();
      }
    } catch (error) {
      setUploadError(error?.data?.message || 'Erro ao excluir a imagem');
    }
  };
  
  // Set primary image
  const handleSetPrimary = async (image) => {
    if (image.primary) return;
    
    try {
      await setPrimaryImage({
        productId,
        imageId: image.id
      }).unwrap();
      
      // Notify parent component
      if (onImagesUpdated) {
        onImagesUpdated();
      }
    } catch (error) {
      setUploadError(error?.data?.message || 'Erro ao definir imagem principal');
    }
  };
  
  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Gerenciamento de Imagens</h5>
      </Card.Header>
      <Card.Body>
        {/* Error alert */}
        {uploadError && (
          <Alert variant="danger" onClose={() => setUploadError(null)} dismissible>
            {uploadError}
          </Alert>
        )}
        
        {/* Upload section */}
        <Card className="mb-4 bg-light">
          <Card.Body>
            <div className="d-flex flex-column align-items-center justify-content-center p-4">
              <i className="bi bi-cloud-upload fs-1 text-primary mb-3"></i>
              <h5>Upload de Imagens</h5>
              <p className="text-muted mb-3 text-center">
                Arraste e solte os arquivos aqui ou clique para selecionar imagens.
                <br />
                Formatos suportados: JPEG, PNG, WebP. Tamanho máximo: 5MB por imagem.
              </p>
              
              <Form.Group controlId="imageUpload" className="w-100">
                <Form.Control
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="d-none"
                />
                
                <div className="d-grid">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                  >
                    <i className="bi bi-images me-2"></i>
                    Selecionar Imagens
                  </Button>
                </div>
              </Form.Group>
            </div>
            
            {/* Preview section */}
            {previewImages.length > 0 && (
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Imagens Selecionadas ({selectedFiles.length})</h6>
                  <div>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-2"
                      onClick={handleClearSelection}
                      disabled={uploading}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Limpar
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handleUpload}
                      disabled={uploading || selectedFiles.length === 0}
                    >
                      {uploading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Enviando... {uploadProgress}%
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-upload me-1"></i>
                          Fazer Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Upload progress bar */}
                {uploading && (
                  <div className="progress mb-3">
                    <div 
                      className="progress-bar bg-primary" 
                      role="progressbar" 
                      style={{ width: `${uploadProgress}%` }} 
                      aria-valuenow={uploadProgress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                )}
                
                <Row className="g-3">
                  {previewImages.map((preview, index) => (
                    <Col key={index} xs={6} md={4} lg={3}>
                      <Card className="h-100">
                        <div className="position-relative">
                          <Image 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="card-img-top object-fit-cover"
                            style={{ height: '150px' }}
                          />
                          <div className="position-absolute top-0 start-0 p-2">
                            <Badge bg="primary" pill>
                              {selectedFiles[index].name.length > 15 
                                ? selectedFiles[index].name.substring(0, 12) + '...' 
                                : selectedFiles[index].name}
                            </Badge>
                          </div>
                        </div>
                        <Card.Footer className="text-center">
                          <small className="text-muted">
                            {(selectedFiles[index].size / 1024).toFixed(1)} KB
                          </small>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Card.Body>
        </Card>
        
        {/* Existing images section */}
        <h5 className="mb-3">Imagens do Produto</h5>
        {images && images.length > 0 ? (
          <Row className="g-3">
            {images.map((image) => (
              <Col key={image.id} xs={6} md={4} lg={3}>
                <Card className="h-100">
                  <div className="position-relative">
                    <Image 
                      src={image.url} 
                      alt={`Produto ${image.id}`} 
                      className="card-img-top object-fit-cover"
                      style={{ height: '150px' }}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Visualizar em tamanho original</Tooltip>}
                      >
                        <Button 
                          size="sm" 
                          variant="light" 
                          className="rounded-circle shadow-sm me-1"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <i className="bi bi-arrows-fullscreen"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Excluir imagem</Tooltip>}
                      >
                        <Button 
                          size="sm" 
                          variant="danger" 
                          className="rounded-circle shadow-sm"
                          onClick={() => handleDeleteClick(image)}
                          disabled={isDeleting && imageToDelete?.id === image.id}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </OverlayTrigger>
                    </div>
                    {image.primary && (
                      <div className="position-absolute top-0 start-0 p-2">
                        <Badge bg="success" pill>Principal</Badge>
                      </div>
                    )}
                  </div>
                  <Card.Footer className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {new Date(image.created_at).toLocaleDateString()}
                    </small>
                    {!image.primary && (
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => handleSetPrimary(image)}
                        disabled={isSettingPrimary}
                      >
                        {isSettingPrimary ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          'Tornar Principal'
                        )}
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert variant="info">
            Nenhuma imagem cadastrada para este produto. Utilize o formulário acima para fazer upload de imagens.
          </Alert>
        )}
      </Card.Body>
      
      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir esta imagem?</p>
          {imageToDelete && (
            <div className="text-center">
              <Image 
                src={imageToDelete.url} 
                alt="Imagem a ser excluída" 
                style={{ maxHeight: '200px' }}
                className="img-thumbnail mb-3"
              />
              {imageToDelete.primary && (
                <Alert variant="warning">
                  Esta é a imagem principal do produto. Ao excluí-la, outra imagem será definida como principal automaticamente.
                </Alert>
              )}
            </div>
          )}
          <p className="text-danger">Esta ação não pode ser desfeita.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Excluindo...
              </>
            ) : (
              'Excluir Imagem'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

ProductImageManagement.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  images: PropTypes.array,
  onImagesUpdated: PropTypes.func
};

ProductImageManagement.defaultProps = {
  images: []
};

export default ProductImageManagement; 