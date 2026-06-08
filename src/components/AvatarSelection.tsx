import React, { useState } from 'react';
import { motion } from 'motion/react';
import { audioManager } from '../audio';

export const avatars = [
  "https://i.imgur.com/Nc8r7bO.jpeg",
  "https://i.imgur.com/EfUcKNP.jpeg",
  "https://i.imgur.com/Blj9LOn.jpeg",
  "https://i.imgur.com/53UvygY.jpeg",
  "https://i.imgur.com/xeZqJwD.jpeg",
  "https://i.imgur.com/8Ua4O8w.jpeg"
];

interface AvatarSelectionProps {
  onSelect: (avatar: string | null) => void;
}

export function AvatarSelection({ onSelect }: AvatarSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-[#f4f4f0] border-4 border-[#2D2D2D] rounded-2xl shadow-[8px_8px_0px_#2D2D2D] w-full max-w-lg relative z-10">
      <h2 className="text-3xl font-black text-[#2D2D2D] mb-2 uppercase tracking-wider text-center">Pick Your Avatar</h2>
      <p className="text-gray-500 font-bold mb-6 text-center">Stand out in the leaderboard!</p>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        {avatars.map((url, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              audioManager.playSfx('click');
              setSelected(url);
            }}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 ${selected === url ? 'border-[#3EACA8] shadow-[0_0_15px_rgba(62,172,168,0.6)]' : 'border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D]'} overflow-hidden transition-all duration-200`}
          >
            <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button 
          onClick={() => {
             if (selected) {
               audioManager.playSfx('success');
               onSelect(selected);
             }
          }}
          disabled={!selected}
          className="bg-[#C16757] text-white disabled:opacity-50 disabled:cursor-not-allowed border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black text-xl px-8 py-3 rounded-xl uppercase tracking-widest hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2D2D2D] active:translate-y-1 active:shadow-none transition-all"
        >
          Select Avatar
        </button>
      </div>
    </div>
  );
}
