import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  IconButton,
  Box,
  LinearProgress,
  TableSortLabel,
  styled,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { format } from 'date-fns';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  borderBottom: `2px solid ${theme.palette.divider}`,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    transition: 'background-color 0.2s ease',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '.MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: '0 0 0 2px ' + theme.palette.primary.main + '40',
    },
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: '8px',
  '&.active': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  '&.inactive': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
  '&.pending': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('startdate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/schedule');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
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
        <LinearProgress color="primary" />
      </Box>
    );
  }

  const filteredData = filterData(data);
  const sortedData = sortData(filteredData);
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%' }}>
      <SearchField
        fullWidth
        variant="outlined"
        placeholder="Search by ID, date, duration, time, or status..."
        value={searchQuery}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="user data table">
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
            {paginatedData.map((row) => (
              <StyledTableRow key={row.idSchedule}>
                <TableCell>{row.idSchedule}</TableCell>
                <TableCell>{formatDate(row.startdate)}</TableCell>
                <TableCell>{row.duration}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>
                  <StatusChip
                    label={row.onoff === 1 ? 'Active' : row.onoff === 0 ? 'Inactive' : 'Pending'}
                    className={row.onoff === 1 ? 'active' : row.onoff === 0 ? 'inactive' : 'pending'}
                  />
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default UserDataTable; 