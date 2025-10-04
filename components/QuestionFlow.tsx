import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '../types';
import { TOTAL_QUESTIONS } from '../constants';
import { startConversation, getNextQuestion } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';
import Icon from './Icon';

interface QuestionFlowProps {
  onConversationComplete: (history: ChatMessage[]) => void;
}

const QuestionFlow: React.FC<QuestionFlowProps> = ({ onConversationComplete }) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(Array(TOTAL_QUESTIONS).fill(''));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const progress = ((currentQuestionIndex) / TOTAL_QUESTIONS) * 100;

  const fetchQuestion = useCallback(async (history: ChatMessage[]) => {
    setIsLoading(true);
    const nextQuestion = await getNextQuestion(history);
    setQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[history.filter(m => m.role === 'user').length] = nextQuestion;
        return newQuestions;
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchFirstQuestion = async () => {
      setIsLoading(true);
      const firstQuestion = await startConversation();
      setQuestions([firstQuestion]);
      setIsLoading(false);
    };
    fetchFirstQuestion();
  }, []);
  
  useEffect(() => {
    if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [answers[currentQuestionIndex]]);

  const handleNext = async () => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // If we don't have the next question yet, fetch it
      if (!questions[newIndex]) {
          const history: ChatMessage[] = [];
          for (let i = 0; i < newIndex; i++) {
            history.push({ role: 'model', content: questions[i]});
            history.push({ role: 'user', content: answers[i] || "I chose to skip this question." });
          }
          history.push({ role: 'model', content: questions[newIndex - 1]});
          await fetchQuestion(history);
      }
    } else {
        // Conversation is complete
        const finalHistory: ChatMessage[] = [];
        for (let i = 0; i < TOTAL_QUESTIONS; i++) {
            finalHistory.push({ role: 'model', content: questions[i] });
            finalHistory.push({ role: 'user', content: answers[i] || "I chose to skip this question." });
        }
        onConversationComplete(finalHistory);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };
  
  const handleSkip = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = ''; // Explicitly mark as skipped
    setAnswers(newAnswers);
    handleNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full justify-center p-4 animate-fade-in">
        {/* Progress Bar */}
        <div className="w-full mb-8">
            <div className="flex justify-between items-center mb-1 text-slate-600">
                <div className="flex items-center gap-2">
                    <Icon name="Seedling" className="w-5 h-5 text-[#D9A566]"/>
                    <span>Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</span>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#D9A566] h-2 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center text-center">
            {isLoading && !questions[currentQuestionIndex] ? (
                 <LoadingIndicator className="w-12 h-12 text-[#D9A566]"/>
            ) : (
                <>
                <div className="bg-yellow-500/20 rounded-full p-3 mb-6">
                    <Icon name="Shield" className="w-8 h-8 text-[#D9A566]"/>
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2A2A2A] mb-4">
                    {questions[currentQuestionIndex]}
                </h1>
                <p className="text-slate-500 mb-8">Take your time. There are no wrong answers - only honest ones.</p>
                <textarea
                    ref={textAreaRef}
                    value={answers[currentQuestionIndex]}
                    onChange={handleAnswerChange}
                    placeholder="Write your reflection here..."
                    className="w-full max-w-lg bg-transparent border-b-2 border-slate-300 focus:border-[#D9A566] focus:ring-0 text-center text-xl text-slate-700 p-2 transition resize-none overflow-hidden"
                    rows={1}
                />
                <p className="text-xs text-slate-400 mt-3">Your words are private and sacred. They help create your inner map.</p>
                </>
            )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12">
            <button 
                onClick={handlePrevious} 
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 text-slate-600 hover:text-black disabled:opacity-50 transition-opacity"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Previous
            </button>
            <div className="flex items-center gap-4">
                <button onClick={handleSkip} className="text-slate-600 hover:text-black">
                    Skip for now
                </button>
                <button 
                    onClick={handleNext}
                    className="bg-[#D9A566] hover:bg-[#c99455] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                    Continue
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m-7-14h18" /></svg>
                </button>
            </div>
        </div>
    </div>
  );
};

export default QuestionFlow;
