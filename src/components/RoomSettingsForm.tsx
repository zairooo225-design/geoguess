import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { audioManager } from '../audio';

export function RoomSettingsForm({ onStart, onCancel }: { onStart: (settings: { title: string; className: string; nameProtected: boolean; numQuestions: number; difficulty: string; globalVolume: number }) => void, onCancel?: () => void }) {
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [nameProtected, setNameProtected] = useState(false);
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("mixed");
  const [globalVolume, setGlobalVolume] = useState(1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const placeholders = ["6C", "6H", "8A", "9B", "10F"];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioManager.playSfx('click');
    onStart({ title, className, nameProtected, numQuestions: parseInt(numQuestions), difficulty, globalVolume });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
      className="flex flex-col p-5 md:p-6 bg-white/90 backdrop-blur-md border-[3px] border-[#2D2D2D] rounded-2xl shadow-[6px_6px_0px_#2D2D2D] w-full max-w-[400px] relative z-10"
    >
      <div className="w-full bg-[#f4f4f0] border-[2px] border-[#2D2D2D] rounded-lg p-3 text-center mb-5 shadow-[2px_2px_0px_#2D2D2D]">
        <h2 className="text-lg md:text-xl font-black text-[#2D2D2D] uppercase tracking-tighter leading-tight bg-white inline-block px-3 py-1 border-[2px] border-[#2D2D2D] transform -rotate-1">
          Settings
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10 box-border text-[16px]">
        <div>
          <label className="block text-[#2D2D2D] font-bold uppercase text-[12px] mb-1">Title for Room</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. World Capitals Quiz"
            className="w-full bg-white text-[#2D2D2D] border-[2px] border-[#2D2D2D] p-2.5 rounded-lg font-bold text-sm outline-none focus:ring-[3px] focus:ring-[#C16757] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-[#2D2D2D] font-bold uppercase text-[12px] mb-1">What Class is this?</label>
          <input 
            type="text" 
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder={placeholders[placeholderIndex]}
            className="w-full bg-white text-[#2D2D2D] border-[2px] border-[#2D2D2D] p-2.5 rounded-lg font-bold text-sm outline-none focus:ring-[3px] focus:ring-[#C16757] transition-all placeholder:transition-opacity"
            required
          />
        </div>

        <div>
          <label className="block text-[#2D2D2D] font-bold uppercase text-[12px] mb-1">Number of Questions</label>
          <select 
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="w-full bg-white text-[#2D2D2D] border-[2px] border-[#2D2D2D] p-2.5 rounded-lg font-bold text-sm outline-none focus:ring-[3px] focus:ring-[#C16757] transition-all"
          >
            <option value="5">5 Questions</option>
            <option value="10">10 Questions</option>
            <option value="15">15 Questions</option>
            <option value="20">20 Questions</option>
          </select>
        </div>

        <div>
          <label className="block text-[#2D2D2D] font-bold uppercase text-[12px] mb-1">Difficulty</label>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-white text-[#2D2D2D] border-[2px] border-[#2D2D2D] p-2.5 rounded-lg font-bold text-sm outline-none focus:ring-[3px] focus:ring-[#C16757] transition-all"
          >
            <option value="mixed">Mixed</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="bg-white border-[2px] border-[#2D2D2D] p-3 rounded-xl flex flex-col gap-2 items-start mt-2 shadow-[2px_2px_0px_#2D2D2D]">
          <div className="flex items-center justify-between w-full">
            <label className="text-[#2D2D2D] font-black uppercase text-[12px]">Name Protected</label>
            <button 
              type="button"
              onClick={() => {
                audioManager.playSfx('click');
                setNameProtected(!nameProtected);
              }}
              className={`w-12 h-6 rounded-full border-[2px] border-[#2D2D2D] p-0.5 transition-colors duration-300 flex items-center shadow-[1px_1px_0px_#2D2D2D] ${nameProtected ? 'bg-[#5CB85C]' : 'bg-gray-200'}`}
            >
              <div className={`bg-white w-4 h-4 rounded border-[2px] border-[#2D2D2D] transform transition-transform duration-300 shadow-sm ${nameProtected ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </button>
          </div>
          <p className="text-[#2D2D2D]/70 text-[11px] font-bold leading-tight">
            Enable if streaming on a smartboard to censor names.
          </p>
        </div>

        <div>
          <label className="block text-[#2D2D2D] font-bold uppercase text-[12px] mb-1">Classroom Music Volume ({Math.round(globalVolume * 100)}%)</label>
          <input 
            type="range" 
            min="0" max="1" step="0.1"
            value={globalVolume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setGlobalVolume(val);
              audioManager.setGlobalVolume(val); // preview changes live
            }}
            className="w-full accent-[#C16757]"
          />
        </div>

        <div className="flex gap-2 w-full mt-4">
          {onCancel && (
            <button
               type="button"
               onClick={() => {
                 audioManager.playSfx('click');
                 onCancel();
               }}
               className="flex-1 text-[#2D2D2D] bg-[#f4f4f0] border-[3px] border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black px-4 py-3 text-sm md:text-base rounded-xl hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all uppercase tracking-widest shrink-0"
            >
              Back
            </button>
          )}
          <button 
            type="submit" 
            className="flex-[2] text-white bg-[#C16757] border-[3px] border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black px-4 py-3 text-sm md:text-base rounded-xl hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all uppercase tracking-widest shrink-0"
          >
            Create Room
          </button>
        </div>
      </form>
    </motion.div>
  );
}
