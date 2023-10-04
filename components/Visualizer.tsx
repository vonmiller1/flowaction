import React from 'react';
import { Task } from '../types';

interface VisualizerProps {
  tasks: Task[];
  onClose: () => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ tasks, onClose }) => {
  // Simple circle layout for 2D visualization
  const centerX = 400;
  const centerY = 300;
  const radius = 220;

  const positions = tasks.reduce((acc, task, idx) => {
    const angle = (idx / tasks.length) * 2 * Math.PI;
    acc[task.title] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
    return acc;
  }, {} as Record<string, {x: number, y: number}>);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8">
      <div className="relative w-full max-w-4xl h-[700px] bg-slate-900 rounded-[3rem] border-2 border-white/10 overflow-hidden shadow-2xl flex flex-col">
        <div className="p-8 flex justify-between items-center border-b border-white/10">
          <h2 className="text-white font-black uppercase tracking-widest text-xl">Dependency Graph</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 relative">
          <svg className="w-full h-full" viewBox="0 0 800 600">
            {/* Draw Dependency Lines */}
            {tasks.map(task => 
              task.dependencies.map(depTitle => {
                const start = positions[depTitle];
                const end = positions[task.title];
                if (!start || !end) return null;
                return (
                  <path
                    key={`${task.id}-${depTitle}`}
                    d={`M ${start.x} ${start.y} Q ${(start.x + end.x)/2} ${(start.y + end.y)/2 - 40} ${end.x} ${end.y}`}
                    className="dependency-line"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })
            )}

            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
              </marker>
            </defs>

            {/* Draw Task Nodes */}
            {tasks.map(task => {
              const pos = positions[task.title];
              return (
                <g key={task.id} className="cursor-pointer group">
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="40" 
                    fill={task.status === 'done' ? '#10b981' : 'var(--primary)'} 
                    className="transition-all group-hover:r-45 shadow-lg"
                  />
                  <text 
                    x={pos.x} 
                    y={pos.y + 60} 
                    textAnchor="middle" 
                    className="fill-white text-[10px] font-black uppercase tracking-tighter"
                  >
                    {task.title.length > 20 ? task.title.substring(0, 18) + '...' : task.title}
                  </text>
                  <circle cx={pos.x} cy={pos.y} r="15" fill="white" fillOpacity="0.2" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="p-8 bg-black/40 flex gap-8 justify-center">
          <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase"><div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div> Active</div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Completed</div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase"><div className="w-8 h-[2px] border-b-2 border-dashed border-[var(--primary)]"></div> Flow</div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;