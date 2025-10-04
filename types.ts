export type AppState = 'welcome' | 'question_flow' | 'generating' | 'results' | 'dashboard' | 'session_detail';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Pattern {
  iconName: 'Shield' | 'Seedling' | 'Path' | 'Heart' | 'Anchor' | 'Lightbulb';
  title: string;
  description: string;
}

export interface SymbolicMap {
  title: string;
  description: string;
  imageUrl: string;
}

export interface Insights {
  reflection: string; // "Your Inner Landscape"
  poem: string; // "A Whisper From Within"
  patterns: Pattern[]; // "Patterns Identified"
  symbolicMap: SymbolicMap;
  isMilestone: boolean;
  milestoneReason: string | null;
  timestamp: number;
  history: ChatMessage[];
}