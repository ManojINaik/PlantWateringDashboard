import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  LinearProgress,
  TableSortLabel,
  styled,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Fade,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { format } from 'date-fns';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  whiteSpace: 'nowrap',
  '&:first-of-type': {
    paddingLeft: theme.spacing(3),
  },
  '&:last-of-type': {
    paddingRight: theme.spacing(3),
  },
  '& .MuiTableSortLabel-root': {
    transition: 'all 0.2s ease',
    '&:hover': {
      color: theme.palette.primary.main,
    },
    '&.Mui-active': {
      color: theme.palette.primary.main,
      '& .MuiTableSortLabel-icon': {
        color: theme.palette.primary.main,
      },
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
  },
  '& td': {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:first-of-type': {
      paddingLeft: theme.spacing(3),
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(3),
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    transform: 'translateY(-1px)',
    boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
  },
  '&:last-child td': {
    borderBottom: 0,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  height: '65vh',
  overflow: 'auto',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(148, 163, 184, 0.05)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(148, 163, 184, 0.15)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(148, 163, 184, 0.25)',
    },
  },
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(148, 163, 184, 0.08)',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
    '& fieldset': {
      borderColor: 'rgba(148, 163, 184, 0.2)',
      transition: 'all 0.2s ease',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 2),
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  borderRadius: 12,
  padding: theme.spacing(0, 1),
  '&.MuiChip-colorSuccess': {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10B981',
  },
  '&.MuiChip-colorError': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
  },
  '&.MuiChip-colorWarning': {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#F59E0B',
  },
}));

interface UserData {
  idSchedule: number;
  startdate: string;
  duration: number;
  time: string;
  onoff: number | null;
}

type SortField = 'idSchedule' | 'startdate' | 'duration' | 'time';

const UserDataTable = () => {
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('startdate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/schedule');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        if (!Array.isArray(jsonData)) {
          throw new Error('Invalid data format received');
        }
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const filterData = (data: UserData[]) => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      return (
        row.idSchedule.toString().includes(query) ||
        formatDate(row.startdate).toLowerCase().includes(query) ||
        row.duration.toString().includes(query) ||
        row.time.toLowerCase().includes(query) ||
        (row.onoff === 1 && 'active'.includes(query)) ||
        (row.onoff === 0 && 'inactive'.includes(query)) ||
        (row.onoff === null && 'pending'.includes(query))
      );
    });
  };

  const sortData = (data: UserData[]) => {
    return [...data].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'idSchedule':
          return (a.idSchedule - b.idSchedule) * multiplier;
        case 'startdate':
          return (new Date(a.startdate).getTime() - new Date(b.startdate).getTime()) * multiplier;
        case 'duration':
          return (a.duration - b.duration) * multiplier;
        case 'time':
          return (a.time as string).localeCompare(b.time as string) * multiplier;
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress 
          color="primary"
          sx={{
            height: 2,
            borderRadius: 1,
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
            },
          }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            '& .MuiAlert-icon': {
              color: '#EF4444',
            },
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const filteredData = filterData(data);
  const sortedData = sortData(filteredData);

  return (
    <Box>
      <Box 
        sx={{ 
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {filteredData.length} {filteredData.length === 1 ? 'entry' : 'entries'} found
          </Typography>
        </Box>
        <StyledSearchField
          fullWidth
          variant="outlined"
          placeholder="Search by ID, date, duration, time, or status..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <StyledTableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <TableSortLabel
                  active={sortField === 'idSchedule'}
                  direction={sortField === 'idSchedule' ? sortDirection : 'asc'}
                  onClick={() => handleSort('idSchedule')}
                >
                  Schedule ID
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>
                <TableSortLabel
                  active={sortField === 'startdate'}
                  direction={sortField === 'startdate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('startdate')}
                >
                  Start Date
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>
                <TableSortLabel
                  active={sortField === 'duration'}
                  direction={sortField === 'duration' ? sortDirection : 'asc'}
                  onClick={() => handleSort('duration')}
                >
                  Duration (min)
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>
                <TableSortLabel
                  active={sortField === 'time'}
                  direction={sortField === 'time' ? sortDirection : 'asc'}
                  onClick={() => handleSort('time')}
                >
                  Time
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <Fade in={true} timeout={100 * (index + 1)} key={row.idSchedule}>
                  <StyledTableRow>
                    <TableCell sx={{ fontWeight: 500 }}>{row.idSchedule}</TableCell>
                    <TableCell>{formatDate(row.startdate)}</TableCell>
                    <TableCell>{row.duration}</TableCell>
                    <TableCell>{row.time}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={row.onoff === 1 ? 'Active' : row.onoff === 0 ? 'Inactive' : 'Pending'}
                        color={row.onoff === 1 ? 'success' : row.onoff === 0 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </StyledTableRow>
                </Fade>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  );
};

export default UserDataTable; 