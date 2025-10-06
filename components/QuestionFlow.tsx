import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '../types';
import { startConversation, getNextQuestion } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';
import Icon from './Icon';

const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 7;

interface QuestionFlowProps {
  onConversationComplete: (history: ChatMessage[]) => void;
}

const QuestionFlow: React.FC<QuestionFlowProps> = ({ onConversationComplete }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentUserInputIndex, setCurrentUserInputIndex] = useState(0); // Tracks which user answer we are on
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isFetching = useRef(false);

  const userMessages = history.filter(m => m.role === 'user');
  const modelMessages = history.filter(m => m.role === 'model');
  const currentQuestion = modelMessages[currentUserInputIndex]?.content;

  const progress = (userMessages.length / MAX_QUESTIONS) * 100;

  // Fetch the next question from the API
  const fetchNextQuestion = useCallback(async (currentHistory: ChatMessage[]) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const nextQuestion = await getNextQuestion(currentHistory);
      setHistory(prev => [...prev, { role: 'model', content: nextQuestion }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "I'm having trouble finding my next thought. Please try again in a moment.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Effect for the very first question
  useEffect(() => {
    const fetchFirstQuestion = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const firstQuestion = await startConversation();
        setHistory([{ role: 'model', content: firstQuestion }]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "I'm having a little trouble starting our conversation. Please try refreshing.";
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFirstQuestion();
  }, []);
  
  // Auto-resize the textarea
  useEffect(() => {
    if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [currentAnswer]);

  // Pre-populate the textarea when navigating back or forward
  useEffect(() => {
    const existingAnswer = history.find(
      (msg, index) => {
        if (msg.role !== 'user') return false;
        // Find the user message that corresponds to the current question index
        const precedingModelMessages = history.slice(0, index).filter(m => m.role === 'model').length;
        return precedingModelMessages === currentUserInputIndex + 1;
      }
    )?.content || '';
    setCurrentAnswer(existingAnswer === "I chose to skip this question." ? "" : existingAnswer);
    textAreaRef.current?.focus();
  }, [currentUserInputIndex, history]);

  const updateHistoryWithAnswer = (currentHistory: ChatMessage[], answer: string): ChatMessage[] => {
    const newHistory = [...currentHistory];
    const userMessageCount = newHistory.filter(m => m.role === 'user').length;

    // Find the index of the model's question we are answering
    let modelMessageIndex = -1;
    let modelCount = 0;
    for(let i = 0; i < newHistory.length; i++) {
        if (newHistory[i].role === 'model') {
            modelCount++;
            if (modelCount === currentUserInputIndex + 1) {
                modelMessageIndex = i;
                break;
            }
        }
    }

    if (modelMessageIndex === -1) return newHistory; // Should not happen

    // Check if an answer for this question already exists
    const nextMessageIsAnswer = newHistory[modelMessageIndex + 1]?.role === 'user';

    if (nextMessageIsAnswer) {
        // We are editing a previous answer
        newHistory[modelMessageIndex + 1] = { role: 'user', content: answer };
    } else {
        // We are adding a new answer
        newHistory.splice(modelMessageIndex + 1, 0, { role: 'user', content: answer });
    }
    return newHistory;
  };

  const handleNext = () => {
    const answer = currentAnswer.trim() || "I chose to skip this question.";
    const newHistory = updateHistoryWithAnswer(history, answer);
    
    setHistory(newHistory);
    setCurrentUserInputIndex(prev => prev + 1);

    const modelMessageCount = newHistory.filter(m => m.role === 'model').length;
    // If we've reached the end of our current questions, fetch a new one
    if (modelMessageCount <= currentUserInputIndex + 1 && modelMessageCount < MAX_QUESTIONS) {
      fetchNextQuestion(newHistory);
    }
  };

  const handleFinish = () => {
    const answer = currentAnswer.trim() || "I chose to skip this question.";
    const finalHistory = updateHistoryWithAnswer(history, answer);
    onConversationComplete(finalHistory);
  };

  const handlePrevious = () => {
    if (currentUserInputIndex > 0) {
      const answer = currentAnswer.trim() || "I chose to skip this question.";
      const newHistory = updateHistoryWithAnswer(history, answer);
      setHistory(newHistory);
      setCurrentUserInputIndex(currentUserInputIndex - 1);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full justify-center p-4 animate-fade-in">
        {/* Progress Bar */}
        <div className="w-full mb-8">
            <div className="flex justify-between items-center mb-1 text-slate-600">
                <div className="flex items-center gap-2">
                    <Icon name="Seedling" className="w-5 h-5 text-[#D9A566]"/>
                    <span>Question {currentUserInputIndex + 1}</span>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#D9A566] h-2 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center text-center">
            {isLoading && !currentQuestion ? (
                 <LoadingIndicator className="w-12 h-12 text-[#D9A566]"/>
            ) : error ? (
                <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
                    <p>{error}</p>
                </div>
            ) : (
                <>
                <div className="bg-yellow-500/20 rounded-full p-3 mb-6">
                    <Icon name="Shield" className="w-8 h-8 text-[#D9A566]"/>
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2A2A2A] mb-4">
                    {currentQuestion}
                </h1>
                <p className="text-slate-500 mb-8">Take your time. There are no wrong answers - only honest ones.</p>
                <textarea
                    ref={textAreaRef}
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                    placeholder="Write your reflection here..."
                    className="w-full max-w-lg bg-transparent border-b-2 border-slate-300 focus:border-[#D9A566] focus:ring-0 text-center text-xl text-slate-700 p-2 transition resize-none overflow-hidden"
                    rows={1}
                    autoFocus
                />
                <p className="text-xs text-slate-400 mt-3">Your words are private and sacred. They help create your inner map.</p>
                </>
            )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12">
            <button 
                onClick={handlePrevious} 
                disabled={currentUserInputIndex === 0}
                className="flex items-center gap-2 text-slate-600 hover:text-black disabled:opacity-50 transition-opacity"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Previous
            </button>
            <div className="flex items-center gap-4">
                {userMessages.length >= MIN_QUESTIONS - 1 && (
                    <button onClick={handleFinish} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 border border-slate-300">
                        Finish & See Insights
                    </button>
                )}
                <button 
                    onClick={currentUserInputIndex >= MAX_QUESTIONS - 1 ? handleFinish : handleNext}
                    disabled={isLoading || !currentAnswer.trim()}
                    className="bg-[#D9A566] hover:bg-[#c99455] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {currentUserInputIndex >= MAX_QUESTIONS - 1 ? (
                        'Finish'
                    ) : (
                        'Continue'
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m-7-14h18" /></svg>
                </button>
            </div>
        </div>
    </div>
  );
};

export default QuestionFlow;
