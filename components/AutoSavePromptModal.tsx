import React, { useEffect } from 'react';
import InfoIcon from './icons/InfoIcon';

interface AutoSavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

const AutoSavePromptModal: React.FC<AutoSavePromptModalProps> = ({ isOpen, onClose, onConfirm, projectName }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="autosave-modal-title"
    >
      <div
        className="bg-[#2d3748] w-full max-w-md rounded-lg shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-800/50 p-4 flex items-center justify-center mx-auto mb-3.5">
                <InfoIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 id="autosave-modal-title" className="mb-5 text-xl font-semibold text-white">Auto-save</h3>
            <p className="mb-6 text-gray-300">We've detected unsaved changes to <span className="font-bold text-gray-100">"{projectName}"</span>. Would you like to save them?</p>
            
            <div className="flex justify-center gap-4">
                <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                >
                    Dismiss
                </button>
                <button
                    onClick={onConfirm}
                    className="px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AutoSavePromptModal;
