import { createTheme } from '@mui/material/styles';
import { red, blue, green } from '@mui/material/colors';

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
    fontFamily: [
      'Roboto',       // Use Roboto as the default font for body text
      'Arial',        // Fallback to a generic font if Roboto is not available
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Roboto Mono, monospace',  // Use Roboto Mono for h1
    },
    h2: {
      fontFamily: 'Roboto Mono, monospace',  // Use Roboto Mono for h2
    },
    h3: {
      fontFamily: 'Roboto Mono, monospace',  // Use Roboto Mono for h2
    },
    h4: {
      fontFamily: 'Roboto Mono, monospace',  // Use Roboto Mono for h2
    }, 
    h5: {
      fontFamily: 'Roboto Mono, monospace',  // Use Roboto Mono for h2
    }
  },
});

export default theme;