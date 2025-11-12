import React, { useState, useCallback, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import ProjectsModal from './components/ProjectsModal';
import SaveProjectModal from './components/SaveProjectModal';
import Toast from './components/Toast';
import { generateUIPrototype, generateJiraStories, refineUIPrototype, generateUIVariant } from './services/geminiService';
import { Epic, OutputTab, Project } from './types';
import SaveIcon from './components/icons/SaveIcon';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("Create a user profile page where users can update their name, email, and profile picture. Include a section to show their recent activity and a button to delete their account.");
  const [uiCode, setUiCode] = useState<string | null>(null);
  const [jiraStories, setJiraStories] = useState<Epic[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>(OutputTab.UI_PROTOTYPE);
  const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; previewUrl: string; } | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');


  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('po-ai-projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    } catch (e) {
      console.error("Failed to parse projects from localStorage", e);
      return [];
    }
  });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('po-ai-projects', JSON.stringify(projects));
  }, [projects]);


  const handleGenerate = useCallback(async () => {
    if (!userInput.trim() && !uploadedImage) return;

    setIsLoading(true);
    setError(null);
    setUiCode(null);
    setJiraStories(null);
    setActiveTab(OutputTab.UI_PROTOTYPE);
    setActiveProjectId(null); // New generation is a new, unsaved project

    try {
      const imagePart = uploadedImage ? {
          inlineData: {
              data: uploadedImage.data,
              mimeType: uploadedImage.mimeType
          }
      } : undefined;

      const [uiResult, jiraResult] = await Promise.all([
        generateUIPrototype(userInput, imagePart),
        generateJiraStories(userInput, imagePart)
      ]);

      setUiCode(uiResult);

      try {
        const parsedJiraStories = JSON.parse(jiraResult);
        setJiraStories(parsedJiraStories);
      } catch (parseError) {
        console.error("Failed to parse Jira stories JSON:", parseError);
        console.error("Received string:", jiraResult);
        setError("Failed to parse Jira stories from the AI. Please try again.");
      }

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, uploadedImage]);

  const handleRefine = useCallback(async (instruction: string) => {
    if (!instruction.trim() || !uiCode) return;

    setIsRefining(true);
    setError(null);

    try {
        const refinedUi = await refineUIPrototype(uiCode, instruction);
        setUiCode(refinedUi);
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during refinement.';
        setError(errorMessage);
    } finally {
        setIsRefining(false);
    }
  }, [uiCode]);

  const handleGenerateVariant = useCallback(async () => {
      if ((!userInput.trim() && !uploadedImage) || !uiCode) return;

      setIsLoading(true);
      setError(null);
      setUiCode(null);
      setActiveTab(OutputTab.UI_PROTOTYPE);

      try {
          const imagePart = uploadedImage ? {
              inlineData: { data: uploadedImage.data, mimeType: uploadedImage.mimeType }
          } : undefined;

          const variantUi = await generateUIVariant(userInput, uiCode, imagePart);
          setUiCode(variantUi);

      } catch (e) {
          console.error(e);
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while generating a variant.';
          setError(errorMessage);
          setUiCode(uiCode); // Restore old UI on error
      } finally {
          setIsLoading(false);
      }
  }, [userInput, uploadedImage, uiCode]);

  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : undefined;

  const isContentUnchanged = activeProject
    ? activeProject.uiCode === uiCode &&
      JSON.stringify(activeProject.jiraStories) === JSON.stringify(jiraStories) &&
      activeProject.userInput === userInput
    : false;

  const handleSaveOrUpdateProject = useCallback(() => {
    if (activeProjectId) {
      // Update existing project
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === activeProjectId
            ? { ...p, uiCode: uiCode!, jiraStories: jiraStories!, userInput, createdAt: new Date().toISOString() }
            : p
        )
      );
      setToastMessage('Project updated successfully!');
    } else {
      // Open modal to save new project
      setIsSaveModalOpen(true);
    }
  }, [activeProjectId, userInput, uiCode, jiraStories]);

  const handleSaveNewProject = (name: string) => {
    if (name && uiCode && jiraStories) {
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name,
        userInput,
        uiCode,
        jiraStories,
        createdAt: new Date().toISOString(),
      };
      setProjects(prevProjects => [newProject, ...prevProjects]);
      setActiveProjectId(newProject.id);
      setIsSaveModalOpen(false);
      setToastMessage('Project saved successfully!');
    }
  };


  const handleLoadProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setUserInput(project.userInput);
      setUiCode(project.uiCode);
      setJiraStories(project.jiraStories);
      setUploadedImage(null);
      setError(null);
      setActiveProjectId(project.id);
      setActiveTab(OutputTab.UI_PROTOTYPE);
      setIsProjectsModalOpen(false);
    }
  }, [projects]);

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
      setUserInput('');
      setUiCode(null);
      setJiraStories(null);
    }
  }, [activeProjectId]);
  
  const defaultProjectName = userInput.trim()
    ? (userInput.trim().length > 40 ? userInput.trim().substring(0, 40) + '...' : userInput.trim())
    : 'New Project';

  const saveButtonText = activeProject ? (isContentUnchanged ? 'Saved' : 'Update Project') : 'Save Project';
  const isSaveDisabled = (activeProject && isContentUnchanged) || !uiCode || !jiraStories || isLoading || isRefining;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Product Owner AI Assistant
          </h1>
          <p className="text-gray-400 mt-2">
            Transform your ideas into wireframes and user stories instantly.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={handleSaveOrUpdateProject}
              disabled={isSaveDisabled}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                 !uiCode || !jiraStories ? "Cannot save until both UI and Jira Stories are generated." :
                 isContentUnchanged ? "Project is saved with the current content." :
                 activeProject ? "Save changes to the current project." :
                 "Save the generated UI and stories as a new project."
              }
            >
              <SaveIcon className="w-5 h-5" />
              <span>{saveButtonText}</span>
            </button>
            <button
              onClick={() => setIsProjectsModalOpen(true)}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors"
            >
              Projects
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-210px)]">
          <div className="xl:col-span-1">
            <InputPanel
              userInput={userInput}
              setUserInput={setUserInput}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
            />
          </div>
          <div className="xl:col-span-1">
            <OutputPanel
              uiCode={uiCode}
              jiraStories={jiraStories}
              isLoading={isLoading}
              error={error}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onRefine={handleRefine}
              isRefining={isRefining}
              onGenerateVariant={handleGenerateVariant}
            />
          </div>
        </main>
      </div>
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
      />
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveNewProject}
        defaultName={defaultProjectName}
      />
      <Toast
        message={toastMessage}
        show={!!toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
};

export default App;