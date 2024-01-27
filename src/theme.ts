import { createTheme } from '@mui/material/styles';
import { red, blue, green } from '@mui/material/colors';

const commonFontFamily = 'Space Mono, Roboto Mono, monospace';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red['A400'],
    },
    info: {
        main: blue['A400'],
      },
    success: {
        main: green['A400'],
    }
  },
  typography: {
    fontFamily: 'Open Sans, Roboto, sans-serif',
    h1: { fontFamily: `${commonFontFamily}, 'Space Mono', monospace` },
    h2: { fontFamily: `${commonFontFamily}, 'Space Mono', monospace` },
    h3: { fontFamily: `${commonFontFamily}, 'Space Mono', monospace` },
    h4: { fontFamily: `${commonFontFamily}, 'Space Mono', monospace` },
    h5: { fontFamily: `${commonFontFamily}, 'Space Mono', monospace` },
    h6: { fontFamily: `${commonFontFamily}, 'Space Mono', monospace` },
  }
});

export default theme;