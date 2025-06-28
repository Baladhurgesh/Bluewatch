import React, { useState } from 'react';
import {
  Bell, Droplets, Users, AlertTriangle, ClipboardCheck
} from 'lucide-react';

const mockOperatorData = {
  user: {
    name: 'John Smith',
    role: 'Primary Operator',
    systems: [
      { pwsid: 'GA0010000', name: 'BAXLEY WATER SYSTEM', role: 'primary' },
      { pwsid: 'GA0670002', name: 'ATLANTA WATER SYSTEM', role: 'backup' }
    ]
  },
  currentSystem: {
    pwsid: 'GA0010000',
    name: 'BAXLEY WATER SYSTEM',
    population: 5749,
    connections: 2576,
    source: 'Groundwater',
    lastInspection: '2024-11-15'
  },
  complianceTasks: [
    {
      id: 1,
      type: 'TCR_SAMPLE',
      title: 'Monthly Coliform Sampling',
      dueDate: '2025-02-01',
      status: 'upcoming',
      assignedTo: 'John Smith',
      locations: 5,
      completed: 0
    },
    {
      id: 2,
      type: 'LCR_SAMPLE',
      title: 'Lead and Copper Sampling',
      dueDate: '2025-01-15',
      status: 'overdue',
      assignedTo: 'John Smith',
      locations: 10,
      completed: 7
    },
    {
      id: 3,
      type: 'DBP_SAMPLE',
      title: 'Disinfection Byproducts Quarterly',
      dueDate: '2025-03-31',
      status: 'future',
      assignedTo: 'John Smith',
      locations: 2,
      completed: 0
    },
    {
      id: 4,
      type: 'CCR_REPORT',
      title: 'Consumer Confidence Report',
      dueDate: '2025-07-01',
      status: 'future',
      assignedTo: 'Admin',
      locations: 0,
      completed: 0
    }
  ],
  recentViolations: [
    {
      id: 'V2025-001',
      date: '2025-01-10',
      type: 'MCL',
      contaminant: 'Nitrate',
      status: 'active',
      publicNotice: 'required'
    }
  ],
  notifications: [
    {
      id: 1,
      type: 'violation',
      priority: 'high',
      title: 'MCL Violation - Nitrate',
      message: 'Nitrate levels exceeded MCL. Public notice required within 30 days.',
      date: '2025-01-10',
      read: false
    },
    {
      id: 2,
      type: 'task',
      priority: 'medium',
      title: 'Lead & Copper Sampling Overdue',
      message: '3 samples still needed to complete LCR monitoring.',
      date: '2025-01-16',
      read: false
    }
  ]
};

function OperatorDashboard() {
  const [selectedSystem] = useState(mockOperatorData.currentSystem);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const tasks = mockOperatorData.complianceTasks;

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'upcoming': return 'text-yellow-600 bg-yellow-50';
      case 'future': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const taskCounts = {
    overdue: tasks.filter(t => t.status === 'overdue').length,
    upcoming: tasks.filter(t => t.status === 'upcoming').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    total: tasks.length
  };

  const unreadNotifications = mockOperatorData.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Droplets className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
              <p className="text-sm text-gray-600">{selectedSystem.name} • PWS ID: {selectedSystem.pwsid}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{mockOperatorData.user.name}</p>
                <p className="text-xs text-gray-600">{mockOperatorData.user.role}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 flex gap-6 border-t">
          {['overview', 'compliance', 'samples', 'reports', 'violations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {showNotifications && (
        <div className="absolute right-6 top-20 bg-white shadow-lg rounded-lg w-96 z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y">
            {mockOperatorData.notifications.map((n) => (
              <li key={n.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  {n.type === 'violation' ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                  ) : (
                    <ClipboardCheck className="w-5 h-5 text-yellow-600 mt-1" />
                  )}
                  <div>
                    <h4 className="text-sm font-medium">{n.title}</h4>
                    <p className="text-xs text-gray-500">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.date}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <main className="px-6 py-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2">System Overview</h2>
              <p className="text-sm">Population: {selectedSystem.population}</p>
              <p className="text-sm">Connections: {selectedSystem.connections}</p>
              <p className="text-sm">Source: {selectedSystem.source}</p>
              <p className="text-sm">Last Inspection: {selectedSystem.lastInspection}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Compliance Tasks</h2>
              <ul className="space-y-2">
                <li>Overdue: {taskCounts.overdue}</li>
                <li>Upcoming: {taskCounts.upcoming}</li>
                <li>Completed: {taskCounts.completed}</li>
                <li>Total: {taskCounts.total}</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Active Violations</h2>
              {mockOperatorData.recentViolations.length === 0 ? (
                <p className="text-sm text-gray-500">No active violations.</p>
              ) : (
                mockOperatorData.recentViolations.map((v) => (
                  <div key={v.id} className="text-sm mb-2">
                    <p><strong>{v.contaminant}</strong> ({v.type}) - {v.status}</p>
                    <p className="text-xs text-gray-500">Public Notice: {v.publicNotice}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Compliance Task Center</h2>
            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => (
                <div key={task.id} className={`rounded-lg border p-4 ${getStatusColor(task.status)}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-xs text-gray-600">Due: {task.dueDate} • Locations: {task.locations}</p>
                    </div>
                    <span className="text-sm">{getDaysUntilDue(task.dueDate)} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OperatorDashboard;

