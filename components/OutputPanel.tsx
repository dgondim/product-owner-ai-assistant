import React, { useState, useRef } from 'react';
import { Epic, OutputTab } from '../types';
import CodeIcon from './icons/CodeIcon';
import JiraIcon from './icons/JiraIcon';
import BoardIcon from './icons/BoardIcon';
import Loader from './Loader';
import ExpandIcon from './icons/ExpandIcon';
import CloseIcon from './icons/CloseIcon';
import DownloadIcon from './icons/DownloadIcon';
import html2canvas from 'html2canvas';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import SparklesIcon from './icons/SparklesIcon';

interface OutputPanelProps {
  uiCode: string | null;
  jiraStories: Epic[] | null;
  isLoading: boolean;
  error: string | null;
  activeTab: OutputTab;
  setActiveTab: (tab: OutputTab) => void;
  onRefine: (instruction: string) => void;
  isRefining: boolean;
  onGenerateVariant: () => void;
}

const TabButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
      isActive
        ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
    }`}
  >
    {children}
  </button>
);

const UIPreview: React.FC<{ htmlContent: string }> = ({ htmlContent }) => (
  <div className="w-full h-full bg-white rounded-lg overflow-auto">
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  </div>
);

const exportJiraToCsv = (epics: Epic[]) => {
    if (!epics || epics.length === 0) return;

    let csvContent = "Epic,Story Title,User Story,Acceptance Criteria,BDD Scenario,Given,When,Then\n";

    const escapeCsvCell = (cellData: string) => {
        if (/[",\n]/.test(cellData)) {
            return `"${cellData.replace(/"/g, '""')}"`;
        }
        return cellData;
    };

    epics.forEach(epic => {
        epic.stories.forEach(story => {
            const epicTitle = escapeCsvCell(epic.epicTitle);
            const storyTitle = escapeCsvCell(story.title);
            const userStory = escapeCsvCell(story.userStory);
            const acceptanceCriteria = escapeCsvCell(story.acceptanceCriteria.join('\n'));

            if (story.bddScenarios && story.bddScenarios.length > 0) {
                story.bddScenarios.forEach(bdd => {
                    const bddScenario = escapeCsvCell(bdd.scenario);
                    const bddGiven = escapeCsvCell(bdd.given);
                    const bddWhen = escapeCsvCell(bdd.when);
                    const bddThen = escapeCsvCell(bdd.then);
                    csvContent += `${epicTitle},${storyTitle},${userStory},${acceptanceCriteria},${bddScenario},${bddGiven},${bddWhen},${bddThen}\n`;
                });
            } else {
                csvContent += `${epicTitle},${storyTitle},${userStory},${acceptanceCriteria},,,, \n`;
            }
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "jira_stories.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


const JiraStoriesDisplay: React.FC<{ epics: Epic[] }> = ({ epics }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const handleCopyHtml = () => {
        if (!contentRef.current) return;
        
        navigator.clipboard.writeText(contentRef.current.innerHTML)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            })
            .catch(err => {
                console.error('Failed to copy HTML to clipboard: ', err);
                alert('Failed to copy content.');
            });
    };
    
    return (
        <div className="relative">
             <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                <button
                    onClick={() => exportJiraToCsv(epics)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-all text-gray-200"
                    aria-label="Export stories as CSV"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Export CSV</span>
                </button>
                <button
                    onClick={handleCopyHtml}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-all text-gray-200"
                    aria-label="Copy stories as HTML"
                >
                    {copied ? (
                        <>
                            <CheckIcon className="w-4 h-4 text-green-400" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-4 h-4" />
                            <span>Copy HTML</span>
                        </>
                    )}
                </button>
            </div>
            <div ref={contentRef} className="space-y-8 pt-10">
                {epics.map((epic, epicIndex) => (
                    <div key={epicIndex}>
                        <h2 className="text-2xl font-bold text-purple-400 mb-4 border-b-2 border-purple-400/50 pb-2">{epic.epicTitle}</h2>
                        <div className="space-y-6">
                            {epic.stories.map((story, index) => (
                                <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <h3 className="text-xl font-bold text-blue-400 mb-2">{story.title}</h3>
                                    <p className="italic text-gray-300 mb-3">"{story.userStory}"</p>
                                    
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-200 mb-2">Acceptance Criteria</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                                            {story.acceptanceCriteria.map((ac, acIndex) => (
                                            <li key={acIndex}>{ac}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold text-gray-200 mb-2">BDD Scenarios</h4>
                                        {story.bddScenarios.map((bdd, bddIndex) => (
                                            <div key={bddIndex} className="bg-gray-800/50 p-3 rounded mt-2">
                                                <p className="font-semibold text-gray-300">{bdd.scenario}</p>
                                                <p className="text-gray-400"><span className="font-bold text-gray-300">Given</span> {bdd.given}</p>
                                                <p className="text-gray-400"><span className="font-bold text-gray-300">When</span> {bdd.when}</p>
                                                <p className="text-gray-400"><span className="font-bold text-gray-300">Then</span> {bdd.then}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StoryBoardDisplay: React.FC<{ epics: Epic[] }> = ({ epics }) => (
  <div className="flex space-x-4 overflow-x-auto pb-4 h-full">
    {epics.map((epic, index) => (
      <div key={index} className="flex-shrink-0 w-80 bg-gray-900 rounded-lg p-3">
        <h3 className="text-lg font-bold text-purple-400 mb-4 px-1">{epic.epicTitle}</h3>
        <div className="space-y-3">
          {epic.stories.map((story, storyIndex) => (
            <div key={storyIndex} className="bg-gray-800 p-3 rounded-md border border-gray-700 shadow-sm hover:bg-gray-700/50 cursor-pointer transition-colors">
              <h4 className="font-semibold text-gray-200">{story.title}</h4>
              <p className="text-sm text-gray-400 mt-1 italic">"{story.userStory.substring(0, 100)}{story.userStory.length > 100 ? '...' : ''}"</p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const UIPrototypeContent: React.FC<{
    uiCode: string;
    handleExport: (targetRef: React.RefObject<HTMLDivElement>) => void;
    isExporting: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    onGenerateVariant: () => void;
    onRefine: (instruction: string) => void;
    isRefining: boolean;
    isLoading: boolean;
}> = ({ uiCode, handleExport, isExporting, setIsModalOpen, onGenerateVariant, onRefine, isRefining, isLoading }) => {
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const [refinementInput, setRefinementInput] = useState('');

    const handleRefinementSubmit = () => {
        onRefine(refinementInput);
        setRefinementInput('');
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-b-lg">
            <div className="flex-shrink-0 flex justify-between items-center p-2 border-b border-gray-700">
                <p className="text-sm font-medium text-gray-300">Preview</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onGenerateVariant}
                        disabled={isLoading || isRefining}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Generate an alternative UI design"
                    >
                        <ShuffleIcon className="w-4 h-4" />
                        <span>Alternative</span>
                    </button>
                    <button 
                        onClick={() => handleExport(previewWrapperRef)}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-200 disabled:bg-gray-500 disabled:cursor-wait min-w-[100px]"
                        aria-label="Export UI Prototype as PNG"
                    >
                        {isExporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-200"></div>
                                <span>Exporting...</span>
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="w-4 h-4" />
                                <span>Export PNG</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-200"
                        aria-label="Expand UI Prototype"
                    >
                        <ExpandIcon className="w-4 h-4" />
                        Expand
                    </button>
                </div>
            </div>
            <div className="flex-grow relative" ref={previewWrapperRef}>
                 <div className="absolute inset-0">
                    <UIPreview htmlContent={uiCode} />
                 </div>
            </div>
            <div className="flex-shrink-0 p-2 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={refinementInput}
                        onChange={(e) => setRefinementInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && refinementInput.trim() && !isRefining) handleRefinementSubmit()}}
                        placeholder="e.g., 'Change the primary button to purple.'"
                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        disabled={isRefining}
                    />
                    <button
                        onClick={handleRefinementSubmit}
                        disabled={isRefining || !refinementInput.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isRefining ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <SparklesIcon className="w-4 h-4" />}
                        <span>Refine</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


const OutputPanel: React.FC<OutputPanelProps> = ({ uiCode, jiraStories, isLoading, error, activeTab, setActiveTab, onRefine, isRefining, onGenerateVariant }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const modalWrapperRef = useRef<HTMLDivElement>(null);
  
  const handleExport = async (targetRef: React.RefObject<HTMLDivElement>) => {
    if (!targetRef.current) {
        console.error("Target for export not found");
        return;
    }

    setIsExporting(true);
    try {
        const canvas = await html2canvas(targetRef.current, { 
            scale: 2,
            useCORS: true, 
            backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'ui-prototype.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Failed to export UI as PNG', error);
    } finally {
        setIsExporting(false);
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Loader />
          <p className="mt-4 text-lg">Generating, please wait...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-400">
          <p>Error: {error}</p>
        </div>
      );
    }
    
    if (!uiCode && !jiraStories) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Your generated assets will appear here.</p>
        </div>
      );
    }

    if (activeTab === OutputTab.UI_PROTOTYPE) {
        if (!uiCode) {
            return <div className="flex items-center justify-center h-full text-gray-500"><p>No UI prototype generated.</p></div>;
        }
        return <UIPrototypeContent
            uiCode={uiCode}
            handleExport={handleExport}
            isExporting={isExporting}
            setIsModalOpen={setIsModalOpen}
            onGenerateVariant={onGenerateVariant}
            onRefine={onRefine}
            isRefining={isRefining}
            isLoading={isLoading}
        />
    }

    if (activeTab === OutputTab.JIRA_STORIES) {
      return jiraStories && jiraStories.length > 0 ? <JiraStoriesDisplay epics={jiraStories} /> : <div className="flex items-center justify-center h-full text-gray-500"><p>No Jira stories generated.</p></div>;
    }

    if (activeTab === OutputTab.STORY_BOARD) {
        return jiraStories && jiraStories.length > 0 ? <StoryBoardDisplay epics={jiraStories} /> : <div className="flex items-center justify-center h-full text-gray-500"><p>No story board data available.</p></div>;
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg shadow-lg">
      <div className="flex-shrink-0 border-b border-gray-700 px-4">
        <div className="flex">
          <TabButton isActive={activeTab === OutputTab.UI_PROTOTYPE} onClick={() => setActiveTab(OutputTab.UI_PROTOTYPE)}>
            <CodeIcon className="w-5 h-5" />
            UI Prototype
          </TabButton>
          <TabButton isActive={activeTab === OutputTab.JIRA_STORIES} onClick={() => setActiveTab(OutputTab.JIRA_STORIES)}>
            <JiraIcon className="w-5 h-5" />
            Jira Stories
          </TabButton>
          <TabButton isActive={activeTab === OutputTab.STORY_BOARD} onClick={() => setActiveTab(OutputTab.STORY_BOARD)}>
            <BoardIcon className="w-5 h-5" />
            Story Board
          </TabButton>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-auto">
        {renderContent()}
      </div>

      {isModalOpen && uiCode && (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setIsModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-gray-800 w-full h-full max-w-7xl rounded-lg shadow-2xl flex flex-col relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex justify-between items-center p-3 bg-gray-900 border-b border-gray-700">
                    <h3 id="modal-title" className="text-lg font-semibold">UI Prototype Full View</h3>
                    <div className="flex items-center gap-3">
                         <button 
                            onClick={() => handleExport(modalWrapperRef)}
                            disabled={isExporting}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-white disabled:bg-blue-800 disabled:cursor-wait w-40"
                            aria-label="Export UI Prototype as PNG"
                        >
                            {isExporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="w-5 h-5" />
                                    <span>Export as PNG</span>
                                </>
                            )}
                        </button>
                        <button 
                          onClick={() => setIsModalOpen(false)} 
                          className="text-gray-400 hover:text-white rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                          aria-label="Close modal"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-auto" ref={modalWrapperRef}>
                    <UIPreview htmlContent={uiCode} />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;