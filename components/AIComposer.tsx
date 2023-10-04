import React, { useState, useEffect } from 'react';
import { enhancePrompt } from '../services/geminiService';

interface AIComposerProps {
  onGenerate: (prompt: string, useAI: boolean) => void;
  isLoading: boolean;
  onOpenScanner: () => void;
}

const AIComposer: React.FC<AIComposerProps> = ({ onGenerate, isLoading, onOpenScanner }) => {
  const [prompt, setPrompt] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => setShowConfirm(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt, useAI);
      setPrompt('');
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.start();
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (e) {
      console.error("Enhancement failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-[var(--card)] border-2 border-[var(--primary)] rounded-[2.5rem] shadow-2xl relative transition-all bg-opacity-90 backdrop-blur-xl">
      {showConfirm && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2 rounded-full text-[10px] font-black animate-bounce shadow-xl flex items-center gap-2 z-50">
          <i className={useAI ? "fa-solid fa-bolt-lightning" : "fa-solid fa-fingerprint"}></i>
          {useAI ? 'NEURAL ARCHITECT' : 'DIRECT INPUT'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-4 w-full">
        {/* Toggle AI/Manual Mode - Exchanged Contrasting Colors matching branding thunderbolt */}
        <button 
          type="button"
          onClick={() => { setUseAI(!useAI); setShowConfirm(true); }}
          className={`relative w-16 h-16 rounded-[1.4rem] transition-all duration-500 outline-none flex-shrink-0 flex items-center justify-center border-2 shadow-lg hover:scale-105 active:scale-90 ${
            useAI 
              ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--accent)]' 
              : 'bg-[var(--accent)] border-[var(--accent)] text-[var(--primary)]'
          }`}
          title={useAI ? "Switch to Manual Mode" : "Switch to AI Mode"}
        >
          <i className={`fa-solid ${useAI ? 'fa-wand-magic-sparkles' : 'fa-keyboard'} text-2xl transition-all duration-300 ${useAI ? 'rotate-12' : 'rotate-0'}`}></i>
        </button>

        {/* The Main Input Bar Container */}
        <div className="relative flex-1 flex items-center bg-[var(--element-bg)] rounded-[1.4rem] border-2 border-transparent transition-all focus-within:border-[var(--primary)] group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={useAI ? "Describe a complex goal..." : "Title of your plan..."}
            className="w-full bg-transparent py-5 px-6 focus:outline-none text-current font-extrabold placeholder-slate-400/60 text-lg"
            disabled={isLoading || isEnhancing}
          />
          
          <div className="flex gap-2 px-4 items-center">
            {useAI && prompt.trim() && (
              <button
                type="button"
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--accent)] transition-all duration-300 font-black border border-transparent hover:border-[var(--primary)]"
                title="Polish with AI"
              >
                {isEnhancing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-sparkles text-lg"></i>}
              </button>
            )}
            
            <button
              type="button"
              onClick={startVoice}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${isListening ? 'bg-rose-500 text-white border-rose-400 shadow-lg animate-pulse' : 'text-slate-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 border-transparent hover:border-[var(--primary)]/20'}`}
              title="Speak Goal"
            >
              <i className="fa-solid fa-microphone text-lg"></i>
            </button>

            <button
              type="button"
              onClick={onOpenScanner}
              className="w-11 h-11 text-slate-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 border border-transparent hover:border-[var(--primary)]/20 rounded-xl flex items-center justify-center transition-all duration-300"
              title="Scan Handwritten Notes"
            >
              <i className="fa-solid fa-camera-retro text-lg"></i>
            </button>
          </div>
        </div>

        {/* Submit Button - Contrasting text for high visibility */}
        <button
          type="submit"
          className="w-16 h-16 bg-[var(--primary)] text-[var(--accent)] rounded-[1.4rem] font-black transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale disabled:scale-100 flex-shrink-0 border-2 border-[var(--primary)]"
          disabled={isLoading || isEnhancing || !prompt.trim()}
        >
          {isLoading ? <i className="fa-solid fa-spinner-third fa-spin text-2xl"></i> : <i className="fa-solid fa-arrow-right-long text-2xl"></i>}
        </button>
      </form>
    </div>
  );
};

export default AIComposer;