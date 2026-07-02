import React, { useEffect, useState } from 'react';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import HelpIcon from '@mui/icons-material/Help';

import CustomTextField from '../../components/CustomTextField';
import CustomButton from '../../components/CustomButton';
import {
  fetchBoothData,
  fetchAvailableCustomers,
  assignBooth,
  reassignBooth,
  cancelAssignment,
  clearBoothErrors,
} from './boothSlice';

const BoothAssignmentPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    booths,
    assignments,
    availableCustomers,
    loading,
    error,
    actionLoading,
    actionError,
  } = useSelector((state) => state.booth);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelTargetDetails, setCancelTargetDetails] = useState('');

  // React Hook Form
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
      boothId: '',
      salesManagerName: '',
      status: 'Assigned',
      remark: '',
    },
  });

  // Watch fields to trigger automatic side-effects (e.g. autofilling manager name)
  const watchedBoothId = watch('boothId');

  // Load booths & assignments
  useEffect(() => {
    dispatch(fetchBoothData());
    dispatch(fetchAvailableCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (watchedBoothId) {
      const selectedBooth = booths.find((b) => b._id === watchedBoothId);
      if (selectedBooth) {
        setValue('salesManagerName', selectedBooth.salesManager);
      }
    }
  }, [watchedBoothId, booths, setValue]);

  // Clean errors on dialog mount/unmount
  useEffect(() => {
    return () => {
      dispatch(clearBoothErrors());
    };
  }, [dispatch]);

  // Handle Add Assignment Dialog Open
  const handleOpenAddDialog = () => {
    setEditMode(false);
    setSelectedAssignmentId(null);
    dispatch(clearBoothErrors());
    reset({
      customerId: '',
      boothId: '',
      salesManagerName: '',
      status: 'Assigned',
      remark: '',
    });
    setFormDialogOpen(true);
  };

  // Handle Edit Assignment Dialog Open
  const handleOpenEditDialog = (assignment) => {
    setEditMode(true);
    setSelectedAssignmentId(assignment._id);
    dispatch(clearBoothErrors());

    // Resolve references in populated objects
    const customerId = assignment.customerId?._id || assignment.customerId;
    const boothId = assignment.boothId?._id || assignment.boothId;

    reset({
      customerId: customerId,
      boothId: boothId,
      salesManagerName: assignment.salesManagerName,
      status: assignment.status,
      remark: assignment.remark || '',
    });
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
  };

  const onFormSubmit = async (data) => {
    if (editMode) {
      // Reassign or update status
      const result = await dispatch(
        reassignBooth({
          id: selectedAssignmentId,
          data: {
            boothId: data.boothId,
            salesManagerName: data.salesManagerName,
            status: data.status,
            remark: data.remark,
          },
        })
      );
      if (reassignBooth.fulfilled.match(result)) {
        toast.success('Assignment updated successfully!');
        setFormDialogOpen(false);
      } else {
        toast.error(result.payload || 'Failed to update assignment');
      }
    } else {
      // Assign brand new
      const result = await dispatch(assignBooth(data));
      if (assignBooth.fulfilled.match(result)) {
        toast.success('Booth assigned successfully!');
        setFormDialogOpen(false);
      } else {
        toast.error(result.payload || 'Failed to create assignment');
      }
    }
  };

  // Handle Cancel Assignment Dialog Open
  const handleOpenCancelDialog = (assignment) => {
    const custName = assignment.customerId?.name || 'Customer';
    const boothNo = assignment.boothNumber || 'Selected Booth';
    setCancelTargetId(assignment._id);
    setCancelTargetDetails(`${custName} at ${boothNo}`);
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelTargetId(null);
    setCancelTargetDetails('');
  };

  const handleCancelConfirm = async () => {
    const result = await dispatch(cancelAssignment(cancelTargetId));
    if (cancelAssignment.fulfilled.match(result)) {
      toast.success('Assignment cancelled and booth released!');
      setCancelDialogOpen(false);
    } else {
      toast.error(result.payload || 'Failed to cancel assignment');
    }
  };

  // Status Colors Resolver
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'Waiting':
        return { label: 'Waiting', color: 'warning' };
      case 'Assigned':
        return { label: 'Assigned', color: 'primary' };
      case 'In Discussion':
        return { label: 'In Discussion', color: 'secondary' };
      case 'Completed':
        return { label: 'Completed', color: 'success' };
      case 'Cancelled':
        return { label: 'Cancelled', color: 'error' };
      default:
        return { label: status, color: 'default' };
    }
  };

  // Generate lists of available booths for selection dropdown
  const getAvailableBoothsForSelect = () => {
    // Return booths that are available
    let available = booths.filter((b) => b.status === 'Available');

    // If editing, also include the current assignment's booth in the list
    if (editMode && selectedAssignmentId) {
      const activeAssign = assignments.find((a) => a._id === selectedAssignmentId);
      const currentBoothId = activeAssign?.boothId?._id || activeAssign?.boothId;
      const currentBooth = booths.find((b) => b._id === currentBoothId);
      if (currentBooth && !available.some((b) => b._id === currentBooth._id)) {
        available.push(currentBooth);
      }
    }
    return available;
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Upper header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
            Booth Allocation
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Allocate active checked-in customers to sales managers at available booths.
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
              marginRight: {
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
              },
            }}
          >
            Assign Booth
          </Box>
        </Button>
      </Box>

      {/* Main Alert error */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
        {/* Top: Active Booth Assignments Table */}
        <Grid size={12}>
          <Card sx={{ width: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AssignmentIndIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Active Booth Assignments
              </Typography>
            </Box>

            <TableContainer component={Box} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Customer Name</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Booth Number</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Sales Manager</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Status</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Remarks</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    // Load skeletons
                    Array.from(new Array(3)).map((_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from(new Array(6)).map((_, colIndex) => (
                          <TableCell key={colIndex}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          No active booth assignments. Click "Assign Booth" to allocate spaces.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((assignment) => (
                      <TableRow key={assignment._id} hover>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                          {assignment.customerId?.name || 'Unknown Attendee'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={assignment.boothNumber}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{assignment.salesManagerName}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            size="small"
                            {...getStatusChipProps(assignment.status)}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {assignment.remark || (
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                              No remark
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <IconButton
                              aria-label={`Edit assignment for ${assignment.customerId?.name || 'Unknown'}`}
                              size="small"
                              color="warning"
                              title="Update Assignment"
                              onClick={() => handleOpenEditDialog(assignment)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              aria-label={`Cancel assignment for ${assignment.customerId?.name || 'Unknown'}`}
                              size="small"
                              color="error"
                              title="Cancel Assignment"
                              onClick={() => handleOpenCancelDialog(assignment)}
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
            </TableContainer>
          </Card>
        </Grid>

        {/* Bottom: Visual Booth Directory Board */}
        <Grid size={12}>
          <Card sx={{ width: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <StorefrontIcon sx={{ color: theme.palette.secondary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Booth Directory Status
              </Typography>
            </Box>
            <CardContent sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
              {loading ? (
                // Skeletons
                Array.from(new Array(4)).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={70} sx={{ borderRadius: 2 }} />
                ))
              ) : booths.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.disabled', width: '100%' }}>
                  <HelpIcon sx={{ fontSize: 32, opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2">No booths configured in backend database.</Typography>
                </Box>
              ) : (
                booths.map((booth) => {
                  const isOccupied = booth.status === 'Assigned';

                  // Find current assignee name
                  const currentAssignee = assignments.find(
                    (a) => (a.boothId?._id || a.boothId) === booth._id
                  );
                  const assigneeName = currentAssignee?.customerId?.name;

                  return (
                    <Paper
                      key={booth._id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        borderColor: isOccupied ? 'rgba(14, 165, 233, 0.2)' : '#e2e8f0',
                        bgcolor: isOccupied ? 'rgba(14, 165, 233, 0.02)' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                          {booth.boothNumber}
                        </Typography>
                        <Chip
                          label={isOccupied ? 'Occupied' : 'Available'}
                          size="small"
                          color={isOccupied ? 'primary' : 'success'}
                          sx={{ fontSize: '0.75rem', fontWeight: 600, height: 20 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Manager: <strong>{booth.salesManager}</strong>
                        </Typography>
                        {isOccupied && assigneeName && (
                          <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                            👤 {assigneeName}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog: Assign / Update Form */}
      <Dialog open={formDialogOpen} onClose={handleCloseFormDialog} fullWidth maxWidth="xs" sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editMode ? 'Update Booth Assignment' : 'Assign Booth'}
          </Typography>
          <IconButton size="small" onClick={handleCloseFormDialog} aria-label="Close form dialog">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 3 }}>
            {actionError && <Alert severity="error">{actionError}</Alert>}

            {/* 1. Customer Dropdown Select */}
            {editMode ? (
              // Read-only customer name on edit mode
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label="Assignee Customer"
                disabled
                value={
                  assignments.find((a) => a._id === selectedAssignmentId)?.customerId?.name || 'Customer'
                }
              />
            ) : (
              <TextField
                select
                fullWidth
                size="small"
                label="Select Checked-In Customer"
                {...register('customerId', { required: 'Please select a customer' })}
                error={!!errors.customerId}
                helperText={errors.customerId?.message}
                defaultValue=""
              >
                <MenuItem value="" disabled>
                  -- Select Checked-In Customer --
                </MenuItem>
                {availableCustomers.length === 0 ? (
                  <MenuItem value="" disabled>
                    No checked-in customers waiting for assignment
                  </MenuItem>
                ) : (
                  availableCustomers.map((cust) => (
                    <MenuItem key={cust._id} value={cust._id}>
                      {cust.name} ({cust.projectName})
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}

            {/* 2. Booth Selection Dropdown */}
            <TextField
              select
              fullWidth
              size="small"
              label="Select Target Booth"
              {...register('boothId', { required: 'Please select a booth' })}
              error={!!errors.boothId}
              helperText={errors.boothId?.message}
              defaultValue=""
            >
              <MenuItem value="" disabled>
                -- Select Target Booth --
              </MenuItem>
              {getAvailableBoothsForSelect().length === 0 ? (
                <MenuItem value="" disabled>
                  No available booths configuration
                </MenuItem>
              ) : (
                getAvailableBoothsForSelect().map((booth) => (
                  <MenuItem key={booth._id} value={booth._id}>
                    {booth.boothNumber} ({booth.salesManager})
                  </MenuItem>
                ))
              )}
            </TextField>

            {/* 3. Sales Manager editable field */}
            <CustomTextField
              size="small"
              label="Sales Manager Name"
              type="text"
              InputLabelProps={{ shrink: !!watch('salesManagerName') }}
              {...register('salesManagerName', { required: 'Sales manager name is required' })}
              error={errors.salesManagerName}
            />

            {/* 4. Assignment Status Dropdown */}
            <TextField
              select
              fullWidth
              size="small"
              label="Assignment Status"
              {...register('status', { required: 'Status is required' })}
              error={!!errors.status}
              helperText={errors.status?.message}
            >
              <MenuItem value="Waiting">Waiting</MenuItem>
              <MenuItem value="Assigned">Assigned</MenuItem>
              <MenuItem value="In Discussion">In Discussion</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>

            {/* 5. Remarks */}
            <CustomTextField
              label="Remarks / Comments"
              type="text"
              multiline
              rows={2}
              {...register('remark')}
              error={errors.remark}
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={handleCloseFormDialog} disabled={actionLoading} variant="outlined" color="inherit">
              Cancel
            </Button>
            <CustomButton type="submit" loading={actionLoading} variant="contained" color="primary">
              {editMode ? 'Save Assignment' : 'Confirm Allocation'}
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: Cancel Confirmation */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Assignment Cancellation</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to cancel the assignment for <strong>{cancelTargetDetails}</strong>?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontWeight: 500 }}>
            ⚠️ This will release the booth (set status to Available) and change the customer's status back to Checked-In.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseCancelDialog} disabled={actionLoading} variant="outlined" color="inherit">
            Cancel
          </Button>
          <CustomButton onClick={handleCancelConfirm} loading={actionLoading} variant="contained" color="error">
            Confirm Cancel Assignment
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoothAssignmentPage;
