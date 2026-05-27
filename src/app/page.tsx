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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 md:p-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pastel-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pastel-blue/20 rounded-full blur-3xl" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pastel-purple to-pastel-blue text-center">
          NeuroConnect4
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
          Strategic mastery powered by Minimax engine and AI Coaching.
        </p>

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
    </main>
  );
}
