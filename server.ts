import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { questions as QUIZ_QUESTIONS } from "./src/data/questions";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

// App State
type GameState = "LOBBY" | "PLAYING" | "LEADERBOARD" | "TEAM_INTRO" | "TEAM_PICKING" | "TEAM_PICKING_FINISHED";

let _gAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!_gAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    _gAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _gAI;
}

interface Player {
  id: string;
  name: string;
  tokens: number;
  streak: number;
  avatar?: string;
  teammateId?: string;
  requestedTeammateId?: string;
}

interface Room {
  id: string;
  hostId: string;
  state: GameState;
  players: Player[];
  settings?: any; // To store room settings, including nameProtected
  currentRound: number;
  totalRounds: number;
  currentQuestion: any | null; // Placeholder for quiz question
  questionsList: any[];
  guesses?: Record<string, any>; // socketId -> guess info
  pickingTimeout?: NodeJS.Timeout;
}

const rooms = new Map<string, Room>();

const generateRoomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const getRandomQuestions = (num: number, difficulty: string) => {
  let filtered = [...QUIZ_QUESTIONS];
  if (difficulty !== "mixed") {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(num, shuffled.length));
};

io.on("connection", (socket) => {
  // Host creates a game
  socket.on("create-room", (settings) => {
    const code = generateRoomCode();
    const numQsStr = settings?.numQuestions;
    const requestedNumQs = typeof numQsStr === 'string' ? parseInt(numQsStr, 10) : (numQsStr || 5);
    const difficulty = settings?.difficulty || "mixed";
    
    const questionsList = getRandomQuestions(requestedNumQs, difficulty);
    const actualNumQs = questionsList.length;

    rooms.set(code, {
      id: code,
      hostId: socket.id,
      state: "LOBBY",
      settings: settings || {},
      players: [],
      currentRound: 0,
      totalRounds: actualNumQs,
      currentQuestion: null,
      questionsList,
    });
    socket.join(code);
    socket.emit("room-created", code, settings?.isSolo);
  });

  // Player joins room
  socket.on("join-room", (code) => {
    const room = rooms.get(code);
    if (room && room.state === "LOBBY") {
      socket.join(code);
      socket.emit("joined-room", code, room.settings);
    } else {
      socket.emit("error", "Room not found or game already started");
    }
  });

  // Player sets name (after validating via API)
  socket.on("set-name", ({ roomCode, name, avatar }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const player = { id: socket.id, name, tokens: 0, streak: 0, avatar, teammateId: undefined };
    room.players.push(player);
    io.to(roomCode).emit("players-updated", room.players);
  });

  // Check attendance before starting
  socket.on("check-attendance", (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    io.to(roomCode).emit("attendance-check");
  });

  // Host starts game (or next round)
  socket.on("start-game", (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    
    if (room.currentRound === 0 && !room.settings.isSolo) {
      // First round -> go through team intro
      room.state = "TEAM_INTRO";
      io.to(roomCode).emit("team-intro-started");
      
      // Wait roughly 8.2s for beat
      setTimeout(() => {
        const checkRoom = rooms.get(roomCode);
        if (checkRoom && checkRoom.state === "TEAM_INTRO") {
           checkRoom.state = "TEAM_PICKING";
           io.to(roomCode).emit("team-picking-started");
           
           // 20s team picking
           checkRoom.pickingTimeout = setTimeout(() => {
             const r = rooms.get(roomCode);
             if (r && r.state === "TEAM_PICKING") {
                finishTeamPicking(r, roomCode);
             }
           }, 20000);
        }
      }, 8200);
    } else {
      startRound(room, roomCode);
    }
  });

  function finishTeamPicking(room: any, roomCode: string) {
    room.state = "TEAM_PICKING_FINISHED";
    io.to(roomCode).emit("team-picking-finished");
    
    // Give client time to play chinese meme and fade in
    setTimeout(() => {
       const r = rooms.get(roomCode);
       if (r) {
         startRound(r, roomCode);
       }
    }, 4000);
  }

  socket.on("send-team-request", ({ roomCode, targetPlayerId }) => {
     const room = rooms.get(roomCode);
     if (!room) return;
     
     const me = room.players.find((p: any) => p.id === socket.id);
     const target = room.players.find((p: any) => p.id === targetPlayerId);
     
     if (me && target && !me.teammateId && !target.teammateId) {
       me.requestedTeammateId = target.id;
       io.to(roomCode).emit("players-updated", room.players);
       
       if (target.requestedTeammateId === me.id) {
         // Mutual pick
         me.teammateId = target.id;
         target.teammateId = me.id;
         io.to(roomCode).emit("players-updated", room.players);
         
         if (room.state === "TEAM_PICKING") {
            const humanPlayers = room.players;
            const allPicked = humanPlayers.every((p: any) => p.teammateId) || humanPlayers.filter((p: any) => !p.teammateId).length <= 1;
            if (allPicked) {
               if (room.pickingTimeout) clearTimeout(room.pickingTimeout);
               finishTeamPicking(room, roomCode);
            }
         }
       }
     }
  });

  function startRound(room: any, roomCode: string) {
    room.state = "PLAYING";
    room.currentRound += 1;
    
    if (room.currentRound > room.totalRounds) {
       room.state = "LEADERBOARD";
       room.players.sort((a,b) => b.tokens - a.tokens);
       io.to(roomCode).emit("leaderboard", room.players);
       return;
    }

    const qIndex = room.currentRound - 1;
    room.currentQuestion = room.questionsList[qIndex];
    room.guesses = {}; // reset guesses
    
    io.to(roomCode).emit("game-started", {
      round: room.currentRound,
      question: room.currentQuestion
    });
  }

  // Submit guess
  socket.on("submit-guess", ({ roomCode, answer, timeTakenInSecs }) => {
    const room = rooms.get(roomCode);
    if (!room || !room.currentQuestion) return;
    
    if (!room.guesses) room.guesses = {};
    if (room.guesses[socket.id]) return; // already guessed
    
    let isCorrect = false;
    
    if (room.currentQuestion.type === 'map-country') {
       isCorrect = answer && typeof answer === 'string' && room.currentQuestion.targetCountry && 
                   answer.toUpperCase() === room.currentQuestion.targetCountry.toUpperCase();
    } else if (room.currentQuestion.type === 'map-click') {
       // Placeholder if needed for distance logic
       isCorrect = answer === true; 
    } else if (Array.isArray(room.currentQuestion.correctAnswer) && Array.isArray(answer)) {
       // Multi-select check
       const correctAnswer = room.currentQuestion.correctAnswer;
       if (correctAnswer.length === answer.length) {
          const sortedCorrect = [...correctAnswer].sort();
          const sortedAnswer = [...answer].sort();
          isCorrect = sortedCorrect.every((val, index) => val === sortedAnswer[index]);
       }
    } else {
       // Multiple choice check
       isCorrect = answer === room.currentQuestion.correctAnswer;
    }
    
    // Dynamic points calculation
    let points = 0;
    if (isCorrect) {
      const timePenalty = (Math.min(timeTakenInSecs, 30) / 30) * 500;
      points = Math.max(500, Math.round(1000 - timePenalty));

      // First-to-answer correct bonus
      const correctGuessesSoFar = Object.values(room.guesses).filter((g: any) => g.isCorrect).length;
      if (correctGuessesSoFar === 0) {
        points += 200; // 1st
      } else if (correctGuessesSoFar === 1) {
        points += 100; // 2nd
      } else if (correctGuessesSoFar === 2) {
        points += 50;  // 3rd
      }
    }

    let player = room.players.find(p => p.id === socket.id);
    if (!player) {
      player = { id: socket.id, name: "Host", tokens: 0, streak: 0 };
      room.players.push(player);
      io.to(roomCode).emit("players-updated", room.players);
    }
    player.tokens = (player.tokens || 0) + points;
    
    if (isCorrect) {
      player.streak = (player.streak || 0) + 1;
    } else {
      player.streak = 0;
    }

    room.guesses[socket.id] = { answer, isCorrect, points, timestamp: Date.now() };
    socket.emit("guess-result", { isCorrect, points, streak: player.streak });

    if (player.teammateId && isCorrect) {
      const teammateGuess = room.guesses[player.teammateId];
      if (teammateGuess && teammateGuess.isCorrect) {
         const timeDiff = Math.abs(Date.now() - teammateGuess.timestamp);
         if (timeDiff <= 5000) {
            // Team Bonus! Give points again to double them
            player.tokens += points;
            const teammate = room.players.find((p: any) => p.id === player.teammateId);
            if (teammate) {
                teammate.tokens += teammateGuess.points;
            }
            room.guesses[socket.id].teamBonus = true;
            teammateGuess.teamBonus = true;
            
            io.to(player.id).emit("team-bonus-awarded", { pointsAdded: points });
            io.to(player.teammateId).emit("team-bonus-awarded", { pointsAdded: teammateGuess.points });
         }
      } else if (!teammateGuess) {
         io.to(player.teammateId).emit("teammate-guessed-eligible", {
            deadline: Date.now() + 5000
         });
      }
    }
    
    io.to(roomCode).emit("players-updated", room.players);

    if (Object.keys(room.guesses).length >= room.players.length) {
       // Everyone guessed
       const stats = {
         correctCount: Object.values(room.guesses).filter((g: any) => g.isCorrect).length,
         totalCount: Object.keys(room.guesses).length,
         guessesInfo: room.guesses
       };
       io.to(roomCode).emit("round-results", stats);
    }
  });

  // Check results
  socket.on("show-leaderboard", (roomCode) => {
     const room = rooms.get(roomCode);
     if (room && room.hostId === socket.id) {
       room.state = "LEADERBOARD";
       // sort players
       room.players.sort((a,b) => b.tokens - a.tokens);
       io.to(roomCode).emit("leaderboard", room.players);
     }
  });

  socket.on("leave-room", (roomCode) => {
    socket.leave(roomCode);
    const room = rooms.get(roomCode);
    if (room) {
      if (room.hostId === socket.id) {
         // Host left, end room
         io.to(roomCode).emit("error", "Host left the room.");
         rooms.delete(roomCode);
      } else {
         const player = room.players.find(p => p.id === socket.id);
         if (player) {
           room.players = room.players.filter(p => p.id !== socket.id);
           io.to(roomCode).emit("players-updated", room.players);
           io.to(room.hostId).emit("player-left", player.name);
         }
      }
    }
  });

  socket.on("disconnect", () => {
    for (const [roomCode, room] of rooms.entries()) {
      if (room.hostId === socket.id) {
         io.to(roomCode).emit("error", "Host left the room.");
         rooms.delete(roomCode);
      } else {
         const player = room.players.find(p => p.id === socket.id);
         if (player) {
           room.players = room.players.filter(p => p.id !== socket.id);
           io.to(roomCode).emit("players-updated", room.players);
           io.to(room.hostId).emit("player-left", player.name);
         }
      }
    }
  });
});

app.post("/api/validate-name", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  // Quick fallback local blocklist for resilience
  const blocklist = [
      "porn", "sex", "p3n1s", "dick", "cock", "pussy", "vagina", "boob", "tits", 
      "nigger", "nigga", "poop", "butt", "fart", "stupid", "idiot", "dumb", "crap", 
      "shit", "fuck", "bitch", "cunt", "slut", "whore",
      // Romanian swear words and common variations
      "pula", "pizda", "pizd", "piz", "p1z", "p!z", "pulaa", "coaie", "muie", "cacat", 
      "dracu", "drac", "curve", "curva", "fut", "sugi", "laba", "labar", "sugaci"
  ];
  const lowerName = name.toLowerCase();
  for (const word of blocklist) {
    if (lowerName.includes(word)) {
      return res.json({ valid: false });
    }
  }

  try {
    const prompt = `You are a strict automated profanity and safety filter for a children's classroom game in both English and Romanian.
Evaluate this username: "${name}".
If it contains ANY of the following, reply ONLY with "INAPPROPRIATE":
- Profanity, dirty words, or circumvented swear words in ANY language (especially Romanian, e.g. pizd*, p1zda, p*la, curve, etc)
- Sexual references, crude humor, suggestive language, or anatomy jokes
- Slurs, hate speech, or derogatory terms
- Highly controversial or violent themes
If it is completely harmless and appropriate for young school children, reply ONLY with "APPROPRIATE". BE EXTREMELY STRICT.`;

    const gAI = getGenAI();
    const response = await gAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const result = response.text.trim();
    if (result === "APPROPRIATE") {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (err) {
    console.error("Gemini Fallback - Validation error or no API key, relying on local blocklist", err);
    // On error, we already checked the basic blocklist, so let them through.
    res.json({ valid: true });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
