
import React from 'react';
import { Song } from '../types';
import Visualizer from './Visualizer';

interface DeckProps {
  song: Song | null;
  isPlaying: boolean;
  side: 'LEFT' | 'RIGHT';
  progress: number;
}

const Deck: React.FC<DeckProps> = ({ song, isPlaying, side, progress }) => {
  const rotation = progress * 3.6; // Convert % to degrees

  return (
    <div className={`flex flex-col gap-4 p-6 glass rounded-3xl ${side === 'LEFT' ? 'border-l-4 border-purple-500' : 'border-r-4 border-cyan-500'}`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold tracking-tighter text-gray-500 uppercase">{side} DECK // 0{side === 'LEFT' ? 1 : 2}</span>
        <span className="text-xs font-mono text-purple-400">{song?.bpm || '--'} BPM</span>
      </div>

      <div className="relative aspect-square w-full max-w-[280px] mx-auto group">
        {/* Record Plate */}
        <div 
          className={`w-full h-full rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border-[8px] border-zinc-900 shadow-2xl relative overflow-hidden transition-transform duration-500 ${isPlaying ? 'animate-spin-slow' : ''}`}
          style={{ transform: isPlaying ? `rotate(${rotation}deg)` : 'none' }}
        >
          {/* Record Grooves */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)]"></div>
          {/* Label */}
          <div className="absolute inset-[30%] rounded-full bg-purple-600 flex items-center justify-center text-center p-2 shadow-inner">
             <div className="text-[10px] font-bold uppercase text-white truncate max-w-full">
               {song?.artist || 'VIBE-RA'}
             </div>
          </div>
          <div className="absolute inset-[48%] rounded-full bg-zinc-900 border border-zinc-700"></div>
        </div>
        
        {/* Tonearm */}
        <div className={`absolute top-0 right-4 w-4 h-32 bg-zinc-800 rounded-full origin-top transition-transform duration-1000 ${isPlaying ? 'rotate-[20deg]' : 'rotate-0'}`}>
          <div className="absolute bottom-0 left-[-4px] w-8 h-4 bg-zinc-700 rounded-sm"></div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-bold truncate">{song?.title || 'Waiting for Track...'}</h3>
        <p className="text-sm text-gray-400 truncate">{song?.artist || 'AI Curation Engine'}</p>
      </div>

      <div className="h-16 w-full bg-black/40 rounded-lg overflow-hidden border border-white/5">
        <Visualizer isPlaying={isPlaying} color={side === 'LEFT' ? '#a855f7' : '#06b6d4'} />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-gray-500">
        <span>00:00</span>
        <span>{song ? Math.floor(song.durationSeconds / 60) + ':' + (song.durationSeconds % 60).toString().padStart(2, '0') : '--:--'}</span>
      </div>
      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${side === 'LEFT' ? 'bg-purple-500' : 'bg-cyan-500'}`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Deck;
