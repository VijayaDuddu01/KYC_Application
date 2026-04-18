import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClockCounterClockwise, User, FileText } from '@phosphor-icons/react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/audit/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action) => {
    if (action.includes('approve')) return 'text-green-600 bg-green-50 border-green-200';
    if (action.includes('reject')) return 'text-red-600 bg-red-50 border-red-200';
    if (action.includes('upload')) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="audit-logs-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tighter mb-2" style={{ fontFamily: 'Chivo' }}>
          Audit Logs
        </h1>
        <p className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
          Complete audit trail of all verification activities
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center" data-testid="no-logs-message">
          <ClockCounterClockwise size={64} weight="duotone" className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Chivo' }}>
            No Audit Logs
          </h2>
          <p className="text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
            Audit logs will appear here as actions are performed.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="audit-logs-table">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50" data-testid={`audit-log-row-${log.id}`}>
                    <td className="px-6 py-4 text-sm border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Mono' }}>
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-r border-gray-200">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm border ${getActionColor(log.action)}`}
                        style={{ fontFamily: 'IBM Plex Mono' }}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <span style={{ fontFamily: 'IBM Plex Sans' }}>{log.user_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Mono' }}>
                      {log.request_id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                      {log.details && Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
