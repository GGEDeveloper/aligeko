import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import {
  useGetAttributesQuery,
  useGetAttributeGroupsQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useCreateAttributeGroupMutation,
  useUpdateAttributeGroupMutation,
  useDeleteAttributeGroupMutation,
  useGetAttributeValuesQuery,
  useAddAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation
} from '../../store/api/attributeApi';

const ProductAttributesManagement = () => {
  // State
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAttributeId, setSelectedAttributeId] = useState('');
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupFormData, setGroupFormData] = useState({ name: '', description: '' });
  const [attributeFormData, setAttributeFormData] = useState({ 
    name: '', 
    description: '', 
    type: 'text',
    required: false,
    groupId: ''
  });
  const [valueFormData, setValueFormData] = useState({ value: '', label: '' });
  const [deleteType, setDeleteType] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // RTK Query hooks
  const { data: groups, isLoading: isLoadingGroups } = useGetAttributeGroupsQuery();
  const { data: attributes, isLoading: isLoadingAttributes } = useGetAttributesQuery(
    selectedGroupId ? { groupId: selectedGroupId } : {}
  );
  const { data: attributeValues, isLoading: isLoadingValues } = useGetAttributeValuesQuery(
    selectedAttributeId, { skip: !selectedAttributeId }
  );

  // Mutation hooks
  const [createGroup, { isLoading: isCreatingGroup }] = useCreateAttributeGroupMutation();
  const [updateGroup, { isLoading: isUpdatingGroup }] = useUpdateAttributeGroupMutation();
  const [deleteGroup, { isLoading: isDeletingGroup }] = useDeleteAttributeGroupMutation();
  
  const [createAttribute, { isLoading: isCreatingAttribute }] = useCreateAttributeMutation();
  const [updateAttribute, { isLoading: isUpdatingAttribute }] = useUpdateAttributeMutation();
  const [deleteAttribute, { isLoading: isDeletingAttribute }] = useDeleteAttributeMutation();
  
  const [addAttributeValue, { isLoading: isAddingValue }] = useAddAttributeValueMutation();
  const [updateAttributeValue, { isLoading: isUpdatingValue }] = useUpdateAttributeValueMutation();
  const [deleteAttributeValue, { isLoading: isDeletingValue }] = useDeleteAttributeValueMutation();

  // Form handlers
  const handleGroupChange = (event) => {
    setSelectedGroupId(event.target.value);
    setSelectedAttributeId('');
  };

  const handleAttributeChange = (attributeId) => {
    setSelectedAttributeId(attributeId);
  };

  // Dialog handlers
  const handleOpenGroupDialog = (group = null) => {
    if (group) {
      setGroupFormData({
        name: group.name,
        description: group.description || ''
      });
    } else {
      setGroupFormData({ name: '', description: '' });
    }
    setIsGroupDialogOpen(true);
  };

  const handleOpenAttributeDialog = (attribute = null) => {
    if (attribute) {
      setAttributeFormData({
        name: attribute.name,
        description: attribute.description || '',
        type: attribute.type || 'text',
        required: attribute.required || false,
        groupId: attribute.groupId
      });
    } else {
      setAttributeFormData({
        name: '',
        description: '',
        type: 'text',
        required: false,
        groupId: selectedGroupId
      });
    }
    setIsAttributeDialogOpen(true);
  };

  const handleOpenValueDialog = (value = null) => {
    if (value) {
      setValueFormData({
        value: value.value,
        label: value.label || ''
      });
    } else {
      setValueFormData({ value: '', label: '' });
    }
    setIsValueDialogOpen(true);
  };

  const handleOpenDeleteDialog = (type, id) => {
    setDeleteType(type);
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers
  const handleSubmitGroup = async () => {
    try {
      if (groupFormData.id) {
        await updateGroup({
          id: groupFormData.id,
          ...groupFormData
        }).unwrap();
        setSuccess('Attribute group updated successfully');
      } else {
        await createGroup(groupFormData).unwrap();
        setSuccess('Attribute group created successfully');
      }
      setIsGroupDialogOpen(false);
    } catch (err) {
      setError(err?.data?.message || 'Failed to save attribute group');
    }
  };

  const handleSubmitAttribute = async () => {
    try {
      if (attributeFormData.id) {
        await updateAttribute({
          id: attributeFormData.id,
          ...attributeFormData
        }).unwrap();
        setSuccess('Attribute updated successfully');
      } else {
        await createAttribute(attributeFormData).unwrap();
        setSuccess('Attribute created successfully');
      }
      setIsAttributeDialogOpen(false);
    } catch (err) {
      setError(err?.data?.message || 'Failed to save attribute');
    }
  };

  const handleSubmitValue = async () => {
    try {
      if (valueFormData.id) {
        await updateAttributeValue({
          attributeId: selectedAttributeId,
          valueId: valueFormData.id,
          ...valueFormData
        }).unwrap();
        setSuccess('Attribute value updated successfully');
      } else {
        await addAttributeValue({
          attributeId: selectedAttributeId,
          ...valueFormData
        }).unwrap();
        setSuccess('Attribute value added successfully');
      }
      setIsValueDialogOpen(false);
    } catch (err) {
      setError(err?.data?.message || 'Failed to save attribute value');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteType === 'group') {
        await deleteGroup(deleteId).unwrap();
        setSelectedGroupId('');
        setSuccess('Attribute group deleted successfully');
      } else if (deleteType === 'attribute') {
        await deleteAttribute(deleteId).unwrap();
        setSelectedAttributeId('');
        setSuccess('Attribute deleted successfully');
      } else if (deleteType === 'value') {
        await deleteAttributeValue({
          attributeId: selectedAttributeId,
          valueId: deleteId
        }).unwrap();
        setSuccess('Attribute value deleted successfully');
      }
    } catch (err) {
      setError(err?.data?.message || `Failed to delete ${deleteType}`);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Clear alerts after 5 seconds
  React.useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Render
  return (
    <Box>
      {(error || success) && (
        <Box mb={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
        </Box>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Attribute Groups</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenGroupDialog()}
          >
            Add Group
          </Button>
        </Box>
        
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Select Attribute Group</InputLabel>
          <Select
            value={selectedGroupId}
            onChange={handleGroupChange}
            label="Select Attribute Group"
            disabled={isLoadingGroups}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {groups?.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedGroupId && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => {
                const group = groups?.find(g => g.id === selectedGroupId);
                if (group) {
                  handleOpenGroupDialog({
                    id: group.id,
                    name: group.name,
                    description: group.description
                  });
                }
              }}
            >
              Edit Group
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleOpenDeleteDialog('group', selectedGroupId)}
            >
              Delete Group
            </Button>
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Attributes</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAttributeDialog()}
            disabled={!selectedGroupId}
          >
            Add Attribute
          </Button>
        </Box>
        
        {isLoadingAttributes ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : attributes?.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="center">Required</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attributes.map((attribute) => (
                  <TableRow 
                    key={attribute.id}
                    selected={attribute.id === selectedAttributeId}
                    onClick={() => handleAttributeChange(attribute.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{attribute.name}</TableCell>
                    <TableCell>{attribute.type}</TableCell>
                    <TableCell align="center">
                      {attribute.required ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <CancelIcon color="disabled" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell>{attribute.description}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAttributeDialog({
                            id: attribute.id,
                            name: attribute.name,
                            description: attribute.description,
                            type: attribute.type,
                            required: attribute.required,
                            groupId: attribute.groupId
                          });
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog('attribute', attribute.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="textSecondary" align="center" p={2}>
            {selectedGroupId ? 'No attributes found in this group' : 'Select a group to view attributes'}
          </Typography>
        )}
      </Paper>
      
      {selectedAttributeId && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Attribute Values</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenValueDialog()}
              disabled={!selectedAttributeId}
            >
              Add Value
            </Button>
          </Box>
          
          {isLoadingValues ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : attributeValues?.length > 0 ? (
            <Grid container spacing={2}>
              {attributeValues.map((value) => (
                <Grid item key={value.id} xs={12} sm={6} md={4} lg={3}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{value.label || value.value}</Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenValueDialog({
                            id: value.id,
                            value: value.value,
                            label: value.label
                          })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog('value', value.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Value: {value.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="textSecondary" align="center" p={2}>
              No values found for this attribute
            </Typography>
          )}
        </Paper>
      )}
      
      {/* Dialogs */}
      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onClose={() => setIsGroupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{groupFormData.id ? 'Edit Attribute Group' : 'Add Attribute Group'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            value={groupFormData.name}
            onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={groupFormData.description}
            onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGroupDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitGroup} 
            variant="contained"
            disabled={!groupFormData.name || isCreatingGroup || isUpdatingGroup}
          >
            {isCreatingGroup || isUpdatingGroup ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Attribute Dialog */}
      <Dialog open={isAttributeDialogOpen} onClose={() => setIsAttributeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{attributeFormData.id ? 'Edit Attribute' : 'Add Attribute'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Attribute Name"
            type="text"
            fullWidth
            value={attributeFormData.name}
            onChange={(e) => setAttributeFormData({ ...attributeFormData, name: e.target.value })}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Attribute Type</InputLabel>
            <Select
              value={attributeFormData.type}
              onChange={(e) => setAttributeFormData({ ...attributeFormData, type: e.target.value })}
              label="Attribute Type"
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="select">Select</MenuItem>
              <MenuItem value="multiselect">Multi-select</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Group</InputLabel>
            <Select
              value={attributeFormData.groupId}
              onChange={(e) => setAttributeFormData({ ...attributeFormData, groupId: e.target.value })}
              label="Group"
              required
            >
              {groups?.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>Required</Typography>
            <Box>
              <Button
                variant={attributeFormData.required ? "contained" : "outlined"}
                color={attributeFormData.required ? "primary" : "inherit"}
                onClick={() => setAttributeFormData({ ...attributeFormData, required: true })}
                sx={{ mr: 1 }}
              >
                Yes
              </Button>
              <Button
                variant={!attributeFormData.required ? "contained" : "outlined"}
                color={!attributeFormData.required ? "primary" : "inherit"}
                onClick={() => setAttributeFormData({ ...attributeFormData, required: false })}
              >
                No
              </Button>
            </Box>
          </Box>
          
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={attributeFormData.description}
            onChange={(e) => setAttributeFormData({ ...attributeFormData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAttributeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitAttribute} 
            variant="contained"
            disabled={
              !attributeFormData.name || 
              !attributeFormData.groupId || 
              isCreatingAttribute || 
              isUpdatingAttribute
            }
          >
            {isCreatingAttribute || isUpdatingAttribute ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Value Dialog */}
      <Dialog open={isValueDialogOpen} onClose={() => setIsValueDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{valueFormData.id ? 'Edit Attribute Value' : 'Add Attribute Value'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Value"
            type="text"
            fullWidth
            value={valueFormData.value}
            onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Display Label (Optional)"
            type="text"
            fullWidth
            value={valueFormData.label}
            onChange={(e) => setValueFormData({ ...valueFormData, label: e.target.value })}
            helperText="If left empty, the value will be used as the label"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsValueDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitValue} 
            variant="contained"
            disabled={!valueFormData.value || isAddingValue || isUpdatingValue}
          >
            {isAddingValue || isUpdatingValue ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteType}?
            {deleteType === 'group' && ' This will also delete all associated attributes and values.'}
            {deleteType === 'attribute' && ' This will also delete all associated values.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            disabled={isDeletingGroup || isDeletingAttribute || isDeletingValue}
          >
            {isDeletingGroup || isDeletingAttribute || isDeletingValue ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductAttributesManagement; 