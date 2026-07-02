// Using 'Inter' as the primary font family since it's imported in index.html.
// Custom styling for headers to make it look clean and well-spaced.
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  htmlFontSize: 16,
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600, // custom weight if supported, standard is 600
  fontWeightBold: 700,
  
  h1: {
    fontWeight: 700,
    fontSize: '2.25rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '1.875rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.35,
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.45,
  },
  subtitle1: {
    fontSize: '0.875rem', // reduced from 1rem
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.8rem', // reduced from 0.875rem
    fontWeight: 500,
    lineHeight: 1.57,
  },
  body1: {
    fontSize: '0.875rem', // reduced from 1rem
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.8rem', // reduced from 0.875rem
    lineHeight: 1.43,
  },
  button: {
    textTransform: 'none', // Disable default uppercase to make buttons look more modern
    fontWeight: 500,
    fontSize: '0.8rem', // reduced from default
  },
  caption: {
    fontSize: '0.7rem', // reduced from 0.75rem
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.7rem', // reduced from 0.75rem
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
};

export default typography;
