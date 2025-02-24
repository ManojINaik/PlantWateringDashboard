"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WateringData {
  ID: number;
  schedule_time: string;
  duration: string;
  yesterday_flow: string;
  today_flow: string;
}

export default function Home() {
  const [data, setData] = useState<WateringData[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/watering-data");
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Plant Watering Admin Dashboard</h1>
      <div className="rounded-md border">
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
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      row.yesterday_flow === "completed"
                        ? "bg-green-100 text-green-800"
                        : row.yesterday_flow === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {row.yesterday_flow}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      row.today_flow === "completed"
                        ? "bg-green-100 text-green-800"
                        : row.today_flow === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {row.today_flow}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
} 