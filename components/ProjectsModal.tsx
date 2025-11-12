import React, { useEffect } from 'react';
import { Project } from '../types';
import CloseIcon from './icons/CloseIcon';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectsModal: React.FC<ProjectsModalProps> = ({ isOpen, onClose, projects, onLoadProject, onDeleteProject }) => {
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
      aria-labelledby="projects-modal-title"
    >
      <div
        className="bg-[#2d3748] w-full max-w-lg rounded-lg shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="projects-modal-title" className="text-xl font-bold text-white">Saved Projects</h2>
        </div>
        <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
          {projects.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No saved projects found.</p>
          ) : (
            projects.map(project => (
              <div key={project.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-md">
                <span className="text-gray-200 font-medium truncate pr-4">{project.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onLoadProject(project.id)}
                    className="px-4 py-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
                            onDeleteProject(project.id)
                        }
                    }}
                    className="px-4 py-1.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end">
           <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
           >
            Close
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsModal;