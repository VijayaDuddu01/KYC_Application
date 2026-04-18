import React from 'react';
import { UploadSimple, FileText, Brain, UserCircle, CheckCircle, XCircle } from '@phosphor-icons/react';

const AIPipeline = ({ currentStatus }) => {
  const stages = [
    { id: 'pending', label: 'Upload', icon: UploadSimple, description: 'Document Received' },
    { id: 'extracted', label: 'OCR Extraction', icon: FileText, description: 'GPT-5.2 Vision' },
    { id: 'validated', label: 'AI Validation', icon: Brain, description: 'Tamper Detection' },
    { id: 'needs_review', label: 'Human Review', icon: UserCircle, description: 'If Flagged' },
    { id: 'approved', label: 'Decision', icon: CheckCircle, description: 'Approved/Rejected' }
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
    <div className="bg-white border border-gray-200" data-testid="ai-pipeline-visualization">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Chivo' }}>
          AI Orchestration Pipeline
        </h2>
        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'IBM Plex Mono' }}>
          Multi-stage verification workflow
        </p>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const status = getStageStatus(stage.id);
            
            const styles = {
              active: { bg: 'bg-[#002FA7]', text: 'text-white', border: 'border-[#002FA7]', lineColor: 'bg-[#002FA7]' },
              current: { bg: 'bg-yellow-400', text: 'text-black', border: 'border-yellow-400', lineColor: 'bg-gray-300' },
              rejected: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600', lineColor: 'bg-gray-300' },
              skipped: { bg: 'bg-gray-200', text: 'text-gray-400', border: 'border-gray-300', lineColor: 'bg-gray-300' },
              pending: { bg: 'bg-white', text: 'text-gray-400', border: 'border-gray-300', lineColor: 'bg-gray-300' }
            };
            
            const s = styles[status];
            
            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center flex-1" data-testid={`pipeline-stage-${stage.id}`}>
                  <div className={`w-16 h-16 ${s.bg} ${s.border} border-2 flex items-center justify-center mb-3 transition-all`}>
                    {status === 'rejected' ? (
                      <XCircle size={28} weight="fill" className={s.text} />
                    ) : (
                      <Icon size={28} weight={status === 'active' ? 'fill' : 'regular'} className={s.text} />
                    )}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-wider text-center ${status === 'active' || status === 'rejected' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: 'IBM Plex Sans' }}>
                    {stage.label}
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1" style={{ fontFamily: 'IBM Plex Mono' }}>
                    {stage.description}
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-300 relative mx-2 -mt-12">
                    <div className={`absolute inset-0 ${s.lineColor} transition-all`} style={{ width: status === 'active' ? '100%' : '0%' }}></div>
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
