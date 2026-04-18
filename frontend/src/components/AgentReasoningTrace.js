import React from 'react';
import {
  Brain,
  ArrowRight,
  CheckCircle,
  Warning,
  Lightning,
  ArrowsSplit,
  UserCircle,
  FileText,
  Robot
} from '@phosphor-icons/react';

const AgentReasoningTrace = ({ decisions = [] }) => {
  if (!decisions || decisions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Mono' }}>
          AGENT REASONING
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-3" style={{ fontFamily: 'Chivo' }}>
          Decision Trajectory
        </h2>
        <div className="text-sm text-gray-500 py-8 text-center">
          No agent decisions recorded yet. New uploads will show the orchestrator's reasoning here.
        </div>
      </div>
    );
  }

  const getAgentColor = (agent) => {
    const colors = {
      ORCHESTRATOR: { bg: 'bg-[#002FA7]', text: 'text-white', border: 'border-[#002FA7]', light: 'bg-blue-50 text-blue-900' },
      OCR_AGENT: { bg: 'bg-[#00875A]', text: 'text-white', border: 'border-[#00875A]', light: 'bg-green-50 text-green-900' },
      VALIDATION_AGENT: { bg: 'bg-[#FFC300]', text: 'text-black', border: 'border-[#FFC300]', light: 'bg-yellow-50 text-yellow-900' },
      HITL_AGENT: { bg: 'bg-[#E63946]', text: 'text-white', border: 'border-[#E63946]', light: 'bg-red-50 text-red-900' },
      DECISION_AGENT: { bg: 'bg-black', text: 'text-white', border: 'border-black', light: 'bg-gray-50 text-gray-900' }
    };
    return colors[agent] || colors.ORCHESTRATOR;
  };

  const getActionIcon = (action) => {
    if (action.includes('plan')) return Brain;
    if (action.includes('delegating')) return ArrowsSplit;
    if (action.includes('fast_track') || action.includes('auto_approving')) return Lightning;
    if (action.includes('retry')) return ArrowRight;
    if (action.includes('routing_to_human')) return UserCircle;
    if (action.includes('extraction')) return FileText;
    if (action.includes('validation')) return CheckCircle;
    if (action.includes('failed') || action.includes('error')) return Warning;
    return Robot;
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').toUpperCase();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="bg-white border border-gray-200" data-testid="agent-reasoning-trace">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1" style={{ fontFamily: 'IBM Plex Mono' }}>
            AGENTIC WORKFLOW
          </div>
          <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
            Agent Reasoning Trace
          </h2>
          <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'IBM Plex Sans' }}>
            {decisions.length} autonomous decisions — full transparency into agent's thought process
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Mono' }}>
          <Brain size={14} weight="fill" />
          ReAct Pattern
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-4">
            {decisions.map((decision, idx) => {
              const colors = getAgentColor(decision.agent);
              const ActionIcon = getActionIcon(decision.action);
              const isDecision = decision.agent === 'ORCHESTRATOR';

              return (
                <div key={decision.id || idx} className="relative flex gap-4 fade-in-left" style={{ animationDelay: `${idx * 80}ms` }} data-testid={`agent-decision-${idx}`}>
                  {/* Agent icon node */}
                  <div className={`relative z-10 w-12 h-12 ${colors.bg} ${colors.border} border-2 flex items-center justify-center flex-shrink-0`}>
                    <ActionIcon size={20} weight={isDecision ? 'fill' : 'regular'} className={colors.text} />
                  </div>

                  {/* Decision card */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${colors.light} border ${colors.border}`} style={{ fontFamily: 'IBM Plex Mono' }}>
                        {decision.agent}
                      </span>
                      <span className="text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Mono' }}>
                        {formatTime(decision.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm font-bold mb-2" style={{ fontFamily: 'IBM Plex Sans' }}>
                      {formatAction(decision.action)}
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 border-l-4 border-gray-300 p-3" style={{ fontFamily: 'IBM Plex Sans' }}>
                      {decision.reasoning}
                    </div>

                    {/* Metadata display */}
                    {decision.metadata && Object.keys(decision.metadata).length > 0 && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-black font-bold uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Mono' }}>
                          View metadata
                        </summary>
                        <pre className="mt-2 p-2 bg-black text-green-400 overflow-x-auto text-[11px]" style={{ fontFamily: 'IBM Plex Mono' }}>
                          {JSON.stringify(decision.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center gap-4 flex-wrap text-xs" style={{ fontFamily: 'IBM Plex Mono' }}>
        <span className="text-gray-500 uppercase tracking-wider font-bold">Agents:</span>
        {['ORCHESTRATOR', 'OCR_AGENT', 'VALIDATION_AGENT'].map((agent) => {
          const c = getAgentColor(agent);
          return (
            <div key={agent} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 ${c.bg}`}></div>
              <span className="text-gray-700">{agent}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentReasoningTrace;
