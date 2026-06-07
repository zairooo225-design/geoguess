import React from 'react';
import { motion } from 'motion/react';
import { Player } from '../types';

export function AttendanceList({ players, expectedClass }: { players: Player[], expectedClass: string }) {
  // Pre-configured lists for demonstration.
  const classes: Record<string, string[]> = {
    "6C": [
       "ANDREI", "ALEXANDRU", "BOGDAN", "CRISTINA", "DIANA", "ELENA", "FLORIN", "GABRIELA", "IONUT", "MARIA", "STEFAN"
    ],
  };

  const expectedNames = classes[expectedClass.toUpperCase()] || [];
  
  if (expectedNames.length === 0) {
    return null;
  }

  // Normalize joined player names to upper case for comparison
  const joinedNames = players.map(p => p.name.toUpperCase());
  
  const present = expectedNames.filter(name => joinedNames.includes(name));
  const missing = expectedNames.filter(name => !joinedNames.includes(name));

  return (
    <div className="w-full max-w-2xl bg-white border-4 border-[#2D2D2D] rounded-xl shadow-[8px_8px_0px_#2D2D2D] p-6 mb-8 text-[#2D2D2D]">
       <h3 className="text-2xl font-black uppercase tracking-wider mb-4 border-b-4 border-[#2D2D2D] pb-2">Prezență Clasa {expectedClass.toUpperCase()}</h3>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div>
            <h4 className="font-bold text-lg mb-3 flex items-center justify-between">
               <span className="bg-[#AEC6C2] px-2 py-1 rounded">Prezenți ({present.length})</span>
            </h4>
            <ul className="space-y-2">
              {present.map((name, i) => (
                 <li key={i} className="flex items-center gap-2 font-black border-2 border-[#AEC6C2] rounded px-3 py-2 bg-[#AEC6C2]/20">
                   <span className="text-green-600">✓</span> {name}
                 </li>
              ))}
              {present.length === 0 && <span className="text-gray-400 italic">Nimeni...</span>}
            </ul>
         </div>

         <div>
            <h4 className="font-bold text-lg mb-3 flex items-center justify-between">
               <span className="bg-[#C16757] text-white px-2 py-1 rounded">Absenți ({missing.length})</span>
            </h4>
            <ul className="space-y-2">
              {missing.map((name, i) => (
                 <li key={i} className="flex items-center gap-2 font-black border-2 border-[#C16757] rounded px-3 py-2 bg-[#C16757]/10 text-gray-400">
                   <span className="text-red-500">✗</span> {name}
                 </li>
              ))}
              {missing.length === 0 && <span className="text-green-600 font-bold block mt-2">Toată clasa este prezentă!</span>}
            </ul>
         </div>
       </div>
    </div>
  );
}
