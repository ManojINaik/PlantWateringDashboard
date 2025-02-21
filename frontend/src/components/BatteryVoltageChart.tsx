import React, { useState, useEffect } from 'react';
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
import { Box, Typography, CircularProgress } from '@mui/material';
import moment from 'moment';
import axios from 'axios';

interface SensorData {
  id: number;
  timestamp: number;
  batteryVoltage: number | null;
  flowReading: number | null;
  finalFlowReading: number | null;
  timeElapsed: number | null;
  wateringStatus: 'start' | 'stop' | null;
}

const BatteryVoltageChart: React.FC = () => {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('API Response:', response.data); // Debug log

        // Filter for valid battery voltage readings and sort by timestamp
        const batteryData = response.data
          .filter((item: SensorData) => {
            const isValid = item.batteryVoltage !== null && 
                          !isNaN(item.batteryVoltage) && 
                          item.batteryVoltage >= 0;
            if (!isValid) {
              console.log('Filtered out invalid battery reading:', item);
            }
            return isValid;
          })
          .sort((a: SensorData, b: SensorData) => a.timestamp - b.timestamp);

        console.log('Processed battery data:', batteryData); // Debug log
        
        if (batteryData.length === 0) {
          setError('No valid battery voltage readings found');
        } else {
          setData(batteryData);
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching battery data:', err);
        setError('Failed to fetch battery data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate voltage range with safety checks
  const voltages = data
    .map(d => d.batteryVoltage)
    .filter((v): v is number => v !== null && !isNaN(v) && v >= 0);
  
  const minVoltage = voltages.length > 0 ? Math.max(0, Math.floor(Math.min(...voltages) * 10) / 10) : 0;
  const maxVoltage = voltages.length > 0 ? Math.ceil(Math.max(...voltages) * 10) / 10 : 5.0;

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 300 }}>
      <Typography variant="h6" gutterBottom>
        Battery Voltage
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="error">{error}</Typography>
        </Box>
      ) : data.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography>No battery data available</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => moment(timestamp * 1000).format('MM/DD HH:mm')}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              domain={[minVoltage - 0.1, maxVoltage + 0.1]}
              tickFormatter={(value) => `${value.toFixed(1)}V`}
            />
            <Tooltip
              labelFormatter={(timestamp) => moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')}
              formatter={(value: any) => [`${value.toFixed(2)}V`, 'Battery Voltage']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="batteryVoltage"
              stroke="#8884d8"
              name="Battery Voltage"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default BatteryVoltageChart;