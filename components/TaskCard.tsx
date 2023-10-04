
import React from 'react';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isBlocked: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit, onDelete, isBlocked }) => {
  const statusColors = {
    'todo': 'bg-white border-slate-200 text-slate-800',
    'in-progress': 'bg-amber-50/80 border-amber-400 text-slate-900 shadow-lg shadow-amber-200/20',
    'done': 'bg-emerald-50 border-emerald-500 text-emerald-900 opacity-80 scale-[0.98]',
    'blocked': 'bg-slate-100 border-slate-300 text-slate-500 grayscale'
  };

  const priorityColors = {
    'low': 'text-slate-500 bg-slate-100',
    'medium': 'text-amber-700 bg-amber-100',
    'high': 'text-rose-700 bg-rose-100'
  };

  const unitAbbr = {
    'minutes': 'm',
    'hours': 'h',
    'days': 'd',
    'weeks': 'w'
  };

  return (
    <div className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 ${isBlocked ? 'opacity-40' : 'hover:shadow-2xl hover:-translate-y-1 hover:border-primary'} ${statusColors[task.status]}`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex gap-2">
          {task.status !== 'done' && (
             <button 
              onClick={() => onStatusChange(task.id, 'done')}
              className="text-emerald-500 hover:text-emerald-600 transition-colors"
              disabled={isBlocked}
              title="Complete"
            >
              <i className="fa-solid fa-circle-check text-xl"></i>
            </button>
          )}
          {task.status === 'todo' && (
            <button 
              onClick={() => onStatusChange(task.id, 'in-progress')}
              className="text-amber-500 hover:text-amber-600 transition-colors"
              disabled={isBlocked}
              title="Start"
            >
              <i className="fa-solid fa-play text-lg"></i>
            </button>
          )}
        </div>
      </div>
      
      <h3 className="font-extrabold text-lg mb-2 leading-tight">{task.title}</h3>
      <p className="text-sm opacity-80 mb-6 line-clamp-2 font-medium leading-relaxed">{task.description}</p>
      
      <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-inherit">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-500/5 rounded-xl border border-slate-500/10">
          <i className="fa-regular fa-clock opacity-60"></i> 
          {task.duration}{unitAbbr[task.durationUnit]}
        </span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(task)} className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-500/10 rounded-lg text-primary">
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button onClick={() => onDelete(task.id)} className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100 rounded-lg text-rose-500">
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      {isBlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-3xl backdrop-blur-[1px]">
           <i className="fa-solid fa-lock text-slate-400 text-2xl drop-shadow-sm"></i>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
