import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment';
import { CircularProgress, Box, Typography } from '@mui/material';

interface SensorData {
  id: number;
  timestamp: number;
  flowReading: number | null;
  finalFlowReading: number | null;
  timeElapsed: number | null;
  wateringStatus: 'start' | 'stop' | null;
}

interface ChartDataPoint {
  time: string;
  flowReading: number;
  timeElapsed: number;
  type: string;
  finalFlowReading: number | null;
}

const SensorDataChart: React.FC = () => {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sensor-data');
        console.log('API Response:', response.data); // Debug log
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError('Failed to fetch sensor data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const chartData = data
    .filter(item => {
      const hasData = item.flowReading !== null || item.finalFlowReading !== null;
      if (!hasData) {
        console.log('Filtered out data point:', item);
      }
      return hasData;
    })
    .map(item => ({
      time: moment(item.timestamp * 1000).format('MM/DD HH:mm'),
      flowReading: item.flowReading || 0,
      timeElapsed: item.timeElapsed || 0,
      type: item.wateringStatus || 'unknown',
      finalFlowReading: item.finalFlowReading
    }))
    .sort((a, b) => moment(a.time).valueOf() - moment(b.time).valueOf());

  console.log('Processed chart data:', chartData); // Debug log

  if (chartData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography>No flow data available</Typography>
      </Box>
    );
  }

  // Calculate Y-axis ranges
  const maxFlow = Math.max(
    ...chartData.map(d => Math.max(d.flowReading || 0, d.finalFlowReading || 0))
  );
  const maxTime = Math.max(...chartData.map(d => d.timeElapsed || 0));

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 300 }}>
      <Typography variant="h6" gutterBottom>
        Flow Readings
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="left" 
            label={{ value: 'Flow Reading (L/min)', angle: -90, position: 'insideLeft' }}
            domain={[0, Math.ceil(maxFlow * 1.2)]}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            label={{ value: 'Time Elapsed (sec)', angle: 90, position: 'insideRight' }}
            domain={[0, Math.ceil(maxTime * 1.2)]}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip 
            formatter={(value: any, name: string) => {
              if (name === 'Flow Reading') return [`${value.toFixed(0)} L/min`, name];
              if (name === 'Final Flow Reading') return [`${value.toFixed(0)} L/min`, name];
              if (name === 'Time Elapsed') return [`${value.toFixed(0)} sec`, name];
              return [value, name];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="flowReading"
            stroke="#2e7d32"
            name="Flow Reading"
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="finalFlowReading"
            stroke="#00796b"
            name="Final Flow Reading"
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="timeElapsed"
            stroke="#1976d2"
            name="Time Elapsed"
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SensorDataChart; 