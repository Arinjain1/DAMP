import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-[#7c6ce0]';
  
  return (
    <div className={`fixed bottom-4 right-4 ${bg} text-white px-5 py-3 rounded-2xl shadow-xl shadow-[#BFB7FD]/30 flex items-center space-x-3 z-50 animate-fade-in-up border border-white/20 backdrop-blur-md`}>
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
      <span className="font-medium text-sm tracking-wide">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80 transition-opacity"><X size={16} /></button>
    </div>
  );
};

export default Toast;