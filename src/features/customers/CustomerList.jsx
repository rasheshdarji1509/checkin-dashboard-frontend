import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';

import CustomTextField from '../../components/CustomTextField';
import CustomButton from '../../components/CustomButton';
import {
  fetchCustomers,
  addCustomer,
  editCustomer,
  deleteCustomer,
  clearCustomerErrors,
} from './customerSlice';

const CustomerList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { list, loading, error, actionLoading, actionError } = useSelector(
    (state) => state.customers
  );

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Table Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog States
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const [deleteCustomerName, setDeleteCustomerName] = useState('');

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: '',
      mobileNumber: '',
      email: '',
      projectName: '',
      qrCode: '',
    },
  });

  // Fetch customers when component mounts or filters change
  useEffect(() => {
    dispatch(fetchCustomers({ search: searchText, status: statusFilter }));
    setPage(0);
  }, [dispatch, searchText, statusFilter]);

  // Clean errors on unmount or dialog open/close
  useEffect(() => {
    return () => {
      dispatch(clearCustomerErrors());
    };
  }, [dispatch]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  // Handle Status Filter Change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog actions - Add/Edit Form
  const handleOpenAddDialog = () => {
    setEditMode(false);
    setSelectedCustomerId(null);
    dispatch(clearCustomerErrors());
    reset({
      name: '',
      mobileNumber: '',
      email: '',
      projectName: '',
      qrCode: '',
    });
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (customer) => {
    setEditMode(true);
    setSelectedCustomerId(customer._id);
    dispatch(clearCustomerErrors());
    reset({
      name: customer.name,
      mobileNumber: customer.mobileNumber,
      email: customer.email,
      projectName: customer.projectName,
      qrCode: customer.qrCode,
    });
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
  };

  const onFormSubmit = async (data) => {
    if (editMode) {
      const result = await dispatch(editCustomer({ id: selectedCustomerId, data }));
      if (editCustomer.fulfilled.match(result)) {
        toast.success('Customer updated successfully!');
        setFormDialogOpen(false);
      } else {
        toast.error(result.payload || 'Failed to update customer');
      }
    } else {
      const result = await dispatch(addCustomer(data));
      if (addCustomer.fulfilled.match(result)) {
        toast.success('Customer added successfully!');
        setFormDialogOpen(false);
      } else {
        toast.error(result.payload || 'Failed to add customer');
      }
    }
  };

  // Dialog actions - View Details
  const handleOpenDetailsDialog = (customer) => {
    setViewCustomer(customer);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setViewCustomer(null);
  };

  // Dialog actions - Delete Confirmation
  const handleOpenDeleteDialog = (customer) => {
    setDeleteCustomerId(customer._id);
    setDeleteCustomerName(customer.name);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteCustomerId(null);
    setDeleteCustomerName('');
  };

  const handleDeleteConfirm = async () => {
    const result = await dispatch(deleteCustomer(deleteCustomerId));
    if (deleteCustomer.fulfilled.match(result)) {
      toast.success('Customer deleted successfully!');
      setDeleteDialogOpen(false);
    } else {
      toast.error(result.payload || 'Failed to delete customer');
    }
  };

  // Status Chip Color Resolver
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'Waiting':
        return { label: 'Waiting', color: 'warning', variant: 'outlined' };
      case 'Checked-In':
        return { label: 'Checked-In', color: 'info', variant: 'filled' };
      case 'Assigned':
        return { label: 'Assigned', color: 'secondary', variant: 'filled' };
      case 'Completed':
        return { label: 'Completed', color: 'success', variant: 'filled' };
      case 'Cancelled':
        return { label: 'Cancelled', color: 'error', variant: 'outlined' };
      default:
        return { label: status, color: 'default', variant: 'outlined' };
    }
  };

  // Slice list for pagination
  const paginatedList = React.useMemo(() => {
    return list.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [list, page, rowsPerPage]);

  return (
    <Box sx={{ py: 1, overflowX: 'hidden' }}>
      {/* Top Header Panel */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
            Customer Management
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Add, update, search, filter, and delete customer registrations.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            boxShadow: "none",
            "& .MuiButton-startIcon": {
              mr: {
                xs: 0,
                sm: 1,
              },
            },
          }}
        >
          <Box
            component="span"
            sx={{
              display: {
                xs: "none",
                sm: "inline",
                textWrap: "nowrap"
              },
            }}
          >
            Add Customer
          </Box>
        </Button>
      </Box>

      {/* Main Filter Panel */}
      <Card sx={{ mb: 4, width: '100%' }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Grid container spacing={2.5} alignItems="center" sx={{ width: '100%', m: 0 }}>
            {/* Search Input */}
            <Grid size={{ xs: 12, sm: 7, lg: 8 }} sx={{ pl: '0px !important' }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search by customer name or mobile number..."
                value={searchText}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchText && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch} edge="end" aria-label="Clear search">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Status Select */}
            <Grid size={{ xs: 12, sm: 5, lg: 4 }} sx={{ pl: { xs: '0px !important', md: '20px !important' } }}>
              <TextField
                select
                fullWidth
                size="small"
                variant="outlined"
                label="Filter Event Status"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Waiting">Waiting</MenuItem>
                <MenuItem value="Checked-In">Checked-In</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Customers Table Container */}
      <TableContainer component={Paper} sx={{ maxHeight: 520, overflowY: 'auto', overflowX: 'auto', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Customer Name</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Mobile Number</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Email</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Project Name</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>QR Code</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Event Status</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Assigned Booth</TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from(new Array(5)).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from(new Array(8)).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : list.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    No customers found matching search/filter criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Actual List Render
              paginatedList.map((customer) => (
                <TableRow key={customer._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                    {customer.name}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer.mobileNumber}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer.email}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer.projectName}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="mono" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                      {customer.qrCode}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Chip size="small" {...getStatusChipProps(customer.eventStatus)} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {customer.assignedBooth ? (
                      <Chip label={customer.assignedBooth} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 500 }} />
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <IconButton
                        aria-label={`View details for ${customer.name}`}
                        size="small"
                        color="primary"
                        title="View Details"
                        onClick={() => handleOpenDetailsDialog(customer)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label={`Edit ${customer.name}`}
                        size="small"
                        color="warning"
                        title="Edit Customer"
                        onClick={() => handleOpenEditDialog(customer)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${customer.name}`}
                        size="small"
                        color="error"
                        title="Delete Customer"
                        onClick={() => handleOpenDeleteDialog(customer)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Pagination bar */}
        {!loading && list.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={list.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid #e2e8f0' }}
          />
        )}
      </TableContainer>

      {/* Dialog: Add/Edit Customer */}
      <Dialog open={formDialogOpen} onClose={handleCloseFormDialog} fullWidth maxWidth="xs" sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editMode ? 'Edit Customer' : 'Add New Customer'}
          </Typography>
          <IconButton size="small" onClick={handleCloseFormDialog} aria-label="Close form dialog">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 3 }}>
            {actionError && <Alert severity="error">{actionError}</Alert>}
            <CustomTextField
              label="Customer Name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              error={errors.name}
            />
            <CustomTextField
              label="Mobile Number"
              type="tel"
              {...register('mobileNumber', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Enter a valid 10-digit mobile number',
                },
              })}
              error={errors.mobileNumber}
            />
            <CustomTextField
              label="Email Address"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Enter a valid email address',
                },
              })}
              error={errors.email}
            />
            <CustomTextField
              label="Project Name"
              type="text"
              {...register('projectName', { required: 'Project Name is required' })}
              error={errors.projectName}
            />
            <CustomTextField
              label="QR Code Identifier"
              type="text"
              disabled={editMode} // QR code cannot be modified after registration to prevent system mismatch
              {...register('qrCode', { required: 'QR Code is required' })}
              error={errors.qrCode}
              helperText={editMode ? 'QR code cannot be edited after creation' : 'Enter unique code (e.g. QR-1003)'}
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={handleCloseFormDialog} disabled={actionLoading} variant="outlined" color="inherit">
              Cancel
            </Button>
            <CustomButton type="submit" disabled={actionLoading || (editMode && !isDirty)} loading={actionLoading} variant="contained" color="primary">
              {editMode ? 'Save Changes' : 'Create Customer'}
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: View Details */}
      <Dialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} fullWidth maxWidth="sm" sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Customer Details
          </Typography>
          <IconButton size="small" onClick={handleCloseDetailsDialog} aria-label="Close details dialog">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {viewCustomer && (
            <Box>
              {/* Profile Card Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
                  <PersonIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {viewCustomer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registered Project: <strong>{viewCustomer.projectName}</strong>
                  </Typography>
                </Box>
              </Box>

              {/* Two-Column Details Grid */}
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Mobile Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {viewCustomer.mobileNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Email Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {viewCustomer.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    QR Code Identifier
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600, color: theme.palette.primary.main }}>
                    {viewCustomer.qrCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    QR Scanned Usage
                  </Typography>
                  <Chip
                    label={viewCustomer.qrUsed ? 'QR Scanned (Used)' : 'QR Code Unused'}
                    size="small"
                    color={viewCustomer.qrUsed ? 'success' : 'default'}
                    variant={viewCustomer.qrUsed ? 'filled' : 'outlined'}
                    sx={{ mt: 0.5, fontWeight: 600 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Event Check-In Status
                  </Typography>
                  <Chip size="small" {...getStatusChipProps(viewCustomer.eventStatus)} sx={{ mt: 0.5, fontWeight: 600 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Assigned Booth Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: viewCustomer.assignedBooth ? theme.palette.secondary.main : 'text.disabled' }}>
                    {viewCustomer.assignedBooth || 'No booth assigned yet'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* Status History Timeline */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon sx={{ color: theme.palette.text.secondary }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Check-in Lifecycle History
                  </Typography>
                </Box>

                {!viewCustomer.statusHistory || viewCustomer.statusHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No transitions recorded for this registrant.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 1 }}>
                    {viewCustomer.statusHistory.map((history, idx) => (
                      <Box key={history._id || idx} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                        {/* Bullet & Line connector */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: COLORS[history.status] || theme.palette.primary.main,
                              mt: 0.75,
                              zIndex: 1,
                            }}
                          />
                          {idx < viewCustomer.statusHistory.length - 1 && (
                            <Box
                              sx={{
                                width: '2px',
                                flexGrow: 1,
                                bgcolor: '#e2e8f0',
                                position: 'absolute',
                                top: 18,
                                bottom: -18,
                              }}
                            />
                          )}
                        </Box>
                        {/* Content text */}
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              {history.status}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              {new Date(history.date).toLocaleString()}
                            </Typography>
                          </Box>
                          {history.remark && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>
                              Comment: <em>"{history.remark}"</em>
                            </Typography>
                          )}
                          {history.followUpDate && (
                            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                              📅 Follow-Up Date: {history.followUpDate}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetailsDialog} variant="contained" color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the customer <strong>{deleteCustomerName}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 500 }}>
            ⚠️ This operation cannot be undone and will permanently remove this customer from the event log.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={actionLoading} variant="outlined" color="inherit">
            Cancel
          </Button>
          <CustomButton onClick={handleDeleteConfirm} loading={actionLoading} variant="contained" color="error">
            Delete Customer
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};



// Recharts status history background color map helper
const COLORS = {
  'Waiting': '#f59e0b',
  'Checked-In': '#3b82f6',
  'Assigned': '#0ea5e9',
  'Completed': '#10b981',
  'Cancelled': '#ef4444',
};

export default CustomerList;
