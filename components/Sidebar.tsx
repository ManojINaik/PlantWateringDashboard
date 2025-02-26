import React, { useState } from 'react';
import { 
  FaHome, 
  FaLeaf, 
  FaChartLine, 
  FaCog, 
  FaCalendarAlt, 
  FaSignOutAlt, 
  FaChevronRight,
  FaBell,
  FaUserCircle
} from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <FaHome className="text-xl" />, href: '/' },
    { id: 'Plants', label: 'Plants', icon: <FaLeaf className="text-xl" />, href: '#' },
    { id: 'Schedules', label: 'Schedules', icon: <FaCalendarAlt className="text-xl" />, href: '#' },
    { id: 'Analytics', label: 'Analytics', icon: <FaChartLine className="text-xl" />, href: '#' },
    { id: 'Settings', label: 'Settings', icon: <FaCog className="text-xl" />, href: '#' },
  ];

  return (
    <aside className="w-64 h-screen bg-gradient-to-br from-green-800 to-green-900 text-white p-6 flex flex-col shadow-xl fixed top-0 left-0 overflow-y-auto z-50">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 mb-10 relative">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md transform transition-transform hover:scale-105">
          <Image 
            src="/plant-svgrepo-com.svg" 
            alt="Plant Logo" 
            width={30} 
            height={30}
            className="text-green-600"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">Ukshathi</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-green-400 to-transparent rounded mt-1"></div>
        </div>
      </div>

      {/* User profile snapshot */}
      <div className="mb-8 glass p-3 rounded-xl flex items-center gap-3">
        <div className="relative">
          <FaUserCircle className="text-3xl text-white/90" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-green-900"></div>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm text-white/90">Admin User</h4>
          <p className="text-xs text-white/60">Plant Manager</p>
        </div>
        <div className="relative">
          <FaBell className="text-white/70 hover:text-white transition-colors" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <h3 className="text-xs uppercase text-green-300/60 font-semibold tracking-wider mb-4 pl-3">
          Main Menu
        </h3>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link 
                href={item.href}
                onClick={() => setActiveMenu(item.id)}
                className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  activeMenu === item.id 
                    ? 'bg-green-600/30 text-white shadow-sm' 
                    : 'hover:bg-green-600/20 text-white/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-all ${activeMenu === item.id ? 'text-white' : 'text-green-400'}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
                
                <FaChevronRight className={`text-xs opacity-0 transform transition-all ${
                  activeMenu === item.id ? 'opacity-100' : 'group-hover:opacity-70'
                }`} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-green-700/30">
        <Link 
          href="#" 
          className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-red-500/20 transition-all text-white/80 hover:text-white group"
        >
          <div className="flex items-center gap-3">
            <FaSignOutAlt className="text-xl text-red-400 group-hover:text-red-300" />
            <span>Logout</span>
          </div>
          <FaChevronRight className="text-xs opacity-0 group-hover:opacity-70" />
        </Link>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-6 right-6 w-20 h-20 bg-green-400/5 rounded-full blur-xl"></div>
      <div className="absolute top-40 left-0 w-10 h-40 bg-green-400/10 rounded-full blur-xl"></div>
    </aside>
  );
};

export default Sidebar; 