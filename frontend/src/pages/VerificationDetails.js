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
  ShieldCheck,
  Scan
} from '@phosphor-icons/react';
import AIPipeline from '../components/AIPipeline';
import AIAgentConsole from '../components/AIAgentConsole';
import AgentReasoningTrace from '../components/AgentReasoningTrace';

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
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="dot-loader">
          <span></span><span></span><span></span>
        </div>
        <div className="text-gray-500 text-sm">Loading verification details...</div>
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

  const { request, extracted_data, validation, agent_decisions } = data;
  const imageUrl = `data:image/jpeg;base64,${request.image_base64}`;
  const isProcessing = ['pending', 'processing', 'extracted'].includes(request.status);
  const isTampered = validation?.tamper_detected;

  return (
    <div className="p-8" data-testid="verification-details-page">
      <div className="mb-6 fade-in-up">
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
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Mono' }}>
              VERIFICATION REPORT
            </div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2" style={{ fontFamily: 'Chivo' }}>
              {request.document_type} · Request Details
            </h1>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Mono' }}>
              ID: {request.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(request.status)}
            {getStatusBadge(request.status)}
          </div>
        </div>
      </div>

      {/* AI PIPELINE - DRAMATIC DARK */}
      <div className="mb-6 fade-in-up delay-100">
        <AIPipeline currentStatus={request.status} />
      </div>

      {/* AGENT REASONING TRACE - Shows agentic decision-making */}
      <div className="mb-6 fade-in-up delay-150">
        <AgentReasoningTrace decisions={agent_decisions} />
      </div>

      {/* TAMPER ALERT BANNER */}
      {isTampered && (
        <div data-testid="tamper-alert-banner" className="mb-6 bg-[#E63946] text-white p-6 border-l-[6px] border-red-900 flex items-center gap-4 tamper-glitch">
          <Warning size={36} weight="fill" className="flex-shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ fontFamily: 'IBM Plex Mono' }}>CRITICAL ALERT</div>
            <div className="text-xl font-bold mb-1" style={{ fontFamily: 'Chivo' }}>Tamper Signals Detected</div>
            <div className="text-sm opacity-90" style={{ fontFamily: 'IBM Plex Sans' }}>
              AI validation flagged this document. Routing to human review required.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - IMAGE + CONSOLE */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 fade-in-left">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Mono' }}>
                  INPUT · IMAGE
                </div>
                <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                  Document Scan
                </h2>
              </div>
              {isProcessing && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Mono' }}>
                  <Scan size={14} className="animate-pulse" />
                  SCANNING
                </div>
              )}
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
                    <div className={`scan-container border-2 ${isTampered ? 'border-red-500' : 'border-gray-200'}`}>
                      {isProcessing && <div className="scan-line"></div>}
                      <TransformComponent>
                        <img
                          src={imageUrl}
                          alt="Document"
                          data-testid="document-image"
                          className="w-full h-auto"
                        />
                      </TransformComponent>
                    </div>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>

          {/* AI AGENT CONSOLE */}
          <div className="fade-in-left delay-200">
            <AIAgentConsole status={request.status} documentType={request.document_type} />
          </div>
        </div>

        {/* RIGHT COLUMN - DATA + VALIDATION */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 fade-in-right">
            <div className="p-6 border-b border-gray-200">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Mono' }}>METADATA</div>
              <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                Request Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
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
                  Created
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
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Sans' }}>
                  Uploaded By
                </div>
                <div className="text-sm font-medium" style={{ fontFamily: 'IBM Plex Mono' }}>
                  {request.created_by || 'system'}
                </div>
              </div>
            </div>
          </div>

          {extracted_data && (
            <div className="bg-white border border-gray-200 fade-in-right delay-100" data-testid="extracted-data-section">
              <div className="p-6 border-b border-gray-200">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Mono' }}>AGENT · OCR OUTPUT</div>
                <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                  Extracted Data
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {Object.entries(extracted_data.structured_data).map(([key, value]) => {
                    if (key === 'confidence_score') return null;
                    const confidence = extracted_data.confidence_scores[key] || extracted_data.confidence_scores.overall || 0.85;
                    const isLowConfidence = confidence < 0.7;
                    const confidencePercent = Math.round(confidence * 100);

                    return (
                      <div key={key} className={`p-4 border-l-4 ${isLowConfidence ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-500" style={{ fontFamily: 'IBM Plex Sans' }}>
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 confidence-bar">
                              <div className="confidence-fill" style={{ width: `${confidencePercent}%` }}></div>
                            </div>
                            <span className="text-xs font-bold" style={{ fontFamily: 'IBM Plex Mono' }}>
                              {confidencePercent}%
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium" style={{ fontFamily: 'IBM Plex Mono' }}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value) || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {validation && (
            <div className="bg-white border border-gray-200 fade-in-right delay-200" data-testid="validation-results-section">
              <div className="p-6 border-b border-gray-200">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Mono' }}>AGENT · VALIDATION</div>
                <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
                  Validation Results
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                      VALID
                    </div>
                    <div className="flex items-center gap-2">
                      {validation.is_valid ? (
                        <CheckCircle size={24} weight="fill" className="text-green-600" />
                      ) : (
                        <Warning size={24} weight="fill" className="text-red-600" />
                      )}
                      <span className="text-2xl font-bold" style={{ fontFamily: 'Chivo' }}>
                        {validation.is_valid ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                  <div className={`border p-4 ${validation.tamper_detected ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                      TAMPER
                    </div>
                    <div className="flex items-center gap-2">
                      {validation.tamper_detected ? (
                        <Warning size={24} weight="fill" className="text-red-600" />
                      ) : (
                        <ShieldCheck size={24} weight="fill" className="text-green-600" />
                      )}
                      <span className="text-2xl font-bold" style={{ fontFamily: 'Chivo' }}>
                        {validation.tamper_detected ? 'DETECTED' : 'CLEAN'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                    Validation Checks
                  </div>
                  <div className="space-y-2">
                    {Object.entries(validation.validation_checks).map(([check, status]) => (
                      <div key={check} className="flex items-center justify-between p-3 border border-gray-200 bg-white hover:bg-gray-50">
                        <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans' }}>
                          {check.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-sm ${status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} style={{ fontFamily: 'IBM Plex Mono' }}>
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
                  <div className="text-sm p-4 bg-gray-50 border-l-4 border-[#002FA7]" style={{ fontFamily: 'IBM Plex Sans' }}>
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
