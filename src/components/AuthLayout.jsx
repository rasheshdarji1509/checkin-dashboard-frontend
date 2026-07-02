import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid'; // Using standard Grid component
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

/**
 * Premium split-pane layout for auth pages.
 * Left: Graphic banner with check-in description.
 * Right: The card containing the auth form.
 */
const AuthLayout = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, #cbd5e1 100%)`,
        position: 'relative',
        overflow: 'hidden',
        padding: 3,
      }}
    >
      {/* Subtle decorative background blur gradients for premium feel */}
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
          opacity: 0.1,
          top: '10%',
          left: '10%',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.primary.light} 100%)`,
          opacity: 0.08,
          bottom: '10%',
          right: '10%',
          filter: 'blur(80px)',
        }}
      />

      <Box sx={{ width: '100%', maxWidth: 400, zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default AuthLayout;
