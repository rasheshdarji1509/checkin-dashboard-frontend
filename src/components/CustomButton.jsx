import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Reusable CustomButton with built-in loading spinner support.
 * Useful for handling asynchronous form submission states.
 */
const CustomButton = ({ children, loading, disabled, ...props }) => {
  return (
    <Button
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomButton;
