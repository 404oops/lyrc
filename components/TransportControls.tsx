import React from "react";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaMapMarker,
  FaClock,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import { formatTime } from "../utils/lrcUtils";

interface TransportControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkip: (seconds: number) => void;
  onAddMarker: (time: number) => void;
  onNudgeForward: () => void;
  onNudgeBackward: () => void;
}

const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onSkip,
  onAddMarker,
  onNudgeForward,
  onNudgeBackward,
}) => {
  // Handle slider change
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  // Format time display (minutes:seconds)
  const formatTimeDisplay = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Time display and main controls */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="text-sm text-gray-800 bg-orange-300 px-2 py-1 rounded">
          {formatTimeDisplay(currentTime)} / {formatTimeDisplay(duration)}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onSkip(-3)}
            className="p-2 rounded bg-orange-500 hover:bg-orange-600 text-white"
            title="Rewind 3 seconds"
          >
            <FaStepBackward />
          </button>

          <button
            onClick={onPlayPause}
            className="p-2 rounded bg-orange-600 hover:bg-orange-700 text-white"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            onClick={() => onSkip(3)}
            className="p-2 rounded bg-orange-500 hover:bg-orange-600 text-white"
            title="Forward 3 seconds"
          >
            <FaStepForward />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-800 font-medium flex items-center">
            <FaClock className="mr-1" /> Global Delay:
          </div>

          <button
            onClick={onNudgeBackward}
            className="p-2 rounded bg-orange-500 hover:bg-orange-600 text-white"
            title="Nudge all markers backward by 100ms"
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={onNudgeForward}
            className="p-2 rounded bg-orange-500 hover:bg-orange-600 text-white"
            title="Nudge all markers forward by 100ms"
          >
            <FaChevronRight />
          </button>
        </div>

        <button
          onClick={() => onAddMarker(currentTime)}
          className="p-2 rounded bg-red-600 hover:bg-red-700 text-white flex items-center"
          title="Set marker at current time"
        >
          <FaMapMarker className="mr-1" /> Set Marker
        </button>
      </div>

      {/* Seek slider */}
      <div className="flex-grow flex items-center">
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.01"
          value={currentTime}
          onChange={handleSeekChange}
          className="w-full h-3"
        />
      </div>
    </div>
  );
};

export default TransportControls;
