import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Box, CircularProgress } from '@mui/material';
import moment from 'moment';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sensor-data');
        setSensorData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        setError(error.message || 'Failed to fetch sensor data');
        setSensorData([]);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!sensorData || sensorData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <Typography>No sensor data available</Typography>
      </Box>
    );
  }

  // Format duration for display
  const formatDuration = (ms) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format voltage for display
  const formatVoltage = (v) => {
    if (!v || isNaN(v) || v < 2.5 || v > 4.5) return '-';
    return v.toFixed(2);
  };

  // Format flow for display
  const formatFlow = (f) => {
    if (!f || isNaN(f) || f < 0 || f > 500) return '-';
    return f.toFixed(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Sensor Data Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Sensor Data
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Flow Rate (L/min)</TableCell>
                    <TableCell>Final Flow (L/min)</TableCell>
                    <TableCell>Battery (V)</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sensorData.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        {moment(event.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {event.wateringStatus === 'start' ? 'Watering Started' :
                         event.wateringStatus === 'stop' ? 'Watering Stopped' :
                         event.batteryVoltage ? 'Battery Reading' : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {formatFlow(event.flowReading)}
                      </TableCell>
                      <TableCell>
                        {formatFlow(event.finalFlowReading)}
                      </TableCell>
                      <TableCell>
                        {formatVoltage(event.batteryVoltage)}
                      </TableCell>
                      <TableCell>
                        {formatDuration(event.timeElapsed)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 