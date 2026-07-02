// Customized component defaults and overrides for standard MUI components.
// This ensures design consistency (e.g. rounded corners, shadows) across the app.
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8, // Sleek, modern rounded corners
        padding: '8px 16px',
        fontWeight: 500,
        boxShadow: 'none', // Flat button design is cleaner
        '&:hover': {
          boxShadow: 'none',
        },
      },
      containedPrimary: {
        '&:hover': {
          backgroundColor: '#4338ca', // Indigo-700
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)', // Subtle shadow
        border: '1px solid #f1f5f9', // soft border to look premium
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 20,
        '&:last-child': {
          paddingBottom: 20,
        },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small', // Small density looks better in admin dashboards
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#cbd5e1', // slate-300 border
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#94a3b8', // slate-400 border on hover
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#4f46e5', // indigo border on focus
          borderWidth: 1.5,
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        fontSize: '0.75rem', // reduced table header font
        backgroundColor: '#f8fafc',
        color: '#475569',
      },
      body: {
        fontSize: '0.8rem', // reduced table body font
      },
    },
  },
};

export default components;
