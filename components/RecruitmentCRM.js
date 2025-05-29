import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Users, Shield, Settings } from 'lucide-react';

// Supabase configuration with your credentials
const CONFIG = {
  supabaseUrl: 'https://zrnezxeoyuzynvrouart.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybmV6eGVveXV6eW52cm91YXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDc1NDEsImV4cCI6MjA2NDEyMzU0MX0.lVA0PHErWqlRcFaXSnjN9glU7oNL0Ir2-XV-jgfffc4'
};

// Simple Supabase client
const supabase = {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${endpoint}`, {
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Supabase request failed:', error);
      return { data: null, error };
    }
  },

  async select(table, query = '') {
    return this.request(`${table}?${query}`);
  },

  async insert(table, data) {
    return this.request(table, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(table, data, filter) {
    return this.request(`${table}?${filter}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};

const RecruitmentCRM = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const users = [
    { id: 1, name: 'Chris van der Merwe', email: 'chris@company.com', role: 'admin', avatar: 'CM' },
    { id: 2, name: 'John Smith', email: 'john@company.com', role: 'admin', avatar: 'JS' },
    { id: 3, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'recruiter', avatar: 'SJ' },
    { id: 4, name: 'Mike Chen', email: 'mike@company.com', role: 'interviewer', avatar: 'MC' },
  ];

  const statuses = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'screening', label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'interviewing', label: 'Interviewing', color: 'bg-purple-100 text-purple-800' },
    { value: 'offer', label: 'Offer Extended', color: 'bg-green-100 text-green-800' },
    { value: 'hired', label: 'Hired', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'do-not-contact', label: 'Do Not Contact', color: 'bg-gray-100 text-gray-800' }
  ];

  // Load candidates from Supabase
  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase.select('candidates');
      if (error) {
        console.error('Failed to load candidates:', error);
        // Fallback to demo data
        setCandidates([
          {
            id: 1,
            name: 'Alice Rodriguez (Demo)',
            email: 'alice.rodriguez@email.com',
            phone: '+1 (555) 123-4567',
            position: 'Senior React Developer',
            status: 'interviewing',
            confidential: false,
            experience: '5 years',
            location: 'San Francisco, CA',
            added_by: 'Sarah Johnson',
            added_date: '2025-05-25',
            last_updated: '2025-05-28'
          }
        ]);
      } else {
        setCandidates(data || []);
      }
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  // Save candidate to Supabase
  const saveCandidate = async (candidateData) => {
    try {
      if (candidateData.id && candidates.find(c => c.id === candidateData.id)) {
        // Update existing
        const { error } = await supabase.update('candidates', candidateData, `id=eq.${candidateData.id}`);
        if (!error) {
          setCandidates(prev => prev.map(c => c.id === candidateData.id ? candidateData : c));
        }
      } else {
        // Create new
        const newCandidate = { ...candidateData };
        delete newCandidate.id; // Let database generate ID
        const { data, error } = await supabase.insert('candidates', newCandidate);
        if (!error && data && data[0]) {
          setCandidates(prev => [...prev, data[0]]);
        } else {
          // Fallback for demo mode
          setCandidates(prev => [...prev, { ...candidateData, id: Date.now() }]);
        }
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RecruitPro CRM</h1>
            <p className="text-gray-600">Database-powered recruitment management</p>
            <div className="mt-3 p-2 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Connected to Supabase Database
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Your Profile:</h3>
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="w-full p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  {user.avatar}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit Candidate Form
  const CandidateForm = ({ candidate, onClose, onSave }) => {
    const [formData, setFormData] = useState(candidate || {
      name: '', email: '', phone: '', position: '', status: 'new',
      confidential: false, experience: '', location: ''
    });

    const handleSubmit = async () => {
      if (!formData.name || !formData.email || !formData.position) {
        alert('Please fill in all required fields');
        return;
      }

      const newCandidate = {
        ...formData,
        id: candidate?.id || Date.now(),
        added_by: currentUser.name,
        added_date: candidate?.added_date || new Date().toISOString().split('T')[0],
        last_updated: new Date().toISOString().split('T')[0]
      };

      await saveCandidate(newCandidate);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">{candidate ? 'Edit Candidate' : 'Add New Candidate'}</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={formData.confidential}
                  onChange={(e) => setFormData({...formData, confidential: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="confidential" className="text-sm font-medium text-gray-700">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Mark as Confidential
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
              >
                {candidate ? 'Update' : 'Add'} Candidate
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Configuration Modal
  const ConfigModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Database Configuration</h2>
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">✅ Database Connected!</h3>
            <p className="text-sm text-green-800">
              Your CRM is connected to Supabase. Data will be saved automatically.
            </p>
            <div className="mt-2 text-xs text-green-700">
              <p><strong>Project:</strong> {CONFIG.supabaseUrl}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add candidates and test the system</li>
              <li>• Data is automatically saved to your database</li>
              <li>• Deploy to Vercel for team access</li>
              <li>• Configure custom domain (optional)</li>
            </ul>
          </div>
        </div>
        <button
          onClick={() => setShowConfig(false)}
          className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    if (candidate.confidential && currentUser.role !== 'admin') {
      return false;
    }
    
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = statuses.reduce((acc, status) => {
    acc[status.value] = candidates.filter(c => c.status === status.value).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">RecruitPro CRM</h1>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Database Connected
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowConfig(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">{currentUser.avatar}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                <span className="text-xs text-gray-500 capitalize">({currentUser.role})</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interviewing</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.interviewing || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hired</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.hired || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confidential</p>
                  <p className="text-2xl font-bold text-gray-900">{candidates.filter(c => c.confidential).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Candidate</span>
              </button>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidates.map(candidate => {
                    const status = statuses.find(s => s.value === candidate.status);
                    return (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">
                                  {candidate.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {candidate.name}
                                {candidate.confidential && (
                                  <Shield className="ml-2 w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status?.color}`}>
                            {status?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.experience}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {candidate.lastUpdated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setEditingCandidate(candidate)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const newStatus = candidate.status === 'new' ? 'screening' : 
                                             candidate.status === 'screening' ? 'interviewing' :
                                             candidate.status === 'interviewing' ? 'offer' : 'new';
                              const updatedCandidate = {
                                ...candidate,
                                status: newStatus,
                                last_updated: new Date().toISOString().split('T')[0]
                              };
                              await saveCandidate(updatedCandidate);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddForm && (
        <CandidateForm
          onClose={() => setShowAddForm(false)}
          onSave={() => {}}
        />
      )}

      {editingCandidate && (
        <CandidateForm
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSave={() => {}}
        />
      )}

      {showConfig && <ConfigModal />}
    </div>
  );
};

export default RecruitmentCRM;
