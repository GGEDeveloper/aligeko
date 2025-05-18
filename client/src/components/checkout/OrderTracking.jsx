import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Divider, Button, Fade, Chip } from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  // Pending as PendingIcon,
  HourglassTop as HourglassIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import './OrderTracking.css';

/**
 * OrderTracking component displays a visual timeline of an order's status
 *
 * @param {Object} props
 * @param {string} props.status - Current order status
 * @param {Date} props.orderDate - Date the order was placed
 * @param {Date} props.estimatedDelivery - Estimated delivery date
 * @param {Date} props.shippedDate - Date the order was shipped (optional)
 * @returns {JSX.Element}
 */
// Animação de pulso para o passo ativo
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Estilos personalizados para o componente
const StepIcon = styled('div')(({ theme, active, completed }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  backgroundColor: completed
    ? theme.palette.success.main
    : active
      ? theme.palette.primary.main
      : theme.palette.grey[300],
  color: completed || active ? '#fff' : theme.palette.text.secondary,
  animation: active ? `${pulse} 2s infinite` : 'none',
  transition: 'all 0.3s ease',
  position: 'relative',
  zIndex: 1,
}));

const StepContent = styled('div')(({ theme, active, completed }) => ({
  flex: 1,
  padding: theme.spacing(1, 0, 3, 0),
  borderLeft: `2px solid ${
    completed
      ? theme.palette.success.main
      : active
        ? theme.palette.primary.main
        : theme.palette.grey[300]
  }`,
  marginLeft: 16,
  paddingLeft: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -7,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: completed
      ? theme.palette.success.main
      : active
        ? theme.palette.primary.main
        : 'transparent',
    border: `2px solid ${
      completed
        ? theme.palette.success.main
        : active
          ? theme.palette.primary.main
          : theme.palette.grey[400]
    }`,
    zIndex: 2,
  },
}));

const OrderTracking = ({
  status,
  orderDate,
  estimatedDelivery,
  shippedDate,
  trackingNumber,
  carrier = 'Standard Shipping',
  onTrackPackage,
}) => {
  // Define the steps in the order process with more detailed information
  const [currentLocation, setCurrentLocation] = useState(null);

  const steps = [
    {
      id: 'placed',
      label: 'Pedido Realizado',
      description: 'Seu pedido foi recebido e está sendo processado',
      icon: <CheckCircleIcon />,
      date: orderDate,
    },
    {
      id: 'processing',
      label: 'Em Processamento',
      description: 'Estamos preparando seu pedido para envio',
      icon: <HourglassIcon />,
      date: orderDate ? new Date(orderDate.getTime() + 3600000) : null, // 1 hour after order
    },
    {
      id: 'shipped',
      label: 'Enviado',
      description: 'Seu pedido saiu para entrega',
      icon: <ShippingIcon />,
      date: shippedDate,
    },
    {
      id: 'delivered',
      label: 'Entregue',
      description: 'Seu pedido foi entregue com sucesso',
      icon: <CheckCircleIcon />,
      date: status === 'delivered' ? new Date() : null,
    },
  ];

  // Determine which steps are completed based on the order status
  const statusMapping = {
    pending: ['placed'],
    processing: ['placed', 'processing'],
    approved: ['placed', 'processing', 'approved'],
    paid: ['placed', 'processing', 'approved'],
    shipped: ['placed', 'processing', 'approved', 'shipped'],
    delivered: ['placed', 'processing', 'approved', 'shipped', 'delivered'],
    cancelled: ['placed', 'cancelled'],
  };

  // Get the completed steps for the current status
  const completedStepIds = statusMapping[status] || ['placed'];

  // Determine the active step (the step that's currently in progress)
  const getActiveStep = () => {
    if (status === 'cancelled') return 'cancelled';
    if (completedStepIds.includes('delivered')) return '';
    if (completedStepIds.includes('shipped')) return 'delivered';
    if (completedStepIds.includes('approved') || completedStepIds.includes('paid'))
      return 'shipped';
    if (completedStepIds.includes('processing')) return 'shipped';
    return 'processing';
  };

  const activeStep = getActiveStep();

  // Calculate estimated dates
  const estimatedDeliveryDate =
    estimatedDelivery ||
    (orderDate ? new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null);

  // Simulate package location updates
  useEffect(() => {
    if (status === 'shipped' && !currentLocation) {
      // Simulate package movement
      const locations = [
        'Centro de distribuição - Lisboa',
        'Em trânsito - Santarém',
        'Centro de distribuição - Coimbra',
        'Saiu para entrega',
        'Entregue',
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < locations.length - 1) {
          currentIndex++;
          setCurrentLocation(locations[currentIndex - 1]);
        } else {
          clearInterval(interval);
        }
      }, 10000); // Update every 10 seconds for demo

      return () => clearInterval(interval);
    }
  }, [status, currentLocation]);

  const getStepStatus = stepId => {
    if (status === 'cancelled') return 'cancelado';
    if (completedStepIds.includes(stepId)) return 'concluído';
    if (stepId === activeStep) return 'em andamento';
    return 'pendente';
  };

  const formatDate = date => {
    if (!date) return 'Aguardando atualização';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <ShippingIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
        <Box>
          <Typography variant="h6" component="h2">
            Acompanhe seu pedido
          </Typography>
          {trackingNumber && (
            <Typography variant="body2" color="text.secondary">
              Número de rastreio: {trackingNumber}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Status Timeline */}
      <Box sx={{ position: 'relative', pl: 4 }}>
        {steps.map((step, index) => {
          const isCompleted = completedStepIds.includes(step.id);
          const isActive = step.id === activeStep;
          const status = getStepStatus(step.id);

          return (
            <Fade in={true} key={step.id} timeout={300 * (index + 1)}>
              <Box sx={{ mb: 4, position: 'relative' }}>
                <Box display="flex" alignItems="flex-start">
                  <StepIcon active={isActive} completed={isCompleted}>
                    {React.cloneElement(step.icon, { fontSize: 'small' })}
                  </StepIcon>

                  <StepContent active={isActive} completed={isCompleted}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={isActive ? 'bold' : 'normal'}
                          gutterBottom
                        >
                          {step.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {step.description}
                        </Typography>
                        {step.date && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(step.date)}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        size="small"
                        color={isCompleted ? 'success' : isActive ? 'primary' : 'default'}
                        variant={isActive ? 'filled' : 'outlined'}
                      />
                    </Box>

                    {/* Additional info for shipped status */}
                    {step.id === 'shipped' && isActive && currentLocation && (
                      <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">
                            Localização Atual:
                          </Typography>
                        </Box>
                        <Typography variant="body2">{currentLocation}</Typography>
                        {onTrackPackage && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={onTrackPackage}
                            startIcon={<InfoIcon />}
                            sx={{ mt: 1 }}
                          >
                            Acompanhar pacote
                          </Button>
                        )}
                      </Box>
                    )}
                  </StepContent>
                </Box>
              </Box>
            </Fade>
          );
        })}
      </Box>

      {/* Carrier Information */}
      {status === 'shipped' && (
        <Box
          mt={4}
          p={2}
          bgcolor="background.paper"
          borderRadius={1}
          border="1px solid"
          borderColor="divider"
        >
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Informações da Transportadora
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box flex={1} minWidth={120}>
              <Typography variant="caption" color="text.secondary" display="block">
                Transportadora
              </Typography>
              <Typography variant="body2">{carrier}</Typography>
            </Box>
            {trackingNumber && (
              <Box flex={1} minWidth={120}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Número de Rastreio
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {trackingNumber}
                </Typography>
              </Box>
            )}
            {estimatedDeliveryDate && (
              <Box flex={1} minWidth={120}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Previsão de Entrega
                </Typography>
                <Typography variant="body2">{formatDate(estimatedDeliveryDate)}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

OrderTracking.propTypes = {
  /** Status atual do pedido */
  status: PropTypes.oneOf([
    'pending',
    'processing',
    'approved',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
  ]).isRequired,
  /** Data em que o pedido foi realizado */
  orderDate: PropTypes.instanceOf(Date),
  /** Data estimada de entrega */
  estimatedDelivery: PropTypes.instanceOf(Date),
  /** Data em que o pedido foi enviado */
  shippedDate: PropTypes.instanceOf(Date),
  /** Número de rastreio do pedido */
  trackingNumber: PropTypes.string,
  /** Nome da transportadora */
  carrier: PropTypes.string,
  /** Função chamada ao clicar em "Acompanhar pacote" */
  onTrackPackage: PropTypes.func,
};

OrderTracking.defaultProps = {
  status: 'pending',
  orderDate: new Date(),
  estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  carrier: 'Transportadora Padrão',
};

export default OrderTracking;
