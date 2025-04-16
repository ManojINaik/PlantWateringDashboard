"use client";

import React from 'react';
import { useEffect, useState, useRef } from "react";
import { FaLeaf, FaWater, FaClock, FaThermometerHalf, FaCheck } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import dynamic from 'next/dynamic';
import SearchBar from "@/components/SearchBar";
import { WateringTable } from "@/components/WateringTable";
import TimeDate from '@/components/TimeDate';
import Card3D from "@/components/Card3D";

interface WateringData {
  idMiscellaneous: number;
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
    
    // Set up interval for periodic updates - refresh every 5 minutes
    intervalRef.current = setInterval(fetchData, 300000);
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredData(data);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = data.filter(
      (item) =>
        item.idMiscellaneous?.toString().includes(lowerTerm) ||
        item.schedule_time?.toLowerCase().includes(lowerTerm) ||
        item.duration?.toLowerCase().includes(lowerTerm) ||
        item.yesterday_flow?.toLowerCase().includes(lowerTerm) ||
        item.today_flow?.toLowerCase().includes(lowerTerm)
    );
    setFilteredData(filtered);
  };

  // Calculate summary data for cards
  const totalSchedules = filteredData.length;
  const activeSchedules = filteredData.filter(item => item.active).length;
  const completedToday = filteredData.filter(item => item.today_flow === "completed").length;
  const weatherEnabled = filteredData.filter(item => item.weather_enabled).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Sidebar />
      
      <main className="flex-1 p-10 relative ml-64">
        {/* Absolutely positioned sticky TimeDate */}
        <div className="fixed right-12 top-6 z-50">
          <TimeDate />
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 relative animate-fadeIn">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-green-glow animate-pulse-soft">
              <FaLeaf className="text-white text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500">
                Plant Watering Dashboard
              </span>
              <div className="h-1 w-28 bg-gradient-to-r from-green-500 to-transparent rounded mt-1"></div>
            </div>
          </h1>
          {/* Placeholder for TimeDate to avoid layout shift */}
          <div style={{ width: 320, height: 56 }} />
        </div>

        {/* Sticky search bar container */}
        <div className="sticky top-0 z-40 py-2 mb-8 animate-slideUp">
          <div className="max-w-md">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
        
        {/* 3D Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 animate-fadeIn">
          <Card3D 
            icon={<FaWater className="text-blue-600 text-2xl" />}
            title="Total Schedules"
            value={totalSchedules.toString()}
            color="secondary"
          />
          <Card3D 
            icon={<FaClock className="text-green-600 text-2xl" />}
            title="Active Schedules" 
            value={activeSchedules.toString()}
            color="primary"
          />
          <Card3D 
            icon={<FaCheck className="text-purple-600 text-2xl" />}
            title="Completed Today" 
            value={completedToday.toString()}
            color="accent"
          />
        </div>
        
        {/* Main content */}
        <div className="animate-fadeIn mb-8">
          <WateringTable initialData={filteredData} onRefresh={fetchData} />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 my-4 animate-fadeIn">
            <p className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              {error}
            </p>
            <button 
              onClick={fetchData}
              className="mt-2 px-4 py-1 bg-white border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          {/* <p>© 2023 GreenBalcony Plant Watering System. All rights reserved.</p> */}
        </footer>
      </main>
    </div>
  );
}