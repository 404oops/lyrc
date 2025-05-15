import { useState, useCallback } from "react";
import { TimeMarker, LrcLine, LrcFile } from "../types";
import { splitLyrics, parseLrc, generateLrc } from "../utils/lrcUtils";

export const useLrcEditor = () => {
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [lyricsText, setLyricsText] = useState<string>("");
  const [markers, setMarkers] = useState<TimeMarker[]>([]);
  const [globalDelay, setGlobalDelay] = useState<number>(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(-1);

  // Update lyrics from text input
  const updateLyrics = useCallback((text: string) => {
    setLyricsText(text);
    const lyricsArray = splitLyrics(text);
    setLyrics(lyricsArray);

    // Adjust markers if necessary (e.g., if lines were added or removed)
    setMarkers((prevMarkers) => {
      // Keep only markers that still have corresponding lyrics
      return prevMarkers.filter(
        (marker) => marker.lyricIndex < lyricsArray.length
      );
    });
  }, []);

  // Add a new marker at the specified time
  const addMarker = useCallback(
    (time: number) => {
      // Find the next lyric line that doesn't have a marker yet
      const existingIndices = new Set(markers.map((m) => m.lyricIndex));
      let nextIndex = 0;

      while (nextIndex < lyrics.length && existingIndices.has(nextIndex)) {
        nextIndex++;
      }

      // If we found a lyric line without a marker, add a marker for it
      if (nextIndex < lyrics.length) {
        const newMarker: TimeMarker = {
          id: `marker-${Date.now()}-${nextIndex}`,
          time,
          lyricIndex: nextIndex,
        };

        setMarkers((prev) =>
          [...prev, newMarker].sort((a, b) => a.time - b.time)
        );
        setCurrentLyricIndex(nextIndex);
      }
    },
    [lyrics, markers]
  );

  // Update an existing marker
  const updateMarker = useCallback((id: string, time: number) => {
    setMarkers((prev) =>
      prev
        .map((marker) => (marker.id === id ? { ...marker, time } : marker))
        .sort((a, b) => a.time - b.time)
    );
  }, []);

  // Remove a marker
  const removeMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  }, []);

  // Apply global delay to all markers
  const applyGlobalDelay = useCallback(() => {
    if (globalDelay === 0) return;

    setMarkers((prev) =>
      prev
        .map((marker) => ({
          ...marker,
          time: Math.max(0, marker.time + globalDelay),
        }))
        .sort((a, b) => a.time - b.time)
    );

    // Reset global delay after applying
    setGlobalDelay(0);
  }, [globalDelay]);

  // Nudge all markers forward by a small amount (100ms)
  const nudgeMarkersForward = useCallback(() => {
    const nudgeAmount = 0.1; // 100ms

    setMarkers((prev) =>
      prev
        .map((marker) => ({
          ...marker,
          time: marker.time + nudgeAmount,
        }))
        .sort((a, b) => a.time - b.time)
    );
  }, []);

  // Nudge all markers backward by a small amount (100ms)
  const nudgeMarkersBackward = useCallback(() => {
    const nudgeAmount = 0.1; // 100ms

    setMarkers((prev) =>
      prev
        .map((marker) => ({
          ...marker,
          time: Math.max(0, marker.time - nudgeAmount),
        }))
        .sort((a, b) => a.time - b.time)
    );
  }, []);

  // Update the current lyric index based on playback time
  const updateCurrentLyricIndex = useCallback(
    (currentTime: number) => {
      // Find the last marker whose time is less than or equal to currentTime
      const sortedMarkers = [...markers].sort((a, b) => a.time - b.time);
      let index = -1;

      for (let i = sortedMarkers.length - 1; i >= 0; i--) {
        if (sortedMarkers[i].time <= currentTime) {
          index = sortedMarkers[i].lyricIndex;
          break;
        }
      }

      if (index !== currentLyricIndex) {
        setCurrentLyricIndex(index);
      }
    },
    [markers, currentLyricIndex]
  );

  // Import LRC file
  const importLrc = useCallback((lrcContent: string) => {
    try {
      const parsedLrc: LrcFile = parseLrc(lrcContent);

      // Extract lyrics text
      const lyricsArray = parsedLrc.lines.map((line) => line.text);
      const uniqueLyrics = Array.from(new Set(lyricsArray)); // Remove duplicates
      const lyricsText = uniqueLyrics.join("\n");

      setLyricsText(lyricsText);
      setLyrics(uniqueLyrics);

      // Create markers from timestamps
      const newMarkers: TimeMarker[] = parsedLrc.lines.map((line, index) => ({
        id: `marker-import-${index}`,
        time: line.time,
        lyricIndex: uniqueLyrics.indexOf(line.text), // Find the index in the deduplicated array
      }));

      setMarkers(newMarkers.sort((a, b) => a.time - b.time));
    } catch (error) {
      console.error("Error importing LRC file:", error);
    }
  }, []);

  // Generate LRC content from current state
  const generateLrcContent = useCallback(() => {
    // Create an array of times from markers
    const times = new Array(lyrics.length).fill(undefined);

    // Fill in times array based on markers
    markers.forEach((marker) => {
      if (marker.lyricIndex >= 0 && marker.lyricIndex < lyrics.length) {
        times[marker.lyricIndex] = marker.time;
      }
    });

    return generateLrc(lyrics, times);
  }, [lyrics, markers]);

  return {
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
  };
};
