import React from 'react';
import { Insights } from '../types';

interface JournalViewProps {
  entries: Insights[];
  onSelect: (entry: Insights) => void;
  onStartNew: () => void;
}

const JournalView: React.FC<JournalViewProps> = ({ entries, onSelect, onStartNew }) => {
  if (entries.length === 0) {
    return (
       <div className="text-center bg-white/50 p-10 rounded-lg shadow-sm">
            <p className="text-slate-600 text-lg">Your journal is waiting for its first story.</p>
            <button onClick={onStartNew} className="mt-4 bg-[#D9A566] hover:bg-[#c99455] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105">
                Begin a New Session
            </button>
        </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
      {entries.map((entry) => (
        <button
          key={entry.timestamp}
          onClick={() => onSelect(entry)}
          className="w-full text-left bg-white/80 hover:bg-white p-5 rounded-xl shadow-md transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col group"
        >
          <img 
            src={entry.symbolicMap.imageUrl} 
            alt={entry.symbolicMap.title}
            className="w-full h-48 rounded-lg object-cover mb-4"
          />
          <div className="flex-grow">
            <p className="text-sm text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</p>
            <h3 className="font-serif text-xl font-bold text-[#2A2A2A] mt-1 group-hover:text-[#D9A566] transition-colors">{entry.symbolicMap.title}</h3>
            <p className="text-slate-600 mt-2 text-sm line-clamp-2">{entry.symbolicMap.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default JournalView;
