
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SetupForm from './components/SetupForm';
import Deck from './components/Deck';
import { generateSetlist, getVibeDescription } from './geminiService';
import { Song, SetlistParams, DJState } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<SetlistParams | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [vibeText, setVibeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [djState, setDjState] = useState<DJState>({
    currentSongIndex: 0,
    isPlaying: false,
    progress: 0,
    volume: 0.8,
    crossfade: -1, // Full Left
  });

  // Use ReturnType<typeof setInterval> to avoid NodeJS namespace issues in browser environment
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startParty = async (newParams: SetlistParams) => {
    setLoading(true);
    setParams(newParams);
    try {
      const generatedSongs = await generateSetlist(newParams);
      setSongs(generatedSongs);
      const desc = await getVibeDescription(generatedSongs);
      setVibeText(desc);
      setDjState(prev => ({ ...prev, isPlaying: true, currentSongIndex: 0, progress: 0, crossfade: -1 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (djState.isPlaying && songs.length > 0) {
      progressInterval.current = setInterval(() => {
        setDjState(prev => {
          const currentSong = songs[prev.currentSongIndex];
          if (!currentSong) return prev;

          const increment = (100 / currentSong.durationSeconds);
          const nextProgress = prev.progress + increment;

          // Start crossfade at 90% completion
          let nextCrossfade = prev.crossfade;
          if (nextProgress > 90) {
            const side = prev.currentSongIndex % 2 === 0 ? -1 : 1;
            const targetSide = side * -1;
            // Linear interpolate crossfade from 90% to 100%
            const t = (nextProgress - 90) / 10;
            nextCrossfade = side + (targetSide - side) * t;
          }

          if (nextProgress >= 100) {
            const nextIdx = (prev.currentSongIndex + 1) % songs.length;
            return {
              ...prev,
              currentSongIndex: nextIdx,
              progress: 0,
              crossfade: nextIdx % 2 === 0 ? -1 : 1
            };
          }

          return { ...prev, progress: nextProgress, crossfade: nextCrossfade };
        });
      }, 1000);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [djState.isPlaying, songs]);

  const togglePlayback = () => setDjState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));

  const leftSong = djState.currentSongIndex % 2 === 0 ? songs[djState.currentSongIndex] : songs[djState.currentSongIndex - 1] || null;
  const rightSong = djState.currentSongIndex % 2 !== 0 ? songs[djState.currentSongIndex] : songs[djState.currentSongIndex + 1] || null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Ambience */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-syncopate font-bold tracking-tighter neon-text flex items-center justify-center gap-4">
          <i className="fa-solid fa-compact-disc animate-spin-slow text-purple-500"></i>
          VIBE-RA
        </h1>
        <p className="text-zinc-500 uppercase tracking-widest text-xs mt-2 font-bold">Artificial Intelligence DJ Engine</p>
      </header>

      {!params ? (
        <SetupForm onStart={startParty} isLoading={loading} />
      ) : (
        <div className="w-full max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Status Header */}
          <div className="flex flex-col md:flex-row justify-between items-center glass p-6 rounded-2xl gap-4">
            <div className="flex-1">
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Current Set: {params.region}</h2>
              <p className="text-lg font-medium text-zinc-300 italic">"{vibeText || 'Syncing global vibes...'}"</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="block text-[10px] text-zinc-500 font-bold uppercase">Tracks Rem.</span>
                <span className="text-xl font-syncopate">{songs.length - djState.currentSongIndex}</span>
              </div>
              <button 
                onClick={togglePlayback}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <i className={`fa-solid ${djState.isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
             <Deck 
                song={leftSong} 
                isPlaying={djState.isPlaying && djState.currentSongIndex % 2 === 0} 
                side="LEFT" 
                progress={djState.currentSongIndex % 2 === 0 ? djState.progress : 100} 
             />
             <Deck 
                song={rightSong} 
                isPlaying={djState.isPlaying && djState.currentSongIndex % 2 !== 0} 
                side="RIGHT" 
                progress={djState.currentSongIndex % 2 !== 0 ? djState.progress : 0} 
             />
          </div>

          {/* Mixer Controls */}
          <div className="glass p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Master Gain</label>
              <input 
                type="range" 
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500" 
                value={djState.volume * 100} 
                onChange={e => setDjState({...djState, volume: parseInt(e.target.value)/100})}
              />
            </div>

            <div className="flex flex-col items-center gap-4">
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Crossfader</label>
               <div className="relative w-full h-2 bg-zinc-900 rounded-full border border-white/5 px-2 flex items-center">
                 <div 
                   className="absolute w-8 h-4 bg-zinc-400 rounded-sm shadow-lg transition-all duration-300"
                   style={{ left: `calc(${(djState.crossfade + 1) * 50}% - 16px)` }}
                 ></div>
               </div>
               <div className="flex justify-between w-full text-[9px] font-mono text-zinc-600">
                 <span>LEFT DECK</span>
                 <span>RIGHT DECK</span>
               </div>
            </div>

            <div className="flex justify-around items-center">
               <div className="text-center">
                 <div className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center mb-2 hover:border-purple-500 transition-colors cursor-pointer">
                   <i className="fa-solid fa-shuffle text-xs"></i>
                 </div>
                 <span className="text-[9px] font-bold text-zinc-500">AUTO-MIX</span>
               </div>
               <div className="text-center">
                 <div className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center mb-2 hover:border-cyan-500 transition-colors cursor-pointer">
                   <i className="fa-solid fa-sliders text-xs"></i>
                 </div>
                 <span className="text-[9px] font-bold text-zinc-500">EQ SETS</span>
               </div>
               <div className="text-center" onClick={() => setParams(null)}>
                 <div className="w-12 h-12 rounded-full border-2 border-red-900/30 flex items-center justify-center mb-2 hover:bg-red-900/20 transition-all cursor-pointer">
                   <i className="fa-solid fa-power-off text-xs text-red-500"></i>
                 </div>
                 <span className="text-[9px] font-bold text-zinc-500">STOP SET</span>
               </div>
            </div>
          </div>

          {/* Upcoming Setlist */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Upcoming in Queue</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {songs.slice(djState.currentSongIndex + 1).map((song, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-600 font-mono text-xs">0{djState.currentSongIndex + 2 + i}</span>
                    <div>
                      <h4 className="text-sm font-bold group-hover:text-purple-400 transition-colors">{song.title}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase">{song.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">{song.bpm} BPM</span>
                    <span className="text-[10px] text-zinc-600">{song.transitionType}</span>
                  </div>
                </div>
              ))}
              {songs.length - 1 === djState.currentSongIndex && (
                <div className="text-center py-4 text-zinc-600 italic text-sm">Last track playing...</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Persistence Controls */}
      <footer className="mt-auto py-8 text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
        VIBE-RA v1.0.4 &copy; 2024 // Powered by Gemini Flash Intelligence
      </footer>
    </div>
  );
};

export default App;
