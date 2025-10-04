import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-[#2A2A2A] p-8 animate-fade-in">
      <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">Your Inner Map</h1>
      <p className="max-w-2xl text-slate-600 mb-10 text-lg md:text-xl">
        A space for self-reflection. Answer a series of thoughtful questions to uncover a map of your inner world, revealing the patterns and strengths that define you.
      </p>
      <button
        onClick={onStart}
        className="bg-[#D9A566] hover:bg-[#c99455] text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105 text-lg"
      >
        Begin Your Journey
      </button>
    </div>
  );
};

export default WelcomeScreen;
