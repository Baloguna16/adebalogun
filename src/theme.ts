import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { red, blue, green } from '@mui/material/colors';

const commonFontFamily = 'Space Mono, Roboto Mono, monospace';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#5D3FD3' : '#08FF00',
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

export default getTheme('light');
