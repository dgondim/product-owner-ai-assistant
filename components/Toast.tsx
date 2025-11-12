import React, { useEffect } from 'react';
import CheckIcon from './icons/CheckIcon';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div 
        className={`fixed top-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 z-[100] transition-all duration-300 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}`}
    >
       <CheckIcon className="w-5 h-5" />
       <span>{message}</span>
    </div>
  );
};

export default Toast;
