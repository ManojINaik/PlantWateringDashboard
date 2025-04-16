"use client";

import React, { useEffect, useState } from "react";
import { FaUser, FaSearch, FaUserCheck, FaUserTimes, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TimeDate from '@/components/TimeDate';

interface User {
  userID: number;
  firstname: string;
  lastname: string;
  city: string;
  district: string;
  state: string;
  active: boolean;
}

type SortField = 'userID' | 'name' | 'city' | 'district' | 'state' | 'active';
type SortDirection = 'asc' | 'desc';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('userID');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/users");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please check if the server is running.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.userID?.toString().includes(lowerTerm) ||
        user.firstname?.toLowerCase().includes(lowerTerm) ||
        user.lastname?.toLowerCase().includes(lowerTerm) ||
        user.city?.toLowerCase().includes(lowerTerm) ||
        user.district?.toLowerCase().includes(lowerTerm) ||
        user.state?.toLowerCase().includes(lowerTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field === sortField) {
      return sortDirection === 'asc' ? 
        <FaSortUp className="ml-1 text-green-600" /> : 
        <FaSortDown className="ml-1 text-green-600" />;
    }
    return <FaSort className="ml-1 text-gray-400" />;
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.active).length;

  // Memoized sorting logic
  const sortedUsers = React.useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Handle special case for name which combines firstname and lastname
      if (sortField === 'name') {
        aValue = `${a.firstname} ${a.lastname}`.toLowerCase();
        bValue = `${b.firstname} ${b.lastname}`.toLowerCase();
      } else {
        aValue = a[sortField as keyof User];
        bValue = b[sortField as keyof User];
        
        // Convert to lowercase for string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredUsers, sortField, sortDirection]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Sidebar />
      
      <main className="flex-1 p-10 relative ml-64">
        {/* Absolutely positioned sticky TimeDate */}
        <div className="fixed right-12 top-6 z-50">
          <TimeDate />
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-green-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-green-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 relative animate-fadeIn">
            <FaUser className="text-green-600" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500">
              User Management
            </span>
            <span className="absolute bottom-[-8px] left-0 w-24 h-1 bg-gradient-to-r from-green-500 to-transparent rounded"></span>
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
        
        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaUserCheck className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="glass-effect rounded-2xl p-6 shadow-soft-xl animate-fadeIn">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span>
              User List
            </h2>
            
            <div className="text-sm text-gray-500">
              {loading ? "Loading data..." : `Showing ${sortedUsers.length} of ${users.length} users`}
            </div>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
                      onClick={() => handleSort('userID')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        ID {getSortIcon('userID')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        Name {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
                      onClick={() => handleSort('city')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        City {getSortIcon('city')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
                      onClick={() => handleSort('district')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        District {getSortIcon('district')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
                      onClick={() => handleSort('state')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        State {getSortIcon('state')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
                      onClick={() => handleSort('active')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        Status {getSortIcon('active')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr key={user.userID} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2.5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {user.userID}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.firstname} {user.lastname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.district}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.state}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.active ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <FaUserCheck className="mr-1" /> Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            <FaUserTimes className="mr-1" /> Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 