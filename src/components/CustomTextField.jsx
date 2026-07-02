import React, { forwardRef } from 'react';
import TextField from '@mui/material/TextField';

/**
 * Reusable CustomTextField wrapper integrated with React Hook Form ref forwarding.
 * Extends MUI TextField defaults with styling consistency.
 */
const CustomTextField = forwardRef(({ label, error, helperText, ...props }, ref) => {
  return (
    <TextField
      fullWidth
      label={label}
      error={!!error}
      helperText={error ? error.message || helperText : helperText}
      inputRef={ref}
      variant="outlined"
      {...props}
    />
  );
});

CustomTextField.displayName = 'CustomTextField';

export default CustomTextField;
