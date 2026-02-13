
export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  durationSeconds: number;
  energyLevel: number; // 1-10
  transitionType: 'crossfade' | 'beatmatch' | 'echo-out';
  genre: string;
}

export interface SetlistParams {
  context: string;
  region: string;
  durationMinutes: number;
  intensity: 'chill' | 'mid' | 'high' | 'peak';
}

export interface DJState {
  currentSongIndex: number;
  isPlaying: boolean;
  progress: number; // 0 to 100
  volume: number;
  crossfade: number; // -1 to 1 (left deck to right deck)
}
