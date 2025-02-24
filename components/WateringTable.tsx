import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Badge } from "./ui/badge"

interface WateringData {
  ID: number
  schedule_time: string
  duration: string
  yesterday_flow: 'completed' | 'pending' | 'no data'
  today_flow: 'completed' | 'pending' | 'no data'
}

export function WateringTable() {
  const [data, setData] = useState<WateringData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/watering-data')
      const result = await response.json()
      setData(result)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">{status}</Badge>
      case 'pending':
        return <Badge variant="warning">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Schedule Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Yesterday Flow</TableHead>
            <TableHead>Today Flow</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.ID}>
              <TableCell>{row.ID}</TableCell>
              <TableCell>{row.schedule_time}</TableCell>
              <TableCell>{row.duration}</TableCell>
              <TableCell>{getStatusBadge(row.yesterday_flow)}</TableCell>
              <TableCell>{getStatusBadge(row.today_flow)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 