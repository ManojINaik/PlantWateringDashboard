import React, { useState, useEffect } from 'react';
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
type Status = 'pending' | 'completed' | 'no data';
type Schedule = {
  ID: number;
  schedule_time: string;
  duration: string;
  yesterday_flow: Status;
  today_flow: Status;
  active: boolean;
  weather_enabled: boolean;
};

function App() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPlants, setTotalPlants] = useState<number>(0);
  const [activeSchedules, setActiveSchedules] = useState<number>(0);

  const [currentTime] = useState(new Date().toLocaleTimeString());
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  useEffect(() => {
    const fetchWateringData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/watering-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setSchedules(data);
        setTotalPlants(data.length);
        setActiveSchedules(data.filter((schedule: Schedule) => schedule.active).length);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching watering data:', err);
        setError('Failed to load watering data. Please try again later.');
        setLoading(false);
      }
    };

    fetchWateringData();
  }, []);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'completed': return 'bg-[#81C784]';
      case 'pending': return 'bg-yellow-400';
      case 'no data': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Format the schedule time to show only the time part
  const formatTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return dateTimeString;
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
                  <p className="text-2xl font-bold">{totalPlants}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Active Schedules</p>
                  <p className="text-2xl font-bold">{activeSchedules}</p>
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

            {/* Loading and Error States */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading watering data...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p>{error}</p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Duration</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Yesterday's Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Today's Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Weather Enabled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.ID} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{formatTime(schedule.schedule_time)}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{schedule.ID}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{schedule.duration}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.yesterday_flow)} text-white`}>
                            {schedule.yesterday_flow}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.today_flow)} text-white`}>
                            {schedule.today_flow}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {schedule.weather_enabled ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Showing 1 to {schedules.length} of {schedules.length} entries
                </p>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;