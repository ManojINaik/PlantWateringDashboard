import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import moment from 'moment';

interface ScheduleData {
  idSchedule: number;
  startdate: string;
  duration: number;
  time: string;
  onoff: number;
}

const ScheduleTable: React.FC = () => {
  const [data, setData] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schedule');
        console.log('Schedule API Response:', response.data); // Debug log
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError('Failed to fetch schedule data');
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

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 220, overflow: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Duration (min)</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.idSchedule}>
              <TableCell>{row.idSchedule}</TableCell>
              <TableCell>{moment(row.startdate).format('MM/DD/YYYY')}</TableCell>
              <TableCell>{moment(row.time, 'HH:mm:ss').format('HH:mm')}</TableCell>
              <TableCell>{row.duration}</TableCell>
              <TableCell>
                <Typography
                  color={row.onoff === 1 ? 'success.main' : 'error.main'}
                  fontWeight="bold"
                >
                  {row.onoff === 1 ? 'Active' : 'Inactive'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScheduleTable; 