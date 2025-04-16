'use client';

import React, { useState, useEffect } from 'react';
import { FaRegClock, FaRegCalendarAlt, FaSun, FaMoon } from 'react-icons/fa';

const TimeDate = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      
      // Format time
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      // Check if it's day or night (6 AM to 6 PM is day)
      setIsDay(hours >= 6 && hours < 18);
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTime(`${hours}:${minutes}`);
      
      // Format date
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      };
      setDate(now.toLocaleDateString('en-US', options));
    };

    // Initial update
    updateTime();

    // Set up interval for updates
    const timer = setInterval(updateTime, 10000); // Update every 10 seconds
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm animate-pulse">
          <FaRegClock className="text-green-600/50" />
          <span className="font-medium text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 perspective-1000">
      <div className="px-5 py-3 rounded-xl flex items-center justify-between min-w-[240px] group
                     glass transition-slow hover:shadow-green-400/20 hover:-translate-y-1
                     transform-style-3d hover:rotate-y-10">
        <div className="flex items-center gap-3">
          {isDay ? (
            <div className="bg-amber-100/60 p-2.5 rounded-lg text-amber-600 border border-amber-200/40
                          backdrop-blur-sm transition-all duration-300 hover:bg-amber-100/80">
              <FaSun className="text-sm animate-pulse-soft" />
            </div>
          ) : (
            <div className="bg-blue-100/60 p-2.5 rounded-lg text-blue-600 border border-blue-200/40
                          backdrop-blur-sm transition-all duration-300 hover:bg-blue-100/80">
              <FaMoon className="text-sm animate-pulse-soft" />
            </div>
          )}
          
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-xl tracking-tight group-hover:text-green-700 transition-colors">{time}</span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
        
        <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-200/50 to-transparent mx-1"></div>
        
        <div className="bg-gradient-to-br from-green-500/80 to-green-600/80 
                       text-white px-3 py-1.5 rounded-lg text-xs font-medium
                       backdrop-blur-sm border border-green-400/30 shadow-sm
                       transition-all duration-300 hover:shadow-green-400/30 hover:scale-105">
          LIVE
        </div>
      </div>
    </div>
  );
};

export default TimeDate; 