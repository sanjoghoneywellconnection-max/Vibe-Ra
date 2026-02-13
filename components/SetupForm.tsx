
import React, { useState } from 'react';
import { SetlistParams } from '../types';

interface SetupFormProps {
  onStart: (params: SetlistParams) => void;
  isLoading: boolean;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStart, isLoading }) => {
  const [params, setParams] = useState<SetlistParams>({
    context: 'House Party',
    region: 'Global Top 40',
    durationMinutes: 60,
    intensity: 'mid'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(params);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 glass rounded-3xl animate-in fade-in duration-700">
      <h2 className="text-3xl font-syncopate font-bold mb-6 text-center text-purple-400">CONFIGURE VIBE</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">The Scene</label>
          <input 
            type="text" 
            placeholder="e.g. Office Party, Wedding, Gym session" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
            value={params.context}
            onChange={e => setParams({...params, context: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Music DNA (Region/Genre)</label>
          <input 
            type="text" 
            placeholder="e.g. Bollywood, Latin, Afrobeat, 90s Rock" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
            value={params.region}
            onChange={e => setParams({...params, region: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Duration (Min)</label>
            <input 
              type="number" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
              value={params.durationMinutes}
              onChange={e => setParams({...params, durationMinutes: parseInt(e.target.value) || 0})}
              min="15"
              max="240"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Energy</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors appearance-none"
              value={params.intensity}
              onChange={e => setParams({...params, intensity: e.target.value as any})}
            >
              <option value="chill">Chill</option>
              <option value="mid">Mid-Tempo</option>
              <option value="high">High Energy</option>
              <option value="peak">Peak Hours</option>
            </select>
          </div>
        </div>

        <button 
          disabled={isLoading}
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed py-4 rounded-xl font-bold tracking-widest uppercase transition-all transform active:scale-95 neon-border"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-spinner animate-spin"></i> ANALYZING MUSIC LIBRARIES...
            </span>
          ) : 'INITIALIZE DJ AI'}
        </button>
      </form>
    </div>
  );
};

export default SetupForm;
