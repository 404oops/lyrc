/**
 * Represents a time marker in the audio waveform.
 */
export interface TimeMarker {
  id: string;
  time: number; // Time in seconds
  lyricIndex: number; // Index of the corresponding lyric line
}

/**
 * Represents a line in the LRC file.
 */
export interface LrcLine {
  time: number; // Time in seconds
  text: string; // Lyric text
}

/**
 * Parsed LRC file structure.
 */
export interface LrcFile {
  lines: LrcLine[];
  metadata?: Record<string, string>; // Optional metadata tags
}

/**
 * Audio player state.
 */
export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioFile: File | null;
}

/**
 * Global application state.
 */
export interface AppState {
  lyrics: string[]; // Array of lyric lines
  markers: TimeMarker[]; // Array of time markers
  audioState: AudioState;
  globalDelay: number; // Global delay offset in seconds
}
