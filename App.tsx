import React, { useState, useEffect, useCallback } from 'react';
import { Flow, Task, TaskStatus, Theme, AIResponse } from './types';
import { generateActionFlow } from './services/geminiService';
import Header from './components/Header';
import FlowCanvas from './components/FlowCanvas';
import AIComposer from './components/AIComposer';
import Sidebar from './components/Sidebar';
import TaskModal from './components/TaskModal';
import OCRScanner from './components/OCRScanner';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('peach');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem('actionflow_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFlows(parsed.flows || []);
        setTheme(parsed.theme || 'peach');
        if (parsed.flows?.length > 0) setActiveFlowId(parsed.flows[0].id);
      } catch (e) { console.error("Load fail"); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('actionflow_v7', JSON.stringify({ flows, theme }));
  }, [flows, theme]);

  const handleAIResult = (result: AIResponse) => {
    const newFlow: Flow = {
      id: crypto.randomUUID(),
      name: result.name,
      description: result.description,
      createdAt: Date.now(),
      tasks: result.tasks.map(t => ({
        ...t,
        id: crypto.randomUUID(),
        status: 'todo',
        priority: t.priority as any
      }))
    };
    setFlows(prev => [newFlow, ...prev]);
    setActiveFlowId(newFlow.id);
  };

  const handleGenerate = async (prompt: string, useAI: boolean) => {
    if (!useAI) {
      handleAIResult({ name: prompt, description: "New manual workflow", tasks: [] });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateActionFlow(prompt);
      handleAIResult(result);
    } catch (err: any) {
      console.error("Workflow Generation Error:", err);
      // More descriptive error for the user
      const msg = err.message || 'Check browser console for technical details.';
      setError(`AI encountered an issue: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFlow = flows.find(f => f.id === activeFlowId);

  return (
    <div className={`flex h-screen overflow-hidden app-container theme-${theme}`}>
      {/* Dynamic Background Elements */}
      {theme === 'peach' && (
        <>
          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>
          <div className="peach-petal" style={{ left: '15%', animationDelay: '0s' }}></div>
          <div className="peach-petal" style={{ left: '40%', animationDelay: '-5s', animationDuration: '12s' }}></div>
          <div className="peach-petal" style={{ left: '70%', animationDelay: '-10s', animationDuration: '18s' }}></div>
        </>
      )}
      {theme === 'onyx' && (
        <svg className="bat-watermark" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,4.5C10,4.5 9,5.5 8,6.5C7,7.5 6,8.5 4,8.5C2,8.5 2,7.5 2,6.5C2,5.5 3,4.5 5,3.5C7,2.5 9,2 12,2C15,2 17,2.5 19,3.5C21,4.5 22,5.5 22,6.5C22,7.5 22,8.5 20,8.5C18,8.5 17,7.5 16,6.5C15,5.5 14,4.5 12,4.5M12,19.5C14,19.5 15,18.5 16,17.5C17,16.5 18,15.5 20,15.5C22,15.5 22,16.5 22,17.5C22,18.5 21,19.5 19,20.5C17,21.5 15,22 12,22C9,22 7,21.5 5,20.5C3,19.5 2,18.5 2,17.5C2,16.5 2,15.5 4,15.5C6,15.5 7,16.5 8,17.5C9,18.5 10,19.5 12,19.5M12,12A2,2 0 0,0 10,14A2,2 0 0,0 12,16A2,2 0 0,0 14,14A2,2 0 0,0 12,12Z" />
        </svg>
      )}
      {theme === 'cyber' && <div className="bg-grid"></div>}
      
      <Sidebar 
        flows={flows} 
        activeId={activeFlowId} 
        onSelect={setActiveFlowId} 
        onDelete={(id) => setFlows(prev => prev.filter(f => f.id !== id))}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <Header 
          flow={activeFlow} 
          onOpenVisualizer={() => setIsVisualizerOpen(true)}
          currentTheme={theme}
          onThemeChange={setTheme}
        />
        
        {activeFlow ? (
          <>
            <div className="flex-none p-8 flex justify-center z-20">
              <AIComposer onGenerate={handleGenerate} isLoading={isLoading} onOpenScanner={() => setIsScannerOpen(true)} />
            </div>
            <FlowCanvas 
              flow={activeFlow} 
              onUpdateTaskStatus={(tid, s) => setFlows(prev => prev.map(f => f.id === activeFlowId ? {...f, tasks: f.tasks.map(t => t.id === tid ? {...t, status: s} : t)} : f))} 
              onEditTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
              onDeleteTask={(tid) => setFlows(prev => prev.map(f => f.id === activeFlowId ? {...f, tasks: f.tasks.filter(t => t.id !== tid)} : f))}
              onAddTask={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }}
            />
            
            <TaskModal 
              isOpen={isTaskModalOpen}
              onClose={() => setIsTaskModalOpen(false)}
              onSave={(data) => {
                setFlows(prev => prev.map(f => f.id === activeFlowId ? {
                  ...f,
                  tasks: editingTask 
                    ? f.tasks.map(t => t.id === editingTask.id ? {...t, ...data} as Task : t)
                    : [...f.tasks, {id: crypto.randomUUID(), status: 'todo', ...data} as Task]
                } : f));
              }}
              task={editingTask}
              existingTasks={activeFlow.tasks}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <h1 className="text-9xl font-black mb-6 tracking-tighter drop-shadow-2xl" style={{ color: 'var(--primary)' }}>ActionFlow</h1>
              <p className="text-2xl opacity-70 font-bold max-w-xl mx-auto leading-relaxed italic">
                Decompose your complex goals into executive action plans with AI intelligence.
              </p>
            </div>
            <div className="w-full max-w-5xl animate-in zoom-in duration-700">
              <AIComposer onGenerate={handleGenerate} isLoading={isLoading} onOpenScanner={() => setIsScannerOpen(true)} />
            </div>
            {error && (
              <div className="mt-8 text-rose-500 font-black bg-rose-50/90 px-8 py-4 rounded-2xl border-2 border-rose-200 animate-in fade-in slide-in-from-top-4 shadow-xl max-w-2xl text-center">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                {error}
              </div>
            )}
          </div>
        )}

        {isScannerOpen && <OCRScanner onResult={handleAIResult} onClose={() => setIsScannerOpen(false)} />}
        {isVisualizerOpen && activeFlow && <Visualizer tasks={activeFlow.tasks} onClose={() => setIsVisualizerOpen(false)} />}
        
        {activeFlow && (
          <button onClick={() => setActiveFlowId(null)} className="absolute bottom-12 right-12 w-16 h-16 bg-[var(--primary)] text-current rounded-3xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 z-50">
            <i className="fa-solid fa-plus text-2xl"></i>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;