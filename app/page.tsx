"use client";

import React from 'react';
import { useEffect, useState, useRef } from "react";
import { FaLeaf, FaCalendar, FaClock, FaTint, FaPlus, FaSearch, FaEllipsisV } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import Card3D from "@/components/Card3D";
import dynamic from 'next/dynamic';
import SearchBar from "@/components/SearchBar";
import { WateringTable } from "@/components/WateringTable";
import TimeDate from '@/components/TimeDate';

interface WateringData {
  ID: number;
  active: boolean;
  duration: string;
  schedule_time: string;
  today_flow: "completed" | "pending" | "no data";
  weather_enabled: boolean;
  yesterday_flow: "completed" | "pending" | "no data";
}

// Import TimeDate component with SSR disabled
const TimeDateComponent = dynamic(() => import('@/components/TimeDate'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-4 opacity-50">
      <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
        <span className="font-medium text-gray-400">Loading time...</span>
      </div>
    </div>
  )
});

export default function Home() {
  const [data, setData] = useState<WateringData[]>([]);
  const [filteredData, setFilteredData] = useState<WateringData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchData = async () => {
    try {
      if (!isMounted.current) return;
      
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/watering-data");
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      if (isMounted.current) {
        setData(jsonData);
        setFilteredData(jsonData);
        setLoading(false);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (isMounted.current) {
        setError("Failed to load watering data. Please check if the server is running.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    
    // Set up interval for periodic updates - refresh every 10 minutes
    intervalRef.current = setInterval(fetchData, 600000);
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array since we want this to run once on mount

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredData(data);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = data.filter(
      (item) =>
        item.ID.toString().includes(lowerTerm) ||
        item.schedule_time.toLowerCase().includes(lowerTerm) ||
        item.duration.toLowerCase().includes(lowerTerm) ||
        item.yesterday_flow.toLowerCase().includes(lowerTerm) ||
        item.today_flow.toLowerCase().includes(lowerTerm)
    );
    setFilteredData(filtered);
  };

  // Calculate stats from actual data
  const totalSchedules = data.length;
  const activeSchedules = data.filter(item => item.active).length;
  
  // Calculate average duration (parse numeric value from "X min" format)
  const averageDuration = data.length > 0 
    ? (data.reduce((sum, item) => {
        const minutes = parseInt(item.duration.replace(' min', ''), 10);
        return isNaN(minutes) ? sum : sum + minutes;
      }, 0) / data.length).toFixed(1)
    : "0.0";
    
  // Count completed watering events for today
  const completedToday = data.filter(item => item.today_flow === 'completed').length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Sidebar />
      
      <main className="flex-1 p-10 relative ml-64">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-green-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-green-100/20 rounded-full blur-3xl"></div>
          <div className="absolute top-[25%] right-[15%] w-[120px] h-[120px] bg-green-200/20 rounded-full blur-xl"></div>
          <div className="absolute top-[60%] right-[25%] w-[80px] h-[80px] bg-green-200/20 rounded-full blur-xl"></div>
          <div className="absolute top-[30%] left-[10%] w-[60px] h-[60px] bg-green-200/20 rounded-full blur-xl"></div>
          <div className="absolute top-[80%] right-[30%] w-[40px] h-[40px] bg-green-300/20 rounded-full blur-xl"></div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 relative animate-fadeIn">
            <FaLeaf className="text-green-600" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500">
              Plant Watering Dashboard
            </span>
            <span className="absolute bottom-[-8px] left-0 w-24 h-1 bg-gradient-to-r from-green-500 to-transparent rounded"></span>
          </h1>
          
          <TimeDate />
        </div>

        <div className="flex flex-col mb-12 space-y-8">
          {/* Action bar */}
          <div className="flex items-center justify-between animate-slideUp">
            <SearchBar onSearch={handleSearch} />
            
            <div className="flex space-x-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all">
                <FaPlus className="text-sm" />
                <span className="text-sm font-medium">Add Schedule</span>
              </button>
              
              <button className="p-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm border border-gray-100 transition-all">
                <FaEllipsisV className="text-sm" />
              </button>
            </div>
          </div>
          
          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <Card3D
              icon={<FaCalendar className="text-white" />}
              title="Total Schedules"
              value={totalSchedules}
              color="primary"
            />
            <Card3D
              icon={<FaClock className="text-white" />}
              title="Average Duration"
              value={`${averageDuration} min`}
              color="secondary"
            />
            <Card3D
              icon={<FaTint className="text-white" />}
              title="Completed Today"
              value={`${completedToday}/${totalSchedules}`}
              color="accent"
            />
          </div>
        </div>
        
        {/* Main content */}
        <div className="glass-effect rounded-2xl p-6 shadow-soft-xl animate-fadeIn">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span>
              Watering Schedules
            </h2>
            
            <div className="text-sm text-gray-500">
              {loading ? "Loading data..." : `Showing ${filteredData.length} of ${data.length} schedules`}
            </div>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p>{error}</p>
              <button 
                onClick={fetchData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <WateringTable initialData={filteredData} onRefresh={fetchData} />
          )}
        </div>
      </main>
    </div>
  );
} 