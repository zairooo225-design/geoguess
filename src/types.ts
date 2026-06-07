export type GameState = "INTRO" | "JOINING" | "NAME_ENTRY" | "AI_THINKING" | "AVATAR_SELECTION" | "LOBBY" | "ATTENDANCE_CHECK" | "TEAM_INTRO" | "TEAM_PICKING" | "TEAM_PICKING_FINISHED" | "PLAYING" | "LEADERBOARD" | "TEACHER_PIN" | "TEACHER_AUTH" | "TEACHER_DASHBOARD" | "ROOM_SETTINGS" | "LOADING_ROOM";

export interface Player {
  id: string;
  name: string;
  tokens: number;
  streak?: number;
  avatar?: string;
  teammateId?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'multi-select' | 'map-click' | 'map-country';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer?: number | number[]; // index for multiple-choice, array of indices for multi-select
  targetLocation?: { lat: number; lng: number }; // for map-click
  targetCountry?: string; // target country name to click on the map
  mapCenter?: { lat: number; lng: number }; // optional starting view
  mapZoom?: number; 
  imageUrl?: string;
}

