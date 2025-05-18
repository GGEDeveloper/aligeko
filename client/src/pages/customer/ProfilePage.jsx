import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Avatar, 
  Divider,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { updateCustomerProfile } from '../../store/slices/customerSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useUpdateProfileMutation } from '../../store/api/customerApi';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);

  const handleToggleEdit = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Reset form values when canceling edit
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      // Validate passwords if changing
      if (data.newPassword || data.confirmPassword) {
        if (data.newPassword !== data.confirmPassword) {
          showSnackbar('As senhas não coincidem', 'error');
          return;
        }
        if (data.newPassword.length < 6) {
          showSnackbar('A nova senha deve ter pelo menos 6 caracteres', 'error');
          return;
        }
      }

      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };

      // Only include password fields if they are being changed
      if (data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      // Call API to update profile
      const result = await updateProfile({
        userId: user.id,
        profileData: updateData,
      }).unwrap();

      // Update local state
      dispatch(updateCustomerProfile(result));
      
      // Show success message
      showSnackbar('Perfil atualizado com sucesso!');
      
      // Exit edit mode
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar(
        error.data?.message || 'Erro ao atualizar o perfil. Tente novamente.',
        'error'
      );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Meu Perfil
          </Typography>
          {!editMode ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleToggleEdit}
            >
              Editar Perfil
            </Button>
          ) : (
            <Box>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleToggleEdit}
                sx={{ mr: 2 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Box>
          )}
        </Box>

        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Profile Picture */}
              <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ mb: 2, position: 'relative' }}>
                  <Avatar
                    src={user?.avatar}
                    sx={{
                      width: 150,
                      height: 150,
                      mb: 2,
                      border: '3px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </Avatar>
                  {editMode && (
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <input hidden accept="image/*" type="file" />
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="subtitle1" align="center" gutterBottom>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Membro desde {new Date(user?.createdAt).toLocaleDateString('pt-BR')}
                </Typography>
              </Grid>

              {/* Profile Form */}
              <Grid item xs={12} md={9}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome"
                      variant="outlined"
                      margin="normal"
                      {...register('firstName', { required: 'Nome é obrigatório' })}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      disabled={!editMode || isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Sobrenome"
                      variant="outlined"
                      margin="normal"
                      {...register('lastName', { required: 'Sobrenome é obrigatório' })}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      disabled={!editMode || isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      type="email"
                      variant="outlined"
                      margin="normal"
                      {...register('email', {
                        required: 'E-mail é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'E-mail inválido',
                        },
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled // Email cannot be changed
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      variant="outlined"
                      margin="normal"
                      {...register('phone', {
                        pattern: {
                          value: /^[0-9\-\s]+$/,
                          message: 'Número de telefone inválido',
                        },
                      })}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={!editMode || isLoading}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">+55</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>

                {editMode && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Alterar Senha
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Deixe em branco para manter a senha atual.
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Senha Atual"
                          type={showPassword ? 'text' : 'password'}
                          variant="outlined"
                          margin="normal"
                          {...register('currentPassword', {
                            required: false,
                            minLength: {
                              value: 6,
                              message: 'A senha deve ter pelo menos 6 caracteres',
                            },
                          })}
                          error={!!errors.currentPassword}
                          helperText={errors.currentPassword?.message}
                          disabled={isLoading}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleTogglePasswordVisibility}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6} />
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nova Senha"
                          type={showPassword ? 'text' : 'password'}
                          variant="outlined"
                          margin="normal"
                          {...register('newPassword', {
                            required: false,
                            minLength: {
                              value: 6,
                              message: 'A senha deve ter pelo menos 6 caracteres',
                            },
                          })}
                          error={!!errors.newPassword}
                          helperText={errors.newPassword?.message}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Confirmar Nova Senha"
                          type={showPassword ? 'text' : 'password'}
                          variant="outlined"
                          margin="normal"
                          {...register('confirmPassword', {
                            validate: (value) =>
                              !value ||
                              value === document.getElementById('newPassword')?.value ||
                              'As senhas não coincidem',
                          })}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword?.message}
                          disabled={isLoading}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Account Preferences */}
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Preferências da Conta
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Verificação de E-mail</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" paragraph>
                Seu endereço de e-mail foi verificado com sucesso.
              </Typography>
              <Button variant="outlined" size="small" disabled>
                E-mail Verificado
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Preferências de Notificação
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Gerencie como você gostaria de receber notificações sobre sua conta.
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/customer/notifications')}
              >
                Gerenciar Notificações
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
