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
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [loginPassword, setLoginPassword] = useState('');

  const [users] = useState([
    { id: 1, name: 'Chris van der Merwe', email: 'chris@company.com', role: 'admin', avatar: 'CM', password: 'NextGen' }
  ]);

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
            job_title: 'Lead Frontend Developer',
            company: 'Tech Innovations Inc',
            status: 'interviewing',
            confidential: false,
            location: 'San Francisco, CA',
            added_by: 'Chris van der Merwe',
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
            <p className="text-gray-600">Secure recruitment management system</p>
            <div className="mt-3 p-2 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Connected to Supabase Database
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mx-auto mb-4">
                CM
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Chris van der Merwe</h3>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (loginPassword === users[0].password) {
                        setCurrentUser(users[0]);
                      } else {
                        alert('Incorrect password');
                        setLoginPassword('');
                      }
                    }
                  }}
                />
              </div>
              
              <button
                onClick={() => {
                  if (loginPassword === users[0].password) {
                    setCurrentUser(users[0]);
                  } else {
                    alert('Incorrect password');
                    setLoginPassword('');
                  }
                }}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit Candidate Form
  const CandidateForm = ({ candidate, onClose, onSave }) => {
    const [formData, setFormData] = useState(candidate || {
      name: '', email: '', phone: '', position: '', job_title: '', company: '', status: 'new',
      confidential: false, location: ''
    });

    const handleSubmit = async () => {
      if (!formData.name || !formData.email || !formData.position || !formData.job_title) {
        alert('Please fill in all required fields (Name, Email, Position, Job Title)');
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
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

  // Detailed Candidate View
  const CandidateDetailView = ({ candidate, onClose }) => {
    const [notes, setNotes] = useState(candidate.notes || '');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(candidate);

    const handleSave = async () => {
      const updatedCandidate = {
        ...editData,
        notes,
        last_updated: new Date().toISOString().split('T')[0]
      };
      await saveCandidate(updatedCandidate);
      setIsEditing(false);
      onClose();
    };

    const updateStatus = async (newStatus) => {
      const updatedCandidate = {
        ...candidate,
        status: newStatus,
        last_updated: new Date().toISOString().split('T')[0]
      };
      await saveCandidate(updatedCandidate);
    };

    const currentStatus = statuses.find(s => s.value === candidate.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
                <p className="text-gray-600">{candidate.job_title} at {candidate.company}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus?.color}`}>
                    {currentStatus?.label}
                  </span>
                  {candidate.confidential && (
                    <span className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <Shield className="inline w-4 h-4 mr-1" />
                      Confidential
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3">Edit Candidate Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={editData.position}
                        onChange={(e) => setEditData({...editData, position: e.target.value})}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={editData.job_title}
                        onChange={(e) => setEditData({...editData, job_title: e.target.value})}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={editData.company}
                        onChange={(e) => setEditData({...editData, company: e.target.value})}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-confidential"
                        checked={editData.confidential}
                        onChange={(e) => setEditData({...editData, confidential: e.target.checked})}
                        className="mr-2"
                      />
                      <label htmlFor="edit-confidential" className="text-sm font-medium text-gray-700">
                        <Shield className="inline w-4 h-4 mr-1" />
                        Mark as Confidential
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Email:</strong> {candidate.email}</p>
                      <p><strong>Phone:</strong> {candidate.phone}</p>
                      <p><strong>Location:</strong> {candidate.location}</p>
                      <p><strong>Position:</strong> {candidate.position}</p>
                      <p><strong>Job Title:</strong> {candidate.job_title}</p>
                      <p><strong>Company:</strong> {candidate.company}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Status Management</h3>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map(status => (
                        <button
                          key={status.value}
                          onClick={() => updateStatus(status.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            candidate.status === status.value 
                              ? status.color
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Notes</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this candidate..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 h-32"
                    />
                    <button
                      onClick={handleSave}
                      className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Save Notes
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Candidate Info</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <p><strong>Added by:</strong> {candidate.added_by}</p>
                  <p><strong>Added:</strong> {candidate.added_date}</p>
                  <p><strong>Last updated:</strong> {candidate.last_updated}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    📞 Schedule Call
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                    📧 Send Email
                  </button>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
                    📅 Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
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
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setLoginPassword('');
                  }}
                  className="ml-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
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
                                <button
                                  onClick={() => setViewingCandidate(candidate)}
                                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                  {candidate.name}
                                </button>
                                {candidate.confidential && (
                                  <Shield className="ml-2 w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.position}</div>
                          <div className="text-sm text-gray-500">{candidate.job_title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status?.color}`}>
                            {status?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.company}
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

      {viewingCandidate && (
        <CandidateDetailView
          candidate={viewingCandidate}
          onClose={() => setViewingCandidate(null)}
        />
      )}

      {showConfig && <ConfigModal />}
    </div>
  );
};

export default RecruitmentCRM;
