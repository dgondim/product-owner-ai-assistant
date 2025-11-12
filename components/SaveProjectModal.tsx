import React, { useState, useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName: string;
}

const SaveProjectModal: React.FC<SaveProjectModalProps> = ({ isOpen, onClose, onSave, defaultName }) => {
  const [projectName, setProjectName] = useState(defaultName);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      setProjectName(defaultName);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, defaultName, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (projectName.trim()) {
      onSave(projectName.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-project-modal-title"
    >
      <div
        className="bg-[#2d3748] w-full max-w-md rounded-lg shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="save-project-modal-title" className="text-xl font-bold text-white">Save Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full"><CloseIcon /></button>
        </div>
        <div className="p-6 space-y-4">
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-300">
                Project Name
            </label>
            <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave()}}
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter a name for your project"
                autoFocus
            />
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
           <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
           >
            Cancel
           </button>
           <button
            onClick={handleSave}
            disabled={!projectName.trim()}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
            Save
           </button>
        </div>
      </div>
    </div>
  );
};

export default SaveProjectModal;