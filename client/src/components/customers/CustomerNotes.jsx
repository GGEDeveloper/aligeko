import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { 
  useGetCustomerNotesQuery,
  useAddCustomerNoteMutation,
  useUpdateCustomerNoteMutation,
  useDeleteCustomerNoteMutation
} from '../../store/api/customerApi';

const CustomerNotes = ({ customerId }) => {
  // State for the new note form
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  // RTK Query hooks
  const { 
    data: notes,
    isLoading,
    isError,
    error,
    refetch
  } = useGetCustomerNotesQuery(customerId);
  
  const [addNote, { isLoading: isAdding }] = useAddCustomerNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateCustomerNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteCustomerNoteMutation();
  
  // Handle adding a new note
  const handleAddNote = async (e) => {
    e.preventDefault();
    
    if (!newNote.trim()) return;
    
    try {
      await addNote({
        customerId,
        content: newNote
      }).unwrap();
      
      setNewNote('');
      refetch();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };
  
  // Handle updating a note
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    
    if (!editContent.trim() || !editingNote) return;
    
    try {
      await updateNote({
        customerId,
        noteId: editingNote.id,
        content: editContent
      }).unwrap();
      
      setEditingNote(null);
      setEditContent('');
      refetch();
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };
  
  // Start editing a note
  const startEditing = (note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingNote(null);
    setEditContent('');
  };
  
  // Handle deleting a note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta anotação?')) return;
    
    try {
      await deleteNote({
        customerId,
        noteId
      }).unwrap();
      
      refetch();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };
  
  // Format date to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };
  
  return (
    <div>
      {/* Add New Note Form */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleAddNote}>
            <Form.Group className="mb-3">
              <Form.Label>Nova Anotação</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Adicione uma nova anotação sobre o cliente..."
                disabled={isAdding}
              />
            </Form.Group>
            <div className="d-grid">
              <Button 
                type="submit" 
                variant="primary"
                disabled={!newNote.trim() || isAdding}
              >
                {isAdding ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Adicionar Anotação
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-3">
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Carregando anotações...</span>
        </div>
      ) : isError ? (
        <Alert variant="danger">
          Erro ao carregar anotações: {error?.data?.message || 'Erro desconhecido'}
        </Alert>
      ) : notes && notes.length > 0 ? (
        <ListGroup>
          {notes.map(note => (
            <ListGroup.Item key={note.id} className="mb-2">
              {editingNote && editingNote.id === note.id ? (
                <Form onSubmit={handleUpdateNote}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={isUpdating}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={cancelEditing}
                      disabled={isUpdating}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="success" 
                      size="sm"
                      disabled={!editContent.trim() || isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {formatDate(note.created_at)}
                      {note.updated_at !== note.created_at && (
                        <span className="ms-2">(editado em {formatDate(note.updated_at)})</span>
                      )}
                    </small>
                    <div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 me-2 text-primary"
                        onClick={() => startEditing(note)}
                        disabled={isDeleting}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 text-danger"
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={isDeleting}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                  <p className="mb-0">{note.content}</p>
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info">
          Nenhuma anotação registrada para este cliente.
        </Alert>
      )}
    </div>
  );
};

CustomerNotes.propTypes = {
  customerId: PropTypes.string.isRequired
};

export default CustomerNotes; 