import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Lazy-loaded route components — each page is split into its own chunk
const Login = lazy(() => import('../features/auth/Login'));
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const CustomerList = lazy(() => import('../features/customers/CustomerList'));
const QrScannerPage = lazy(() => import('../features/qrScanner/QrScannerPage'));
const BoothAssignmentPage = lazy(() => import('../features/boothAssignment/BoothAssignmentPage'));
const CustomerStatusPage = lazy(() => import('../features/customerStatus/CustomerStatusPage'));

// Full-screen loading fallback for route transitions
const PageLoader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <CircularProgress size={36} />
  </Box>
);


const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Guest-only routes: redirected if logged in */}
        <Route element={<ProtectedRoute requireAuth={false} />}>
          <Route path="/" element={<Login />} />
        </Route>

        {/* Protected routes: redirected if not logged in */}
        <Route element={<ProtectedRoute requireAuth={true} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/booths" element={<BoothAssignmentPage />} />
            <Route path="/qr-scanner" element={<QrScannerPage />} />
            <Route path="/status" element={<CustomerStatusPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;