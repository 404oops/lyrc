import { useState, useRef, useEffect, useCallback } from "react";
import { AudioState } from "../types";

export const useAudioPlayer = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioFile: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    // Create AudioContext on component mount
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Cleanup on unmount
    return () => {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Set up audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setAudioState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const updateDuration = () => {
      setAudioState((prev) => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    const handleEnded = () => {
      setAudioState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
      audio.currentTime = 0;
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef.current]);

  // Load audio file
  const loadAudioFile = useCallback((file: File) => {
    const audio = audioRef.current;
    if (!audio) return;

    const fileURL = URL.createObjectURL(file);
    audio.src = fileURL;
    audio.load();

    setAudioState((prev) => ({
      ...prev,
      audioFile: file,
      isPlaying: false,
      currentTime: 0,
    }));

    // Clean up the object URL when done
    return () => {
      URL.revokeObjectURL(fileURL);
    };
  }, []);

  // Play/pause toggle
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioState.audioFile) return;

    if (audioState.isPlaying) {
      audio.pause();
      setAudioState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audio.play();
      setAudioState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [audioState.isPlaying, audioState.audioFile]);

  // Seek to a specific time
  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      // Ensure time is within valid range
      const clampedTime = Math.max(0, Math.min(time, audioState.duration));
      audio.currentTime = clampedTime;

      setAudioState((prev) => ({
        ...prev,
        currentTime: clampedTime,
      }));
    },
    [audioState.duration]
  );

  // Skip forward or backward
  const skip = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const newTime = audio.currentTime + seconds;
      seekTo(newTime);
    },
    [seekTo]
  );

  return {
    audioState,
    audioRef,
    audioContextRef,
    loadAudioFile,
    togglePlayPause,
    seekTo,
    skip,
  };
};
