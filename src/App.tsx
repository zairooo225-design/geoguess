import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import { socket, SERVER_URL, updateSocketServerUrl } from './socket';
import { GameState, Player, QuizQuestion } from './types';
import { IntroAnimation } from './components/IntroAnimation';
import { StudentPinEntry } from './components/StudentPinEntry';
import { RoomSettingsForm } from './components/RoomSettingsForm';
import { AudioVisualizer } from './components/AudioVisualizer';
import { GameInterface } from './components/GameInterface';
import { AttendanceList } from './components/AttendanceList';
import { AvatarSelection } from './components/AvatarSelection';
import { auth, googleProvider, signInWithPopup } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager, audioFiles } from './audio';
import { Volume2, VolumeX, Lock, Loader2, Globe, Settings, Check, X, RefreshCw } from 'lucide-react';

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

import confetti from 'canvas-confetti';

const LeaderboardScreen = ({ players }: { players: Player[] }) => {
  useEffect(() => {
    audioManager.playSfx('fanfare');
    const t2 = setTimeout(() => { if (players.length > 1) audioManager.playSfx('podium_pop'); }, 300);
    const t1 = setTimeout(() => { if (players.length > 0) audioManager.playSfx('podium_pop'); }, 600);
    const t3 = setTimeout(() => { if (players.length > 2) audioManager.playSfx('podium_pop'); }, 900);
    
    const confettiTimer = setTimeout(() => {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      return () => clearInterval(interval);
    }, 1000);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(confettiTimer); };
  }, [players.length]);

  return (
    <motion.div key="leaderboard" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ type: "spring", bounce: 0.4 }} className="flex-1 flex flex-col items-center w-full max-w-5xl overflow-y-auto pb-8">
        <motion.h2 
          initial={{ rotate: -2, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}
          className="text-3xl md:text-5xl font-black text-[#2D2D2D] mb-8 mt-4 uppercase tracking-widest bg-white px-6 md:px-8 py-4 border-4 border-[#2D2D2D] shadow-[8px_8px_0px_#C16757] text-center shrink-0"
        >
          Final Results
        </motion.h2>

        {players.length > 0 && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-8 w-full h-auto md:h-[250px] lg:h-[300px] border-b-4 border-[#2D2D2D] pb-0 shrink-0">
            {players.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring", bounce: 0.5 }} className="flex-1 flex flex-col items-center w-full md:max-w-[200px]">
                {players[1].avatar && <img src={players[1].avatar} alt="" className="w-12 h-12 rounded-full border-[3px] border-[#2D2D2D] mb-1 object-cover" />}
                <div className="font-black text-2xl uppercase mb-2 truncate w-full text-center px-2">{players[1].name}</div>
                <div className="bg-[#AEC6C2] w-full h-24 md:h-40 border-4 border-[#2D2D2D] border-b-0 rounded-t-xl flex flex-col items-center justify-start pt-4">
                   <span className="font-black text-5xl text-[#2D2D2D] opacity-80">2</span>
                 <span className="font-bold text-lg mt-2 text-[#2D2D2D]">{players[1].tokens} T</span>
                   {players[1].streak && players[1].streak > 1 && <span className="text-sm font-bold mt-1 bg-white/50 px-2 rounded-lg">🔥 {players[1].streak}</span>}
                </div>
              </motion.div>
            )}
            
            <motion.div initial={{ opacity: 0, y: 150 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, type: "spring", bounce: 0.5 }} className="flex-1 flex flex-col items-center w-full md:max-w-[240px] z-10">
              {players[0].avatar && <img src={players[0].avatar} alt="" className="w-16 h-16 rounded-full border-4 border-[#2D2D2D] mb-1 object-cover" />}
              <div className="font-black text-3xl uppercase mb-2 text-[#C16757] truncate w-full text-center px-2">👑 {players[0].name}</div>
              <div className="bg-[#C16757] w-full h-32 md:h-56 border-4 border-[#2D2D2D] border-b-0 rounded-t-xl flex flex-col items-center justify-start pt-4 shadow-[0_0_20px_rgba(193,103,87,0.4)]">
                 <span className="font-black text-6xl text-white">1</span>
                 <span className="font-bold text-xl text-white mt-2">{players[0].tokens} T</span>
                 {players[0].streak && players[0].streak > 1 && <span className="text-sm font-bold mt-1 bg-black/20 text-white px-2 py-0.5 rounded-lg border border-white/20">🔥 {players[0].streak} Streak</span>}
              </div>
            </motion.div>

            {players.length > 2 && (
              <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, type: "spring", bounce: 0.5 }} className="flex-1 flex flex-col items-center w-full md:max-w-[200px]">
                {players[2].avatar && <img src={players[2].avatar} alt="" className="w-12 h-12 rounded-full border-[3px] border-[#2D2D2D] mb-1 object-cover" />}
                <div className="font-black text-2xl uppercase mb-2 truncate w-full text-center px-2">{players[2].name}</div>
                <div className="bg-[#D4A373] w-full h-20 md:h-32 border-4 border-[#2D2D2D] border-b-0 rounded-t-xl flex flex-col items-center justify-start pt-4">
                   <span className="font-black text-5xl text-[#2D2D2D] opacity-60">3</span>
                   <span className="font-bold text-lg mt-2 text-[#2D2D2D]">{players[2].tokens} T</span>
                   {players[2].streak && players[2].streak > 1 && <span className="text-sm font-bold mt-1 bg-white/50 px-2 rounded-lg">🔥 {players[2].streak}</span>}
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="w-full flex-1 min-h-0 flex flex-col items-center gap-3 pb-12 overflow-y-auto px-4">
            {players.slice(3).map((p, idx) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + (idx * 0.3), type: "spring" }} className="flex items-center justify-between px-6 py-3 rounded-xl border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] bg-white w-full max-w-md transform transition-transform hover:-translate-y-1">
                   <div className="flex items-center gap-4">
                      <span className="font-mono font-black text-2xl text-gray-400">#{idx + 4}</span>
                      {p.avatar ? (
                         <img src={p.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-[#2D2D2D] object-cover" />
                      ) : null}
                      <span className="font-black text-lg uppercase tracking-wider truncate max-w-[150px]">{p.name}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <span className="font-mono font-bold text-[#2D2D2D] bg-[#f4f4f0] px-3 py-1 rounded border-2 border-[#2D2D2D]">{p.tokens} T</span>
                       {p.streak > 1 && <span className="font-bold text-xs bg-[#C16757] text-white px-2 py-1 rounded border-2 border-[#2D2D2D]">🔥 {p.streak}</span>}
                   </div>
                </motion.div>
            ))}
        </div>
    </motion.div>
  );
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState<GameState>("INTRO");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomError, setRoomError] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [shake, setShake] = useState(false);
  const [question, setQuestion] = useState<{ question: string, options: string[] } | null>(null);
  const [teacherPin, setTeacherPin] = useState("");
  const [teacherPinError, setTeacherPinError] = useState(false);
  const [teacherAccount, setTeacherAccount] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(SERVER_URL);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(audioManager.isMuted);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    audioManager.setMuted(newState);
  };

  useEffect(() => {
    const handleInteraction = () => {
      audioManager.tryResume();
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (showIntro) return;

    if (gameState === "INTRO") {
      audioManager.playBgm(0.2, true);
    } else if (gameState === "TEACHER_PIN" || gameState === "TEACHER_AUTH" || gameState === "TEACHER_DASHBOARD") {
      audioManager.stopBgm();
    } else if (gameState === "NAME_ENTRY") {
      audioManager.playBgm(0.5, true);
    } else if (gameState === "LOBBY") {
      audioManager.playBgm(0.5, false, -1);
    } else if (gameState === "LEADERBOARD") {
      audioManager.stopBgm();
    }
  }, [gameState, showIntro]);

  const [roomSettings, setRoomSettings] = useState<any>(null);
  const [teamBonusEligibleDeadline, setTeamBonusEligibleDeadline] = useState<number | null>(null);
  const [teamBonusAwarded, setTeamBonusAwarded] = useState<number | null>(null);

  const [guessResult, setGuessResult] = useState<{isCorrect: boolean, points: number, streak?: number} | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [roundStats, setRoundStats] = useState<any>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(0);

  useEffect(() => {
    if (gameState === "PLAYING") {
      if (!roundStats && !showPreview) {
        audioManager.playBgm(0.3, true, -1);
      }
    }
  }, [gameState, showPreview, roundStats]);

  useEffect(() => {
    if (roundStats && guessResult) {
      audioManager.stopBgm();
      if (guessResult.isCorrect) {
        audioManager.playSfx('success');
      } else {
        audioManager.playSfx('error');
      }
    } else if (roundStats && isHost) {
      audioManager.stopBgm();
      audioManager.playSfx('success');
    }
  }, [roundStats, guessResult, isHost]);

  useEffect(() => {
    socket.connect();
    setSocketConnected(socket.connected);

    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleConnectError = (err: any) => {
      console.error("Socket connection error:", err);
      setSocketConnected(false);
      // Auto-retry connection
      setTimeout(() => {
        if (!socket.connected) {
          socket.connect();
        }
      }, 2000);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.on("room-created", (code: string, isSolo?: boolean) => {
      setRoomCode(code);
      if (isSolo) {
        setIsHost(true);
        setGameState("NAME_ENTRY");
      } else {
        setGameState("LOBBY");
        setIsHost(true);
      }
    });

    socket.on("joined-room", (code: string, settings: any) => {
      setRoomCode(code);
      setRoomSettings(settings);
      if (settings?.globalVolume !== undefined) {
         audioManager.setGlobalVolume(settings.globalVolume);
      }
      setGameState("LOADING_ROOM");
      setTimeout(() => setGameState("NAME_ENTRY"), 1500);
    });

    socket.on("players-updated", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on("player-left", (name: string) => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, text: `${name} left the game!` }]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);
    });

    socket.on("attendance-check", () => {
      setGameState("ATTENDANCE_CHECK");
    });

    socket.on("team-intro-started", () => {
      setGameState("TEAM_INTRO");
      audioManager.playSpecificBgm(audioFiles.masked_dedede, 0.5);
    });

    socket.on("team-picking-started", () => {
      setGameState("TEAM_PICKING");
    });
    
    socket.on("team-picking-finished", () => {
      setGameState("TEAM_PICKING_FINISHED");
      audioManager.stopBgm();
      audioManager.playSfx('chinese_meme');
    });

    socket.on("game-started", (data: { round: number, question: any }) => {
      audioManager.stopSfx('chinese_meme');
      setCurrentRound(data.round);
      setQuestion(data.question);
      setGameState("PLAYING");
      setSelectedOption(null);
      setGuessResult(null);
      setHasGuessed(false);
      setRoundStats(null);
      setShowPreview(true);
      setTeamBonusEligibleDeadline(null);
      setTeamBonusAwarded(null);
    });

    socket.on("guess-result", (res: { isCorrect: boolean, points: number, streak?: number }) => {
       setGuessResult(res);
       setHasGuessed(true);
    });

    socket.on("teammate-guessed-eligible", (data: { deadline: number }) => {
       setTeamBonusEligibleDeadline(data.deadline);
       audioManager.playSfx('fanfare'); // short sound to alert
    });

    socket.on("team-bonus-awarded", (data: { pointsAdded: number }) => {
       setTeamBonusAwarded(data.pointsAdded);
       audioManager.playSfx('success');
    });

    socket.on("round-results", (stats) => {
       setRoundStats(stats);
    });

    socket.on("leaderboard", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
      setGameState("LEADERBOARD");
    });

    socket.on("error", (msg: string) => {
      // Use zero-width spaces of varying length to force a state change without visible text
      const zeroes = "\u200B".repeat(Math.floor(Math.random() * 10) + 1);
      setRoomError(msg + zeroes);
      
      setGameState("INTRO");
      setTimeout(() => setRoomError(""), 4000);
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("room-created");
      socket.off("joined-room");
      socket.off("players-updated");
      socket.off("player-left");
      socket.off("game-started");
      socket.off("guess-result");
      socket.off("round-results");
      socket.off("leaderboard");
      socket.off("error");
    };
  }, []);

  const handleCreateRoom = () => {
    audioManager.playSfx('click');
    setGameState("ROOM_SETTINGS");
  };

  const handleStartGame = (settings: { title: string; className: string; nameProtected: boolean; numQuestions: number; difficulty: string; globalVolume?: number; isSolo?: boolean }) => {
    if (!socket.connected) {
      setRoomError("Offline. Re-connecting to server... Please try again.");
      socket.connect();
      return;
    }
    const fullSettings = { ...settings, isSolo: isSoloMode };
    setRoomSettings(fullSettings);
    setGameState("LOADING_ROOM");
    setTimeout(() => {
      socket.emit("create-room", fullSettings);
    }, 2000);
  };

  const handleLeaveRoom = () => {
    audioManager.playSfx('click');
    setShowLeaveWarning(true);
  };

  const confirmLeaveRoom = () => {
    audioManager.playSfx('click');
    setGameState('INTRO');
    setRoomCode(null);
    setPlayers([]);
    setIsHost(false);
    setShowLeaveWarning(false);
    setPlayerName("");
    socket.emit("leave-room", roomCode); // Server handles gracefully
  };

  const handleTeacherLoginClick = () => {
    audioManager.playSfx('click');
    setGameState("TEACHER_PIN");
  };

  const handleTeacherPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherPin === "4802") {
      audioManager.playSfx('success');
      setGameState("TEACHER_AUTH");
    } else {
      audioManager.playSfx('error');
      setTeacherPinError(true);
      setTimeout(() => setTeacherPinError(false), 4000);
    }
  };

  const handleGoogleLogin = async () => {
    audioManager.playSfx('click');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setTeacherAccount(result.user);
      setGameState("TEACHER_DASHBOARD");
    } catch (e: any) {
      console.error(e);
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        alert("Failed to sign in with Google.");
      }
    }
  };

  const handleJoinRoom = (pin: string) => {
    setRoomError("");
    if (!socket.connected) {
      setRoomError("Offline. Connecting to server... Please try again.");
      socket.connect();
      return;
    }
    socket.emit("join-room", pin);
  };

  const handleNameSubmit = async () => {
    if (!playerName.trim()) return;

    setGameState("AI_THINKING");

    try {
      const res = await fetch('/api/validate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName })
      });
      const data = await res.json();
      
      if (data.valid) {
        audioManager.playSfx('success');
        const lowerName = playerName.toLowerCase().trim();
        if (lowerName === "luca" || lowerName === "zairo") {
           handleAvatarSelect("https://i.imgur.com/drLidd1.gif");
        } else {
           setGameState("AVATAR_SELECTION");
        }
      } else {
        audioManager.playSfx('error');
        setGameState("NAME_ENTRY");
        setNameError("Nope. Not today pal.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setTimeout(() => setNameError(""), 4000);
      }
    } catch (e) {
      console.error(e);
      setGameState("AVATAR_SELECTION");
    }
  };

  const handleAvatarSelect = (avatar: string | null) => {
     socket.emit("set-name", { roomCode, name: playerName, avatar });
     setGameState("LOBBY");
  };

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  const TopBar = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#2D2D2D] z-40 flex items-center justify-between px-6 border-b-4 border-[#1a1a1a]">
      <div className="flex items-center gap-3 flex-1">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[24px] h-[24px] min-w-[24px] min-h-[24px] shrink-0 text-[#C16757]">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
        </svg>
        <h1 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
          GeoQuest
        </h1>
      </div>
      <div className="flex justify-center flex-1">
        {roomCode && (
          <div className="bg-[#1a1a1a] px-4 py-1 rounded-sm border border-black flex gap-3 items-center">
            <span className="text-xs uppercase text-gray-400 font-bold">Room PIN</span>
            <span className="text-xl font-mono font-black text-white tracking-widest">{roomCode}</span>
          </div>
        )}
      </div>
      <div className="flex justify-end items-center gap-3 flex-1">
        <button
          onClick={() => {
            audioManager.playSfx('click');
            setShowConnectionModal(true);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all uppercase cursor-pointer ${
            socketConnected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 animate-pulse'
          }`}
          title={socketConnected ? `Connected to ${customServerUrl}` : "Disconnected. Click to configure connection settings."}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{socketConnected ? 'Connected' : 'Configure Server'}</span>
        </button>

        <button 
          onClick={toggleMute}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );

  const myPlayer = players.find(p => p.id === socket.id);

  return (
    <div className="w-full h-screen text-[#2D2D2D] font-sans flex flex-col relative overflow-hidden pt-16">
      <TopBar />
      
      <main className="flex-1 overflow-hidden relative flex flex-col p-2 sm:p-4 md:p-6 items-center justify-center">
        {isHost && notifications.length > 0 && (
          <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
              {notifications.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  className="bg-[#C16757] text-white px-4 py-2 rounded-lg font-bold shadow-[4px_4px_0_#2D2D2D] border-2 border-[#2D2D2D]"
                >
                  {note.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        {gameState === "INTRO" && <AudioVisualizer />}
        <AnimatePresence mode="wait">
          {gameState === "INTRO" && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center relative w-full h-full gap-8"
            >
              <StudentPinEntry onJoin={handleJoinRoom} error={roomError} />
              
              <div className="text-center w-full max-w-sm px-4">
                <span className="text-gray-500 font-bold text-sm tracking-widest uppercase mb-3 block">Or host a game</span>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
                  <button 
                    onClick={handleTeacherLoginClick}
                    className="w-full sm:w-auto btn-shine bg-transparent border-2 border-[#2D2D2D] text-[#2D2D2D] font-black px-6 py-3 rounded-lg uppercase tracking-widest hover:bg-[#2D2D2D] hover:text-white transition-colors"
                  >
                    Teacher Login
                  </button>
                  <button 
                    onClick={() => {
                      audioManager.playSfx('click');
                      setIsSoloMode(true);
                      setIsHost(true);
                      setGameState("ROOM_SETTINGS");
                    }}
                    className="w-full sm:w-auto btn-shine bg-transparent border-2 border-[#2D2D2D] text-[#2D2D2D] font-black px-6 py-3 rounded-lg uppercase tracking-widest hover:bg-[#3EACA8] hover:text-white hover:border-[#3EACA8] transition-colors"
                  >
                    Solo Play
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "TEACHER_PIN" && (
            <motion.div 
              key="teacher_pin"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center p-6 md:p-8 bg-white border-4 border-[#2D2D2D] rounded-2xl shadow-[8px_8px_0px_#2D2D2D] w-full max-w-sm relative z-10"
            >
               <h2 className="text-2xl font-black text-[#2D2D2D] uppercase tracking-wider mb-6 text-center">
                  Teacher Access
                </h2>
                <form onSubmit={handleTeacherPinSubmit} className="w-full flex flex-col gap-4">
                  <input
                    type="password"
                    value={teacherPin}
                    onChange={(e) => setTeacherPin(e.target.value)}
                    placeholder="Enter PIN"
                    className={`w-full border-4 rounded-lg p-5 font-black text-center text-3xl tracking-widest outline-none transition-all uppercase ${teacherPinError ? 'bg-[#C16757] border-black text-white placeholder-white/50' : 'bg-[#f4f4f0] border-[#2D2D2D] text-[#2D2D2D] focus:border-[#C16757]'}`}
                  />
                  <button 
                    type="submit"
                    className="btn-shine w-full bg-[#2D2D2D] text-white font-black py-5 rounded-lg uppercase tracking-widest shadow-[4px_4px_0px_#C16757] hover:translate-y-1 hover:shadow-[0px_0px_0px_#C16757] transition-all"
                  >
                    Verify
                  </button>
                  <button 
                    type="button"
                    onClick={() => setGameState("INTRO")}
                    className="mt-4 text-sm font-bold uppercase text-gray-500 hover:text-black"
                  >
                    Back to Join
                  </button>
                </form>
            </motion.div>
          )}

          {gameState === "TEACHER_AUTH" && (
            <motion.div 
              key="teacher_auth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center p-6 md:p-8 bg-white border-4 border-[#2D2D2D] rounded-2xl shadow-[8px_8px_0px_#2D2D2D] w-full max-w-sm relative z-10"
            >
               <div className="w-16 h-16 bg-[#AEC6C2] rounded-full border-4 border-[#2D2D2D] shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                 <Lock className="w-8 h-8 text-[#2D2D2D]" strokeWidth={2.5} />
               </div>
               <h2 className="text-2xl font-black text-[#2D2D2D] uppercase tracking-wider mb-2 text-center">
                  Authentication
                </h2>
                <p className="text-gray-500 font-bold text-center mb-8">Sign in with your Google Workspace account to host games.</p>
                
                <button 
                  onClick={handleGoogleLogin}
                  className="btn-shine w-full bg-white border-2 border-[#2D2D2D] flex items-center justify-center gap-3 font-black py-4 rounded-lg shadow-[4px_4px_0px_#2d2d2d] hover:translate-y-1 hover:shadow-[0px_0px_0px_#2d2d2d] transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                  Sign in with Google
                </button>
            </motion.div>
          )}

          {gameState === "TEACHER_DASHBOARD" && (
             <motion.div 
               key="teacher_dashboard"
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
               className="flex flex-col items-center justify-center p-8 bg-white border-4 border-[#2D2D2D] rounded-2xl shadow-[8px_8px_0px_#2D2D2D] w-full max-w-md relative z-10"
             >
                <motion.div 
                   initial={{ scale: 0, rotate: -180 }}
                   animate={{ scale: 1, rotate: 0 }}
                   transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                   className="w-24 h-24 rounded-full border-4 border-[#2D2D2D] overflow-hidden mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                >
                   <img src={teacherAccount?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </motion.div>
                <motion.h2 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="text-3xl font-black text-[#2D2D2D] uppercase tracking-wider mb-2 text-center"
                >
                   Welcome, {teacherAccount?.displayName?.split(" ")[0] || "Teacher"}
                </motion.h2>
                <motion.p 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.4 }}
                   className="text-gray-500 font-bold text-center mb-8"
                >Ready to test their geography knowledge?</motion.p>
                
                <motion.button 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                   onClick={handleCreateRoom}
                   className="btn-shine w-full bg-[#C16757] text-white border-2 border-[#2D2D2D] shadow-[6px_6px_0px_#2D2D2D] font-black text-2xl px-8 py-6 rounded-xl uppercase tracking-widest hover:translate-y-1 hover:shadow-[2px_2px_0px_#2D2D2D] transition-all"
                 >
                   Create Room
                 </motion.button>
             </motion.div>
          )}

          {gameState === "ROOM_SETTINGS" && (
            <motion.div
              key="room_settings"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center w-full"
            >
              <RoomSettingsForm onStart={handleStartGame} onCancel={() => {
                 setIsSoloMode(false);
                 setIsHost(false);
                 if (teacherAccount) {
                    setGameState("TEACHER_DASHBOARD");
                 } else {
                    setGameState("INTRO");
                 }
              }} />
            </motion.div>
          )}

          {gameState === "LOADING_ROOM" && (
            <motion.div 
              key="loading_room"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-6 md:p-8 bg-white border-4 border-[#2D2D2D] rounded-2xl shadow-[8px_8px_0px_#2D2D2D] w-full max-w-sm relative z-10"
            >
              <div className="w-16 h-16 bg-[#AEC6C2] rounded-full border-4 border-[#2D2D2D] shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                 <Loader2 className="w-8 h-8 text-[#2D2D2D] animate-spin" strokeWidth={2.5} />
               </div>
               <h2 className="text-2xl font-black text-[#2D2D2D] uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1">
                  Loading Room
                  <span className="flex">
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}>.</motion.span>
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}>.</motion.span>
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}>.</motion.span>
                  </span>
                </h2>
            </motion.div>
          )}

          {gameState === "NAME_ENTRY" && (
            <motion.div 
              key="name_entry"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col items-center justify-center relative w-full"
            >
              <div className={`w-full max-w-md p-8 rounded-xl shadow-2xl flex flex-col items-center gap-6 border-4 transition-colors duration-300 ${nameError ? 'bg-[#C16757] border-black scale-[1.02]' : 'bg-white border-[#2D2D2D]'} ${shake ? 'animate-shake' : ''}`}>
                <div className="text-center">
                  <h2 className={`text-2xl font-black uppercase tracking-wider ${nameError ? 'text-black' : 'text-[#2D2D2D]'}`}>
                    {nameError ? "Name Rejected" : "Who are you?"}
                  </h2>
                  <p className={`text-sm mt-2 font-bold ${nameError ? 'text-black/80' : 'text-gray-500'}`}>
                    {nameError ? nameError : "Keep it clean."}
                  </p>
                </div>
                
                <div className="bg-[#AEC6C2] rounded-lg p-3 w-full border-[2px] border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D]">
                  <p className="text-xs font-bold text-[#2D2D2D] leading-tight text-center">
                    All usernames are checked by AI before joining. Don't try to be funny.
                  </p>
                </div>

                <input 
                  type="text" 
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value.toUpperCase());
                    setNameError("");
                  }}
                  placeholder="NICKNAME"
                  className={`w-full border-4 rounded-lg p-5 font-black text-center text-3xl tracking-widest outline-none transition-all uppercase ${nameError ? 'bg-black/20 border-black/40 text-black placeholder-black/40' : 'bg-[#f4f4f0] border-[#2D2D2D] text-[#2D2D2D] focus:border-[#C16757]'}`} 
                  maxLength={15}
                />
                <button 
                  onClick={handleNameSubmit}
                  className={`btn-shine w-full font-black py-5 rounded-lg uppercase tracking-widest transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] ${nameError ? 'bg-black text-white hover:bg-gray-900 border-2 border-black' : 'bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]'}`}
                >
                  Join Game
                </button>
              </div>
            </motion.div>
          )}

          {gameState === "AI_THINKING" && (
            <motion.div 
              key="ai_thinking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center relative w-full"
            >
              <div className="flex flex-col items-center justify-center p-8 bg-white border-4 border-[#2D2D2D] rounded-2xl shadow-[8px_8px_0px_#2D2D2D] w-full max-w-sm relative z-10 text-center">
                <h2 className="text-2xl font-black text-[#2D2D2D] uppercase tracking-wider mb-2">
                  AI Verifying
                </h2>
                <p className="text-gray-500 font-bold mb-4">AI checking your name...</p>
                <div className="flex gap-2 justify-center">
                  <motion.div className="w-3 h-3 bg-[#C16757] rounded-full border-2 border-[#2D2D2D]" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                  <motion.div className="w-3 h-3 bg-[#D4A373] rounded-full border-2 border-[#2D2D2D]" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-3 h-3 bg-[#AEC6C2] rounded-full border-2 border-[#2D2D2D]" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "AVATAR_SELECTION" && (
            <motion.div
              key="avatar_selection"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center relative w-full"
            >
               <AvatarSelection onSelect={handleAvatarSelect} />
            </motion.div>
          )}

          {gameState === "LOBBY" && (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col w-full max-w-5xl bg-white rounded-xl border-4 border-[#2D2D2D] p-6 shadow-[8px_8px_0px_#2D2D2D] overflow-hidden"
            >
               <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                 <div className="text-center md:text-left">
                   <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                     {roomSettings?.title || "Students in lobby"}
                   </h2>
                   {roomSettings?.className && (
                     <p className="text-gray-500 font-bold text-lg mt-1">Class: {roomSettings.className}</p>
                   )}
                 </div>
                 <div className="bg-[#f4f4f0] border-2 border-[#2D2D2D] px-4 py-2 rounded-full font-black text-xl flex items-center gap-2">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                   {players.length}
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto w-full">
                 <motion.div 
                   variants={{
                     hidden: { opacity: 0 },
                     show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                   }}
                   initial="hidden"
                   animate="show"
                   className="flex flex-wrap gap-4 items-start content-start"
                 >
                   <AnimatePresence>
                     {players.map((p) => (
                       <motion.div 
                         key={p.id} 
                         variants={{
                           hidden: { scale: 0, opacity: 0 },
                           show: { scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5 } }
                         }}
                         exit={{ scale: 0, opacity: 0 }}
                         whileHover={{ scale: 1.05, rotate: -2 }}
                         className="bg-[#D4A373] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black text-2xl px-5 py-4 rounded-xl flex flex-col sm:flex-row items-center gap-3 shrink-0 uppercase cursor-default"
                       >
                         {p.avatar && <img src={p.avatar} alt="" className="w-16 h-16 sm:w-14 sm:h-14 rounded-full border-2 border-[#2D2D2D] object-cover bg-white" />}
                         <span className="truncate max-w-[150px] sm:max-w-[200px]">{p.name}</span>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                   {players.length === 0 && (
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="w-full h-40 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest border-4 border-dashed border-gray-300 rounded-xl"
                     >
                       Waiting for students...
                     </motion.div>
                   )}
                 </motion.div>
               </div>

               <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
                 <button 
                   onClick={handleLeaveRoom}
                   className="bg-white text-[#2D2D2D] border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black text-xl px-8 py-5 rounded-xl uppercase tracking-widest hover:translate-y-1 hover:shadow-[0px_0px_0px_#2D2D2D] transition-all w-full md:w-auto"
                 >
                   Leave Room
                 </button>
                 {isHost && (
                   <button 
                     onClick={() => {
                       audioManager.playSfx('click');
                       if (!roomSettings?.isSolo && roomSettings?.className && (roomSettings.className.toUpperCase() === "6C" || roomSettings.className.toUpperCase() === "6 C")) {
                         socket.emit("check-attendance", roomCode);
                       } else {
                         socket.emit("start-game", roomCode);
                       }
                     }}
                     className="bg-[#C16757] text-white border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black text-xl md:text-2xl px-6 md:px-12 py-5 rounded-xl uppercase tracking-widest hover:translate-y-1 hover:shadow-[0px_0px_0px_#2D2D2D] transition-all w-full md:w-auto"
                   >
                     Start Game
                   </button>
                 )}
               </div>
            </motion.div>
          )}

          {gameState === "ATTENDANCE_CHECK" && (
            <motion.div 
              key="attendance_check"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center relative w-full h-full overflow-y-auto"
            >
               <AttendanceList players={players} expectedClass={roomSettings?.className || "6c"} />
               {isHost && (
                 <button 
                   onClick={() => {
                     audioManager.playSfx('click');
                     socket.emit("start-game", roomCode);
                   }}
                   className="bg-[#C16757] text-white border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black text-xl md:text-2xl px-6 md:px-12 py-5 rounded-xl uppercase tracking-widest hover:translate-y-1 hover:shadow-[0px_0px_0px_#2D2D2D] transition-all mb-8 w-full md:w-auto"
                 >
                   PROCEDURĂ JOC
                 </button>
               )}
            </motion.div>
          )}

          {gameState === "TEAM_INTRO" && (
            <motion.div 
              key="team_intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center relative w-full h-full bg-black z-50 fixed inset-0"
            >
              {/* Needs to slowly appear over 8.2s */}
              <motion.div
                initial={{ filter: 'grayscale(100%) brightness(0%)', scale: 0.9, x: -50 }}
                animate={{ filter: 'grayscale(0%) brightness(100%)', scale: 1, x: 0 }}
                transition={{ duration: 7, ease: "easeOut", delay: 1 }}
                className="flex items-center gap-6"
              >
                <h1 className="text-6xl md:text-8xl font-black text-white italic rotate-[-5deg] tracking-tighter drop-shadow-[4px_4px_0_#C16757]">
                  GEOQUEST
                </h1>
                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#3EACA8] border-8 border-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(62,172,168,0.8)]">
                  <span className="text-4xl md:text-6xl">🌍</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === "TEAM_PICKING" && (
            <motion.div 
              key="team_picking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-start py-8 relative w-full h-full overflow-y-auto"
            >
               <h2 className="text-3xl md:text-5xl font-black text-[#2D2D2D] uppercase tracking-widest text-center">
                 Quick!
               </h2>
               <p className="text-xl md:text-2xl font-bold bg-[#C16757] text-white px-6 py-2 rounded-xl mt-2 mb-8 border-4 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D]">
                 Pick a teammate to play with
               </p>

               {isHost ? (
                  <div className="flex-1 flex flex-col items-center justify-center -mt-16 w-full">
                    <h2 className="text-3xl md:text-4xl font-black text-[#2D2D2D] uppercase text-center mb-8">
                       Students are pairing up...
                    </h2>
                    <div className="bg-[#2D2D2D] text-white px-8 py-4 rounded-full text-4xl font-black shadow-[4px_4px_0_#C16757]">
                       {players.filter((p: any) => !!p.teammateId).length} / {players.length}
                    </div>
                  </div>
               ) : players.find(me => me.id === socket.id)?.teammateId ? (
                  <div className="flex-1 flex flex-col items-center justify-center -mt-16 w-full">
                    <Loader2 className="w-16 h-16 animate-spin text-[#3EACA8] mb-6" />
                    <h2 className="text-3xl md:text-5xl font-black text-[#2D2D2D] uppercase text-center mb-4">
                       Waiting for other students...
                    </h2>
                    <div className="bg-[#2D2D2D] text-white px-8 py-3 rounded-full text-3xl font-black">
                       {players.filter((p: any) => !!p.teammateId).length} / {players.length}
                    </div>
                  </div>
               ) : (
                 <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 overflow-y-auto pb-24">
                    {players.filter(p => !p.isHost && p.id !== socket.id).map(p => {
                      const me = players.find(x => x.id === socket.id);
                      const isMyTeammate = me?.teammateId === p.id;
                      const hasTeammate = !!p.teammateId;
                      const iRequestedThem = me?.requestedTeammateId === p.id;
                      const theyRequestedMe = p.requestedTeammateId === socket.id;
                      
                      return (
                        <motion.button
                          key={p.id}
                          whileHover={!hasTeammate || isMyTeammate ? { y: -5, scale: 1.05 } : {}}
                          whileTap={!hasTeammate || isMyTeammate ? { scale: 0.95 } : {}}
                          onClick={() => {
                            if (!hasTeammate) {
                              audioManager.playSfx('click');
                              socket.emit("send-team-request", { roomCode, targetPlayerId: p.id });
                            }
                          }}
                          className={`p-4 flex flex-col items-center gap-3 border-4 rounded-xl shadow-[4px_4px_0_#2D2D2D] transition-all bg-white relative overflow-hidden ${
                            isMyTeammate ? 'border-[#5CB85C] bg-[#5CB85C]/10 shadow-[4px_4px_0_#5CB85C]' :
                            iRequestedThem && !theyRequestedMe ? 'border-[#F0AD4E] shadow-[4px_4px_0_#F0AD4E]' :
                            hasTeammate ? 'border-gray-300 opacity-50 grayscale cursor-not-allowed' :
                            'border-[#2D2D2D] hover:border-[#3EACA8]'
                          }`}
                        >
                           {isMyTeammate && (
                             <div className="absolute top-0 right-0 bg-[#5CB85C] text-white font-black px-2 py-1 text-[10px] rounded-bl-lg uppercase tracking-wider">
                               TEAM
                             </div>
                           )}
                           {iRequestedThem && !isMyTeammate && (
                             <div className="absolute top-0 right-0 bg-[#F0AD4E] text-white font-black px-2 py-1 text-[10px] rounded-bl-lg uppercase tracking-wider">
                               Requested
                             </div>
                           )}
                           {theyRequestedMe && !isMyTeammate && (
                             <div className="absolute top-0 right-0 bg-[#3EACA8] text-white font-black px-2 py-1 text-[10px] rounded-bl-lg uppercase tracking-wider animate-pulse">
                               Wants You!
                             </div>
                           )}
                           <div className="w-16 h-16 rounded-full border-4 border-[#2D2D2D] overflow-hidden bg-gray-100 flex items-center justify-center">
                              {p.avatar ? (
                                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-400 font-bold uppercase">{p.name.substring(0,2)}</span>
                              )}
                           </div>
                           <span className="font-black text-lg uppercase tracking-wider text-center">{p.name}</span>
                        </motion.button>
                      )
                    })}
                 </div>
               )}

               <div className="fixed left-0 top-0 bottom-0 w-2 md:w-3 bg-[#E8E8E8] z-50">
                  <motion.div 
                    initial={{ height: "100%" }}
                    animate={{ height: "0%" }}
                    transition={{ duration: 20, ease: "linear" }}
                    className="w-full bg-[#C16757]"
                  />
               </div>
               
               <div className="fixed right-0 top-0 bottom-0 w-2 md:w-3 bg-[#E8E8E8] z-50">
                  <motion.div 
                    initial={{ height: "100%" }}
                    animate={{ height: "0%" }}
                    transition={{ duration: 20, ease: "linear" }}
                    className="w-full bg-[#C16757]"
                  />
               </div>
            </motion.div>
          )}

          {gameState === "TEAM_PICKING_FINISHED" && (
            <motion.div 
              key="team_picking_finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center relative w-full h-full bg-black z-50 fixed inset-0 p-4"
            >
               {(() => {
                  const me = players.find(p => p.id === socket.id);
                  const teammate = players.find(p => p.id === me?.teammateId);
                  
                  if (!me || !teammate) return null;
                  
                  return (
                     <motion.div 
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.6, delay: 0.5, duration: 1 }}
                        className="flex flex-col items-center gap-6"
                     >
                       <p className="text-white text-3xl font-black uppercase tracking-widest text-center animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                          Your Teammate is
                       </p>
                       <div className="flex flex-col items-center gap-4 bg-[#2D2D2D]/80 border-8 border-[#3EACA8] p-8 rounded-3xl shadow-[0_0_50px_rgba(62,172,168,0.8)]">
                         {teammate.avatar && <img src={teammate.avatar} alt="Teammate" className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white object-cover shadow-2xl" />}
                         <div className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl text-center break-words max-w-[90vw]">
                           {teammate.name}
                         </div>
                       </div>
                     </motion.div>
                  )
               })()}
            </motion.div>
          )}

          {gameState === "PLAYING" && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col w-full max-w-7xl gap-4 h-full overflow-hidden pb-16">
              {question ? (
                 showPreview ? (
                   <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
                     <h2 className="text-3xl md:text-5xl font-black text-[#2D2D2D] uppercase text-center mb-8 drop-shadow-md bg-white border-4 border-[#2D2D2D] p-6 rounded-2xl shadow-[8px_8px_0px_#2D2D2D] transform -rotate-1">
                       {question.question}
                     </h2>
                     <div className="w-full max-w-lg bg-gray-200 h-8 rounded-full border-4 border-[#2D2D2D] overflow-hidden shadow-[4px_4px_0px_#2D2D2D] shrink-0">
                       <motion.div 
                         className="h-full bg-purple-500"
                         initial={{ width: '100%' }}
                         animate={{ width: '0%' }}
                         transition={{ duration: 4, ease: "linear" }} onAnimationComplete={() => setShowPreview(false)}
                       />
                     </div>
                   </div>
                 ) : roundStats ? (
                   <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-4 p-4">
                      {guessResult && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-6 rounded-2xl border-4 border-[#2D2D2D] shadow-[6px_6px_0px_#2D2D2D] w-full max-w-lg text-center ${guessResult.isCorrect ? 'bg-[#5CB85C]' : 'bg-[#E23048]'}`}>
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg transform -rotate-1 mb-2">
                            {guessResult.isCorrect ? 'Corect!' : 'Greșit!'}
                          </h2>
                          {guessResult.isCorrect && (
                            <div className="mt-2 flex flex-col items-center gap-2">
                              <div className="bg-black/20 rounded-xl px-4 py-2 inline-block font-black text-white text-xl uppercase border-2 border-white/20">
                                +{guessResult.points} Puncte
                              </div>
                              {guessResult.streak && guessResult.streak > 1 && (
                                <div className="text-white font-black drop-shadow-md text-lg animate-bounce">
                                  🔥 {guessResult.streak} Streak!
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                      
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="w-full bg-[#f4f4f0] p-4 md:p-6 rounded-2xl border-4 border-[#2D2D2D] shadow-[6px_6px_0px_#2D2D2D] flex flex-col gap-3">
                         <h3 className="text-xl font-black uppercase text-center border-b-4 border-[#2D2D2D] pb-3 text-[#2D2D2D]">Rezultate</h3>
                         <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-2">
                           {question.type === 'map-country' ? (
                              <div className="relative flex flex-col p-4 border-2 border-[#2D2D2D] rounded-xl overflow-hidden bg-[#5CB85C] text-white shadow-[2px_2px_0px_#2D2D2D]">
                                 <span className="font-bold mb-1 uppercase text-sm">Răspuns Corect:</span>
                                 <span className="font-black text-2xl uppercase tracking-tighter">{question.targetCountry}</span>
                                 <div className="mt-2 pt-2 border-t border-white/20">
                                    Acuratețe: {roundStats.totalCount > 0 ? Math.round((Object.values(roundStats.guessesInfo || {}).filter((g: any) => g.isCorrect).length / roundStats.totalCount) * 100) : 0}%
                                 </div>
                              </div>
                           ) : question.options?.map((opt: string, i: number) => {
                              const isCorrectOpt = Array.isArray(question.correctAnswer) ? question.correctAnswer.includes(i) : question.correctAnswer === i;
                              const pickedCount = Object.values(roundStats.guessesInfo || {}).filter((g: any) => {
                                if (Array.isArray(g.answer)) return g.answer.includes(i);
                                return g.answer === i;
                              }).length;
                              
                              const percentage = roundStats.totalCount > 0 ? (pickedCount / roundStats.totalCount) * 100 : 0;

                              return (
                                <div key={i} className={`relative flex items-center justify-between p-3 border-2 border-[#2D2D2D] rounded-xl overflow-hidden ${isCorrectOpt ? 'bg-[#5CB85C] text-white shadow-[2px_2px_0px_#2D2D2D]' : 'bg-white opacity-80'}`}>
                                  {/* Progress bar background for selections */}
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${percentage}%` }} 
                                    transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                                    className={`absolute left-0 top-0 bottom-0 z-0 ${isCorrectOpt ? 'bg-white/20' : 'bg-gray-200'}`} 
                                  />
                                  <span className={`relative z-10 font-bold ${isCorrectOpt ? 'text-white' : 'text-gray-700'}`}>{opt}</span>
                                  <span className={`relative z-10 font-black flex items-center gap-1 ${isCorrectOpt ? 'text-white' : 'text-gray-900'}`}>
                                    {pickedCount} <span className="text-[10px] uppercase tracking-widest opacity-80">voti</span>
                                  </span>
                                </div>
                              );
                           })}
                         </div>
                      </motion.div>

                      {isHost && (
                        <div className="mt-2">
                          <button 
                             onClick={() => {
                                audioManager.playSfx('click');
                                if (currentRound >= (roomSettings?.numQuestions || 5)) {
                                  socket.emit("show-leaderboard", roomCode);
                                } else {
                                  socket.emit("start-game", roomCode);
                                }
                             }}
                             className="bg-[#2D2D2D] text-white px-8 py-3 border-4 border-[#2D2D2D] rounded-xl shadow-[4px_4px_0px_#2D2D2D] font-black text-xl active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all uppercase tracking-widest hover:bg-black"
                          >
                            {currentRound >= (roomSettings?.numQuestions || 5) ? 'Show Leaderboard →' : 'Next Question →'}
                          </button>
                        </div>
                      )}
                   </div>
                 ) : hasGuessed ? (
                   <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center gap-6 p-4">
                      <p className="text-2xl md:text-4xl font-black text-gray-500 uppercase tracking-widest animate-pulse">Așteptăm ceilalți jucători...</p>
                      {isHost && (
                        <div className="mt-8">
                          <button 
                             onClick={() => {
                                audioManager.playSfx('click');
                                if (currentRound >= (roomSettings?.numQuestions || 5)) {
                                  socket.emit("show-leaderboard", roomCode);
                                } else {
                                  socket.emit("start-game", roomCode);
                                }
                             }}
                             className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-gray-800 border-b-2 border-transparent hover:border-gray-800 transition-colors"
                          >
                            [Host] Force Next / End Round
                          </button>
                        </div>
                      )}
                   </div>
                 ) : (
                  <div className="flex-1 flex flex-col w-full h-full justify-center items-center relative p-4 gap-4">
                   <GameInterface 
                     question={question} 
                     isHost={isHost} 
                     timeRemaining={30}
                     currentStreak={myPlayer?.streak || 0}
                     teamBonusEligibleDeadline={teamBonusEligibleDeadline}
                     onAnswer={(ans, timeTakenInSecs) => {
                       socket.emit("submit-guess", { roomCode, answer: ans, timeTakenInSecs: timeTakenInSecs || 5 }); 
                     }}
                   />
                   {isHost && (
                      <div className="mt-2 text-center w-full max-w-4xl flex justify-end">
                        <button 
                           onClick={() => {
                              audioManager.playSfx('click');
                              if (currentRound >= (roomSettings?.numQuestions || 5)) {
                                socket.emit("show-leaderboard", roomCode);
                              } else {
                                socket.emit("start-game", roomCode);
                              }
                           }}
                           className="bg-transparent text-[#2D2D2D] px-4 py-2 border-2 border-[#2D2D2D] rounded-lg shadow-[2px_2px_0px_#2D2D2D] font-black text-xs sm:text-sm active:translate-y-px active:shadow-none transition-all uppercase tracking-wider hover:bg-gray-100"
                        >
                          {currentRound >= (roomSettings?.numQuestions || 5) ? 'Force Leaderboard' : 'Force Skip'}
                        </button>
                      </div>
                    )}
                 </div>
                 )
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <h2 className="text-3xl font-black text-white">Loading question...</h2>
                </div>
              )}
               
              {/* Team Widget */}
              {(() => {
                if (myPlayer && myPlayer.teammateId) {
                   const teammate = players.find(p => p.id === myPlayer.teammateId);
                   if (teammate) {
                     return (
                        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border-4 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] rounded-full px-6 py-2 flex items-center gap-3 z-50">
                          <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Teamming with:</span>
                          {teammate.avatar && <img src={teammate.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-[#2D2D2D] object-cover" />}
                          <span className="font-black text-[#2D2D2D] uppercase tracking-wider">{teammate.name}</span>
                        </div>
                     );
                   }
                }
                return null;
              })()}
            </motion.div>
          )}

          {gameState === "LEADERBOARD" && (
            <LeaderboardScreen players={players} />
          )}
        </AnimatePresence>

        {/* Leave Warning Modal */}
        <AnimatePresence>
          {showLeaveWarning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#f4f4f4] border-4 border-[#2D2D2D] p-8 rounded-2xl shadow-[8px_8px_0px_#2D2D2D] max-w-md w-full text-center"
              >
                <h3 className="text-3xl font-black text-[#2D2D2D] uppercase tracking-tighter mb-4">Are you sure?</h3>
                <p className="text-gray-600 font-bold mb-8">
                  Do you really want to leave this room? You'll be taken back to the main screen.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowLeaveWarning(false)}
                    className="flex-1 bg-white text-[#2D2D2D] border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black py-4 rounded-xl uppercase hover:translate-y-1 hover:shadow-[0px_0px_0px_#2D2D2D] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmLeaveRoom}
                    className="flex-1 bg-[#D9534F] text-white border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black py-4 rounded-xl uppercase hover:translate-y-1 hover:shadow-[0px_0px_0px_#2D2D2D] transition-all"
                  >
                    I'm Sure
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection Settings Modal */}
        <AnimatePresence>
          {showConnectionModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#fdfbf7] border-4 border-[#2D2D2D] p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_#2D2D2D] max-w-md w-full relative"
              >
                <button 
                  onClick={() => setShowConnectionModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#2D2D2D] transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#3EACA8]/20 flex items-center justify-center border-2 border-[#2D2D2D]">
                    <Globe className="w-6 h-6 text-[#3EACA8]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#2D2D2D] uppercase tracking-tighter">Connection Settings</h3>
                </div>

                <p className="text-gray-600 font-bold text-sm mb-6 text-left leading-relaxed">
                  GeoQuest utilizes a live Node.js/Socket.IO backend server to keep multiplayer states synchronized. 
                  If you are hosting the client statically (such as under GitHub Pages), enter your running Cloud Run backend URL below.
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-left font-black text-xs text-[#2D2D2D] uppercase tracking-wider">
                    Backend Server URL
                  </label>
                  <input
                    type="url"
                    value={customServerUrl}
                    onChange={(e) => setCustomServerUrl(e.target.value)}
                    placeholder="https://your-app-url.run.app"
                    className="w-full border-4 border-[#2D2D2D] rounded-xl p-4 font-bold text-sm bg-white outline-none focus:border-[#3EACA8]"
                  />
                  <div className="flex items-center gap-2 mt-1 justify-between">
                    <span className="text-xs transition-all flex items-center gap-1">
                      Status: 
                      <span className={`font-black ${socketConnected ? 'text-emerald-600 font-bold' : 'text-rose-500 animate-pulse font-bold'}`}>
                        {socketConnected ? '● Connected' : '● Disconnected'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const original = import.meta.env.VITE_APP_URL || window.location.origin;
                        setCustomServerUrl(original);
                      }}
                      className="text-xs font-bold text-[#3EACA8] hover:underline cursor-pointer"
                    >
                      Use Default Origin
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowConnectionModal(false)}
                    className="flex-1 bg-white text-[#2D2D2D] border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black py-3 rounded-xl uppercase hover:translate-y-1 hover:shadow-[0px_0px_0px_#2D2D2D] transition-all text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      updateSocketServerUrl(customServerUrl);
                      socket.connect();
                      setSocketConnected(socket.connected);
                      setShowConnectionModal(false);
                      setRoomError("");
                      const id = Date.now();
                      setNotifications(prev => [...prev, { id, text: "Server URL updated! Reconnecting..." }]);
                    }}
                    className="flex-1 bg-[#3EACA8] text-white border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] font-black py-3 rounded-xl uppercase hover:translate-y-1 hover:shadow-[0px_0px_0px_#2D2D2D] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Save & Connect
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg) scale(1.02); }
          25% { transform: rotate(-2deg) translateX(-10px) scale(1.02); }
          50% { transform: rotate(3deg) translateX(10px) scale(1.02); }
          75% { transform: rotate(-2deg) translateX(-10px) scale(1.02); }
        }
        .animate-shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

