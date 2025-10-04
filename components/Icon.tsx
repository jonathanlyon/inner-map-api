import React from 'react';
import { Pattern } from '../types';

interface IconProps {
  name: Pattern['iconName'] | 'Path' | 'Seedling' | 'Shield' | 'Download';
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const icons: Record<IconProps['name'], React.ReactNode> = {
    Shield: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    ),
    Seedling: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16M8 20V10a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v10M12 10V4M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
        <path d="M10 12h4"></path>
      </svg>
    ),
    Path: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8M4 20a8 8 0 0 1 8-8 8 8 0 0 1 8 8"></path>
            <path d="M12 4v16"></path>
        </svg>
    ),
    Heart: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    ),
    Anchor: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3"></circle>
            <line x1="12" y1="22" x2="12" y2="8"></line>
            <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
        </svg>
    ),
    Lightbulb: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 22h4"></path>
        <path d="M12 2a7 7 0 0 0-7 7c0 3.03 1.13 4.41 3 5.42.92.5 1.5 1.39 1.5 2.58V18h5v-2c0-1.19.58-2.08 1.5-2.58 1.87-1.01 3-2.39 3-5.42a7 7 0 0 0-7-7z"></path>
      </svg>
    ),
    Download: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    ),
  };

  return icons[name] || null;
};

export default Icon;