import React from 'react';
import { RefreshCw, Zap, Sparkles, Smile, Bot } from 'lucide-react';

interface GameHUDProps {
  currentPlayer: number; // 1 or 2
  winner: number | null;
  isThinking: boolean;
  onReset: () => void;
  onAIAdvice?: () => void;
  isPro?: boolean;
}

export function GameHUD({ currentPlayer, winner, isThinking, onReset, onAIAdvice, isPro = false }: GameHUDProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-5 rounded-3xl shadow-xl mb-8 border-2 border-white/50 dark:border-gray-700/50 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        <div className="text-xl font-bold dark:text-gray-100 flex items-center">
          {winner ? (
            winner === 3 ? (
              <span className="text-gray-500 flex items-center gap-2">
                🤝 It's a friendly tie!
              </span>
            ) : (
              <span className={`flex items-center gap-2 animate-bounce ${winner === 1 ? 'text-rose-500' : 'text-amber-500'}`}>
                <Sparkles className="w-5 h-5" /> Ура! Игрок {winner} победил! <Sparkles className="w-5 h-5" />
              </span>
            )
          ) : (
            <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
              <Smile className={`w-5 h-5 ${currentPlayer === 1 ? 'text-rose-500' : 'text-amber-500'}`} />
              Твой ход:
              <span className={`ml-1 w-5 h-5 rounded-full shadow-sm inline-block ${currentPlayer === 1 ? 'bg-gradient-to-br from-pink-300 to-rose-400' : 'bg-gradient-to-br from-yellow-200 to-amber-400'}`} />
            </span>
          )}
        </div>
        {isThinking && (
          <div className="text-sm text-indigo-500 dark:text-indigo-400 animate-pulse flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full font-medium">
             <Bot className="w-4 h-4 mr-2 animate-bounce" /> Хмм... я думаю 🧠
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {onAIAdvice && (
          <button
            onClick={onAIAdvice}
            disabled={!isPro || !winner}
            className={`flex items-center px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-95 ${
              !isPro 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : !winner 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md hover:shadow-lg'
            }`}
            title={!isPro ? "Requires Pro Subscription" : "Get AI Coach Advice"}
          >
            <Zap className="w-4 h-4 mr-2" />
            Совет ИИ ✨
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center px-5 py-2.5 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-800/40 rounded-2xl text-rose-600 dark:text-rose-300 font-bold transition-all active:scale-95 border border-rose-200 dark:border-rose-800/50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Сыграть еще раз 🔄
        </button>
      </div>
    </div>
  );
}
