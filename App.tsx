import React, { useState, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import { generateUIPrototype, generateJiraStories, refineUIPrototype, generateUIVariant } from './services/geminiService';
import { Epic, OutputTab } from './types';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("Create a user profile page where users can update their name, email, and profile picture. Include a section to show their recent activity and a button to delete their account.");
  const [uiCode, setUiCode] = useState<string | null>(null);
  const [jiraStories, setJiraStories] = useState<Epic[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>(OutputTab.UI_PROTOTYPE);
  const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; previewUrl: string; } | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);

  const handleGenerate = useCallback(async () => {
    if (!userInput.trim() && !uploadedImage) return;

    setIsLoading(true);
    setError(null);
    setUiCode(null);
    setJiraStories(null);
    setActiveTab(OutputTab.UI_PROTOTYPE);

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
        // Still show the UI if it was successful
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

      setIsLoading(true); // Reuse main loader
      setError(null);
      setUiCode(null); // Clear old UI to show loader
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
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-150px)]">
          <InputPanel 
            userInput={userInput}
            setUserInput={setUserInput}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
          />
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
        </main>
      </div>
    </div>
  );
};

export default App;