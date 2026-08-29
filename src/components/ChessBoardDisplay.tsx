import React from 'react';
import {
  ChessGameState,
  Square,
  coordsToSquare,
  squareToCoords,
  UNICODE_PIECES,
  PieceColor,
  ChessPiece,
} from '../lib/chessEngine';
import { Trophy, Swords, AlertCircle, RotateCcw } from 'lucide-react';

interface ChessBoardDisplayProps {
  state: ChessGameState;
  playerColor?: PieceColor;
  selectedSquare?: Square | null;
  validDestinations?: Square[];
  lastMove?: { from: Square; to: Square } | null;
  onSquareClick?: (sq: Square) => void;
  interactive?: boolean;
}

export function ChessBoardDisplay({
  state,
  playerColor = 'w',
  selectedSquare,
  validDestinations = [],
  lastMove,
  onSquareClick,
  interactive = true,
}: ChessBoardDisplayProps) {
  const isFlipped = playerColor === 'b';
  const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  // Material evaluation difference
  const getMaterialScore = (color: PieceColor) => {
    let score = 0;
    const weights: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c];
        if (p && p.color === color) score += weights[p.type] || 0;
      }
    }
    return score;
  };

  const whiteMaterial = getMaterialScore('w');
  const blackMaterial = getMaterialScore('b');
  const whiteDiff = whiteMaterial - blackMaterial;
  const blackDiff = blackMaterial - whiteMaterial;

  return (
    <div className="w-full max-w-md mx-auto my-3 p-3.5 sm:p-4 rounded-3xl border border-inherit themed-modal shadow-2xl backdrop-blur-md flex flex-col gap-3 select-none">
      {/* Top Game Bar: Opponent info & captured pieces */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              state.turn === (playerColor === 'w' ? 'b' : 'w')
                ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                : 'bg-zinc-400 opacity-60'
            }`}
          />
          <span className="font-bold themed-text">
            {playerColor === 'w' ? 'AI (Black)' : 'AI (White)'}
          </span>
          {playerColor === 'w' && blackDiff > 0 && (
            <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
              +{blackDiff}
            </span>
          )}
          {playerColor === 'b' && whiteDiff > 0 && (
            <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
              +{whiteDiff}
            </span>
          )}
        </div>

        {/* Captured Tray for AI */}
        <div className="flex items-center gap-0.5 text-base themed-text opacity-85">
          {(playerColor === 'w' ? state.capturedWhite : state.capturedBlack).map((p, i) => (
            <span key={i} className="opacity-90">
              {UNICODE_PIECES[`${p.color}-${p.type}`]}
            </span>
          ))}
        </div>
      </div>

      {/* 8x8 Geometric Chess Board */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-inherit shadow-inner aspect-square w-full">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {rows.map((r) =>
            cols.map((c) => {
              const sq = coordsToSquare(r, c);
              const piece = state.board[r][c];
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedSquare === sq;
              const isDestination = validDestinations.includes(sq);
              const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
              const isCheckedKing = piece?.type === 'k' && piece?.color === state.turn && state.isCheck;

              return (
                <button
                  key={sq}
                  type="button"
                  onClick={() => interactive && onSquareClick && onSquareClick(sq)}
                  disabled={!interactive}
                  className={`relative flex items-center justify-center transition-all ${
                    isDark
                      ? 'bg-zinc-700/85 text-zinc-100 hover:bg-zinc-600/85'
                      : 'bg-zinc-200/90 text-zinc-900 hover:bg-zinc-100'
                  } ${
                    isSelected ? '!bg-pink-500/50 ring-2 ring-pink-400 ring-inset' : ''
                  } ${
                    isLastMove && !isSelected ? '!bg-amber-500/35' : ''
                  } ${
                    isCheckedKing ? '!bg-red-600/70 animate-pulse ring-2 ring-red-500 ring-inset' : ''
                  }`}
                >
                  {/* Square Coordinate Labels on edge tiles */}
                  {(isFlipped ? r === 7 : r === 0) && (
                    <span
                      className={`absolute top-0.5 right-1 text-[8px] font-mono font-bold pointer-events-none opacity-50 ${
                        isDark ? 'text-zinc-300' : 'text-zinc-700'
                      }`}
                    >
                      {sq[0]}
                    </span>
                  )}
                  {(isFlipped ? c === 7 : c === 0) && (
                    <span
                      className={`absolute bottom-0.5 left-1 text-[8px] font-mono font-bold pointer-events-none opacity-50 ${
                        isDark ? 'text-zinc-300' : 'text-zinc-700'
                      }`}
                    >
                      {sq[1]}
                    </span>
                  )}

                  {/* Piece Representation (Unicode Character with shadow and vector styling) */}
                  {piece && (
                    <span
                      className={`text-2xl sm:text-3xl font-serif select-none transition-transform ${
                        piece.color === 'w'
                          ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter'
                          : 'text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)] filter'
                      } ${isSelected ? 'scale-110' : ''}`}
                    >
                      {UNICODE_PIECES[`${piece.color}-${piece.type}`]}
                    </span>
                  )}

                  {/* Destination Dot indicator */}
                  {isDestination && (
                    <div
                      className={`absolute rounded-full pointer-events-none ${
                        piece
                          ? 'w-full h-full border-4 border-emerald-400/80 rounded-none'
                          : 'w-3.5 h-3.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      }`}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Game Bar: Player info & captured pieces */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              state.turn === playerColor
                ? 'bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                : 'bg-zinc-400 opacity-60'
            }`}
          />
          <span className="font-bold themed-text">
            You ({playerColor === 'w' ? 'White' : 'Black'})
          </span>
          {playerColor === 'w' && whiteDiff > 0 && (
            <span className="text-[10px] font-mono font-bold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded">
              +{whiteDiff}
            </span>
          )}
          {playerColor === 'b' && blackDiff > 0 && (
            <span className="text-[10px] font-mono font-bold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded">
              +{blackDiff}
            </span>
          )}
        </div>

        {/* Captured Tray for Player */}
        <div className="flex items-center gap-0.5 text-base themed-text opacity-85">
          {(playerColor === 'w' ? state.capturedBlack : state.capturedWhite).map((p, i) => (
            <span key={i} className="opacity-90">
              {UNICODE_PIECES[`${p.color}-${p.type}`]}
            </span>
          ))}
        </div>
      </div>

      {/* Game State Banner (Check, Checkmate, Stalemate) */}
      {(state.isCheck || state.isCheckmate || state.isStalemate || state.isDraw) && (
        <div
          className={`py-1.5 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 ${
            state.isCheckmate
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : state.isCheck
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse'
              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
          }`}
        >
          {state.isCheckmate ? (
            <>
              <Trophy size={14} className="text-amber-500" />
              <span>
                Checkmate! Winner:{' '}
                {state.winner === playerColor ? 'You' : 'AI Companion'}
              </span>
            </>
          ) : state.isCheck ? (
            <>
              <AlertCircle size={14} className="text-amber-500" />
              <span>Check! King in danger</span>
            </>
          ) : (
            <span>Game Drawn (Stalemate / Rule)</span>
          )}
        </div>
      )}
    </div>
  );
}
