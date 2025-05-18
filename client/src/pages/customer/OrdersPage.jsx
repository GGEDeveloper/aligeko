import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { fetchOrders } from '../../store/slices/orderSlice';

const statusColors = {
  pending: 'default',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'warning',
};

const statusLabels = {
  pending: 'Pendente',
  processing: 'Em Processamento',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const OrdersPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error, pagination } = useSelector((state) => state.order);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateDesc');

  useEffect(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sort: sortBy,
    };

    if (dateFilter !== 'all') {
      const today = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'thisWeek':
          startDate.setDate(today.getDate() - today.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'thisMonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'last30days':
          startDate.setDate(today.getDate() - 30);
          break;
        case 'thisYear':
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          break;
      }
      
      params.startDate = startDate.toISOString();
      params.endDate = dateFilter !== 'thisYear' ? new Date().toISOString() : undefined;
    }

    dispatch(fetchOrders(params));
  }, [dispatch, page, rowsPerPage, searchTerm, statusFilter, dateFilter, sortBy]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    setPage(0);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('dateDesc');
    setPage(0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusChip = (status) => (
    <Chip
      label={statusLabels[status] || status}
      color={statusColors[status] || 'default'}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  );

  if (loading && page === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error" gutterBottom>
          Ocorreu um erro ao carregar os pedidos
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ mt: 2 }}
        >
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Meus Pedidos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptIcon />}
            onClick={() => navigate('/catalog')}
          >
            Continuar Comprando
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: theme.palette.background.paper }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar pedido..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">Todos os status</MenuItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  label="Período"
                >
                  <MenuItem value="all">Todo o período</MenuItem>
                  <MenuItem value="today">Hoje</MenuItem>
                  <MenuItem value="thisWeek">Esta semana</MenuItem>
                  <MenuItem value="thisMonth">Este mês</MenuItem>
                  <MenuItem value="last30days">Últimos 30 dias</MenuItem>
                  <MenuItem value="thisYear">Este ano</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Ordenar por"
                >
                  <MenuItem value="dateDesc">Mais recentes primeiro</MenuItem>
                  <MenuItem value="dateAsc">Mais antigos primeiro</MenuItem>
                  <MenuItem value="totalDesc">Maior valor</MenuItem>
                  <MenuItem value="totalAsc">Menor valor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleRefresh}
                disabled={!searchTerm && statusFilter === 'all' && dateFilter === 'all' && sortBy === 'dateDesc'}
              >
                Limpar filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {orders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: theme.palette.background.paper }}>
            <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhum pedido encontrado
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Nenhum pedido corresponde aos filtros selecionados.'
                : 'Você ainda não realizou nenhum pedido.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/catalog')}
            >
              Ver Produtos
            </Button>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ overflow: 'hidden', backgroundColor: theme.palette.background.paper }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nº do Pedido</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Itens</TableCell>
                    <TableCell>Valor Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" color="primary" fontWeight="medium">
                          #{order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.items[0]?.name}
                          {order.items.length > 1 ? ` +${order.items.length - 1} mais` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(order.total)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(order.status)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/customer/orders/${order.id}`)}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver recibo">
                          <IconButton
                            color="primary"
                            onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}
                            size="small"
                          >
                            <ReceiptIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default OrdersPage;
