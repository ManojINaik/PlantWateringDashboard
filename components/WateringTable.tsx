import React, { useEffect, useState, useCallback, memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Badge } from "./ui/badge"
import { FaSort, FaSortUp, FaSortDown, FaSync, FaCheck, FaClock, FaBan, FaCloud } from 'react-icons/fa'

interface WateringData {
  ID: number
  schedule_time: string
  duration: string
  yesterday_flow: 'completed' | 'pending' | 'no data'
  today_flow: 'completed' | 'pending' | 'no data'
  active: boolean
  weather_enabled: boolean
}

interface WateringTableProps {
  initialData: WateringData[]
  onRefresh: () => void
}

type SortField = 'ID' | 'schedule_time' | 'duration' | 'yesterday_flow' | 'today_flow'
type SortDirection = 'asc' | 'desc'

// Memoized table row component for better performance
const TableRowMemo = memo(({ row, getStatusBadge, formatTime }: { 
  row: WateringData, 
  getStatusBadge: (status: string) => JSX.Element,
  formatTime: (dateTimeString: string) => string
}) => (
  <TableRow className="hover:bg-gray-50/80 transition-colors group">
    <TableCell className="font-medium px-6 py-4">
      <div className="flex items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2.5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {row.ID}
      </div>
    </TableCell>
    <TableCell className="px-6 py-4">{formatTime(row.schedule_time)}</TableCell>
    <TableCell className="px-6 py-4">{row.duration}</TableCell>
    <TableCell className="px-6 py-4">
      {getStatusBadge(row.yesterday_flow)}
    </TableCell>
    <TableCell className="px-6 py-4">
      {getStatusBadge(row.today_flow)}
    </TableCell>
    <TableCell className="px-6 py-4">
      {row.weather_enabled ? (
        <Badge variant="success" className="flex items-center gap-1 font-normal">
          <FaCloud className="text-xs" />
          <span>Enabled</span>
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1 font-normal">
          <FaBan className="text-xs" />
          <span>Disabled</span>
        </Badge>
      )}
    </TableCell>
  </TableRow>
), (prevProps, nextProps) => {
  // Only re-render if any of these properties change
  return prevProps.row.ID === nextProps.row.ID &&
    prevProps.row.schedule_time === nextProps.row.schedule_time &&
    prevProps.row.duration === nextProps.row.duration &&
    prevProps.row.yesterday_flow === nextProps.row.yesterday_flow &&
    prevProps.row.today_flow === nextProps.row.today_flow &&
    prevProps.row.weather_enabled === nextProps.row.weather_enabled;
});

export function WateringTable({ initialData, onRefresh }: WateringTableProps) {
  const [data, setData] = useState<WateringData[]>(initialData)
  const [sortField, setSortField] = useState<SortField>('ID')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [refreshing, setRefreshing] = useState(false)

  // Memoize handlers and formatters
  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField, sortDirection])

  const getSortIcon = useCallback((field: SortField) => {
    if (field === sortField) {
      return sortDirection === 'asc' ? <FaSortUp className="ml-1 text-green-600" /> : <FaSortDown className="ml-1 text-green-600" />
    }
    return <FaSort className="ml-1 text-gray-400" />
  }, [sortField, sortDirection])

  const getStatusBadge = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <Badge variant="success" className="flex items-center gap-1 font-normal">
            <FaCheck className="text-xs" />
            <span>Completed</span>
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1 font-normal">
            <FaClock className="text-xs" />
            <span>Pending</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1 font-normal">
            <FaBan className="text-xs" />
            <span>No Data</span>
          </Badge>
        )
    }
  }, [])

  const formatTime = useCallback((dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (err) {
      return dateTimeString
    }
  }, [])

  // Update data only if it has changed
  useEffect(() => {
    const hasDataChanged = JSON.stringify(data) !== JSON.stringify(initialData)
    if (hasDataChanged) {
      setData(initialData)
    }
  }, [initialData])

  // Memoized sorting logic
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'schedule_time') {
        const aDate = new Date(a.schedule_time)
        const bDate = new Date(b.schedule_time)
        return sortDirection === 'asc' 
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime()
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (aValue.includes('min') && bValue.includes('min')) {
          aValue = parseInt(aValue.replace(' min', ''), 10)
          bValue = parseInt(bValue.replace(' min', ''), 10)
        }
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [data, sortField, sortDirection])

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead 
                className="hover:bg-gray-100/80 cursor-pointer transition-colors px-6 py-3.5"
                onClick={() => handleSort('ID')}
              >
                <div className="flex items-center whitespace-nowrap font-medium">
                  ID {getSortIcon('ID')}
                </div>
              </TableHead>
              <TableHead 
                className="hover:bg-gray-100/80 cursor-pointer transition-colors px-6 py-3.5"
                onClick={() => handleSort('schedule_time')}
              >
                <div className="flex items-center whitespace-nowrap font-medium">
                  Schedule Time {getSortIcon('schedule_time')}
                </div>
              </TableHead>
              <TableHead 
                className="hover:bg-gray-100/80 cursor-pointer transition-colors px-6 py-3.5"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center whitespace-nowrap font-medium">
                  Duration {getSortIcon('duration')}
                </div>
              </TableHead>
              <TableHead 
                className="hover:bg-gray-100/80 cursor-pointer transition-colors px-6 py-3.5"
                onClick={() => handleSort('yesterday_flow')}
              >
                <div className="flex items-center whitespace-nowrap font-medium">
                  Yesterday Status {getSortIcon('yesterday_flow')}
                </div>
              </TableHead>
              <TableHead 
                className="hover:bg-gray-100/80 cursor-pointer transition-colors px-6 py-3.5"
                onClick={() => handleSort('today_flow')}
              >
                <div className="flex items-center whitespace-nowrap font-medium">
                  Today Status {getSortIcon('today_flow')}
                </div>
              </TableHead>
              <TableHead className="px-6 py-3.5">
                <div className="flex items-center whitespace-nowrap font-medium">
                  Weather Enabled
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((row) => (
                <TableRowMemo
                  key={row.ID}
                  row={row}
                  getStatusBadge={getStatusBadge}
                  formatTime={formatTime}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No watering schedules found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 