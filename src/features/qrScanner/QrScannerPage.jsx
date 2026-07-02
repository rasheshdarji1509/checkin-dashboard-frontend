import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Html5Qrcode } from 'html5-qrcode';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';

// Icons
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SearchIcon from '@mui/icons-material/Search';

import CustomButton from '../../components/CustomButton';
import {
  verifyCustomerQr,
  checkInCustomer,
  resetScannerState,
  clearScannerErrors,
} from './qrSlice';

const QrScannerPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    scannedCustomer,
    loading,
    error,
    checkInLoading,
    checkInSuccess,
    checkInError,
  } = useSelector((state) => state.qr);

  const [manualCode, setManualCode] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInitError, setScannerInitError] = useState(null);

  const qrScannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Clear scanner states on mount/unmount
  useEffect(() => {
    dispatch(resetScannerState());

    // Fetch available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Default to the first device found
          setSelectedCameraId(devices[0].id);
        } else {
          setScannerInitError('No cameras or video inputs found on this device.');
        }
      })
      .catch((err) => {
        console.error('Error fetching cameras:', err);
        setScannerInitError('Camera access permission was denied or is unavailable.');
      });

    return () => {
      stopScanning();
      dispatch(resetScannerState());
    };
  }, [dispatch]);

  // Clean errors on changes
  const handleManualCodeChange = (e) => {
    setManualCode(e.target.value);
    if (error || checkInError) {
      dispatch(clearScannerErrors());
    }
  };

  // Start Camera Scanning
  const startScanning = async () => {
    dispatch(resetScannerState());
    setScannerInitError(null);
    setIsScanning(true);

    // Stop any existing instance
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
    }

    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrCodeRef.current = html5QrCode;

    // Use selected camera if available, otherwise fallback to default rear camera (this triggers permission prompt)
    const cameraIdentifier = selectedCameraId ? selectedCameraId : { facingMode: 'environment' };

    html5QrCode
      .start(
        cameraIdentifier,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (qrCodeText) => {
          // Success callback: stop scanning & verify code
          stopScanning();
          dispatch(verifyCustomerQr(qrCodeText));
        },
        (errorMessage) => {
          // Verbose log is generally ignored as it triggers on every camera frame
        }
      )
      .catch((err) => {
        console.error('Error starting scanner:', err);
        setScannerInitError('Failed to initialize camera scanner. Check camera permissions.');
        setIsScanning(false);
      });
  };

  // Stop Camera Scanning
  const stopScanning = () => {
    setIsScanning(false);
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          console.log('Scanner stopped successfully.');
        })
        .catch((err) => {
          console.error('Failed to stop scanner:', err);
        });
    }
  };

  // Manual code submission
  const handleManualVerifySubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    stopScanning();
    dispatch(verifyCustomerQr(manualCode.trim()));
  };

  // Execute Check-in submit
  const handleCheckInSubmit = async () => {
    if (!scannedCustomer) return;
    const result = await dispatch(checkInCustomer(scannedCustomer.qrCode));
    if (checkInCustomer.fulfilled.match(result)) {
      // Check-in was successful
    }
  };

  // Resets to initial scan view
  const handleScanNext = () => {
    dispatch(resetScannerState());
    setManualCode('');
  };

  // Get status color helper
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Waiting':
        return 'warning';
      case 'Checked-In':
        return 'info';
      case 'Assigned':
        return 'secondary';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Header section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
          QR Code Check-In
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Scan the registrant's QR code via camera or enter the QR identifier manually to verify and check-in.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
        {/* Left Side: Scanner Controls */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ pl: '0px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Camera Scanner Card */}
            <Card sx={{ overflow: 'hidden', width: '100%' }}>
              <Box
                sx={{
                  py: 2,
                  px: 3,
                  bgcolor: theme.palette.primary.main,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <QrCodeScannerIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Camera Scan Receiver
                </Typography>
              </Box>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 2.5, p: 3 }}>

                {/* Camera Selector Dropdown */}
                {cameras.length > 0 && (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Select Active Camera"
                    value={selectedCameraId}
                    disabled={isScanning}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                  >
                    {cameras.map((camera) => (
                      <MenuItem key={camera.id} value={camera.id}>
                        {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {/* Initial Device Alert Errors */}
                {scannerInitError && (
                  <Alert severity="warning" sx={{ width: '100%', borderRadius: 2 }}>
                    {scannerInitError}
                  </Alert>
                )}

                {/* Scanner container viewport */}
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 360,
                    minHeight: 280,
                    bgcolor: '#0f172a',
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    border: `2px solid ${isScanning ? theme.palette.primary.main : '#334155'}`,
                    position: 'relative',
                  }}
                >
                  {/* HTML5 QR code renders inside this div */}
                  <div
                    id="qr-reader"
                    ref={qrScannerRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: isScanning ? 'block' : 'none',
                    }}
                  />

                  {/* Idle scanner overlay display */}
                  {!isScanning && (
                    <Box sx={{ textAlign: 'center', p: 3, color: '#94a3b8' }}>
                      <CameraAltIcon sx={{ fontSize: 48, mb: 1, opacity: 0.6 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Camera is currently offline
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                        Click "Start Scanning" to activate the camera frame.
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Controls buttons */}
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                  {!isScanning ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={startScanning}
                      sx={{ py: 1.25, borderRadius: 2 }}
                    >
                      Start Scanning
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={stopScanning}
                      sx={{ py: 1.25, borderRadius: 2 }}
                    >
                      Stop Scanning
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Manual QR Search Card */}
            <Card sx={{ width: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Manual QR Code Entry
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 2, display: 'block' }}>
                  If camera access fails, type the registrant's identifier below.
                </Typography>

                <Box component="form" onSubmit={handleManualVerifySubmit} sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="QR Code Identifier"
                    placeholder="e.g. QR-1001"
                    value={manualCode}
                    onChange={handleManualCodeChange}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    color="primary"
                    startIcon={<SearchIcon />}
                    sx={{ px: 3, borderRadius: 2, borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                  >
                    Verify
                  </Button>
                </Box>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* Right Side: Verification Details & Action */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ pl: { xs: '0px !important', md: '32px !important' } }}>
          <Card sx={{ height: '100%', minHeight: 460, display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                py: 2,
                px: 3,
                bgcolor: theme.palette.secondary.main,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CheckCircleIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Verification & Check-In Results
              </Typography>
            </Box>

            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>

              {/* 1. Loading State */}
              {loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Verifying customer credentials...
                  </Typography>
                </Box>
              )}

              {/* 2. Initial State (No scan done) */}
              {!loading && !scannedCustomer && !error && !checkInSuccess && (
                <Box sx={{ textAlign: 'center', color: 'text.disabled', py: 4 }}>
                  <QrCodeScannerIcon sx={{ fontSize: 64, mb: 1.5, opacity: 0.4 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Waiting for QR Scans
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Activate the camera scanner or enter an identifier manually to verify attendees.
                  </Typography>
                </Box>
              )}

              {/* 3. Error State (Verification failure) */}
              {!loading && error && (
                <Box sx={{ py: 2 }}>
                  <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                    <strong>Verification Failed:</strong> {error}
                  </Alert>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Please ensure the QR code is correct and has not been previously checked in.
                  </Typography>
                </Box>
              )}

              {/* 4. Verified Customer Details */}
              {!loading && scannedCustomer && !checkInSuccess && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
                    Customer Verified Successfully!
                  </Typography>

                  {/* Customer Card Profile */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 52, height: 52 }}>
                      <PersonIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {scannedCustomer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Project: <strong>{scannedCustomer.projectName}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Registration Attributes */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', display: 'block' }}>
                        QR Code ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {scannedCustomer.qrCode}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', display: 'block' }}>
                        Current Status
                      </Typography>
                      <Chip
                        label={scannedCustomer.eventStatus}
                        size="small"
                        color={getStatusChipColor(scannedCustomer.eventStatus)}
                        sx={{ fontWeight: 600, mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', display: 'block' }}>
                        Mobile Number
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {scannedCustomer.mobileNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', display: 'block' }}>
                        Email Address
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scannedCustomer.email}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Submission Action */}
                  <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {/* Error check-in display if any */}
                    {checkInError && (
                      <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {checkInError}
                      </Alert>
                    )}

                    {scannedCustomer.eventStatus !== 'Waiting' ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        This customer has already completed the check-in process. (Current state is <strong>{scannedCustomer.eventStatus}</strong>).
                      </Alert>
                    ) : (
                      <CustomButton
                        fullWidth
                        size="large"
                        variant="contained"
                        color="success"
                        loading={checkInLoading}
                        onClick={handleCheckInSubmit}
                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                      >
                        Confirm Check-In Attendance
                      </CustomButton>
                    )}
                  </Box>
                </Box>
              )}

              {/* 5. Check-In Success State */}
              {!loading && checkInSuccess && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Check-In Successful!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Registrant <strong>{scannedCustomer?.name}</strong> has been successfully checked in. Status has updated to <strong>Checked-In</strong>.
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleScanNext}
                    sx={{ py: 1.25, px: 4, borderRadius: 2 }}
                  >
                    Scan Next Attendee
                  </Button>
                </Box>
              )}

            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QrScannerPage;
