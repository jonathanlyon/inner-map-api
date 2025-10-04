import React from 'react';

interface NavigationProps {
  currentTab: 'journal' | 'evolution';
  setTab: (tab: 'journal' | 'evolution') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab }) => {
  const getButtonClasses = (tabName: 'journal' | 'evolution') => {
    const baseClasses = "px-6 py-2 rounded-full font-semibold transition-colors text-lg";
    if (currentTab === tabName) {
      return `${baseClasses} bg-white text-[#2A2A2A] shadow`;
    }
    return `${baseClasses} text-slate-600 hover:bg-white/50`;
  };

  return (
    <div className="flex justify-center">
      <div className="bg-gray-200/70 p-1.5 rounded-full flex items-center space-x-2">
        <button
          onClick={() => setTab('journal')}
          className={getButtonClasses('journal')}
        >
          Journal
        </button>
        <button
          onClick={() => setTab('evolution')}
          className={getButtonClasses('evolution')}
        >
          Evolution
        </button>
      </div>
    </div>
  );
};

export default Navigation;
