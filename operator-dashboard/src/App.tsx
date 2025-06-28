import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaFilter,
  FaWater,
  FaSearch,
  FaInfoCircle,
  FaTimes,
  FaFilePdf,
  FaChartLine,
  FaUsers,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding,
  FaCalendarAlt,
  FaDownload,
  FaBell,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { saveAs } from "file-saver";
import { LetterGenerator } from "./components/LetterGenerator";

// Icon typing
const Icons = {
  Tasks: FaTasks as React.ComponentType<{ className?: string }>,
  Check: FaCheckCircle as React.ComponentType<{ className?: string }>,
  Exclaim: FaExclamationCircle as React.ComponentType<{ className?: string }>,
  Clock: FaClock as React.ComponentType<{ className?: string }>,
  Filter: FaFilter as React.ComponentType<{ className?: string }>,
  Water: FaWater as React.ComponentType<{ className?: string }>,
  Search: FaSearch as React.ComponentType<{ className?: string }>,
  Info: FaInfoCircle as React.ComponentType<{ className?: string }>,
  Times: FaTimes as React.ComponentType<{ className?: string }>,
  Pdf: FaFilePdf as React.ComponentType<{ className?: string }>,
  Chart: FaChartLine as React.ComponentType<{ className?: string }>,
  Users: FaUsers as React.ComponentType<{ className?: string }>,
  Location: FaMapMarkerAlt as React.ComponentType<{ className?: string }>,
  Phone: FaPhoneAlt as React.ComponentType<{ className?: string }>,
  Email: FaEnvelope as React.ComponentType<{ className?: string }>,
  Building: FaBuilding as React.ComponentType<{ className?: string }>,
  Calendar: FaCalendarAlt as React.ComponentType<{ className?: string }>,
  Download: FaDownload as React.ComponentType<{ className?: string }>,
  Bell: FaBell as React.ComponentType<{ className?: string }>,
  ChevronRight: FaChevronRight as React.ComponentType<{ className?: string }>,
  ChevronDown: FaChevronDown as React.ComponentType<{ className?: string }>,
};

// Design System Colors
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Utility function for classNames
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// Custom tooltip style
const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  padding: '12px',
};

export default function App() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedSystemIdx, setSelectedSystemIdx] = useState(0);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [generatedLetters, setGeneratedLetters] = useState<any[]>([]);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load dashboard data
  useEffect(() => {
    fetch("/dashboard_data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <Icons.Exclaim className="text-6xl text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-700">Error: {error || "No data found"}</p>
        </div>
      </div>
    );
  }

  const system = data[selectedSystemIdx];
  const violations = system.violations_enforcement || [];
  const events = system.events_milestones || [];
  const lcrSamples = system.lcr_samples || [];

  // Task generation functions
  const calculateDaysLeft = (dueDate: string): number => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const generateTasksFromViolations = (violations: any[]): any[] => {
    if (!violations || violations.length === 0) return [];
    
    const uniqueViolations = new Map();
    
    violations.forEach((violation, index) => {
      const uniqueKey = `${violation.violation_id || 'unknown'}-${violation.violation_type || 'unknown'}-${violation.contaminant_code || 'unknown'}`;
      
      if (!uniqueViolations.has(uniqueKey)) {
        const dueDate = violation.violation_begin_date || violation.first_reported || '2024-12-31';
        const daysLeft = calculateDaysLeft(dueDate);
        
        let taskStatus = 'Upcoming';
        if (violation.status === 'Resolved' || violation.status === 'Closed') {
          taskStatus = 'Completed';
        } else if (daysLeft < 0) {
          taskStatus = 'Overdue';
        } else if (daysLeft <= 7) {
          taskStatus = 'Due Soon';
        }
        
        const task = {
          id: `violation-${violation.violation_id || index}`,
          name: `${violation.violation_type} - ${violation.contaminant_name}`,
          type: 'Violation',
          due: dueDate,
          status: taskStatus,
          daysLeft: daysLeft,
          locations: violation.requires_action ? '1' : '0',
          priority: violation.priority || 'Medium',
          description: `Violation ID: ${violation.violation_id}, Code: ${violation.violation_code}`,
          violation: violation
        };
        
        uniqueViolations.set(uniqueKey, task);
      }
    });
    
    return Array.from(uniqueViolations.values());
  };

  const tasks = generateTasksFromViolations(violations);

  // Add event tasks
  events.forEach((e: any) => {
    tasks.push({
      name: e.event_milestone_code || "Event",
      due: e.event_end_date || e.event_actual_date || "",
      locations: 1,
      daysLeft: e.event_end_date ? calculateDaysLeft(e.event_end_date) : 0,
      status: e.event_end_date && new Date(e.event_end_date) < new Date() ? 'Overdue' : 'On Track',
      details: e,
      type: 'Event',
    });
  });

  const filteredTaskList = tasks.filter((t: any) => 
    t.name && 
    (!filter || t.status === filter) && 
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const summaryData = [
    { 
      label: "Total Tasks", 
      value: filteredTaskList.length, 
      color: colors.primary[600], 
      bgColor: colors.primary[50],
      icon: Icons.Tasks 
    },
    { 
      label: "On Track", 
      value: filteredTaskList.filter((t: any) => t.status === 'On Track').length, 
      color: colors.success[600], 
      bgColor: colors.success[50],
      icon: Icons.Check 
    },
    { 
      label: "Overdue", 
      value: filteredTaskList.filter((t: any) => t.status === 'Overdue').length, 
      color: colors.danger[600], 
      bgColor: colors.danger[50],
      icon: Icons.Exclaim 
    },
    { 
      label: "Upcoming", 
      value: filteredTaskList.filter((t: any) => t.status === 'Upcoming').length, 
      color: colors.warning[600], 
      bgColor: colors.warning[50],
      icon: Icons.Clock 
    },
    { 
      label: "Letters", 
      value: generatedLetters.length, 
      color: colors.primary[600], 
      bgColor: colors.primary[50],
      icon: Icons.Pdf 
    },
  ];

  const pieData = summaryData.slice(1, 4).map((s) => ({
    name: s.label,
    value: s.value,
    color: s.color,
  }));

  const downloadCSV = () => {
    const header = ["Name", "Due", "Locations", "Days Left", "Status"];
    const rows = filteredTaskList.map((t: any) => [t.name, t.due, t.locations, t.daysLeft, t.status]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "tasks.csv");
  };

  const info = system;
  const geo = info.geographic_areas?.[0] || {};
  const address = info.address || {};
  const contact = info.contact || {};

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Icons.Chart },
    { id: 'tasks', label: 'Compliance Tasks', icon: Icons.Tasks },
    { id: 'violations', label: 'Violations', icon: Icons.Exclaim },
    { id: 'reports', label: 'Reports & Letters', icon: Icons.Pdf },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <Icons.Water className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Operator Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium">{info.name}</p>
              </div>
            </div>

            {/* System Selector and Actions */}
            <div className="flex items-center space-x-4">
              <select
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedSystemIdx}
                onChange={e => setSelectedSystemIdx(Number(e.target.value))}
              >
                {data.map((sys, idx) => (
                  <option key={idx} value={idx}>{sys.name} ({sys.pwsid})</option>
                ))}
              </select>
              
              <button className="relative p-2 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <Icons.Bell className="text-gray-600 text-xl" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    "flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200",
                    activeTab === tab.id
                      ? "text-blue-600 border-blue-600 bg-blue-50/50"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="text-lg" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Info Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 cursor-pointer"
                onClick={() => setShowSystemInfo(!showSystemInfo)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Icons.Building className="text-white text-3xl" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">System Information</h2>
                      <p className="text-blue-100">PWS ID: {info.pwsid} • {info.type}</p>
                    </div>
                  </div>
                  <Icons.ChevronDown className={`text-white text-2xl transform transition-transform duration-200 ${showSystemInfo ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {showSystemInfo && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <Icons.Info className="mr-2 text-blue-500" />
                      Basic Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Primary Source:</span>
                        <span className="font-medium">{info.primary_source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Population Served:</span>
                        <span className="font-medium">{info.population_served?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Connections:</span>
                        <span className="font-medium">{info.service_connections?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <Icons.Location className="mr-2 text-blue-500" />
                      Location
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-600">
                        {address.line1} {address.line2}
                      </div>
                      <div className="text-gray-600">
                        {address.city}, {address.state} {address.zip}
                      </div>
                      <div className="text-gray-600">
                        County: {geo.county}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <Icons.Phone className="mr-2 text-blue-500" />
                      Contact
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-600">
                        <Icons.Users className="inline mr-2" />
                        {contact.admin_name}
                      </div>
                      <div className="text-gray-600">
                        <Icons.Phone className="inline mr-2" />
                        {contact.phone}
                      </div>
                      <div className="text-gray-600">
                        <Icons.Email className="inline mr-2" />
                        {contact.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {summaryData.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                           style={{ backgroundColor: item.bgColor }}>
                        <div style={{ color: item.color }}>
                          <Icon className={`text-2xl`} />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{item.label}</p>
                      <p className="text-3xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                    <div className="h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style={{ backgroundImage: `linear-gradient(to right, ${item.color}, ${item.bgColor})` }}></div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Icons.Chart className="mr-2 text-blue-500" />
                  Task Status Overview
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value, entry: any) => (
                        <span style={{ color: entry?.color || '#000' }}>{value}: {entry?.payload?.value || 0}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Icons.Calendar className="mr-2 text-blue-500" />
                  Task Timeline
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Overdue', value: filteredTaskList.filter(t => t.status === 'Overdue').length, fill: colors.danger[500] },
                      { name: 'Due Today', value: filteredTaskList.filter(t => t.daysLeft === 0).length, fill: colors.warning[500] },
                      { name: 'This Week', value: filteredTaskList.filter(t => t.daysLeft > 0 && t.daysLeft <= 7).length, fill: colors.primary[500] },
                      { name: 'This Month', value: filteredTaskList.filter(t => t.daysLeft > 7 && t.daysLeft <= 30).length, fill: colors.success[500] },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
                    <XAxis dataKey="name" tick={{ fill: colors.gray[600] }} />
                    <YAxis tick={{ fill: colors.gray[600] }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Icons.Filter className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {["", "On Track", "Overdue", "Upcoming"].map((status) => (
                    <button
                      key={status || "all"}
                      onClick={() => setFilter(status)}
                      className={classNames(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                        filter === status
                          ? status === "On Track"
                            ? "bg-green-500 text-white shadow-lg"
                            : status === "Overdue"
                            ? "bg-red-500 text-white shadow-lg"
                            : status === "Upcoming"
                            ? "bg-yellow-500 text-white shadow-lg"
                            : "bg-blue-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {status || "All"} 
                      {status && (
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full">
                          {summaryData.find(s => s.label === status)?.value || 0}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex items-center justify-end space-x-4">
                  <div className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  
                  <button
                    onClick={downloadCSV}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Icons.Download />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTaskList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Icons.Info className="mx-auto text-4xl text-gray-300 mb-4" />
                          <p className="text-gray-500">No tasks found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTaskList.map((task: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                task.status === 'Overdue' ? 'bg-red-500' :
                                task.status === 'Upcoming' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{task.name}</p>
                                <p className="text-sm text-gray-500">{task.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-gray-900">{task.due}</p>
                              <p className="text-sm text-gray-500">
                                {task.daysLeft < 0 ? `${Math.abs(task.daysLeft)} days overdue` :
                                 task.daysLeft === 0 ? 'Due today' :
                                 `${task.daysLeft} days left`}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={classNames(
                              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                              task.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                              task.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                              task.status === 'Due Soon' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            )}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={classNames(
                              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                              task.priority === 'High' ? 'bg-red-100 text-red-800' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1 group"
                            >
                              <span>View Details</span>
                              <Icons.ChevronRight className="group-hover:translate-x-1 transition-transform duration-200" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'violations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Icons.Exclaim className="mr-3 text-red-500" />
                Violation Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <Icons.Exclaim className="text-3xl text-red-500 mb-4" />
                  <h3 className="font-semibold text-red-900 mb-2">Active Violations</h3>
                  <p className="text-3xl font-bold text-red-600">{violations.filter((v: any) => v.status === 'Active').length}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <Icons.Clock className="text-3xl text-yellow-500 mb-4" />
                  <h3 className="font-semibold text-yellow-900 mb-2">Pending Review</h3>
                  <p className="text-3xl font-bold text-yellow-600">{violations.filter((v: any) => v.status === 'Pending').length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <Icons.Check className="text-3xl text-green-500 mb-4" />
                  <h3 className="font-semibold text-green-900 mb-2">Resolved</h3>
                  <p className="text-3xl font-bold text-green-600">{violations.filter((v: any) => v.status === 'Resolved').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <LetterGenerator
              system={system}
              violations={violations}
              tasks={tasks}
              onLetterGenerated={(letter) => {
                setGeneratedLetters(prev => [...prev, letter]);
              }}
            />
          </div>
        )}
      </main>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{selectedTask.name}</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                >
                  <Icons.Times className="text-xl" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Task Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                  <p className="font-semibold text-gray-900">{selectedTask.type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span className={classNames(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    selectedTask.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                    selectedTask.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  )}>
                    {selectedTask.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Due Date</p>
                  <p className="font-semibold text-gray-900">{selectedTask.due}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Days Left</p>
                  <p className="font-semibold text-gray-900">{selectedTask.daysLeft}</p>
                </div>
              </div>

              {/* Violation Details */}
              {selectedTask.violation && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Icons.Exclaim className="mr-2 text-red-500" />
                    Violation Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Violation ID</p>
                      <p className="font-medium text-gray-900">{selectedTask.violation.violation_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Contaminant</p>
                      <p className="font-medium text-gray-900">{selectedTask.violation.contaminant_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Category</p>
                      <p className="font-medium text-gray-900">{selectedTask.violation.violation_category}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Priority</p>
                      <span className={classNames(
                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                        selectedTask.violation.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      )}>
                        {selectedTask.violation.priority}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium">
                  Mark as Complete
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}