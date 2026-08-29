import React, { useState } from 'react';
import {
  ChessGameState,
  ChessMove,
  getLegalMoves,
  PieceColor,
  Square,
  UNICODE_PIECES,
} from '../lib/chessEngine';
import {
  Play,
  RotateCcw,
  Flag,
  Handshake,
  MessageSquare,
  Sparkles,
  Swords,
  ChevronRight,
} from 'lucide-react';

interface ChessMoveInputPanelProps {
  state: ChessGameState;
  playerColor: PieceColor;
  onMakeMove: (move: ChessMove) => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onNewGame: () => void;
  onSendChatMessage?: (text: string) => void;
  disabled?: boolean;
  selectedSquare?: Square | null;
  onSelectSquare?: (sq: Square | null) => void;
}

export function ChessMoveInputPanel({
  state,
  playerColor,
  onMakeMove,
  onResign,
  onOfferDraw,
  onNewGame,
  onSendChatMessage,
  disabled = false,
  selectedSquare,
  onSelectSquare,
}: ChessMoveInputPanelProps) {
  const [typedSan, setTypedSan] = useState('');
  const [inputError, setInputError] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [mode, setMode] = useState<'move' | 'chat'>('move');

  const isPlayerTurn = state.turn === playerColor && !state.isCheckmate && !state.isDraw;
  const legalMoves = isPlayerTurn ? getLegalMoves(state) : [];

  // Filter legal moves for selected square if any
  const filteredMoves = selectedSquare
    ? legalMoves.filter((m) => m.from === selectedSquare)
    : legalMoves;

  const handlePlayMove = (move: ChessMove) => {
    if (disabled || !isPlayerTurn) return;
    setInputError('');
    setTypedSan('');
    if (onSelectSquare) onSelectSquare(null);
    onMakeMove(move);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !isPlayerTurn) return;

    const query = typedSan.trim().toLowerCase();
    if (!query) return;

    // Match SAN (case insensitive) or from-to coordinates e.g. "e2e4", "e4", "Nf3"
    const match = legalMoves.find((m) => {
      const cleanSan = m.san.replace(/[+#]/g, '').toLowerCase();
      const coord = `${m.from}${m.to}`.toLowerCase();
      return cleanSan === query || m.san.toLowerCase() === query || coord === query;
    });

    if (match) {
      handlePlayMove(match);
    } else {
      setInputError(`"${typedSan}" is not a legal move in this position.`);
      setTimeout(() => setInputError(''), 3000);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !onSendChatMessage) return;
    onSendChatMessage(chatMessage.trim());
    setChatMessage('');
    setMode('move');
  };

  return (
    <div className="themed-sidebar-panel border-t p-3 sm:p-4 backdrop-blur-xl shrink-0 z-20 transition-all">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Top Status & Controls Strip */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isPlayerTurn
                  ? 'bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                  : 'bg-amber-400 animate-spin'
              }`}
            />
            <span className="font-bold">
              {state.isCheckmate
                ? `Game Over - ${state.winner === playerColor ? 'Victory!' : 'Defeat'}`
                : state.isDraw
                ? 'Game Over - Drawn'
                : isPlayerTurn
                ? `Your Turn to Move (${playerColor === 'w' ? 'White' : 'Black'})`
                : 'AI Opponent is calculating move...'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMode(mode === 'move' ? 'chat' : 'move')}
              className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                mode === 'chat'
                  ? 'border-pink-500 bg-pink-500/20 text-pink-500 font-bold'
                  : 'border-inherit themed-btn opacity-85 hover:opacity-100'
              }`}
            >
              <MessageSquare size={12} />
              <span>{mode === 'chat' ? 'Move Mode' : 'Chat & Banter'}</span>
            </button>

            <button
              type="button"
              onClick={onNewGame}
              className="p-1.5 rounded-xl border border-inherit themed-btn hover:opacity-100 opacity-85 transition-colors"
              title="New Chess Game"
            >
              <RotateCcw size={13} />
            </button>

            {isPlayerTurn && !state.isCheckmate && !state.isDraw && (
              <>
                <button
                  type="button"
                  onClick={onOfferDraw}
                  className="px-2 py-1 rounded-xl border border-inherit themed-btn text-[11px] font-medium flex items-center gap-1 opacity-85 hover:opacity-100"
                  title="Offer Draw"
                >
                  <Handshake size={12} />
                  <span className="hidden sm:inline">Draw</span>
                </button>
                <button
                  type="button"
                  onClick={onResign}
                  className="px-2 py-1 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[11px] font-medium flex items-center gap-1"
                  title="Resign Game"
                >
                  <Flag size={12} />
                  <span className="hidden sm:inline">Resign</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* MODE: MOVE CONTROLLER */}
        {mode === 'move' && (
          <div className="space-y-2">
            {/* Quick Move Chips Selection */}
            {isPlayerTurn && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] opacity-75 px-1 themed-text">
                  <span>
                    {selectedSquare
                      ? `Legal moves for ${selectedSquare.toUpperCase()} (${filteredMoves.length}):`
                      : `Select a square on the board or pick a legal move (${legalMoves.length}):`}
                  </span>
                  {selectedSquare && onSelectSquare && (
                    <button
                      type="button"
                      onClick={() => onSelectSquare(null)}
                      className="text-pink-500 hover:underline font-bold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 max-w-full custom-scrollbar">
                  {filteredMoves.slice(0, 14).map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePlayMove(m)}
                      className="px-3 py-1.5 rounded-xl border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/25 themed-text font-mono font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <span className="text-sm">
                        {UNICODE_PIECES[`${m.piece.color}-${m.piece.type}`]}
                      </span>
                      <span>{m.san}</span>
                    </button>
                  ))}
                  {filteredMoves.length > 14 && (
                    <span className="text-[10px] opacity-60 px-1 font-mono shrink-0 themed-text">
                      +{filteredMoves.length - 14} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Manual Notation Input Bar */}
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={
                    isPlayerTurn
                      ? 'Type move (e.g. e4, Nf3, O-O, e2e4) or click on the board...'
                      : 'Waiting for AI move...'
                  }
                  value={typedSan}
                  onChange={(e) => setTypedSan(e.target.value)}
                  disabled={!isPlayerTurn || disabled}
                  className="w-full px-4 py-2.5 rounded-2xl themed-input border text-xs sm:text-sm outline-none transition-all focus:border-pink-500"
                />
                {inputError && (
                  <div className="absolute -top-7 left-2 text-[11px] font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded-lg border border-red-500/40">
                    {inputError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!isPlayerTurn || disabled || !typedSan.trim()}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md active:scale-98 shrink-0"
              >
                <span>Play Move</span>
                <Play size={14} className="fill-white" />
              </button>
            </form>
          </div>
        )}

        {/* MODE: IN-GAME CHAT & BANTER */}
        {mode === 'chat' && (
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Send in-game banter, question, or comment to persona..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2.5 rounded-2xl themed-input border text-xs sm:text-sm outline-none transition-all focus:border-pink-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={disabled || !chatMessage.trim()}
              className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md active:scale-98 shrink-0"
            >
              <span>Send</span>
              <ChevronRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
