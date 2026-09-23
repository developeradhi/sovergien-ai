import React, { useState } from 'react';
import { X, Play, Zap } from 'lucide-react';
import type { WorkflowType, TaskPriority } from '../types';

interface TaskCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    workflow_type: WorkflowType;
    unit_location: string;
    priority: TaskPriority;
    description: string;
    document_ids: string[];
  }) => Promise<void>;
}

export const TaskCreatorModal: React.FC<TaskCreatorModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('CDU-II Reflux Manifold Welding Repair');
  const [workflowType, setWorkflowType] = useState<WorkflowType>('HOT_WORK_PERMIT');
  const [unitLocation, setUnitLocation] = useState('Crude Distillation Unit (CDU-II), Column C-101 Overhead');
  const [priority, setPriority] = useState<TaskPriority>('URGENT');
  const [description, setDescription] = useState(
    'High-pressure pipe weld repair on CDU-II reflux line 14-B following ultrasonic indication of flange crack. Requires oxy-acetylene torch cutting and TIG welding within battery limits.'
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (type: 'CDU' | 'FCCU' | 'PUMP') => {
    if (type === 'CDU') {
      setTitle('CDU-II Reflux Manifold Welding Repair');
      setWorkflowType('HOT_WORK_PERMIT');
      setUnitLocation('Crude Distillation Unit (CDU-II), Column C-101 Overhead');
      setPriority('URGENT');
      setDescription(
        'High-pressure pipe weld repair on CDU-II reflux line 14-B following ultrasonic indication of flange crack. Requires oxy-acetylene torch cutting and TIG welding within battery limits.'
      );
    } else if (type === 'FCCU') {
      setTitle('FCCU R-201 Cyclone Riser Support Weld');
      setWorkflowType('HOT_WORK_PERMIT');
      setUnitLocation('Fluid Catalytic Cracking Unit (FCCU), Reactor Structure Elevation +24m');
      setPriority('EMERGENCY');
      setDescription(
        'Structural welding of secondary support gussets on reactor riser catalyst line. Hot spark activity required in adjacent vicinity of regeneration gas stack.'
      );
    } else {
      setTitle('Charge Pump P-101A Thickness & Vibration Assessment');
      setWorkflowType('EQUIPMENT_INSPECTION');
      setUnitLocation('Offsites & Utilities Tank Farm Booster Station P-101A');
      setPriority('ROUTINE');
      setDescription(
        'Review ultrasonic thickness scan and vibration telemetry from September 2026 inspection. Check compliance against API 570 and ISO 10816-3 limits.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        workflow_type: workflowType,
        unit_location: unitLocation,
        priority,
        description,
        document_ids: ['DOC-SOP-402', 'DOC-ENG-108']
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <h3 className="text-base font-bold text-slate-900">
              Initiate Sovereign AI Workflow Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="bg-slate-50/70 px-6 py-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-700 font-bold whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => handleApplyTemplate('CDU')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded border border-slate-300 whitespace-nowrap font-medium shadow-2xs transition-colors"
          >
            CDU-II Hot Work (Flagship)
          </button>
          <button
            type="button"
            onClick={() => handleApplyTemplate('FCCU')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded border border-slate-300 whitespace-nowrap font-medium shadow-2xs transition-colors"
          >
            FCCU Riser Welding
          </button>
          <button
            type="button"
            onClick={() => handleApplyTemplate('PUMP')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded border border-slate-300 whitespace-nowrap font-medium shadow-2xs transition-colors"
          >
            Pump P-101A Inspection
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Workflow Type
            </label>
            <select
              value={workflowType}
              onChange={(e) => setWorkflowType(e.target.value as WorkflowType)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium"
            >
              <option value="HOT_WORK_PERMIT">Hot Work Permit Verification (MRPL-SOP-SAF-402)</option>
              <option value="EQUIPMENT_INSPECTION">Equipment Integrity & Thickness Review (API 570)</option>
              <option value="PID_REVIEW">P&ID Engineering Standards Check (MRPL-ENG-108)</option>
              <option value="KNOWLEDGE_QUERY">Sovereign Industrial Knowledge Retrieval</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium"
              >
                <option value="ROUTINE">Routine Maintenance</option>
                <option value="URGENT">Urgent Operational Need</option>
                <option value="EMERGENCY">Emergency Shutdown / Repair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Refinery Unit & Location Coordinates
            </label>
            <input
              type="text"
              required
              value={unitLocation}
              onChange={(e) => setUnitLocation(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-[11px] shadow-2xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Scope of Work & Maintenance Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans shadow-2xs font-normal"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-mono text-[11px]">
              Air-gap model inference: Local Open-Weight
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{loading ? 'Orchestrating...' : 'Launch Workflow'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TaskCreatorModal;
