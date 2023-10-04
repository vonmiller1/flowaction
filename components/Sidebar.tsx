import React from 'react';
import { Flow } from '../types';

interface SidebarProps {
  flows: Flow[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ flows, activeId, onSelect, onDelete }) => {
  return (
    <aside className="w-80 bg-inherit border-r-2 border-slate-200/10 flex flex-col flex-shrink-0 shadow-2xl z-20">
      <div className="p-8 border-b-2 border-slate-200/5 flex items-center gap-4">
        <div className="w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-xl transition-transform hover:scale-105">
          <i className="fa-solid fa-bolt text-[var(--accent)] text-xl"></i>
        </div>
        <span className="font-black text-2xl tracking-tighter">Action<span className="opacity-50">Flow</span></span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="text-[11px] font-black opacity-40 uppercase tracking-[0.2em] px-3 mb-6">WORKSPACES</div>
        <div className="space-y-3 mb-10">
          {flows.map(flow => (
            <div 
              key={flow.id}
              onClick={() => onSelect(flow.id)}
              className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                activeId === flow.id ? 'bg-white/10 border-white/20 shadow-md backdrop-blur-sm' : 'hover:bg-white/5 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <i className={`fa-solid ${activeId === flow.id ? 'fa-folder-open opacity-80' : 'fa-folder opacity-30'} text-lg`}></i>
                <span className={`truncate text-sm font-bold ${activeId === flow.id ? 'text-primary' : ''}`}>{flow.name}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDelete(flow.id); }} className="opacity-0 group-hover:opacity-100 p-2 hover:text-rose-500 rounded-lg transition-all">
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          ))}
          {flows.length === 0 && (
            <div className="p-8 text-center opacity-30 border-2 border-dashed border-current rounded-2xl">
              <p className="text-xs font-bold uppercase tracking-widest">No plans yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 border-t-2 border-slate-200/5">
        <button onClick={() => onSelect('')} className="w-full py-4 px-4 primary-btn hover:opacity-90 text-sm font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3">
          <i className="fa-solid fa-plus"></i> NEW PLAN
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;