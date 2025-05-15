"use client";
import { useEffect, useState } from "react";
import AudioWaveform from "../components/AudioWaveform";
import TransportControls from "../components/TransportControls";
import LyricsInput from "../components/LyricsInput";
import PredictiveLyricsDisplay from "../components/PredictiveLyricsDisplay";
import LrcOutput from "../components/LrcOutput";
import AudioFileUpload from "../components/AudioFileUpload";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useLrcEditor } from "../hooks/useLrcEditor";

function App() {
  // Setup audio player
  const { audioState, audioRef, loadAudioFile, togglePlayPause, seekTo, skip } =
    useAudioPlayer();

  // Setup LRC editor
  const {
    lyrics,
    lyricsText,
    markers,
    globalDelay,
    currentLyricIndex,
    updateLyrics,
    addMarker,
    updateMarker,
    removeMarker,
    setGlobalDelay,
    applyGlobalDelay,
    nudgeMarkersForward,
    nudgeMarkersBackward,
    updateCurrentLyricIndex,
    importLrc,
    generateLrcContent,
  } = useLrcEditor();

  // Update current lyric based on playback time
  useEffect(() => {
    updateCurrentLyricIndex(audioState.currentTime);
  }, [audioState.currentTime, updateCurrentLyricIndex]);

  // Generate LRC content when lyrics or markers change
  const [lrcContent, setLrcContent] = useState<string>("");

  useEffect(() => {
    setLrcContent(generateLrcContent());
  }, [lyrics, markers, generateLrcContent]);

  // Handle audio file upload
  const handleFileUpload = (file: File) => {
    loadAudioFile(file);
  };

  return (
    <div className="h-screen bg-gray-900 text-white p-4 overflow-hidden flex flex-col">
      <audio ref={audioRef} className="hidden" />

      <header className="mb-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold italic">
          L Y R C -- Local lYRic Composer
        </h1>
        <div>
          <AudioFileUpload
            onFileUpload={handleFileUpload}
            currentFile={audioState.audioFile}
          />
        </div>
      </header>

      <div className="flex h-full gap-4">
        {/* Left Column */}
        <div className="flex flex-col w-2/3 gap-4">
          {/* Blue Area - Waveform */}
          <div className="bg-blue-400 rounded-lg p-4 h-[45%] overflow-hidden">
            <AudioWaveform
              audioFile={audioState.audioFile}
              audioRef={audioRef}
              currentTime={audioState.currentTime}
              markers={markers}
              onMarkerUpdate={updateMarker}
              onMarkerRemove={removeMarker}
              onTimeUpdate={seekTo}
              onSeek={seekTo}
              lyrics={lyrics}
            />
          </div>

          {/* Orange Area - Transport Controls */}
          <div className="bg-orange-400 rounded-lg p-4 h-[10%]">
            <TransportControls
              isPlaying={audioState.isPlaying}
              currentTime={audioState.currentTime}
              duration={audioState.duration}
              onPlayPause={togglePlayPause}
              onSeek={seekTo}
              onSkip={skip}
              onAddMarker={addMarker}
              onNudgeForward={nudgeMarkersForward}
              onNudgeBackward={nudgeMarkersBackward}
            />
          </div>

          <div className="flex gap-4 h-[42.5%]">
            {/* Yellow Area - Lyrics Input */}
            <div className="bg-yellow-300 rounded-lg p-4 w-1/2">
              <LyricsInput value={lyricsText} onChange={updateLyrics} />
            </div>

            {/* Green Area - LRC Output */}
            <div className="bg-green-400 rounded-lg p-4 w-1/2">
              <LrcOutput lrcContent={lrcContent} onImport={importLrc} />
            </div>
          </div>
        </div>

        {/* Red Area - Live Lyrics Display */}
        <div className="bg-red-400 rounded-lg p-4 w-1/3">
          <PredictiveLyricsDisplay
            lyrics={lyrics}
            currentIndex={currentLyricIndex}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
