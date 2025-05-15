import React, { useState } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaFileCode } from "react-icons/fa";

interface LrcOutputProps {
  lrcContent: string;
  onImport: (content: string) => void;
}

const LrcOutput: React.FC<LrcOutputProps> = ({ lrcContent, onImport }) => {
  const [copied, setCopied] = useState(false);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept .lrc files
    if (!file.name.toLowerCase().endsWith(".lrc")) {
      alert("Please upload a valid .lrc file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onImport(content);
    };
    reader.readAsText(file);

    // Reset the input so the same file can be uploaded again
    e.target.value = "";
  };

  // Download LRC file
  const handleDownload = () => {
    const blob = new Blob([lrcContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "lyrics.lrc");
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard
      .writeText(lrcContent)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <FaFileCode className="text-green-700 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">LRC Output</h2>
        </div>

        <div className="flex space-x-1">
          <button
            onClick={handleCopy}
            className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs"
            title="Copy to clipboard"
          >
            <FaCopy className="mr-1" />
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center px-2 py-1 bg-green-700 hover:bg-green-800 rounded text-white text-xs"
            disabled={!lrcContent}
            title="Download LRC file"
          >
            <FaDownload className="mr-1" />
            Download
          </button>
        </div>
      </div>

      <p className="text-xs text-green-800 mb-2">
        LRC format shows time-synced lyrics. You can import existing LRC files
        or export your work.
      </p>

      <textarea
        value={lrcContent}
        readOnly
        className="flex-grow w-full p-3 bg-green-50 text-gray-800 border border-green-400 rounded resize-none font-mono text-sm focus:outline-none focus:border-green-600"
        placeholder="LRC content will appear here..."
      />
    </div>
  );
};

export default LrcOutput;
