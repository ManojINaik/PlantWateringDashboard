'use client';

import React, { useState, useEffect } from 'react';
import { FaRegClock, FaRegCalendarAlt } from 'react-icons/fa';

const TimeDate = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      
      // Format time
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTime(`${hours}:${minutes}:${seconds} ${ampm}`);
      
      // Format date
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setDate(now.toLocaleDateString('en-US', options));
    };

    // Initial update
    updateTime();

    // Set up interval for updates
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm animate-pulse">
          <FaRegClock className="text-green-600/50" />
          <span className="font-medium text-gray-400">Loading...</span>
        </div>
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm animate-pulse">
          <FaRegCalendarAlt className="text-green-600/50" />
          <span className="font-medium text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm animate-fadeIn">
        <FaRegClock className="text-green-600" />
        <span className="font-medium text-gray-700">{time}</span>
      </div>
      
      <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm animate-fadeIn">
        <FaRegCalendarAlt className="text-green-600" />
        <span className="font-medium text-gray-700">{date}</span>
      </div>
    </div>
  );
};

export default TimeDate; 