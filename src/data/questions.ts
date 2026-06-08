import { QuizQuestion } from '../types';
import { mapQuestions } from './mapQuestions';

export const baseQuestions: QuizQuestion[] = [
  // EASY
  {
    id: "e1",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Care este capitala României?",
    options: ["București", "Cluj-Napoca", "Timișoara", "Brașov"],
    correctAnswer: 0
  },
  {
    id: "e2",
    type: "multiple-choice",
    difficulty: "easy",
    question: "În ce județ se află orașul Iași?",
    options: ["Suceava", "Botoșani", "Iași", "Neamț"],
    correctAnswer: 2
  },
  {
    id: "e3",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Care este cel mai lung fluviu care străbate România?",
    options: ["Olt", "Mureș", "Dunărea", "Siret"],
    correctAnswer: 2
  },
  {
    id: "e4",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Care este capitala Republicii Moldova?",
    options: ["Bălți", "Tighina", "Chișinău", "Orhei"],
    correctAnswer: 2
  },
  {
    id: "e5",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Ce mare se află în estul României?",
    options: ["Marea Mediterană", "Marea Neagră", "Marea Egee", "Marea Adriatică"],
    correctAnswer: 1
  },
  {
    id: "e6",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Care este cel mai înalt vârf muntos din România?",
    options: ["Omu", "Moldoveanu", "Negoiu", "Peleaga"],
    correctAnswer: 1
  },
  {
    id: "e7",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Ce lanț muntos traversează centrul României?",
    options: ["Alpii", "Munții Carpați", "Munții Balcani", "Munții Apenini"],
    correctAnswer: 1
  },
  {
    id: "e8",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Care oraș este cunoscut sub numele de 'Capitala Băniei'?",
    options: ["Craiova", "Târgu Jiu", "Slatina", "Râmnicu Vâlcea"],
    correctAnswer: 0
  },
  {
    id: "e9",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Pe malul cărui râu se află orașul București?",
    options: ["Olt", "Argeș", "Dâmbovița", "Somes"],
    correctAnswer: 2
  },
  {
    id: "e10",
    type: "multiple-choice",
    difficulty: "easy",
    question: "Care dintre următoarele este un oraș la Marea Neagră?",
    options: ["Tulcea", "Brăila", "Galați", "Constanța"],
    correctAnswer: 3
  },

  // MEDIUM
  {
    id: "m1",
    type: "multiple-choice",
    difficulty: "medium",
    question: "Care dintre următorii munți NU fac parte din Carpații Meridionali?",
    options: ["Retezat", "Făgăraș", "Apuseni", "Parâng"],
    correctAnswer: 2
  },
  {
    id: "m2",
    type: "multiple-choice",
    difficulty: "medium",
    question: "Unde se află Delta Dunării?",
    options: ["La ieșirea Dunării din România", "În județul Tulcea", "La granița cu Bulgaria", "În județul Constanța"],
    correctAnswer: 1
  },
  {
    id: "m3",
    type: "multiple-choice",
    difficulty: "medium",
    question: "Care este al doilea cel mai populat oraș din România?",
    options: ["Timișoara", "Cluj-Napoca", "Iași", "Constanța"],
    correctAnswer: 1
  },
  {
    id: "m4",
    type: "multiple-choice",
    difficulty: "medium",
    question: "Ce râu formează granita naturală dintre România și Bulgaria pe o distanță mare?",
    options: ["Prut", "Tisa", "Dunărea", "Nistru"],
    correctAnswer: 2
  },
  {
    id: "m5",
    type: "multiple-choice",
    difficulty: "medium",
    question: "Care este singurul lac vulcanic din România?",
    options: ["Sfânta Ana", "Bucura", "Roșu", "Vidraru"],
    correctAnswer: 0
  },
  {
    id: "m6",
    type: "multiple-choice",
    difficulty: "medium",
    question: "În ce județ se află Sfinxul din Bucegi?",
    options: ["Prahova", "Dâmbovița", "Brașov", "Argeș"],
    correctAnswer: 1
  },
  {
    id: "m7",
    type: "multiple-choice",
    difficulty: "medium",
    question: "Care este cel mai vestic punct al României?",
    options: ["Beba Veche", "Jimbolia", "Nădlac", "Cenad"],
    correctAnswer: 0
  },
  {
    id: "m8",
    type: "multiple-choice",
    difficulty: "medium",
    question: "Ce râu se varsă în Dunăre la Galați?",
    options: ["Olt", "Mureș", "Prut", "Siret"],
    correctAnswer: 3
  },
  {
    id: "m9",
    type: "multiple-choice",
    difficulty: "medium",
    question: "În ce regiune se regăsesc celebrele Biserici de lemn aflate sub patrimoniu UNESCO?",
    options: ["Banat", "Maramureș", "Moldova", "Dobrogea"],
    correctAnswer: 1
  },
  {
    id: "m10",
    type: "multiple-choice",
    difficulty: "medium",
    question: "Ce oraș este considerat 'Orașul celor șapte coline' în România?",
    options: ["Iași", "Cluj-Napoca", "Brașov", "București"],
    correctAnswer: 0
  },

  // HARD
  {
    id: "h1",
    type: "multiple-choice",
    difficulty: "hard",
    question: "În ce oraș s-a semnat Tratatul de la Trianon (1920)?",
    options: ["Versailles", "Viena", "Trianon", "Paris"],
    correctAnswer: 3
  },
  {
    id: "h2",
    type: "multiple-choice",
    difficulty: "hard",
    question: "Câte județe are România (inclusiv Municipiul București ca entitate de nivel județean)?",
    options: ["40", "41", "42", "43"],
    correctAnswer: 2
  },
  {
    id: "h3",
    type: "multiple-choice",
    difficulty: "hard",
    question: "Care este suprafața aproximativă a României?",
    options: ["200.000 km²", "238.397 km²", "285.000 km²", "310.000 km²"],
    correctAnswer: 1
  },
  {
    id: "h4",
    type: "multi-select",
    difficulty: "hard",
    question: "Numește toate țările cu care se învecinează România.",
    options: ["Ucraina", "Slovacia", "Ungaria", "Bulgaria", "Serbia", "Croația", "Republica Moldova"],
    correctAnswer: [0, 2, 3, 4, 6]
  },
  {
    id: "h5",
    type: "multi-select",
    difficulty: "hard",
    question: "Numește toate cele 10 monarhii rămase din Europa.",
    options: ["Regatul Unit", "România", "Spania", "Suedia", "Norvegia", "Olanda", "Belgia", "Danemarca", "Franța", "Monaco", "Luxemburg", "Andorra", "Liechtenstein", "Italia"],
    correctAnswer: [0, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12]
  },
  {
    id: "h6",
    type: "multiple-choice",
    difficulty: "hard",
    question: "Ce denumire antică purta Marea Neagră?",
    options: ["Pontus Euxinus", "Mare Nostrum", "Dacia Pontica", "Peloponesus"],
    correctAnswer: 0
  },
  {
    id: "h7",
    type: "multiple-choice",
    difficulty: "hard",
    question: "Care este cel mai estic punct al României?",
    options: ["Sulina", "Vama Veche", "Gura Portiței", "Sfântu Gheorghe"],
    correctAnswer: 0
  },
  {
    id: "h8",
    type: "multiple-choice",
    difficulty: "hard",
    question: "În ce județ se află cascada Bigăr?",
    options: ["Caraș-Severin", "Timiș", "Hunedoara", "Alba"],
    correctAnswer: 0
  },
  {
    id: "h9",
    type: "multiple-choice",
    difficulty: "hard",
    question: "Ce unitate de relief se află în sudul României?",
    options: ["Câmpia Română", "Podișul Getic", "Munții Măcin", "Subcarpații Moldovei"],
    correctAnswer: 0
  },
  {
    id: "h10",
    type: "multi-select",
    difficulty: "hard",
    question: "Care dintre următoarele județe se află în regiunea istorică Transilvania? (Fără Crișana și Maramureș)",
    options: ["Cluj", "Bihor", "Sibiu", "Brașov", "Arad", "Mureș"],
    correctAnswer: [0, 2, 3, 5]
  }
];

export const questions: QuizQuestion[] = [...baseQuestions, ...mapQuestions];
