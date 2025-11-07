
import React, { useRef, useEffect } from 'react';
import Loader from './Loader';
import UploadIcon from './icons/UploadIcon';
import TrashIcon from './icons/TrashIcon';

interface InputPanelProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  uploadedImage: { previewUrl: string } | null;
  setUploadedImage: (image: { data: string; mimeType: string; previewUrl: string } | null) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ userInput, setUserInput, onGenerate, isLoading, uploadedImage, setUploadedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items || isLoading) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            event.preventDefault();

            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Url = reader.result as string;
              const parts = base64Url.split(',');
              const mimeType = parts[0].match(/:(.*?);/)?.[1];
              const base64Data = parts[1];

              if (mimeType && base64Data) {
                setUploadedImage({ data: base64Data, mimeType: mimeType, previewUrl: base64Url });
              }
            };
            reader.readAsDataURL(file);
            return; // Handle only the first image
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isLoading, setUploadedImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        const parts = base64Url.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1];
        const base64Data = parts[1];

        if (mimeType && base64Data) {
          setUploadedImage({ data: base64Data, mimeType: mimeType, previewUrl: base64Url });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg p-4 shadow-lg">
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        <label htmlFor="userInput" className="text-lg font-semibold text-gray-300 mb-2">
          Enter your requirements
        </label>
        <textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g., 'Create a user profile page where users can update their name, email, and profile picture.'"
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
          disabled={isLoading}
        />
        <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm font-semibold">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>
        <div className="mt-0">
          {uploadedImage ? (
            <div className="relative group p-2 bg-gray-900 rounded-lg">
              <img src={uploadedImage.previewUrl} alt="Wireframe preview" className="rounded-md max-h-48 w-full object-contain" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                aria-label="Remove image"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full px-4 transition bg-gray-900 border-2 border-gray-700 border-dashed rounded-md ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-800/60 hover:border-gray-500'}`}
              >
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <UploadIcon className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold text-blue-400">Upload a Wireframe/Image</span> or paste
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Optional. PNG, JPG, WEBP, or from clipboard.</p>
                </div>
              </label>
            </>
          )}
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={isLoading || (!userInput.trim() && !uploadedImage)}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center h-12 flex-shrink-0"
      >
        {isLoading ? <Loader /> : '✨ Generate'}
      </button>
    </div>
  );
};

export default InputPanel;