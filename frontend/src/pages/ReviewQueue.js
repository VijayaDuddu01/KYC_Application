import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Warning, CheckCircle, ArrowRight, Eye } from '@phosphor-icons/react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReviewQueue = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/verify/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const needsReview = response.data.filter(
        (req) => req.status === 'needs_review'
      );
      setRequests(needsReview);
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, decision) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/verify/requests/${requestId}/review`,
        {
          decision,
          notes: reviewNotes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReviewingId(null);
      setReviewNotes('');
      fetchReviewQueue();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
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
        <div className="text-gray-500">Loading review queue...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="review-queue-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tighter mb-2" style={{ fontFamily: 'Chivo' }}>
          Review Queue
        </h1>
        <p className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
          Human-in-the-loop verification for flagged documents
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center" data-testid="no-reviews-message">
          <CheckCircle size={64} weight="duotone" className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Chivo' }}>
            No Pending Reviews
          </h2>
          <p className="text-gray-600" style={{ fontFamily: 'IBM Plex Sans' }}>
            All verifications have been processed. Check back later.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="review-queue-table">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Alert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50" data-testid={`review-row-${request.id}`}>
                    <td className="px-6 py-4 text-sm border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Mono' }}>
                      {request.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                      {request.document_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-b border-r border-gray-200" style={{ fontFamily: 'IBM Plex Mono' }}>
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-r border-gray-200">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-sm text-xs font-bold uppercase">
                        <Warning size={14} weight="fill" />
                        Review Required
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/verification/${request.id}`}
                          data-testid={`view-details-${request.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-black hover:bg-gray-50 rounded-none text-xs font-medium"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                        {reviewingId === request.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReview(request.id, 'approve')}
                              data-testid={`approve-button-${request.id}`}
                              className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-none text-xs font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(request.id, 'reject')}
                              data-testid={`reject-button-${request.id}`}
                              className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-none text-xs font-medium"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setReviewingId(null)}
                              data-testid={`cancel-review-${request.id}`}
                              className="px-3 py-1.5 border border-gray-300 text-black hover:bg-gray-50 rounded-none text-xs font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewingId(request.id)}
                            data-testid={`review-button-${request.id}`}
                            className="px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded-none text-xs font-medium"
                          >
                            Review
                          </button>
                        )}
                      </div>
                      {reviewingId === request.id && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Add review notes (optional)"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            data-testid={`review-notes-${request.id}`}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-none text-xs focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            style={{ fontFamily: 'IBM Plex Sans' }}
                          />
                        </div>
                      )}
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

export default ReviewQueue;
