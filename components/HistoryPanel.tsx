import React from 'react';
import { Project } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
};


interface HistoryPanelProps {
  projects: Project[];
  activeProjectId: string | null;
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ projects, activeProjectId, onLoadProject, onDeleteProject, onNewProject }) => {
  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-200">Projects</h2>
      </div>
      <button 
        onClick={onNewProject}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
      >
        <PlusIcon className="w-5 h-5" />
        <span>New Project</span>
      </button>
      <div className="mt-4 flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
        {projects.length === 0 ? (
            <div className="text-center text-gray-500 pt-10">
                <p>No saved projects yet.</p>
                <p className="text-sm mt-1">Generated projects will appear here once you save them.</p>
            </div>
        ) : (
            projects.map(project => (
                <div 
                    key={project.id} 
                    onClick={() => onLoadProject(project.id)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all ${activeProjectId === project.id ? 'bg-blue-900/50 border-l-4 border-blue-400' : 'bg-gray-800 hover:bg-gray-700/70'}`}
                >
                    <p className="font-semibold text-gray-200 truncate">{project.name}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(project.createdAt)}</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(project.id);
                        }}
                        className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 text-gray-500 hover:text-red-400 bg-gray-700/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label={`Delete project ${project.name}`}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
