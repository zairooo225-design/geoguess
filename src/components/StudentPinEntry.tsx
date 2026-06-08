import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameState } from "../types";
import { audioManager } from "../audio";

export function StudentPinEntry({ onJoin, error }: { onJoin: (pin: string) => void, error: string }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      setLoading(false);
      audioManager.playSfx('error');
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawPin = pin.replace(/ /g, '');
    if (rawPin.length < 6) return;
    setLoading(true);
    audioManager.playSfx('success');
    onJoin(rawPin);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 6) raw = raw.slice(0, 6);
    
    // Play keypress sound if we added a character
    if (raw.length > pin.replace(/ /g, '').length) {
      audioManager.playSfx('keypress');
    }

    let formatted = raw;
    if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3)}`;
    }
    setPin(formatted);
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="bg-white p-6 md:p-12 rounded-2xl shadow-[8px_8px_0px_#2D2D2D] border-4 border-[#2D2D2D] w-[90%] w-full max-w-sm flex flex-col items-center relative z-10"
    >
      <h2 className="text-2xl font-black text-[#2D2D2D] uppercase tracking-wider mb-6 text-center">
        Enter Game PIN
      </h2>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 relative">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-12 left-0 w-full bg-[#C16757] text-white p-2 text-center rounded-lg font-bold text-sm border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="text"
          value={pin}
          onChange={handlePinChange}
          placeholder="000 000"
          disabled={loading}
          className="w-full bg-[#f4f4f0] border-2 border-[#2D2D2D] focus:border-[#C16757] focus:ring-4 focus:ring-[#C16757]/20 outline-none rounded-lg p-5 text-[#2D2D2D] font-mono font-black text-center text-3xl md:text-4xl tracking-widest md:tracking-[0.3em] transition-all disabled:opacity-50"
          maxLength={7}
        />
        <button
          type="submit"
          disabled={pin.replace(/ /g, '').length < 6 || loading}
          className="w-full relative overflow-hidden bg-[#2D2D2D] text-white font-black py-5 rounded-lg uppercase tracking-widest shadow-[4px_4px_0px_#C16757] hover:translate-y-1 hover:shadow-[0px_0px_0px_#C16757] hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          onClick={() => {
             // Let the form submit handle this, but if we need a sound we can play it here as well. Form submit will play success.
          }}
        >
          {loading ? (
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
               className="w-6 h-6 border-4 border-white border-t-transparent rounded-full mx-auto"
             />
          ) : "Enter"}
          
          {!loading && (
             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shine_1s_ease-in-out]" />
          )}
        </button>
      </form>
    </motion.div>
  );
}
