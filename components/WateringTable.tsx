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
import { FaSort, FaSortUp, FaSortDown, FaSync, FaCheck, FaClock, FaBan, FaCloud, FaWater } from 'react-icons/fa'

interface WateringData {
  idMiscellaneous: number
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

type SortField = 'idMiscellaneous' | 'schedule_time' | 'duration' | 'yesterday_flow' | 'today_flow'
type SortDirection = 'asc' | 'desc'

// Memoized table row component for better performance
const TableRowMemo = memo(({ row, getStatusBadge, formatTime }: { 
  row: WateringData, 
  getStatusBadge: (status: string) => JSX.Element,
  formatTime: (dateTimeString: string) => string
}) => (
  <TableRow className="hover:bg-gray-50/90 transition-all group border-b border-gray-100/60">
    <TableCell className="font-medium px-6 py-4">
      <div className="flex items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2.5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {row.idMiscellaneous}
      </div>
    </TableCell>
    <TableCell className="px-6 py-4">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">
          <FaWater className="text-xs" />
        </div>
        <span>{formatTime(row.schedule_time)}</span>
      </div>
    </TableCell>
    <TableCell className="px-6 py-4 font-medium">{row.duration}</TableCell>
    <TableCell className="px-6 py-4">
      {getStatusBadge(row.yesterday_flow)}
    </TableCell>
    <TableCell className="px-6 py-4">
      {getStatusBadge(row.today_flow)}
    </TableCell>
  </TableRow>
), (prevProps, nextProps) => {
  // Only re-render if any of these properties change
  return prevProps.row.idMiscellaneous === nextProps.row.idMiscellaneous &&
    prevProps.row.schedule_time === nextProps.row.schedule_time &&
    prevProps.row.duration === nextProps.row.duration &&
    prevProps.row.yesterday_flow === nextProps.row.yesterday_flow &&
    prevProps.row.today_flow === nextProps.row.today_flow;
});

export function WateringTable({ initialData, onRefresh }: WateringTableProps) {
  const [data, setData] = useState<WateringData[]>(initialData)
  const [sortField, setSortField] = useState<SortField>('idMiscellaneous')
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
          <Badge variant="success" className="flex items-center gap-1.5 font-normal px-3 py-1.5 rounded-full text-xs">
            <div className="p-1 bg-green-200 rounded-full">
              <FaCheck className="text-xs text-green-700" />
            </div>
            <span>Completed</span>
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1.5 font-normal px-3 py-1.5 rounded-full text-xs">
            <div className="p-1 bg-amber-200 rounded-full">
              <FaClock className="text-xs text-amber-700" />
            </div>
            <span>Pending</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1.5 font-normal px-3 py-1.5 rounded-full text-xs">
            <div className="p-1 bg-gray-200 rounded-full">
              <FaBan className="text-xs text-gray-700" />
            </div>
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

  // Handle refresh with animation
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    onRefresh()
    setTimeout(() => setRefreshing(false), 1000)
  }, [onRefresh])

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
    <div className="relative overflow-hidden rounded-xl border border-gray-100/80 bg-white/90 backdrop-blur-sm shadow-soft-xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-100/80">
        <h3 className="font-semibold text-gray-800">Plant Watering Schedule</h3>
        <button 
          onClick={handleRefresh}
          className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          disabled={refreshing}
        >
          <FaSync className={`${refreshing ? 'animate-spin text-green-600' : ''}`} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead 
                className="hover:bg-gray-100/80 cursor-pointer transition-colors px-6 py-3.5"
                onClick={() => handleSort('idMiscellaneous')}
              >
                <div className="flex items-center whitespace-nowrap font-medium">
                  ID {getSortIcon('idMiscellaneous')}
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
                  Previous Status {getSortIcon('yesterday_flow')}
                </div>
              </TableHead>
              <TableHead 
                className="hover:bg-gray-100/80 cursor-pointer transition-colors px-6 py-3.5"
                onClick={() => handleSort('today_flow')}
              >
                <div className="flex items-center whitespace-nowrap font-medium">
                  Latest Status {getSortIcon('today_flow')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                    <FaWater className="text-3xl text-gray-300 mb-2" />
                    <p>No watering schedules found</p>
                    <button 
                      onClick={handleRefresh}
                      className="mt-4 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm flex items-center gap-2 hover:bg-green-100 transition-colors"
                    >
                      <FaSync className={refreshing ? 'animate-spin' : ''} />
                      <span>Refresh Data</span>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <TableRowMemo
                  key={row.idMiscellaneous}
                  row={row}
                  getStatusBadge={getStatusBadge}
                  formatTime={formatTime}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Subtle gradient overlay at the bottom for aesthetic flair */}
      <div className="h-6 bg-gradient-to-t from-white to-transparent w-full pointer-events-none absolute bottom-0"></div>
    </div>
  )
}