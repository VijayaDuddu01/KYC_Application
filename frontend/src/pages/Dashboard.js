import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Warning,
  Clock,
  TrendUp,
  ArrowRight,
  Sparkle,
  Lightning
} from '@phosphor-icons/react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#002FA7', '#00875A', '#FFC300', '#E63946', '#111827', '#4B5563'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_scans: 0,
    pending_review: 0,
    tamper_alerts: 0,
    approval_rate: 0
  });
  const [analytics, setAnalytics] = useState({ status_distribution: [], document_types: [], timeline: [] });
  const [recentRequests, setRecentRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, analyticsRes, requestsRes, logsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers }),
        axios.get(`${API}/dashboard/analytics`, { headers }),
        axios.get(`${API}/verify/requests`, { headers }),
        axios.get(`${API}/audit/logs`, { headers })
      ]);

      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setRecentRequests(requestsRes.data.slice(0, 10));
      setAuditLogs(logsRes.data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedDemoData = async () => {
    setSeeding(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/demo/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDashboardData();
    } catch (error) {
      console.error('Error seeding demo:', error);
    } finally {
      setSeeding(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', label: 'Pending' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Processing' },
      extracted: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Extracted' },
      validated: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Validated' },
      needs_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Needs Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Rejected' },
      error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Error' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm border ${config.bg} ${config.text} ${config.border}`}
        style={{ fontFamily: 'IBM Plex Mono' }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="dashboard-page">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider mb-3" style={{ fontFamily: 'IBM Plex Mono' }}>
            <Lightning size={14} weight="fill" /> LIVE SYSTEM
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2" style={{ fontFamily: 'Chivo' }}>
            Verification Dashboard
          </h1>
          <p className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
            AI-orchestrated identity verification with real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.total_scans === 0 && (
            <button
              onClick={seedDemoData}
              disabled={seeding}
              data-testid="seed-demo-button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#002FA7] text-white font-semibold hover:bg-[#001f7a] disabled:bg-gray-300 rounded-none text-sm"
              style={{ fontFamily: 'IBM Plex Sans' }}
            >
              <Sparkle size={16} weight="fill" />
              {seeding ? 'Seeding...' : 'Load Demo Data'}
            </button>
          )}
          <Link
            to="/upload"
            data-testid="upload-cta-button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold hover:bg-gray-800 rounded-none text-sm"
            style={{ fontFamily: 'IBM Plex Sans' }}
          >
            <FileText size={16} />
            Upload Document
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div data-testid="stat-total-scans" className="bg-white border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <FileText size={32} weight="duotone" className="text-[#002FA7]" />
          </div>
          <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Chivo' }}>
            {stats.total_scans}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-600 font-bold" style={{ fontFamily: 'IBM Plex Sans' }}>
            Total Scans
          </div>
        </div>

        <div data-testid="stat-pending-review" className="bg-white border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <Clock size={32} weight="duotone" className="text-[#FFC300]" />
          </div>
          <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Chivo' }}>
            {stats.pending_review}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-600 font-bold" style={{ fontFamily: 'IBM Plex Sans' }}>
            Pending Review
          </div>
        </div>

        <div data-testid="stat-tamper-alerts" className="bg-white border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <Warning size={32} weight="duotone" className="text-[#E63946]" />
          </div>
          <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Chivo' }}>
            {stats.tamper_alerts}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-600 font-bold" style={{ fontFamily: 'IBM Plex Sans' }}>
            Tamper Alerts
          </div>
        </div>

        <div data-testid="stat-approval-rate" className="bg-white border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <TrendUp size={32} weight="duotone" className="text-[#00875A]" />
          </div>
          <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Chivo' }}>
            {stats.approval_rate}%
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-600 font-bold" style={{ fontFamily: 'IBM Plex Sans' }}>
            Approval Rate
          </div>
        </div>
      </div>

      {analytics.status_distribution.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200" data-testid="status-distribution-chart">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                Status Distribution
              </h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={analytics.status_distribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analytics.status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200" data-testid="document-types-chart">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                Document Types
              </h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.document_types}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#4B5563" style={{ fontSize: '12px', fontFamily: 'IBM Plex Mono' }} />
                  <YAxis stroke="#4B5563" style={{ fontSize: '12px', fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#002FA7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200" data-testid="timeline-chart">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                Verification Timeline
              </h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#4B5563" style={{ fontSize: '10px', fontFamily: 'IBM Plex Mono' }} />
                  <YAxis stroke="#4B5563" style={{ fontSize: '12px', fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'IBM Plex Sans' }} />
                  <Line type="monotone" dataKey="uploads" stroke="#002FA7" strokeWidth={2} />
                  <Line type="monotone" dataKey="approved" stroke="#00875A" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejected" stroke="#E63946" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
              Recent Verifications
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="recent-verifications-table">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                      No verification requests yet. <Link to="/upload" className="text-[#002FA7] hover:text-black">Upload a document</Link> or click <button onClick={seedDemoData} className="text-[#002FA7] hover:text-black underline">Load Demo Data</button> to get started.
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50" data-testid={`verification-row-${request.id}`}>
                      <td className="px-6 py-4 text-sm border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Mono' }}>
                        {request.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                        {request.document_type}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-r border-gray-200">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Mono' }}>
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-200">
                        <Link
                          to={`/verification/${request.id}`}
                          data-testid={`view-details-${request.id}`}
                          className="inline-flex items-center gap-1 text-[#002FA7] hover:text-black font-medium"
                        >
                          View <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
              Audit Activity
            </h2>
          </div>
          <div className="p-6 space-y-4" data-testid="audit-activity-list">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No audit logs yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-gray-300 pl-4 pb-4" data-testid={`audit-log-${log.id}`}>
                  <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Mono' }}>
                    {formatDate(log.timestamp)}
                  </div>
                  <div className="text-sm font-medium mb-1" style={{ fontFamily: 'IBM Plex Sans' }}>
                    {log.action.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
                    by {log.user_email}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
