import React, { useState } from 'react';
import { 
  Leaf, 
  Droplets, 
  Clock, 
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Bell
} from 'lucide-react';

// Types
type Status = 'pending' | 'completed' | 'nodata';
type Schedule = {
  id: number;
  time: string;
  duration: number;
  yesterdayStatus: Status;
  todayStatus: Status;
  plantName: string;
};

function App() {
  const [schedules] = useState<Schedule[]>([
    { id: 1, time: '08:00', duration: 5, yesterdayStatus: 'completed', todayStatus: 'pending', plantName: 'Snake Plant' },
    { id: 2, time: '10:30', duration: 3, yesterdayStatus: 'completed', todayStatus: 'completed', plantName: 'Peace Lily' },
    { id: 3, time: '14:00', duration: 7, yesterdayStatus: 'nodata', todayStatus: 'pending', plantName: 'Monstera' },
    { id: 4, time: '16:30', duration: 4, yesterdayStatus: 'completed', todayStatus: 'pending', plantName: 'Spider Plant' },
  ]);

  const [currentTime] = useState(new Date().toLocaleTimeString());
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'completed': return 'bg-[#81C784]';
      case 'pending': return 'bg-yellow-400';
      case 'nodata': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBjNi02IDEyLTEyIDE4LTE4TTIwIDIwYy02IDYtMTIgMTItMTggMThNMjAgMjBjNi02IDEyLTEyIDE4LTE4TTIwIDIwYy02LTYtMTItMTItMTgtMTgiIHN0cm9rZT0iIzJFN0QzMiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-10" />

      <div className="relative">
        {/* Header */}
        <header className="bg-[#2E7D32] text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Leaf className="h-8 w-8" />
                <h1 className="text-2xl font-bold">Plant Watering Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm opacity-80">{currentDate}</p>
                  <p className="text-lg font-semibold">{currentTime}</p>
                </div>
                <button className="relative p-2 hover:bg-[#1B5E20] rounded-full transition-colors">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Total Plants</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Active Schedules</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm opacity-80">System Status</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Watering Schedule</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors">
                  <Filter className="h-5 w-5" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center space-x-1 cursor-pointer">
                        <span>Time</span>
                        <div className="flex flex-col">
                          <ChevronUp className="h-3 w-3" />
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Plant Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Duration (min)</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Yesterday's Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Today's Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{schedule.time}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{schedule.plantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{schedule.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.yesterdayStatus)} text-white`}>
                          {schedule.yesterdayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.todayStatus)} text-white`}>
                          {schedule.todayStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">Showing 1 to 4 of 4 entries</p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;