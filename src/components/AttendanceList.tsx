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
  const joinedNames = players.map(p => p.name.toUpperCase().trim()).filter(Boolean);

  // Map each joinedName to at most one expectedName under a greedy-matching schema
  interface MatchCandidate {
    joined: string;
    expected: string;
    score: number;
  }

  const candidates: MatchCandidate[] = [];

  joinedNames.forEach(joined => {
    const jParts = joined.split(/\s+/);
    expectedNames.forEach(expected => {
      const eParts = expected.toUpperCase().split(/\s+/);
      
      // Strict matching check: each word in the joined name must exist as a full word in the expected name
      // This prevents "LUCA" from matching "LUCAS" since "LUCAS" !== "LUCA"
      const allWordsMatch = jParts.every(jp => eParts.includes(jp));
      if (allWordsMatch) {
        const wordMatchCount = jParts.length;
        const exactMatchBonus = joined === expected.toUpperCase() ? 100 : 0;
        const lengthRatio = Math.min(joined.length, expected.length) / Math.max(joined.length, expected.length);
        const score = wordMatchCount * 10 + exactMatchBonus + lengthRatio;
        candidates.push({ joined, expected, score });
      }
    });
  });

  // Sort candidates by match quality score descending
  candidates.sort((a, b) => b.score - a.score);

  const matchedExpected = new Set<string>();
  const matchedJoined = new Set<string>();

  for (const candidate of candidates) {
    if (!matchedExpected.has(candidate.expected) && !matchedJoined.has(candidate.joined)) {
      matchedExpected.add(candidate.expected);
      matchedJoined.add(candidate.joined);
    }
  }

  const present = expectedNames.filter(name => matchedExpected.has(name));
  const missing = expectedNames.filter(name => !matchedExpected.has(name));

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
