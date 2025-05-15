import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaMusic, FaUpload } from 'react-icons/fa';

interface AudioFileUploadProps {
  onFileUpload: (file: File) => void;
  currentFile: File | null;
}

const AudioFileUpload: React.FC<AudioFileUploadProps> = ({
  onFileUpload,
  currentFile,
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file (MP3, WAV, etc.)');
        return;
      }

      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`inline-flex items-center cursor-pointer px-3 py-2 rounded-lg transition-colors duration-200
        ${isDragActive
          ? 'bg-blue-600 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
    >
      <input {...getInputProps()} />

      {currentFile ? (
        <div className="flex items-center">
          <FaMusic className="mr-1" />
          <span className="text-sm font-medium truncate max-w-[180px]">
            {currentFile.name}
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          <FaUpload className="mr-1" />
          <span className="text-sm font-medium">
            {isDragActive ? 'Drop audio here...' : 'Upload Audio'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioFileUpload;
