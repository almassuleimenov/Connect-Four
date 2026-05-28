import React from 'react';
import { RefreshCw, Zap } from 'lucide-react';
//D:\Downloads\jules_session\src\components/GameHUD.tsx
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
    <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-2xl bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        <div className="text-lg font-semibold dark:text-gray-200">
          {winner ? (
            winner === 3 ? (
              <span className="text-gray-500">It&apos;s a Draw!</span>
            ) : (
              <span className={winner === 1 ? 'text-pastel-red' : 'text-pastel-yellow'}>
                Player {winner} Wins!
              </span>
            )
          ) : (
            <span className="flex items-center">
              Turn: 
              <span className={`ml-2 w-4 h-4 rounded-full inline-block ${currentPlayer === 1 ? 'bg-pastel-red' : 'bg-pastel-yellow'}`} />
            </span>
          )}
        </div>
        {isThinking && (
          <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse flex items-center">
             <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> AI is thinking...
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {onAIAdvice && (
          <button
            onClick={onAIAdvice}
            disabled={!isPro || !winner}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              !isPro 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : !winner 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-pastel-purple text-white hover:bg-opacity-90 shadow-sm'
            }`}
            title={!isPro ? "Requires Pro Subscription" : "Get AI Coach Advice"}
          >
            <Zap className="w-4 h-4 mr-2" />
            AI Coach
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200 font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </button>
      </div>
    </div>
  );
}
