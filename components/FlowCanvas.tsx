import React from 'react';
import { Flow, Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface FlowCanvasProps {
  flow: Flow;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({ flow, onUpdateTaskStatus, onEditTask, onDeleteTask, onAddTask }) => {
  const getTaskDepth = (task: Task, allTasks: Task[], memo: Record<string, number> = {}): number => {
    if (memo[task.id] !== undefined) return memo[task.id];
    if (task.dependencies.length === 0) return 0;

    const depDepths = task.dependencies.map(depTitle => {
      const depTask = allTasks.find(t => t.title === depTitle);
      return depTask ? getTaskDepth(depTask, allTasks, memo) + 1 : 0;
    });

    memo[task.id] = depDepths.length > 0 ? Math.max(...depDepths) : 0;
    return memo[task.id];
  };

  const depths = flow.tasks.map(t => getTaskDepth(t, flow.tasks));
  const maxDepth = Math.max(...depths, 0);
  
  const columns = Array.from({ length: maxDepth + 1 }, (_, i) => 
    flow.tasks.filter((_, idx) => depths[idx] === i)
  );

  const checkIfBlocked = (task: Task) => {
    return task.dependencies.some(depTitle => {
      const depTask = flow.tasks.find(t => t.title === depTitle);
      return depTask && depTask.status !== 'done';
    });
  };

  return (
    <div className="flex-1 overflow-x-auto p-12 custom-scrollbar relative">
      <div className="flex gap-16 min-w-max pb-32">
        {columns.map((column, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-8 w-80">
            <div className="flex items-center gap-3 mb-2 px-3">
              <span className="w-7 h-7 rounded-xl sunset-gradient flex items-center justify-center text-[10px] font-black border border-white/50 text-white shadow-lg">
                {colIdx + 1}
              </span>
              <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                {colIdx === 0 ? 'Foundation' : `Phase ${colIdx + 1}`}
              </h2>
            </div>
            
            {column.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={onUpdateTaskStatus}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                isBlocked={checkIfBlocked(task)}
              />
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-8 w-80">
           <button 
            onClick={onAddTask}
            className="flex flex-col items-center justify-center gap-4 p-10 border-4 border-dashed border-[var(--primary)]/30 rounded-[2.5rem] text-[var(--primary)]/50 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all group h-56 bg-white/5 hover:bg-white/10"
          >
            <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-[var(--primary)]/30 flex items-center justify-center group-hover:scale-110 transition-all bg-[var(--card)] shadow-sm">
              <i className="fa-solid fa-plus"></i>
            </div>
            <span className="text-xs font-black uppercase tracking-widest">New Entry</span>
          </button>
        </div>

        {flow.tasks.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--primary)]/20 pointer-events-none">
            <i className="fa-solid fa-wind text-7xl mb-6"></i>
            <p className="text-2xl font-black italic">A blank canvas awaits...</p>
            <p className="text-sm font-bold opacity-60 mt-2 tracking-widest uppercase">Add a step or use the generator</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowCanvas;