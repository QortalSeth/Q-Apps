import { createTheme } from '@mui/material/styles';
const commonThemeOptions = {
  typography: {
    fontFamily: "'Arial', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontSize: '2rem',
      fontWeight: 600
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500
    },
    body1: {
      fontSize: '1rem'
    },
    body2: {
      fontSize: '0.875rem'
    }
  },
  spacing: 8,
  shape: {
    borderRadius: 4
  }
}

const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5'
    },
    secondary: {
      main: '#f50057'
    },
    background: {
      default: '#fafafa',
      paper: '#f0f0f0'
    },
    text: {
      primary: '#212121',
      secondary: '#757575'
    }
  }
})

const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5'
    },
    secondary: {
      main: '#f50057'
    },
    background: {
      default: '#303030'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3'
    }
  }
})

export { lightTheme, darkTheme }
