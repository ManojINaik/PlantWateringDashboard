import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SensorDataChart from './components/SensorDataChart';
import BatteryVoltageChart from './components/BatteryVoltageChart';
import ScheduleTable from './components/ScheduleTable';
import UserDataTable from './components/UserDataTable';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // Green color for plant theme
    },
    secondary: {
      main: '#00796b', // Teal as secondary
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h6: {
      fontWeight: 500,
      color: '#2e7d32',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 3
      }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: 'primary.main',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Plant Watering Dashboard
          </Typography>
          
          <Grid container spacing={3}>
            {/* Flow Data Chart - Full width */}
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 400,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Watering Flow Data
                </Typography>
                <SensorDataChart />
              </Paper>
            </Grid>

            {/* Battery Voltage Chart - Half width */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 350,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Battery Voltage
                </Typography>
                <BatteryVoltageChart />
              </Paper>
            </Grid>

            {/* Schedule Table - Half width */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 350,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Watering Schedule
                </Typography>
                <ScheduleTable />
              </Paper>
            </Grid>

            {/* User Data Table - Full width */}
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  User Data Overview
                </Typography>
                <UserDataTable />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
