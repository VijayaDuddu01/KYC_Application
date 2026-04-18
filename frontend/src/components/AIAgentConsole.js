import React, { useEffect, useState, useRef } from 'react';
import { Terminal } from '@phosphor-icons/react';

const AIAgentConsole = ({ status, documentType = 'Aadhaar' }) => {
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    const allLogs = {
      pending: [
        { time: '00:00.01', agent: 'INGESTION', level: 'info', msg: `Document received: ${documentType}.jpg` },
        { time: '00:00.02', agent: 'INGESTION', level: 'info', msg: 'Validating image format...' },
        { time: '00:00.04', agent: 'INGESTION', level: 'success', msg: 'Format OK: image/jpeg, 2.4MB' },
      ],
      extracted: [
        { time: '00:00.01', agent: 'INGESTION', level: 'info', msg: `Document received: ${documentType}.jpg` },
        { time: '00:00.04', agent: 'INGESTION', level: 'success', msg: 'Format validated' },
        { time: '00:00.12', agent: 'OCR', level: 'info', msg: 'Initializing GPT-5.2 Vision...' },
        { time: '00:00.45', agent: 'OCR', level: 'info', msg: 'Extracting text regions...' },
        { time: '00:01.22', agent: 'OCR', level: 'info', msg: 'Parsing structured fields...' },
        { time: '00:01.89', agent: 'OCR', level: 'success', msg: 'Extraction complete · confidence: 0.94' },
      ],
      validated: [
        { time: '00:00.04', agent: 'INGESTION', level: 'success', msg: 'Format validated' },
        { time: '00:01.89', agent: 'OCR', level: 'success', msg: 'Extraction complete · confidence: 0.94' },
        { time: '00:02.10', agent: 'VALIDATION', level: 'info', msg: 'Running tamper detection...' },
        { time: '00:02.34', agent: 'VALIDATION', level: 'info', msg: 'Analyzing pixel patterns...' },
        { time: '00:02.78', agent: 'VALIDATION', level: 'info', msg: 'Checking date consistency...' },
        { time: '00:03.15', agent: 'VALIDATION', level: 'success', msg: 'All checks passed · tamper: false' },
        { time: '00:03.20', agent: 'DECISION', level: 'success', msg: 'Document VALIDATED' },
      ],
      needs_review: [
        { time: '00:00.04', agent: 'INGESTION', level: 'success', msg: 'Format validated' },
        { time: '00:01.89', agent: 'OCR', level: 'warn', msg: 'Extraction complete · confidence: 0.68' },
        { time: '00:02.10', agent: 'VALIDATION', level: 'info', msg: 'Running tamper detection...' },
        { time: '00:02.78', agent: 'VALIDATION', level: 'warn', msg: 'Anomaly detected in metadata' },
        { time: '00:03.15', agent: 'VALIDATION', level: 'error', msg: 'Tamper signals found · confidence: 0.82' },
        { time: '00:03.20', agent: 'HITL', level: 'warn', msg: 'Routing to human reviewer...' },
      ],
      approved: [
        { time: '00:01.89', agent: 'OCR', level: 'success', msg: 'Extraction complete' },
        { time: '00:03.15', agent: 'VALIDATION', level: 'success', msg: 'All checks passed' },
        { time: '00:03.20', agent: 'DECISION', level: 'success', msg: 'Document VALIDATED' },
        { time: '04:12.88', agent: 'HITL', level: 'success', msg: 'Human review: APPROVED' },
      ],
      rejected: [
        { time: '00:01.89', agent: 'OCR', level: 'success', msg: 'Extraction complete' },
        { time: '00:03.15', agent: 'VALIDATION', level: 'error', msg: 'Tamper detected' },
        { time: '04:12.88', agent: 'HITL', level: 'error', msg: 'Human review: REJECTED' },
      ]
    };

    const statusLogs = allLogs[status] || allLogs.pending;
    setLogs([]);

    let i = 0;
    const interval = setInterval(() => {
      if (i < statusLogs.length) {
        setLogs((prev) => [...prev, statusLogs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [status, documentType]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getLevelStyle = (level) => {
    const styles = {
      info: 'text-blue-400',
      success: 'text-green-400',
      warn: 'text-yellow-400',
      error: 'text-red-400'
    };
    return styles[level] || 'text-gray-400';
  };

  const getLevelSymbol = (level) => {
    const symbols = { info: '▸', success: '✓', warn: '⚠', error: '✗' };
    return symbols[level] || '▸';
  };

  return (
    <div className="bg-black border border-gray-800" data-testid="ai-agent-console">
      <div className="px-4 py-3 border-b border-gray-800 bg-[#111827] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <Terminal size={14} className="text-gray-500 ml-2" />
          <span className="text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Mono' }}>
            ai-agent-console · live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot"></div>
          <span className="text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Mono' }}>STREAMING</span>
        </div>
      </div>
      <div className="p-4 h-64 overflow-y-auto no-scrollbar font-mono text-xs space-y-1" style={{ fontFamily: 'IBM Plex Mono' }}>
        {logs.filter(Boolean).map((log, idx) => (
          <div key={idx} className="flex gap-3 fade-in-up">
            <span className="text-gray-600 w-20 flex-shrink-0">[{log.time}]</span>
            <span className="text-purple-400 w-24 flex-shrink-0">{log.agent}</span>
            <span className={`w-3 flex-shrink-0 ${getLevelStyle(log.level)}`}>{getLevelSymbol(log.level)}</span>
            <span className={getLevelStyle(log.level)}>{log.msg}</span>
          </div>
        ))}
        {logs.length > 0 && (
          <div className="flex gap-3">
            <span className="text-green-400 terminal-cursor"></span>
          </div>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default AIAgentConsole;
