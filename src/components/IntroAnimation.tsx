import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "fade">("enter");
  const [canClick, setCanClick] = useState(false);

  useEffect(() => {
    const t2 = setTimeout(() => setCanClick(true), 1500);
    return () => {
      clearTimeout(t2);
    };
  }, []);

  const handleStart = () => {
    if (canClick) {
      setPhase("fade");
      setTimeout(() => onComplete(), 500);
    }
  };

  return (
    <motion.div
      onClick={handleStart}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFBF7] overflow-hidden ${canClick ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-1 flex flex-col items-center justify-center pointer-events-none w-full relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center gap-6"
        >
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#3EACA8] border-8 border-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(62,172,168,0.8)]">
            <span className="text-4xl md:text-6xl">🌍</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#2D2D2D] uppercase drop-shadow-lg italic rotate-[-5deg]">
            GeoQuest
          </h1>
        </motion.div>
      </div>

      {canClick && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-16 text-gray-400 font-bold tracking-widest uppercase text-sm animate-pulse"
        >
          Click Anywhere to Enter
        </motion.div>
      )}
    </motion.div>
  );
}
