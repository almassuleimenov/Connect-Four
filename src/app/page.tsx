'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Board } from '@/components/Board';
import { GameHUD } from '@/components/GameHUD';
import { useGameState } from '@/hooks/useGameState';
import confetti from 'canvas-confetti';
<<<<<<< HEAD
//D:\Downloads\jules_session\src\app/page.tsx
=======
import { Sparkles, Trophy, Play, Gamepad2, LogOut, ArrowLeft, Lightbulb } from 'lucide-react';

>>>>>>> 765c772524cbd67acb9dda93819b2d7afa7b0846
export default function Home() {
  const { state, playMove, setThinking, resetGame } = useGameState();
  const workerRef = useRef<Worker | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isPro] = useState(true); // Mock Pro subscription for demo purposes
  const [currentView, setCurrentView] = useState<'menu' | 'game' | 'leaderboard'>('menu');

  const [showNotification, setShowNotification] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentView === 'menu') {
      timer = setTimeout(() => {
        setShowNotification(true);
      }, 5000);
    } else {
      setShowNotification(false);
      setShowPanel(false);
    }
    return () => clearTimeout(timer);
  }, [currentView]);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../workers/ai.worker.ts', import.meta.url));

    workerRef.current.onmessage = (e) => {
      const { bestCol } = e.data;
      setThinking(false);
      if (bestCol !== -1) {
        playMove(bestCol);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [playMove, setThinking]);

  useEffect(() => {
    // AI's turn
    if (state.currentPlayer === 2 && state.winner === null && !state.isThinking) {
      setThinking(true);
      // Add a slight delay for better UX
      setTimeout(() => {
        workerRef.current?.postMessage({
          grid: state.grid,
          depth: 5, // Medium-Hard difficulty
          isPlayer1AI: false, // AI is Player 2
        });
      }, 700);
    }
  }, [state.currentPlayer, state.winner, state.isThinking, state.grid, setThinking]);

  useEffect(() => {
    if (state.winner === 1 || state.winner === 2) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: state.winner === 1 ? ['#fbcfe8', '#fb7185', '#e11d48'] : ['#fef08a', '#facc15', '#eab308']
      });
    }
  }, [state.winner]);

  const handleColumnClick = (col: number) => {
    if (state.currentPlayer === 1 && !state.isThinking && state.winner === null) {
      setAdvice(null);
      playMove(col);
    }
  };

  const handleAIAdvice = async () => {
    if (!isPro || !state.winner) return;

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: state.history, grid: state.grid }),
      });
      const data = await response.json();
      setAdvice(data.advice);
    } catch (error) {
      console.error('Failed to get advice:', error);
      setAdvice("Ой! Я не могу придумать ничего подходящего сейчас. Попробуй позже! 🥺");
    }
  };

  const renderGame = () => (
    <div className="z-10 w-full max-w-5xl flex flex-col items-center animate-in zoom-in-95 duration-500">
      <h1 className="text-4xl md:text-5xl font-pixel font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 drop-shadow-sm flex items-center gap-4">
        <Sparkles className="w-8 h-8 text-pink-300 animate-pulse" />
        Oculo
        <Sparkles className="w-8 h-8 text-indigo-300 animate-pulse" />
      </h1>

      <div className="mb-6 w-full flex justify-start">
        <button
          onClick={() => setCurrentView('menu')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md transition-all active:scale-95 border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" /> Вернуться в меню
        </button>
      </div>

      <GameHUD
        currentPlayer={state.currentPlayer}
        winner={state.winner}
        isThinking={state.isThinking}
        onReset={() => {
          setAdvice(null);
          resetGame();
        }}
        onAIAdvice={handleAIAdvice}
        isPro={isPro}
      />

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center">
        <div className="flex-shrink-0 mx-auto lg:mx-0">
           <Board
            grid={state.grid}
            winningCells={state.winningCells}
            onColumnClick={handleColumnClick}
            disabled={state.currentPlayer === 2 || state.isThinking || state.winner !== null}
          />
        </div>

        {advice && (
          <div className="flex-1 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 p-6 md:p-8 rounded-[2rem] shadow-xl border-2 border-purple-200/50 dark:border-purple-700/50 animate-in fade-in slide-in-from-bottom-8 duration-500 w-full max-w-md lg:max-w-none mx-auto lg:mx-0 backdrop-blur-sm">
            <h3 className="text-xl font-bold flex items-center mb-4 text-indigo-600 dark:text-indigo-300">
              <span className="bg-indigo-100 dark:bg-indigo-800 p-2.5 rounded-2xl mr-3 shadow-inner">
                <Lightbulb className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />
              </span>
              Совет тренера
            </h3>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base md:text-lg font-medium">
              {advice}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="z-10 w-full max-w-md flex flex-col items-center bg-white/10 p-8 md:p-10 rounded-[3rem] backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-yellow-400/20 p-4 rounded-full mb-4">
        <Trophy className="w-12 h-12 text-yellow-300" />
      </div>
      <h2 className="text-3xl md:text-4xl font-pixel font-bold mb-8 text-center text-white drop-shadow-md">
        Зал славы
      </h2>

      <div className="w-full flex flex-col gap-4 mb-8">
        {[
          { rank: 1, name: "Player 1", score: 9999, color: "text-yellow-300", bg: "bg-yellow-400/10 border-yellow-400/30" },
          { rank: 2, name: "Player 2", score: 8500, color: "text-gray-300", bg: "bg-white/5 border-white/10" },
          { rank: 3, name: "Player 3", score: 7200, color: "text-amber-500", bg: "bg-amber-600/10 border-amber-600/20" }
        ].map((player) => (
          <div key={player.rank} className={`flex items-center justify-between p-5 rounded-2xl border ${player.bg} transition-transform hover:scale-105 duration-200`}>
            <div className="flex items-center gap-4">
              <span className={`text-2xl font-bold ${player.color}`}>#{player.rank}</span>
              <span className="text-xl font-semibold text-white">{player.name}</span>
            </div>
            <span className="text-purple-300 font-mono text-xl font-bold">{player.score}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrentView('menu')}
        className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-sm transition-all active:scale-95 border border-white/20 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" /> Вернуться назад
      </button>
    </div>
  );

  const renderMenu = () => (
    <div className="z-10 w-full max-w-md flex flex-col items-center gap-5 bg-white/10 p-10 md:p-12 rounded-[3rem] backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-700">
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-30 blur-2xl rounded-full"></div>
        <h1 className="relative text-6xl md:text-7xl font-pixel font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Oculo
        </h1>
      </div>

      <p className="text-indigo-200 font-medium mb-4 text-center text-lg">Готов к испытанию? 🚀</p>

      <button
        onClick={() => setCurrentView('game')}
        className="group w-full py-4 px-6 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold text-xl rounded-2xl transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-3"
      >
        <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" /> Играть с ИИ
      </button>

      <button
        onClick={() => {}}
        className="w-full py-4 px-6 bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 font-semibold text-lg rounded-2xl backdrop-blur-sm transition-all border border-blue-400/30 active:scale-95 flex items-center justify-center gap-3"
      >
        <Gamepad2 className="w-6 h-6" /> Играть локально
      </button>

      <button
        onClick={() => setCurrentView('leaderboard')}
        className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg rounded-2xl backdrop-blur-sm transition-all border border-white/20 active:scale-95 flex items-center justify-center gap-3"
      >
        <Trophy className="w-6 h-6" /> Зал славы
      </button>

      <button
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.close();
            document.body.innerHTML = '<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:linear-gradient(to bottom right, #4c1d95, #1e3a8a);color:white;font-family:sans-serif;"><div style="font-size:4rem;margin-bottom:1rem;">👋</div><h1 style="font-size:2rem;font-weight:bold;">До новых встреч!</h1><p style="opacity:0.8;">Вы можете безопасно закрыть эту вкладку.</p></div>';
          }
        }}
        className="w-full py-4 px-6 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-lg rounded-2xl backdrop-blur-sm transition-all border border-rose-400/30 active:scale-95 flex items-center justify-center gap-3 mt-4"
      >
        <LogOut className="w-6 h-6" /> Выйти!
      </button>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 md:p-24 relative overflow-hidden bg-[#0a0a1a] text-white selection:bg-pink-500/30">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-20 mix-blend-screen filter hue-rotate-30 contrast-150 saturate-150 pointer-events-none"
      >
        <source src="/media/video.mp4" type="video/mp4" />
      </video>

      {/* Background Audio */}
      <audio
        autoPlay
        loop
        src="/media/music.ogg"
        className="hidden"
        ref={(el) => {
          if (el) {
            el.volume = 0.1;
            const playAudio = () => {
              el.play().catch(e => console.log("Audio autoplay prevented", e));
              document.removeEventListener('click', playAudio);
            };
            document.addEventListener('click', playAudio);
          }
        }}
      />

      {/* Warm Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-pink-500/10 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] right-[20%] w-[20rem] h-[20rem] bg-purple-500/10 rounded-full blur-[80px] z-0 pointer-events-none mix-blend-screen" />

      {currentView === 'menu' && renderMenu()}
      {currentView === 'game' && renderGame()}
      {currentView === 'leaderboard' && renderLeaderboard()}

      {/* Friendly Notification */}
      {showNotification && !showPanel && currentView === 'menu' && (
        <div
          onClick={() => setShowPanel(true)}
          className="absolute bottom-8 right-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white p-4 px-6 rounded-3xl shadow-[0_10px_25px_rgba(225,29,72,0.4)] cursor-pointer animate-bounce flex items-center gap-3 z-50 border-2 border-pink-300/50 hover:scale-105 transition-transform"
        >
          <div className="w-3 h-3 bg-white rounded-full animate-ping absolute -top-1 -right-1" />
          <div className="w-3 h-3 bg-white rounded-full" />
          <span className="font-bold text-lg">Тсс! Открой меня! 💌</span>
        </div>
      )}

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-black/60 backdrop-blur-2xl border-l border-white/10 p-8 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-50 flex flex-col shadow-2xl ${
          showPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setShowPanel(false)}
          className="self-start text-white/60 hover:text-white mb-8 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Закрыть
        </button>
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="text-6xl mb-6 animate-bounce">🎁</div>
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
            A Secret For You!
          </h2>
          <p className="mb-8 text-gray-300 text-lg leading-relaxed">
            Мы спрятали кое-что особенное для наших любимых игроков. Хочешь посмотреть?
          </p>
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&pp=ygUXbmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXCgBwE%3D"
            className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-xl overflow-hidden transition-all shadow-lg border border-white/20 active:scale-95 block w-full"
          >
            <div className="absolute inset-0 w-0 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 ease-out group-hover:w-full opacity-60"></div>
            <span className="relative text-white group-hover:text-white transition-colors flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> РАСКРЫТЬ СЕКРЕТ
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}
