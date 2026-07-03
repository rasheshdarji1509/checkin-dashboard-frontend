import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import CustomTextField from '../../components/CustomTextField';
import CustomButton from '../../components/CustomButton';

// Redux Thunks & Actions
import { fetchCustomers } from '../customers/customerSlice';
import {
  fetchStatusHistory,
  updateCustomerStatus,
  clearStatusErrors,
  clearStatusHistoryState,
} from './statusSlice';

const CustomerStatusPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Selected customer tracking
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Ref to scroll to the update form panel when a customer is selected
  const formPanelRef = useRef(null);

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Redux selectors
  const { list: customerList, loading: customersLoading, error: customersError } = useSelector(
    (state) => state.customers
  );
  const { history, loading: historyLoading, error: historyError, actionLoading, actionError } = useSelector(
    (state) => state.status
  );

  // Form hooks
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerId: '',
      status: '',
      remark: '',
      followUpDate: '',
    },
  });

  const watchedStatus = watch('status');

  // Load overall customers directory on mount
  useEffect(() => {
    dispatch(fetchCustomers({ search: searchText, status: statusFilter }));
  }, [dispatch, searchText, statusFilter]);

  // Sync selected customer state if the underlying list changes (e.g. after status update)
  useEffect(() => {
    if (selectedCustomer) {
      const updatedCustomer = customerList.find((c) => c._id === selectedCustomer._id);
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
      }
    }
  }, [customerList, selectedCustomer]);

  // Handle customer row selection
  const handleSelectCustomer = (customer) => {
    dispatch(clearStatusErrors());
    dispatch(clearStatusHistoryState());
    setSelectedCustomer(customer);

    // Fetch their history log
    dispatch(fetchStatusHistory(customer._id));

    // Reset update status form — status is empty so user must pick one (validation)
    reset({
      customerId: customer._id,
      status: '',
      remark: '',
      followUpDate: '',
    });

    // Scroll to the form panel smoothly
    setTimeout(() => {
      formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Form submit handler
  const onStatusFormSubmit = async (data) => {
    if (!selectedCustomer) return;

    // Inject customerId
    const submitData = {
      ...data,
      customerId: selectedCustomer._id,
    };

    // Clean followUpDate if status is not Follow-Up Required
    if (data.status !== 'Follow-Up Required') {
      delete submitData.followUpDate;
    }

    const result = await dispatch(updateCustomerStatus(submitData));
    if (updateCustomerStatus.fulfilled.match(result)) {
      toast.success('Attendee status updated successfully!');
      // Reset comments and date
      setValue('remark', '');
      setValue('followUpDate', '');
    } else {
      toast.error(result.payload || 'Failed to update attendee status');
    }
  };

  // Chips color resolver
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'Waiting':
        return { label: 'Waiting', color: 'warning' };
      case 'Checked-In':
        return { label: 'Checked-In', color: 'info' };
      case 'Assigned':
        return { label: 'Assigned', color: 'secondary' };
      case 'In Discussion':
        return { label: 'In Discussion', color: 'primary' };
      case 'Follow-Up Required':
        return { label: 'Follow-Up', color: 'warning', variant: 'outlined' };
      case 'Completed':
        return { label: 'Completed', color: 'success' };
      case 'Cancelled':
        return { label: 'Cancelled', color: 'error' };
      default:
        return { label: status, color: 'default' };
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
          Registrant Status Logs
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Track and advance attendee statuses, schedule follow-ups, and review check-in lifecycles.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
        {/* Top: Customer Selection Directory */}
        <Grid size={12}>
          <Card sx={{ width: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Attendee Directory
              </Typography>

              {/* Search and status filters */}
              <Grid container spacing={2.5} alignItems="center" sx={{ width: '100%', m: 0 }}>
                <Grid size={{ xs: 12, sm: 8 }} sx={{ pl: '0px !important' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name or phone..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchText && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchText('')} aria-label="Clear customer search">
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }} sx={{ pl: { xs: '0px !important', md: '20px !important' } }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Filter Event Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="Waiting">Waiting</MenuItem>
                    <MenuItem value="Checked-In">Checked-In</MenuItem>
                    <MenuItem value="Assigned">Assigned</MenuItem>
                    <MenuItem value="In Discussion">In Discussion</MenuItem>
                    <MenuItem value="Follow-Up Required">Follow-Up</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            {/* Customers table */}
            <TableContainer component={Box} sx={{ maxHeight: 400, overflowY: 'auto', overflowX: 'auto' }}>
              <Table stickyHeader sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Name</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Project</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Current Status</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customersLoading ? (
                    Array.from(new Array(5)).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="text" width={80} /></TableCell>
                        <TableCell align="center"><Skeleton variant="circular" width={32} height={32} /></TableCell>
                      </TableRow>
                    ))
                  ) : customerList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          No registrants found matching search filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerList.map((customer) => {
                      const isSelected = selectedCustomer?._id === customer._id;
                      return (
                        <TableRow
                          key={customer._id}
                          hover
                          selected={isSelected}
                          onClick={() => handleSelectCustomer(customer)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                            {customer.name}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer.projectName}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Chip size="small" {...getStatusChipProps(customer.eventStatus)} sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                            <IconButton
                              aria-label={`Select ${customer.name}`}
                              size="small"
                              color={isSelected ? 'primary' : 'default'}
                              title="Update Status"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Bottom: Update form and Chronological logs */}
        <Grid size={12}>
          <Card ref={formPanelRef} sx={{ width: '100%', minHeight: 460, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#f8fafc' }}>
              <HistoryIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Status Log & Update Panel
              </Typography>
            </Box>

            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
              {!selectedCustomer ? (
                // Helpful Informative Empty State
                <Grid container spacing={4}>
                  {/* Left Column: Quick Guide */}
                  <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
                        Advance Attendee State Guide
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Advance registrant check-in lifecycles by following these simple operational steps:
                      </Typography>
                      <Box component="ol" sx={{ pl: 2, m: 0, '& li': { mb: 1.5, color: theme.palette.text.secondary, fontSize: '0.875rem' } }}>
                        <li>
                          <strong>Select Registrant:</strong> Click on any attendee row in the <em>Attendee Directory</em> list above.
                        </li>
                        <li>
                          <strong>Choose Target Status:</strong> Use the select dropdown to advance status (e.g. <em>In Discussion</em> or <em>Completed</em>).
                        </li>
                        <li>
                          <strong>Schedule Callbacks:</strong> If status is set to <em>Follow-Up Required</em>, select a callback date (mandatory).
                        </li>
                        <li>
                          <strong>Write Remarks:</strong> Enter brief notes/comments for audit logs, and submit.
                        </li>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Right Column: Status Meanings */}
                  <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: theme.palette.secondary.main }}>
                        Status System Definitions
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {[
                          { status: 'Waiting', desc: 'Customer registered; waiting for QR verification.' },
                          { status: 'Checked-In', desc: 'QR code verified; registrant is active in the venue.' },
                          { status: 'Assigned', desc: 'Attendee allocated to a sales booth manager.' },
                          { status: 'In Discussion', desc: 'Active meeting/discussion is ongoing at the booth.' },
                          { status: 'Follow-Up Required', desc: 'Callbacks scheduled for further discussions.' },
                          { status: 'Completed', desc: 'Attendee check-in lifecycle concluded successfully.' },
                          { status: 'Cancelled', desc: 'Customer check-in cancelled.' },
                        ].map((item, i) => (
                          <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <Chip size="small" {...getStatusChipProps(item.status)} sx={{ fontWeight: 600, mt: 0.2 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.785rem' }}>
                              {item.desc}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                // Active status details Split Layout
                <Grid container spacing={4}>
                  {/* Left Column: Form */}
                  <Grid size={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      {/* Selected attendee headers */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 44, height: 44 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {selectedCustomer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Project: <strong>{selectedCustomer.projectName}</strong> | Mobile: {selectedCustomer.mobileNumber}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.palette.text.secondary }}>
                          Advance Attendee State
                        </Typography>

                        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

                        <form onSubmit={handleSubmit(onStatusFormSubmit)} noValidate>
                          <Grid container spacing={2.5} alignItems="stretch">
                            {/* Status Selection */}
                            <Grid size={{ xs: 12, md: 5 }}>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Target Status"
                                {...register('status', { required: 'Please select a status' })}
                                error={!!errors.status}
                                helperText={errors.status?.message}
                                sx={{ '& .MuiInputBase-root': { height: 42 } }}
                              >
                                <MenuItem value="Waiting">Waiting</MenuItem>
                                <MenuItem value="Checked-In">Checked-In</MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="In Discussion">In Discussion</MenuItem>
                                <MenuItem value="Follow-Up Required">Follow-Up Required</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Cancelled">Cancelled</MenuItem>
                              </TextField>
                            </Grid>

                            {/* Conditional Follow Up Date selection */}
                            {watchedStatus === 'Follow-Up Required' && (
                              <Grid size={{ xs: 12, md: 5 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="date"
                                  label="Schedule Follow-Up Date"
                                  InputLabelProps={{ shrink: true }}
                                  {...register('followUpDate', {
                                    required: 'Follow-up date is required for this status',
                                  })}
                                  error={!!errors.followUpDate}
                                  helperText={errors.followUpDate?.message}
                                  sx={{ '& .MuiInputBase-root': { height: 42 } }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <CalendarMonthIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                            )}

                            {/* Remarks */}
                            <Grid size={{ xs: 12, md: 4 }}>
                              <CustomTextField
                                label="Comments / Operational Remarks"
                                type="text"
                                {...register('remark')}
                                error={errors.remark}
                                placeholder="e.g. Discussed budget requirements..."
                                sx={{ '& .MuiInputBase-root': { height: 42 } }}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, md: 3 }}>
                              <CustomButton
                                type="submit"
                                variant="contained"
                                color="primary"
                                loading={actionLoading}
                                sx={{ px: 4, borderRadius: 2, width: '100%', height: 42 }}
                              >
                                Update Status State
                              </CustomButton>
                            </Grid>
                          </Grid>
                        </form>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Right Column: Chronological Timeline logs */}
                  <Grid size={12}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.palette.text.secondary }}>
                        Lifecycle Event Log History
                      </Typography>

                      {historyLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                          <CircularProgress size={30} />
                        </Box>
                      ) : historyError ? (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>{historyError}</Alert>
                      ) : history.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No transitions logged for this registrant.
                        </Typography>
                      ) : (
                        // Timeline Log List
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                          {history.map((log, idx) => (
                            <Box key={log._id || idx} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                              {/* Connective bullets */}
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: COLORS[log.status] || theme.palette.primary.main,
                                    mt: 0.75,
                                    zIndex: 1,
                                  }}
                                />
                                {idx < history.length - 1 && (
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

                              {/* Log details */}
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                    {log.status}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                    {new Date(log.date).toLocaleString()}
                                  </Typography>
                                </Box>
                                {log.remark && (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem', bgcolor: '#f8fafc', p: 1, borderRadius: 1.5, borderLeft: `2.5px solid #cbd5e1`, mt: 0.5 }}>
                                    Remark: <em>"{log.remark}"</em>
                                  </Typography>
                                )}
                                {log.followUpDate && (
                                  <Chip
                                    icon={<CalendarMonthIcon sx={{ fontSize: '0.9rem !important' }} />}
                                    label={`Callback: ${log.followUpDate}`}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    sx={{ mt: 1, fontWeight: 600, fontSize: '0.75rem' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Recharts status history background color map helper
const COLORS = {
  'Waiting': '#f59e0b',
  'Checked-In': '#3b82f6',
  'Assigned': '#0ea5e9',
  'In Discussion': '#4f46e5',
  'Follow-Up Required': '#f59e0b',
  'Completed': '#10b981',
  'Cancelled': '#ef4444',
};

export default CustomerStatusPage;
