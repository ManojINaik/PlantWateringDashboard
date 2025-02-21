import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import UserDataTable from './components/UserDataTable';
import { alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899', // Pink
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f8fafc', // Slate 50
      secondary: '#cbd5e1', // Slate 300
    },
    error: {
      main: '#ef4444', // Red 500
    },
    warning: {
      main: '#f59e0b', // Amber 500
    },
    success: {
      main: '#10b981', // Emerald 500
    },
    info: {
      main: '#3b82f6', // Blue 500
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
      backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#f8fafc',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (min-width: 1200px)': {
            paddingLeft: 32,
            paddingRight: 32,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(148, 163, 184, 0.1)',
        },
        head: {
          fontWeight: 600,
          color: '#94a3b8',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(15, 23, 42, 0.3)',
          },
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.1) !important',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
        colorSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#34d399',
        },
        colorWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          color: '#fbbf24',
        },
        colorError: {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.1), transparent 40%), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          py: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="xl">
          <Box 
            sx={{ 
              mb: { xs: 4, md: 6 },
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '25%',
                  width: '50%',
                  height: 4,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  borderRadius: 2,
                  filter: 'blur(2px)',
                }
              }}
            >
              Plant Watering Dashboard
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 2, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  },
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    borderRadius: '4px 4px 0 0',
                    filter: 'blur(1px)',
                  },
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                    color: theme.palette.text.primary,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  User Data Overview
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <UserDataTable />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

