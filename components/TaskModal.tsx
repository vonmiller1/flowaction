import React, { useState, useEffect } from 'react';
import { Task, TimeUnit } from '../types';

interface TaskModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  existingTasks: Task[];
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave, existingTasks }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [duration, setDuration] = useState(30);
  const [durationUnit, setDurationUnit] = useState<TimeUnit>('minutes');
  const [dependencies, setDependencies] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDuration(task.duration);
      setDurationUnit(task.durationUnit);
      setDependencies(task.dependencies);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDuration(30);
      setDurationUnit('minutes');
      setDependencies([]);
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      priority,
      duration,
      durationUnit,
      dependencies,
    });
    onClose();
  };

  const toggleDependency = (depTitle: string) => {
    setDependencies(prev => 
      prev.includes(depTitle) ? prev.filter(t => t !== depTitle) : [...prev, depTitle]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-7 border-b border-[var(--border)]/20 flex justify-between items-center bg-[var(--element-bg)]/30">
          <h2 className="text-xl font-extrabold text-current">{task ? 'Refine Step' : 'New Step'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-[var(--primary)]">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-black opacity-40 uppercase tracking-widest mb-2">Goal Name</label>
            <input 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[var(--element-bg)] border border-[var(--border)]/10 rounded-xl px-5 py-3 focus:border-[var(--primary)] focus:outline-none transition-all text-current font-bold"
              placeholder="e.g. Set up database"
            />
          </div>

          <div>
            <label className="block text-xs font-black opacity-40 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[var(--element-bg)] border border-[var(--border)]/10 rounded-xl px-5 py-3 focus:border-[var(--primary)] focus:outline-none h-24 resize-none transition-all text-current font-medium"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black opacity-40 uppercase tracking-widest mb-2">Priority</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-[var(--element-bg)] border border-[var(--border)]/10 rounded-xl px-5 py-3 focus:border-[var(--primary)] focus:outline-none transition-all appearance-none text-current font-bold"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-black opacity-40 uppercase tracking-widest mb-2">Time</label>
                <input 
                  type="number"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full bg-[var(--element-bg)] border border-[var(--border)]/10 rounded-xl px-4 py-3 focus:border-[var(--primary)] focus:outline-none transition-all text-current font-bold"
                />
              </div>
              <div className="w-24">
                 <label className="block text-xs font-black opacity-40 uppercase tracking-widest mb-2">Unit</label>
                 <select 
                  value={durationUnit}
                  onChange={e => setDurationUnit(e.target.value as any)}
                  className="w-full bg-[var(--element-bg)] border border-[var(--border)]/10 rounded-xl px-2 py-3 focus:border-[var(--primary)] focus:outline-none transition-all appearance-none text-xs font-bold text-current"
                >
                  <option value="minutes">Min</option>
                  <option value="hours">Hr</option>
                  <option value="days">Day</option>
                  <option value="weeks">Wk</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black opacity-40 uppercase tracking-widest mb-2">Prerequisites</label>
            <div className="max-h-32 overflow-y-auto border border-[var(--border)]/10 rounded-xl p-3 space-y-2 bg-[var(--element-bg)]/50 custom-scrollbar">
              {existingTasks.filter(t => t.id !== task?.id).map(t => (
                <div 
                  key={t.id}
                  onClick={() => toggleDependency(t.title)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-sm font-semibold transition-all ${
                    dependencies.includes(t.title) ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/5 text-current opacity-60'
                  }`}
                >
                  <i className={`fa-solid ${dependencies.includes(t.title) ? 'fa-circle-check' : 'fa-circle-plus opacity-30'}`}></i>
                  {t.title}
                </div>
              ))}
              {existingTasks.length <= 1 && (
                <p className="text-xs text-current opacity-30 text-center py-4 italic">No other steps to link yet.</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm text-current opacity-60 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 px-4 bg-[var(--primary)] hover:opacity-90 rounded-2xl font-black text-sm text-white transition-all shadow-lg"
            >
              {task ? 'Save Changes' : 'Add to Flow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;