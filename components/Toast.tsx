import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="bg-slate-800/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
        <div className="bg-green-500 rounded-full p-0.5">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
        {message}
      </div>
    </div>
  );
};