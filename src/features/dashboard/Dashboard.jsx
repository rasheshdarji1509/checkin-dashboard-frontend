import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

// Recharts components
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import RefreshIcon from '@mui/icons-material/Refresh';

import { fetchDashboardSummary } from './dashboardSlice';

// Defined outside Dashboard to prevent re-creation on every render (stable reference for Recharts)
const CustomTooltip = React.memo(({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {data.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Customers: <strong>{data.value}</strong>
        </Typography>
      </Paper>
    );
  }
  return null;
});

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { summary, loading, error } = useSelector((state) => state.dashboard);

  // Only fetch if we don't already have data (avoids redundant network calls on re-mount)
  useEffect(() => {
    if (!summary.totalCustomers && !loading) {
      dispatch(fetchDashboardSummary());
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    dispatch(fetchDashboardSummary());
  };

  // Setup summary cards configuration — memoized to avoid rebuilding on every render
  const cardConfigs = useMemo(() => [
    {
      title: 'Total Customers',
      value: summary.totalCustomers,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.primary.main,
      bg: 'rgba(79, 70, 229, 0.08)',
    },
    {
      title: 'Waiting List',
      value: summary.waitingCustomers,
      icon: <HourglassEmptyIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.warning.main,
      bg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      title: 'Checked-In',
      value: summary.checkedInCustomers,
      icon: <HowToRegIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.info.main,
      bg: 'rgba(59, 130, 246, 0.08)',
    },
    {
      title: 'Assigned Booths',
      value: summary.assignedCustomers,
      icon: <StorefrontIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.secondary.main,
      bg: 'rgba(14, 165, 233, 0.08)',
    },
    {
      title: 'Completed',
      value: summary.completedCustomers,
      icon: <TaskAltIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.success.main,
      bg: 'rgba(16, 185, 129, 0.08)',
    },
  ], [summary, theme]);

  // Colors for Recharts pie segments matching the card statuses
  const COLORS = useMemo(() => ({
    'Waiting': theme.palette.warning.main,
    'Checked-In': theme.palette.info.main,
    'Assigned': theme.palette.secondary.main,
    'Completed': theme.palette.success.main,
  }), [theme]);

  const chartData = summary.distribution || [];
  const hasData = chartData.some(item => item.value > 0);

  return (
    <Box sx={{ py: 1 }}>
      {/* Upper header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
            Welcome Back!
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Real-time customer metrics, check-in statuses, and booth assignments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{
            boxShadow: "none",
            "& .MuiButton-startIcon": {
              mr: {
                xs: 0,
                sm: 1, // default spacing
              },
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline', textWrap: "nowrap" } }}>
            Refresh Data
          </Box>
        </Button>
      </Box>

      {/* Error alert banner */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      )}

      {/* Main Content or Empty State */}
      {!loading && summary.totalCustomers === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: 'transparent',
            border: '2px dashed #e2e8f0',
            borderRadius: 3,
            mt: 4
          }}
        >
          <PeopleIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 1 }}>
            No Customers Found
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 500, mx: 'auto' }}>
            Your dashboard is currently empty. Get started by adding your first event attendee or scanning a QR code to check them in.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/customers"
              startIcon={<PeopleIcon />}
            >
              Add Customer Manually
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/qr-scanner"
            >
              Scan QR Code
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          {/* Summary Cards Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 3,
              mb: 4,
            }}
          >
            {cardConfigs.map((card, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[3],
                    borderBottom: `3px solid ${card.color}`,
                  },
                  borderBottom: '3px solid transparent',
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5, p: '20px !important' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                    {loading ? (
                      <Skeleton width={60} height={40} />
                    ) : (
                      <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        {card.value}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: card.bg,
                        color: card.color,
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Chart and Activity Section */}
          <Grid container spacing={3}>
            {/* Pie Chart Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: 420 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Status Distribution
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 2, display: 'block' }}>
                    Proportion of event attendees by active operational check-in status.
                  </Typography>

                  <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {loading ? (
                      <CircularProgress />
                    ) : !hasData ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                          No customer distribution data available.
                        </Typography>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || theme.palette.primary.main} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            iconType="circle"
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: 20 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Info & Actions Side Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: 420 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Quick Action Panel
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 3, display: 'block' }}>
                    Frequently used event check-in tools and shortcuts.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      component={RouterLink}
                      to="/qr-scanner"
                      sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                    >
                      Scan QR Verification Code
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      component={RouterLink}
                      to="/customers"
                      sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                    >
                      Manage Customer Directory
                    </Button>
                    <Button
                      variant="outlined"
                      color="info"
                      fullWidth
                      component={RouterLink}
                      to="/booths"
                      sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                    >
                      Assign Booth Staff
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
