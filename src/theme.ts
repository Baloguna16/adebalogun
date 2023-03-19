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
});

export default theme;