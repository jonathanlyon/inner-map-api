import { Insights } from '../types';

const JOURNAL_KEY = 'innerMapJournal';

export function saveSession(newSession: Insights): void {
  try {
    const existingSessions = getSessions();
    const updatedSessions = [newSession, ...existingSessions];
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error("Error saving session to local storage:", error);
  }
}

export function getSessions(): Insights[] {
  try {
    const sessionsJSON = localStorage.getItem(JOURNAL_KEY);
    if (!sessionsJSON) {
      return [];
    }
    const sessions = JSON.parse(sessionsJSON) as Insights[];
    // Sort by timestamp descending (newest first)
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error retrieving sessions from local storage:", error);
    return [];
  }
}
