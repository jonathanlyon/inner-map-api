import React from 'react';
import { Insights } from '../types';
import Icon from './Icon';

interface EvolutionViewProps {
  entries: Insights[];
  onSelect: (entry: Insights) => void;
  onStartNew: () => void;
}

const EvolutionView: React.FC<EvolutionViewProps> = ({ entries, onSelect, onStartNew }) => {
  const milestones = entries.filter(entry => entry.isMilestone).sort((a, b) => a.timestamp - b.timestamp);

  if (milestones.length === 0) {
    return (
       <div className="text-center bg-white/50 p-10 rounded-lg shadow-sm">
            <p className="text-slate-600 text-lg">Your path of evolution will appear here as you complete more sessions.</p>
            <p className="text-slate-500 mt-1">Milestones are automatically identified when you have a significant breakthrough.</p>
             <button onClick={onStartNew} className="mt-6 bg-[#D9A566] hover:bg-[#c99455] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105">
                Continue Your Journey
            </button>
        </div>
    )
  }

  return (
    <div className="relative animate-fade-in">
        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-300 -translate-x-1/2"></div>

        <div className="space-y-16">
            {milestones.map((entry, index) => (
                <div key={entry.timestamp} className="relative flex items-center justify-center">
                    <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-[#D9A566] rounded-full border-4 border-[#F9F6F0] z-10"></div>
                    <div className={`w-full flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className="w-full md:w-5/12">
                             <button
                                onClick={() => onSelect(entry)}
                                className={`w-full text-left bg-white/80 hover:bg-white p-5 rounded-xl shadow-md transition-all hover:shadow-xl hover:-translate-y-1 group flex flex-col sm:flex-row gap-4 ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                            >
                                <img 
                                    src={entry.symbolicMap.imageUrl} 
                                    alt={entry.symbolicMap.title}
                                    className="w-full sm:w-32 h-32 rounded-lg object-cover flex-shrink-0"
                                />
                                <div>
                                    <p className="text-sm text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</p>
                                    <h3 className="font-serif text-lg font-bold text-[#2A2A2A] mt-1 group-hover:text-[#D9A566] transition-colors">{entry.symbolicMap.title}</h3>
                                    <p className="text-slate-600 mt-2 text-sm">{entry.milestoneReason}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
         <div className="mt-16 text-center bg-yellow-500/10 p-8 rounded-lg shadow-sm border border-yellow-500/20">
            <Icon name="Path" className="w-10 h-10 text-[#D9A566] mx-auto mb-4"/>
            <h2 className="font-serif text-2xl font-bold text-[#2A2A2A]">Your Journey Reflection</h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">This timeline highlights the pivotal moments in your journey of self-discovery. Each milestone represents a significant shift in understanding or a breakthrough in awareness, mapping the beautiful and courageous path of your inner evolution.</p>
        </div>
    </div>
  );
};

export default EvolutionView;
