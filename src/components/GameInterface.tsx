import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QuizQuestion } from '../types';
import { audioManager } from '../audio';
import { CheckSquare, Square } from 'lucide-react';
import { MapCountrySelect } from './MapCountrySelect';
import confetti from 'canvas-confetti';

interface GameInterfaceProps {
  question: QuizQuestion;
  onAnswer: (answer: number | number[] | string, timeTakenInSecs: number) => void;
  isHost: boolean;
  timeRemaining?: number;
  currentStreak?: number;
  teamBonusEligibleDeadline?: number | null;
}

export function GameInterface({ question, onAnswer, isHost, timeRemaining = 30, currentStreak = 0, teamBonusEligibleDeadline }: GameInterfaceProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeRemaining);
  const [bonusTimer, setBonusTimer] = useState<number | null>(null);

  useEffect(() => {
    setTimeLeft(timeRemaining);
    setSelectedAnswers([]);
    setHasSubmitted(false);
  }, [question, timeRemaining]);

  useEffect(() => {
    if (currentStreak >= 3) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E23048', '#3EACA8', '#FFEB3B'],
          zIndex: 1000
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E23048', '#3EACA8', '#FFEB3B'],
          zIndex: 1000
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [currentStreak]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasSubmitted) {
        audioManager.playSfx('click');
        setHasSubmitted(true);
        onAnswer(question.type === 'multi-select' ? selectedAnswers : -1, timeRemaining - timeLeft);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, hasSubmitted, onAnswer, question.type, selectedAnswers, timeRemaining]);

  useEffect(() => {
    if (teamBonusEligibleDeadline) {
      const remaining = Math.max(0, Math.floor((teamBonusEligibleDeadline - Date.now()) / 1000));
      setBonusTimer(remaining);
      const timer = setInterval(() => {
        const r = Math.max(0, Math.floor((teamBonusEligibleDeadline - Date.now()) / 1000));
        setBonusTimer(r);
        if (r <= 0) clearInterval(timer);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setBonusTimer(null);
    }
  }, [teamBonusEligibleDeadline]);

  const colors = [
    "bg-[#E23048] hover:bg-[#C2162B]", // Red
    "bg-[#1D6AED] hover:bg-[#1150C2]", // Blue
    "bg-[#D89E00] hover:bg-[#B38300]", // Yellow
    "bg-[#26890C] hover:bg-[#1E6C0A]", // Green
    "bg-[#864C9A] hover:bg-[#683A78]", // Purple
    "bg-[#0099AE] hover:bg-[#007A8A]"  // Teal
  ];

  const shapes = ["▲", "◆", "●", "■", "★", "✚"];

  const tryVibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleMultipleChoiceClick = (index: number) => {
    if (hasSubmitted || timeLeft <= 0) return;
    tryVibrate();
    audioManager.playSfx('click');
    setHasSubmitted(true);
    onAnswer(index, timeRemaining - timeLeft);
  };

  const toggleMultiSelectOption = (index: number) => {
    if (hasSubmitted || timeLeft <= 0) return;
    tryVibrate();
    audioManager.playSfx('click');
    setSelectedAnswers(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const submitMultiSelect = () => {
    if (hasSubmitted || timeLeft <= 0) return;
    tryVibrate();
    audioManager.playSfx('click');
    setHasSubmitted(true);
    onAnswer(selectedAnswers, timeRemaining - timeLeft);
  };

  if (question.type === 'map-country' && question.targetCountry) {
    return (
      <div className={`w-full flex-1 flex flex-col w-full max-w-6xl overflow-hidden p-0 gap-0 relative z-10 box-border text-[14px] transition-all duration-500`}>
        {/* Timer overlay */}
        <div className="absolute top-4 left-4 z-[1001] pointer-events-none">
          <div className={`w-12 h-12 md:w-16 md:h-16 ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-purple-500'} rounded-full border-4 border-[#2D2D2D] flex items-center justify-center shadow-[4px_4px_0_#2D2D2D]`}>
             <span className="text-xl md:text-2xl font-black text-white drop-shadow-sm">{timeLeft}</span>
          </div>
        </div>

        {currentStreak > 1 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 z-50 bg-orange-500 border-4 border-[#2D2D2D] rounded-full px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0_#2D2D2D] transform rotate-3"
          >
            <span className="text-2xl md:text-3xl">🔥</span>
            <span className="text-white font-black drop-shadow-md text-xl md:text-2xl">{currentStreak}</span>
          </motion.div>
        )}

        <MapCountrySelect 
           targetCountry={question.targetCountry}
           mapCenter={question.mapCenter}
           mapZoom={question.mapZoom}
           disabled={hasSubmitted || timeLeft <= 0}
           onSelect={(countryId) => {
              setHasSubmitted(true);
              tryVibrate();
              audioManager.playSfx('click');
              onAnswer(countryId, timeRemaining - timeLeft);
           }}
        />
      </div>
    );
  }

  return (
    <div className={`w-full flex-1 md:flex-none flex flex-col h-full md:h-auto max-w-4xl bg-white/85 backdrop-blur-md border-[2px] border-[#2D2D2D] rounded-xl shadow-[4px_4px_0px_#2D2D2D] overflow-y-auto p-2 md:p-4 gap-2 sm:gap-3 relative z-10 box-border text-[14px] transition-all duration-500 ${bonusTimer && bonusTimer > 0 ? 'ring-4 ring-[#3EACA8] shadow-[0_0_20px_#3EACA8] border-[#3EACA8]' : ''}`}>
      
      {/* HEADER: Question */}
      <div className="w-full bg-[#f4f4f0] border-[2px] border-[#2D2D2D] rounded-lg p-2 md:p-3 text-center shadow-[2px_2px_0px_#2D2D2D] relative">
        <h2 className="text-base md:text-xl lg:text-2xl font-black text-[#2D2D2D] uppercase tracking-tighter leading-tight bg-white inline-block px-2 py-1 border-2 border-[#2D2D2D] transform -rotate-1">{question.question}</h2>
        
        {currentStreak > 1 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-orange-500 border-2 border-[#2D2D2D] rounded-full p-2 flex items-center gap-1 shadow-[2px_2px_0_#2D2D2D] transform rotate-12 z-20"
          >
            <span className="text-xl">🔥</span>
            <span className="text-white font-black drop-shadow-md text-lg">{currentStreak}</span>
          </motion.div>
        )}

        {bonusTimer && bonusTimer > 0 && (
          <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#3EACA8] text-white border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] px-3 py-1 rounded-full font-black text-xs md:text-sm uppercase whitespace-nowrap z-20 animate-pulse"
          >
            Team Bonus: {bonusTimer}s
          </motion.div>
        )}
      </div>

      {/* MIDDLE: Media & Stats */}
      <div className="flex-1 min-h-0 flex flex-col sm:flex-row w-full items-center justify-between gap-2">
        
        {/* Timer */}
        <div className="flex flex-col items-center justify-center order-2 sm:order-1 flex-shrink-0">
          <div className={`w-12 h-12 md:w-16 md:h-16 ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-purple-500'} rounded-full border-[2px] border-[#2D2D2D] flex items-center justify-center shadow-sm`}>
            <span className="text-xl md:text-2xl font-black text-white drop-shadow-sm">{timeLeft}</span>
          </div>
        </div>

        {/* Center Image */}
        <div className="flex-1 w-full flex items-center justify-center order-1 sm:order-2 px-1 min-h-0">
          {question.imageUrl ? (
            <img src={question.imageUrl} alt="Question media" className="w-full max-h-full object-contain rounded-lg border-[2px] border-[#2D2D2D] bg-[#f4f4f0]" />
          ) : question.type !== 'map-country' ? (
            <div className="w-full h-[10vh] md:h-24 bg-[#3EACA8] flex items-center justify-center rounded-lg border-[2px] border-[#2D2D2D] shadow-sm">
              <span className="text-white font-black text-xl md:text-3xl uppercase tracking-tighter transform -rotate-2 drop-shadow-sm">GeoQuest!</span>
            </div>
          ) : null}
        </div>

        {/* Answer Count (Placeholder) */}
        <div className="flex flex-col items-center justify-center bg-[#f4f4f0] border-[2px] border-[#2D2D2D] rounded-lg p-2 order-3 min-w-[60px] flex-shrink-0 shadow-sm">
          <span className="text-xl md:text-2xl font-black text-[#2D2D2D]">0</span>
          <span className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-widest mt-0.5">Ans</span>
        </div>
      </div>

      {/* BOTTOM: Answer Grid */}
      {question.type === 'multiple-choice' && question.options && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              disabled={hasSubmitted || timeLeft <= 0}
              onClick={() => handleMultipleChoiceClick(idx)}
              className={`${colors[idx % colors.length]} w-full p-2.5 md:p-3 rounded-lg border-[2px] border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all flex items-center gap-2 relative disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-md flex items-center justify-center border-[1.5px] border-white/40 flex-shrink-0">
                <span className="text-white text-sm md:text-base font-black drop-shadow-sm">
                  {shapes[idx % shapes.length]}
                </span>
              </div>
              <div className="flex-1 text-left text-white font-black text-sm md:text-base uppercase tracking-tight drop-shadow-sm leading-tight break-words">
                {option}
              </div>
            </button>
          ))}
        </div>
      )}

      {question.type === 'multi-select' && question.options && (
        <div className="w-full flex flex-col items-center gap-2 mt-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 w-full max-h-[25vh] overflow-y-auto pr-1">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswers.includes(idx);
              return (
                <button
                  key={idx}
                  disabled={hasSubmitted || timeLeft <= 0}
                  onClick={() => toggleMultiSelectOption(idx)}
                  className={`w-full p-2 rounded-lg border-[2px] border-[#2D2D2D] ${isSelected ? 'bg-[#FFEB3B] translate-y-px translate-x-px' : 'bg-white shadow-[2px_2px_0px_#2D2D2D] hover:-translate-y-px'} flex items-start sm:items-center gap-1.5 transition-all text-left disabled:opacity-70`}
                >
                  <div className={`text-base flex-shrink-0 ${isSelected ? 'text-[#2D2D2D]' : 'text-gray-400'}`}>
                    {isSelected ? <CheckSquare size={18} className="fill-[#2D2D2D] text-[#FFEB3B]" /> : <Square size={18} className="text-[#2D2D2D]" />}
                  </div>
                  <span className="text-[#2D2D2D] font-black uppercase text-[10px] md:text-sm leading-tight flex-1">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
          
          <button 
            disabled={hasSubmitted || selectedAnswers.length === 0 || timeLeft <= 0}
            onClick={submitMultiSelect}
            className="mt-1 text-white bg-[#C16757] border-[2px] border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] font-black px-6 py-2 text-sm md:text-base rounded-lg hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none disabled:opacity-50 transition-all uppercase tracking-widest shrink-0"
          >
            Confirm? ({selectedAnswers.length})
          </button>
        </div>
      )}
    </div>
  );
}
