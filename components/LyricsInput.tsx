import React from 'react';
import { FaMusic } from 'react-icons/fa';

interface LyricsInputProps {
  value: string;
  onChange: (text: string) => void;
}

const LyricsInput: React.FC<LyricsInputProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-2">
        <FaMusic className="text-yellow-700 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Raw Lyrics</h2>
      </div>

      <p className="text-xs text-yellow-800 mb-2">
        Enter each line of lyrics on a new line. Set markers for each line using the "Set Marker" button.
      </p>

      <textarea
        value={value}
        onChange={handleChange}
        className="flex-grow w-full p-3 bg-yellow-50 text-gray-800 border border-yellow-400 rounded resize-none focus:outline-none focus:border-yellow-600"
        placeholder="Enter your lyrics here..."
      />
    </div>
  );
};

export default LyricsInput;
