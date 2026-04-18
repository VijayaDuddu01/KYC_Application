import React from 'react';
import { UploadSimple, FileText, Brain, UserCircle, CheckCircle, XCircle, Cpu } from '@phosphor-icons/react';

const AIPipeline = ({ currentStatus }) => {
  const stages = [
    { id: 'pending', label: 'Upload', icon: UploadSimple, description: 'Document Received', agent: 'INGESTION_AGENT' },
    { id: 'extracted', label: 'OCR Extraction', icon: FileText, description: 'GPT-5.2 Vision', agent: 'OCR_AGENT' },
    { id: 'validated', label: 'AI Validation', icon: Brain, description: 'Tamper Detection', agent: 'VALIDATION_AGENT' },
    { id: 'needs_review', label: 'Human Review', icon: UserCircle, description: 'If Flagged', agent: 'HITL_AGENT' },
    { id: 'approved', label: 'Decision', icon: CheckCircle, description: 'Approved/Rejected', agent: 'DECISION_AGENT' }
  ];

  const getStageStatus = (stageId) => {
    const statusOrder = ['pending', 'processing', 'extracted', 'validated', 'needs_review', 'approved', 'rejected'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stageIdx = statusOrder.indexOf(stageId);

    if (currentStatus === 'rejected' && stageId === 'approved') return 'rejected';
    if (currentStatus === 'approved' && stageId === 'approved') return 'active';
    if (currentStatus === 'needs_review' && stageId === 'approved') return 'pending';
    if (currentStatus === 'validated' && stageId === 'needs_review') return 'skipped';
    if (currentStatus === 'validated' && stageId === 'approved') return 'pending';

    if (stageIdx <= currentIdx) return 'active';
    if (stageIdx === currentIdx + 1) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-[#111827] text-white border border-gray-800 relative overflow-hidden" data-testid="ai-pipeline-visualization">
      <div className="absolute inset-0 grid-bg-dark opacity-60 pointer-events-none"></div>

      <div className="relative z-10 p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-1 border border-white/20 text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ fontFamily: 'IBM Plex Mono' }}>
            <Cpu size={12} />
            MULTI-AGENT PIPELINE
          </div>
          <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
            AI Orchestration Engine
          </h2>
          <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'IBM Plex Mono' }}>
            5-stage sequential verification workflow · Real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot"></div>
          <span className="text-xs uppercase tracking-wider text-green-400 font-bold" style={{ fontFamily: 'IBM Plex Mono' }}>ACTIVE</span>
        </div>
      </div>

      <div className="relative z-10 p-8">
        <div className="flex items-start justify-between">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const status = getStageStatus(stage.id);

            const styles = {
              active: {
                iconBg: 'bg-[#00c477]', iconBorder: 'border-[#00c477]', iconText: 'text-black',
                label: 'text-white', agent: 'text-[#00c477]',
                lineColor: 'bg-[#00c477]', glow: 'shadow-[0_0_20px_rgba(0,196,119,0.5)]'
              },
              current: {
                iconBg: 'bg-[#FFC300]', iconBorder: 'border-[#FFC300]', iconText: 'text-black',
                label: 'text-white', agent: 'text-[#FFC300]',
                lineColor: 'bg-gray-700', glow: 'shadow-[0_0_30px_rgba(255,195,0,0.6)]',
                extraClass: 'pulse-ring'
              },
              rejected: {
                iconBg: 'bg-[#E63946]', iconBorder: 'border-[#E63946]', iconText: 'text-white',
                label: 'text-white', agent: 'text-[#E63946]',
                lineColor: 'bg-gray-700', glow: 'shadow-[0_0_20px_rgba(230,57,70,0.5)]'
              },
              skipped: {
                iconBg: 'bg-gray-800', iconBorder: 'border-gray-700', iconText: 'text-gray-600',
                label: 'text-gray-500', agent: 'text-gray-600',
                lineColor: 'bg-gray-700', glow: ''
              },
              pending: {
                iconBg: 'bg-transparent', iconBorder: 'border-gray-700', iconText: 'text-gray-600',
                label: 'text-gray-500', agent: 'text-gray-600',
                lineColor: 'bg-gray-700', glow: ''
              }
            };

            const s = styles[status];
            const isProcessing = status === 'current';

            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center flex-1" data-testid={`pipeline-stage-${stage.id}`}>
                  <div className="relative">
                    <div className={`w-16 h-16 ${s.iconBg} ${s.iconBorder} border-2 flex items-center justify-center mb-3 transition-all duration-500 ${s.glow} ${s.extraClass || ''}`}>
                      {status === 'rejected' ? (
                        <XCircle size={28} weight="fill" className={s.iconText} />
                      ) : (
                        <Icon size={28} weight={status === 'active' || status === 'current' ? 'fill' : 'regular'} className={s.iconText} />
                      )}
                    </div>
                    {isProcessing && (
                      <div className="absolute -inset-2 border-2 border-[#FFC300] border-dashed animate-spin" style={{ animationDuration: '3s' }}></div>
                    )}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-wider text-center ${s.label}`} style={{ fontFamily: 'IBM Plex Sans' }}>
                    {stage.label}
                  </div>
                  <div className={`text-[10px] text-center mt-1 ${s.agent}`} style={{ fontFamily: 'IBM Plex Mono' }}>
                    {stage.agent}
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1" style={{ fontFamily: 'IBM Plex Mono' }}>
                    {stage.description}
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <div className="flex-1 pt-8 mx-1 relative">
                    <div className="h-0.5 bg-gray-800 relative overflow-hidden">
                      {status === 'active' && (
                        <>
                          <div className="absolute inset-0 bg-[#00c477]"></div>
                          <div className="absolute top-0 left-0 w-4 h-0.5 bg-white" style={{
                            animation: 'flow 2s ease-in-out infinite'
                          }}></div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIPipeline;
