import { createTheme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import components from './components';
import shadows from './shadows';

// Create and export the customized Material UI theme
const theme = createTheme({
  palette,
  typography,
  components,
  shadows,
});

export default theme;
