import React from 'react';
import { Insights } from '../types';
import ResultsDisplay from './ResultsDisplay';
import Icon from './Icon';

interface SessionDetailViewProps {
  entry: Insights;
  onBack: () => void;
  onExport: () => void;
}

const SessionDetailView: React.FC<SessionDetailViewProps> = ({ entry, onBack, onExport }) => {
  const qAndA = [];
  for (let i = 0; i < entry.history.length; i += 2) {
    const question = entry.history[i];
    const answer = entry.history[i+1];
    if (question && answer) {
        qAndA.push({ question: question.content, answer: answer.content });
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in" id={`session-detail-${entry.timestamp}`}>
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-black transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
        </button>
      </div>

      <div className="bg-white/60 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
        <h2 className="font-serif text-sm uppercase tracking-widest text-slate-500 mb-6">Your Conversation</h2>
        <div className="space-y-6">
            {qAndA.map((item, index) => (
                <div key={index} className="border-b border-gray-300/70 pb-6 last:border-b-0 last:pb-0">
                    <p className="font-serif font-semibold text-lg text-[#2A2A2A] mb-2">Question {index + 1}: {item.question}</p>
                    <p className="text-slate-600 leading-relaxed pl-4 border-l-2 border-[#D9A566]">
                        {item.answer || <span className="italic">You chose to skip this question.</span>}
                    </p>
                </div>
            ))}
        </div>
      </div>
      
      <ResultsDisplay insights={entry} />

      <div className="text-center mt-8">
         <button onClick={onExport} className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 border border-slate-300">
            <Icon name="Download" className="w-5 h-5"/>
            Export PDF
        </button>
      </div>
    </div>
  );
};

export default SessionDetailView;