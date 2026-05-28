'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Board } from '@/components/Board';
import { GameHUD } from '@/components/GameHUD';
import { useGameState } from '@/hooks/useGameState';
import confetti from 'canvas-confetti';

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
      }, 500);
    }
  }, [state.currentPlayer, state.winner, state.isThinking, state.grid, setThinking]);

  useEffect(() => {
    if (state.winner === 1 || state.winner === 2) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: state.winner === 1 ? ['#faddd1', '#ef4444'] : ['#fef08a', '#eab308']
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
    }
  };

  const renderGame = () => (
    <div className="z-10 w-full max-w-4xl flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-pixel font-bold mb-6 text-center text-white drop-shadow-md">
        Oculo
      </h1>

      <div className="mb-4">
        <button
          onClick={() => setCurrentView('menu')}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded backdrop-blur-sm transition-colors"
        >
          Выйти в меню
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
          <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-pastel-purple/30 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
            <h3 className="text-lg font-semibold flex items-center mb-3 text-pastel-purple">
              <span className="bg-pastel-purple/20 p-2 rounded-lg mr-2">🧠</span> AI Coach Insights
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
              {advice}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="z-10 w-full max-w-md flex flex-col items-center bg-black/40 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
      <h2 className="text-3xl md:text-4xl font-pixel font-bold mb-8 text-center text-white drop-shadow-md">
        Топ 3
      </h2>

      <div className="w-full flex flex-col gap-4 mb-8">
        {[
          { rank: 1, name: "Игрок 1", score: 9999, color: "text-yellow-400" },
          { rank: 2, name: "Игрок 2", score: 8500, color: "text-gray-300" },
          { rank: 3, name: "Игрок 3", score: 7200, color: "text-amber-600" }
        ].map((player) => (
          <div key={player.rank} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-4">
              <span className={`text-2xl font-bold ${player.color}`}>#{player.rank}</span>
              <span className="text-xl font-semibold">{player.name}</span>
            </div>
            <span className="text-pastel-purple font-mono text-xl">{player.score}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrentView('menu')}
        className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-colors border border-white/5"
      >
        Назад
      </button>
    </div>
  );

  const renderMenu = () => (
    <div className="z-10 w-full max-w-md flex flex-col items-center gap-6 bg-black/40 p-12 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
      <h1 className="text-6xl md:text-7xl font-pixel font-bold mb-8 text-center text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
        Oculo
      </h1>

      <button
        onClick={() => setCurrentView('game')}
        className="w-full py-4 px-6 bg-gradient-to-r from-pastel-purple to-pastel-blue hover:from-pastel-blue hover:to-pastel-purple text-gray-900 font-bold text-xl rounded-xl transition-all transform hover:scale-105 hover:shadow-lg"
      >
        Играть с ИИ
      </button>

      <button
        onClick={() => {}}
        className="w-full py-4 px-6 bg-blue-500/20 hover:bg-blue-500/40 text-blue-100 font-semibold text-lg rounded-xl backdrop-blur-sm transition-all border border-blue-500/10"
      >
        Играть в блютуз
      </button>

      <button
        onClick={() => setCurrentView('leaderboard')}
        className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg rounded-xl backdrop-blur-sm transition-all border border-white/5"
      >
        Турнирная таблица
      </button>

      <button
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.close(); // Only works if opened by script, but fulfills standard behavior
            // Fallback for when window.close() doesn't work:
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:black;color:white;font-family:sans-serif;font-size:24px;">Вы вышли из игры. Вы можете закрыть эту вкладку.</div>';
          }
        }}
        className="w-full py-4 px-6 bg-red-500/20 hover:bg-red-500/40 text-red-100 font-semibold text-lg rounded-xl backdrop-blur-sm transition-all border border-red-500/10 mt-4"
      >
        Выйти
      </button>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 md:p-24 relative overflow-hidden bg-black text-white">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen filter hue-rotate-15 contrast-125 pointer-events-none"
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
            // Attempt to play if autoplay is blocked, often unblocked after first interaction
            const playAudio = () => {
              el.play().catch(e => console.log("Audio autoplay prevented", e));
              document.removeEventListener('click', playAudio);
            };
            document.addEventListener('click', playAudio);
          }
        }}
      />

      {/* Decorative background elements if needed */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pastel-purple/20 rounded-full blur-3xl z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pastel-blue/20 rounded-full blur-3xl z-0 pointer-events-none" />

      {currentView === 'menu' && renderMenu()}
      {currentView === 'game' && renderGame()}
      {currentView === 'leaderboard' && renderLeaderboard()}

      {/* Delayed Notification */}
      {showNotification && !showPanel && currentView === 'menu' && (
        <div
          onClick={() => setShowPanel(true)}
          className="absolute bottom-8 right-8 bg-red-600 hover:bg-red-500 text-white p-4 rounded-2xl shadow-2xl cursor-pointer animate-bounce flex items-center gap-3 z-50 border-2 border-red-400"
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="font-bold">Новое сообщение!</span>
        </div>
      )}

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-xl border-l border-white/10 p-8 transform transition-transform duration-500 z-50 flex flex-col ${
          showPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setShowPanel(false)}
          className="self-end text-white/50 hover:text-white mb-8"
        >
          ✕ Закрыть
        </button>
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500 animate-pulse">
            ВАЖНОЕ!!!
          </h2>
          <p className="mb-8 text-gray-300">
            У нас появилась новая секретная ссылка!
          </p>
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&pp=ygUXbmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXCgBwE%3D"
            className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 rounded-full font-bold text-xl overflow-hidden transition-all"
          >
            <div className="absolute inset-0 w-0 bg-gradient-to-r from-pastel-purple to-pastel-blue transition-all duration-[250ms] ease-out group-hover:w-full opacity-50"></div>
            <span className="relative text-white group-hover:text-black transition-colors">НАЖМИ СЮДА</span>
          </a>
        </div>
      </div>
    </main>
  );
}
