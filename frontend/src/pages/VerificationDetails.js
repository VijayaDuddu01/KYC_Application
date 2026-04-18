import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  ArrowLeft,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  ArrowsOut,
  CheckCircle,
  Warning,
  Clock,
  ShieldCheck
} from '@phosphor-icons/react';
import AIPipeline from '../components/AIPipeline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VerificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVerificationDetails();
    const interval = setInterval(fetchVerificationDetails, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchVerificationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/verify/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load verification details');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={24} weight="duotone" className="text-gray-600" />,
      processing: <Clock size={24} weight="duotone" className="text-blue-600" />,
      extracted: <CheckCircle size={24} weight="duotone" className="text-blue-600" />,
      validated: <CheckCircle size={24} weight="duotone" className="text-green-600" />,
      needs_review: <Warning size={24} weight="duotone" className="text-yellow-600" />,
      approved: <CheckCircle size={24} weight="duotone" className="text-green-600" />,
      rejected: <Warning size={24} weight="duotone" className="text-red-600" />,
      error: <Warning size={24} weight="duotone" className="text-red-600" />
    };
    return icons[status] || icons.pending;
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
        className={`inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm border ${config.bg} ${config.text} ${config.border}`}
        style={{ fontFamily: 'IBM Plex Mono' }}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading verification details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 p-6 text-red-800">
          <Warning size={24} className="mb-2" />
          {error}
        </div>
      </div>
    );
  }

  const { request, extracted_data, validation } = data;
  const imageUrl = `data:image/jpeg;base64,${request.image_base64}`;

  return (
    <div className="p-8" data-testid="verification-details-page">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          data-testid="back-to-dashboard-button"
          className="flex items-center gap-2 text-[#002FA7] hover:text-black font-medium mb-4"
          style={{ fontFamily: 'IBM Plex Sans' }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2" style={{ fontFamily: 'Chivo' }}>
              Verification Details
            </h1>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Mono' }}>
              Request ID: {request.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(request.status)}
            {getStatusBadge(request.status)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <AIPipeline currentStatus={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
              Document Image
            </h2>
          </div>
          <div className="p-6">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={3}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => zoomIn()}
                      data-testid="zoom-in-button"
                      className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-none"
                    >
                      <MagnifyingGlassPlus size={20} />
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      data-testid="zoom-out-button"
                      className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-none"
                    >
                      <MagnifyingGlassMinus size={20} />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      data-testid="reset-zoom-button"
                      className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-none"
                    >
                      <ArrowsOut size={20} />
                    </button>
                  </div>
                  <TransformComponent>
                    <img
                      src={imageUrl}
                      alt="Document"
                      data-testid="document-image"
                      className="w-full h-auto border border-gray-200"
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                Request Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Sans' }}>
                  Document Type
                </div>
                <div className="text-sm font-medium" style={{ fontFamily: 'IBM Plex Sans' }}>
                  {request.document_type}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Sans' }}>
                  Created At
                </div>
                <div className="text-sm font-medium" style={{ fontFamily: 'IBM Plex Mono' }}>
                  {new Date(request.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Sans' }}>
                  Last Updated
                </div>
                <div className="text-sm font-medium" style={{ fontFamily: 'IBM Plex Mono' }}>
                  {new Date(request.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {extracted_data && (
            <div className="bg-white border border-gray-200" data-testid="extracted-data-section">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                  Extracted Data
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {Object.entries(extracted_data.structured_data).map(([key, value]) => {
                    if (key === 'confidence_score') return null;
                    const confidence = extracted_data.confidence_scores[key] || 0.85;
                    const isLowConfidence = confidence < 0.7;

                    return (
                      <div key={key} className={`p-3 border ${isLowConfidence ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-500" style={{ fontFamily: 'IBM Plex Sans' }}>
                            {key.replace(/_/g, ' ')}
                          </div>
                          {isLowConfidence && (
                            <span className="text-xs font-bold text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded-sm">
                              LOW CONFIDENCE
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium" style={{ fontFamily: 'IBM Plex Mono' }}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {validation && (
            <div className="bg-white border border-gray-200" data-testid="validation-results-section">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                  Validation Results
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {validation.tamper_detected && (
                  <div data-testid="tamper-alert" className="p-4 bg-red-600 text-white border-2 border-red-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Warning size={24} weight="fill" />
                      <div className="text-sm font-bold uppercase tracking-wider">TAMPER DETECTED</div>
                    </div>
                    <div className="text-sm">This document shows signs of manipulation or tampering.</div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Validation Status
                  </div>
                  <div className="flex items-center gap-2">
                    {validation.is_valid ? (
                      <CheckCircle size={20} weight="fill" className="text-green-600" />
                    ) : (
                      <Warning size={20} weight="fill" className="text-red-600" />
                    )}
                    <span className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans' }}>
                      {validation.is_valid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Validation Checks
                  </div>
                  <div className="space-y-2">
                    {Object.entries(validation.validation_checks).map(([check, status]) => (
                      <div key={check} className="flex items-center justify-between p-2 border border-gray-200">
                        <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans' }}>
                          {check.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-sm ${status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                    AI Reasoning
                  </div>
                  <div className="text-sm p-3 bg-gray-50 border border-gray-200" style={{ fontFamily: 'IBM Plex Sans' }}>
                    {validation.ai_reasoning}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationDetails;
