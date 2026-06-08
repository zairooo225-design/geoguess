import React from 'react';
import { motion } from 'motion/react';
import { Player } from '../types';

export function AttendanceList({ players, expectedClass }: { players: Player[], expectedClass: string }) {
  // Pre-configured lists for demonstration.
  const classes: Record<string, string[]> = {
    "6C": [
       "MARIA AGAPIE CRISTINA", "BAJENARU ERIC IOAN", "BIRLA RARES IOAN", "BUCULEI LUCA MIHAI",
       "COMAN LUCA STEFAN", "COSTIN LAVINIA ANDREEA", "DRAGOMIR SERGIU ANDREI", "GRIGORE ALEXIA GEORGIANA",
       "IONESCU LUCAS ANDREI", "IONITA NICOLAS", "IORDACHE DELIA MARIA", "MANEA DAVID IOAN",
       "MARIN SOPHIA MARIA", "MOCANU ANDREI", "NICOLAE RADU STEFAN", "OLARU ERIC FLORIN",
       "OPREA TEODORA ELENA", "PATRANOIU IRINA ALEXANDRA", "PANDARU KARINA MARIA", "PETRE MARIA TEODORA",
       "STERIAN SARA MARIA", "TEODORESCU RARES COSTIN", "VASILIU VLAD ANDREI", "ZIDARESCU MIHNEA BOGDAN",
       "ZIDARESCU RARES GABRIEL"
    ],
  };

  const expectedNames = classes[expectedClass.toUpperCase()] || [];
  
  if (expectedNames.length === 0) {
    return null;
  }

  // Normalize joined player names to upper case for comparison
  const joinedNames = players.map(p => p.name.toUpperCase());
  
  const isPresent = (expectedName: string) => {
    return joinedNames.some(joined => {
       const jParts = joined.split(' ');
       const eParts = expectedName.split(' ');
       // If any part of the joined name exactly matches any part of the expected name
       return jParts.some(jp => jp.length >= 3 && eParts.includes(jp)) || 
              joined === expectedName || 
              expectedName.includes(joined);
    });
  };

  const present = expectedNames.filter(name => isPresent(name));
  const missing = expectedNames.filter(name => !isPresent(name));

  return (
    <div className="w-[90%] w-full max-w-2xl bg-white border-4 border-[#2D2D2D] rounded-xl shadow-[8px_8px_0px_#2D2D2D] p-4 sm:p-6 mb-8 text-[#2D2D2D] mx-auto overflow-hidden">
       <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-4 border-b-4 border-[#2D2D2D] pb-2">Prezență Clasa {expectedClass.toUpperCase()}</h3>
       
       <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
         <div className="flex-1">
            <h4 className="font-bold text-base sm:text-lg mb-3 flex items-center justify-between">
               <span className="bg-[#AEC6C2] px-2 py-1 rounded">Prezenți ({present.length})</span>
            </h4>
            <ul className="space-y-2">
              {present.map((name, i) => (
                 <li key={i} className="flex items-center gap-2 font-black border-2 border-[#AEC6C2] rounded px-3 py-2 bg-[#AEC6C2]/20 text-xs sm:text-sm">
                   <span className="text-green-600 shrink-0">✓</span>
                   <span className="truncate">{name}</span>
                 </li>
              ))}
              {present.length === 0 && <span className="text-gray-400 italic text-sm">Nimeni...</span>}
            </ul>
         </div>

         <div className="flex-1">
            <h4 className="font-bold text-base sm:text-lg mb-3 flex items-center justify-between">
               <span className="bg-[#C16757] text-white px-2 py-1 rounded">Absenți ({missing.length})</span>
            </h4>
            <ul className="space-y-2">
              {missing.map((name, i) => (
                 <li key={i} className="flex items-center gap-2 font-black border-2 border-[#C16757] rounded px-3 py-2 bg-[#C16757]/10 text-gray-400 text-xs sm:text-sm">
                   <span className="text-red-500 shrink-0">✗</span>
                   <span className="truncate">{name}</span>
                 </li>
              ))}
              {missing.length === 0 && <span className="text-green-600 font-bold block mt-2 text-sm">Toată clasa este prezentă!</span>}
            </ul>
         </div>
       </div>
    </div>
  );
}
