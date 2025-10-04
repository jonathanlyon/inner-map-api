import React from 'react';
import { Insights } from '../types';
import Icon from './Icon';

interface ResultsDisplayProps {
  insights: Insights;
}

const Section: React.FC<{title: string, children: React.ReactNode, titleClassName?: string, containerClassName?: string}> = 
    ({ title, children, titleClassName, containerClassName }) => (
    <div className={`py-10 border-b border-gray-300/70 ${containerClassName}`}>
        <h2 className={`font-serif text-sm uppercase tracking-widest text-slate-500 mb-6 ${titleClassName}`}>{title}</h2>
        {children}
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ insights }) => {
  return (
    <div className="max-w-3xl w-full mx-auto p-4 sm:p-8 bg-white/60 shadow-xl rounded-2xl my-10">
        
        <Section title="Your Symbolic Map">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2A2A2A] mb-4">{insights.symbolicMap.title}</h1>
            <img 
                src={insights.symbolicMap.imageUrl}
                alt={insights.symbolicMap.title}
                className="w-full h-auto rounded-lg shadow-md object-cover mb-4"
            />
            <p className="text-slate-600 leading-relaxed text-lg">{insights.symbolicMap.description}</p>
        </Section>

        <Section title="Patterns Identified">
            <div className="space-y-6">
                {insights.patterns.map((pattern, index) => (
                    <div key={index} className="flex gap-5 items-start">
                         <div className="flex-shrink-0 bg-yellow-500/20 rounded-full p-2 mt-1">
                             <Icon name={pattern.iconName} className="w-6 h-6 text-[#D9A566]"/>
                         </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#2A2A2A]">{pattern.title}</h3>
                            <p className="text-slate-600 leading-relaxed mt-1">{pattern.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
        
        <Section title="Your Inner Landscape">
            <div className="font-serif text-slate-700 leading-relaxed text-lg whitespace-pre-wrap prose">
                {insights.reflection}
            </div>
        </Section>

        <Section title="A Whisper From Within">
            <p className="font-serif text-slate-600 leading-loose text-xl italic whitespace-pre-wrap text-center">
                {insights.poem}
            </p>
        </Section>
    </div>
  );
};

export default ResultsDisplay;