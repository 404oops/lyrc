import { LrcFile, LrcLine } from "../types";

/**
 * Converts seconds to the LRC timestamp format [mm:ss.xx]
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "[00:00.00]";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds % 1) * 100);

  return `[${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}]`;
};

/**
 * Parses LRC timestamp format [mm:ss.xx] into seconds
 */
export const parseTimeString = (timeString: string): number => {
  // Extract the time part from the timestamp format [mm:ss.xx]
  const match = timeString.match(/\[(\d+):(\d+)\.(\d+)\]/);
  if (!match) return 0;

  const [, mins, secs, hundredths] = match;
  return parseInt(mins) * 60 + parseInt(secs) + parseInt(hundredths) / 100;
};

/**
 * Parses an LRC file string into structured data
 */
export const parseLrc = (lrcString: string): LrcFile => {
  const lines: LrcLine[] = [];
  const metadata: Record<string, string> = {};

  // Split the LRC file into lines
  const lrcLines = lrcString.split("\n");

  for (const line of lrcLines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Check for metadata (tags like [ar:Artist])
    const metadataMatch = line.match(/\[([\w]+):(.*?)\]/);
    if (metadataMatch) {
      const [, key, value] = metadataMatch;
      metadata[key] = value.trim();
      continue;
    }

    // Extract timestamps and text
    const timeStampRegex = /\[(\d+:\d+\.\d+)\]/g;
    const timeStamps = [...line.matchAll(timeStampRegex)];

    if (timeStamps.length > 0) {
      // Extract the lyric text (everything after the last timestamp)
      const lastTimestampEnd =
        timeStamps[timeStamps.length - 1].index! +
        timeStamps[timeStamps.length - 1][0].length;
      const text = line.substring(lastTimestampEnd).trim();

      // Create an LrcLine for each timestamp with the same text
      for (const match of timeStamps) {
        const timeString = `[${match[1]}]`;
        const time = parseTimeString(timeString);
        lines.push({ time, text });
      }
    }
  }

  // Sort lines by time
  lines.sort((a, b) => a.time - b.time);

  return { lines, metadata };
};

/**
 * Converts structured LRC data into an LRC file string
 */
export const generateLrc = (lyrics: string[], markers: number[]): string => {
  let lrcString = "";

  // Make sure lyrics and markers arrays have the same length
  const minLength = Math.min(lyrics.length, markers.length);

  for (let i = 0; i < minLength; i++) {
    if (markers[i] !== undefined && lyrics[i]) {
      lrcString += `${formatTime(markers[i])}${lyrics[i]}\n`;
    }
  }

  return lrcString;
};

/**
 * Splits lyrics text into individual lines
 */
export const splitLyrics = (lyricsText: string): string[] => {
  return lyricsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};
