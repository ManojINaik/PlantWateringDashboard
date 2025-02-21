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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import { Box, CircularProgress } from '@mui/material';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sensor-data', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
        if (response.data) {
          console.log('API Response:', response.data); // Debug log
          setSensorData(response.data);
        } else {
          console.warn('No data received from API');
          setSensorData([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch sensor data');
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

  console.log('Raw sensor data:', sensorData);

  // Prepare chart data - data should already be parsed by the backend
  const chartData = sensorData
    .filter(data => {
      // Keep data points that have any valid readings
      const hasData = data.batteryVoltage !== null || 
                     data.flowReading !== null || 
                     data.finalFlowReading !== null ||
                     data.timeElapsed !== null;
      if (!hasData) {
        console.log('Filtered out invalid data point:', data); // Debug log
      }
      return hasData;
    })
    .map(data => {
      // Convert and validate data
      const item = {
        time: data.timestamp * 1000, // Convert to milliseconds for moment
        voltage: data.batteryVoltage,
        flowReading: data.flowReading,
        finalFlowReading: data.finalFlowReading,
        timeElapsed: data.timeElapsed ? data.timeElapsed / 1000 : null, // Convert to seconds
        status: data.wateringStatus
      };
      console.log('Processed data point:', item); // Debug log
      return item;
    })
    .sort((a, b) => a.time - b.time);

  console.log('Processed chart data:', chartData); // Debug log

  // Calculate voltage range with safety checks
  const voltages = chartData
    .map(d => d.voltage)
    .filter(v => v !== null && !isNaN(v) && v >= 2.5 && v <= 4.5); // Filter to reasonable battery voltage range
  const minVoltage = voltages.length > 0 ? Math.floor(Math.min(...voltages) * 10) / 10 : 2.5;
  const maxVoltage = voltages.length > 0 ? Math.ceil(Math.max(...voltages) * 10) / 10 : 4.5;

  // Calculate flow range with safety checks
  const flowReadings = chartData
    .map(d => Math.max(
      d.flowReading || 0,
      d.finalFlowReading || 0
    ))
    .filter(v => !isNaN(v) && v >= 0 && v < 500); // More reasonable flow range
  const maxFlow = flowReadings.length > 0 ? Math.ceil(Math.max(...flowReadings) * 1.2) : 50;

  // Calculate time elapsed range
  const timeElapsedReadings = chartData
    .map(d => d.timeElapsed)
    .filter(v => v !== null && !isNaN(v) && v >= 0);
  const maxTimeElapsed = timeElapsedReadings.length > 0 ? 
    Math.ceil(Math.max(...timeElapsedReadings)) : 60; // Default to 60 seconds

  // Format duration for display
  const formatDuration = (ms) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000); // Convert to seconds if in milliseconds
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
        {/* Flow and Time Elapsed Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Flow Readings and Time Elapsed
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={['auto', 'auto']}
                    tickFormatter={(timestamp) => moment(timestamp).format('MM/DD HH:mm')}
                  />
                  <YAxis
                    yAxisId="flow"
                    orientation="left"
                    domain={[0, maxFlow]}
                    tickFormatter={(value) => `${value.toFixed(0)} L/min`}
                  />
                  <YAxis
                    yAxisId="time"
                    orientation="right"
                    domain={[0, maxTimeElapsed]}
                    tickFormatter={(value) => `${value.toFixed(0)}s`}
                  />
                  <Tooltip
                    labelFormatter={(timestamp) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    formatter={(value, name) => {
                      if (name === 'Flow Rate') return [formatFlow(value) + ' L/min', name];
                      if (name === 'Final Flow Rate') return [formatFlow(value) + ' L/min', name];
                      if (name === 'Time Elapsed') return [value?.toFixed(1) + 's', name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="flow"
                    type="monotone"
                    dataKey="flowReading"
                    stroke="#82ca9d"
                    dot={false}
                    name="Flow Rate"
                    connectNulls
                  />
                  <Line
                    yAxisId="flow"
                    type="monotone"
                    dataKey="finalFlowReading"
                    stroke="#ffc658"
                    dot={false}
                    name="Final Flow Rate"
                    connectNulls
                  />
                  <Line
                    yAxisId="time"
                    type="monotone"
                    dataKey="timeElapsed"
                    stroke="#8884d8"
                    dot={false}
                    name="Time Elapsed"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography align="center">No chart data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Battery Voltage Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Battery Voltage
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={['auto', 'auto']}
                    tickFormatter={(timestamp) => moment(timestamp).format('MM/DD HH:mm')}
                  />
                  <YAxis
                    domain={[minVoltage - 0.1, maxVoltage + 0.1]}
                    tickFormatter={(value) => `${value.toFixed(1)}V`}
                  />
                  <Tooltip
                    labelFormatter={(timestamp) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    formatter={(value, name) => [formatVoltage(value) + 'V', name]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="#8884d8"
                    dot={false}
                    name="Battery Voltage"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography align="center">No voltage data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Sensor Data Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Events
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