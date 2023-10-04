import React, { useRef, useState, useEffect } from 'react';
import { extractTasksFromImage } from '../services/geminiService';
import { AIResponse } from '../types';

interface OCRScannerProps {
  onResult: (result: AIResponse) => void;
  onClose: () => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onResult, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setError("Camera access denied. Please check permissions.");
      }
    }
    startCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = async () => {
    if (!canvasRef.current || !videoRef.current || isProcessing) return;
    setIsProcessing(true);
    
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      try {
        const result = await extractTasksFromImage(base64);
        onResult(result);
        onClose();
      } catch (err) {
        setError("AI failed to read notes. Try again with better lighting.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full border-2 border-dashed border-white/50 rounded-2xl"></div>
        </div>

        <div className="p-8 flex flex-col items-center gap-4 bg-slate-900">
          {error && <p className="text-rose-400 font-bold text-sm mb-2">{error}</p>}
          <div className="flex gap-4 w-full">
             <button onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl uppercase tracking-widest text-xs transition-all">Cancel</button>
             <button 
              onClick={capture} 
              disabled={isProcessing}
              className="flex-1 py-4 bg-[var(--primary)] hover:opacity-90 text-white font-black rounded-2xl uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2"
             >
               {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
               {isProcessing ? 'SCANNING...' : 'CAPTURE NOTES'}
             </button>
          </div>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Hold steady for better OCR results</p>
        </div>
      </div>
    </div>
  );
};

export default OCRScanner;