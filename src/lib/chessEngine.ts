// Pure TypeScript Robust Chess Engine with Persona Inference

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type Square = string; // e.g. 'e4', 'a1'

export interface ChessMove {
  from: Square;
  to: Square;
  piece: ChessPiece;
  captured?: ChessPiece;
  promotion?: PieceType;
  san: string;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCastling?: 'kingside' | 'queenside';
}

export interface ChessGameState {
  board: (ChessPiece | null)[][]; // 8x8 [rank 0..7][file 0..7] (rank 0 = rank 8, rank 7 = rank 1)
  turn: PieceColor;
  castling: {
    w: { k: boolean; q: boolean };
    b: { k: boolean; q: boolean };
  };
  enPassant: Square | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  history: ChessMove[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  capturedWhite: ChessPiece[];
  capturedBlack: ChessPiece[];
  winner?: PieceColor | 'draw';
}

export const UNICODE_PIECES: Record<string, string> = {
  'w-k': '♔',
  'w-q': '♕',
  'w-r': '♖',
  'w-b': '♗',
  'w-n': '♘',
  'w-p': '♙',
  'b-k': '♚',
  'b-q': '♛',
  'b-r': '♜',
  'b-b': '♝',
  'b-n': '♞',
  'b-p': '♟',
};

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function squareToCoords(sq: Square): [number, number] {
  const file = sq.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(sq[1], 10);
  return [rank, file];
}

export function coordsToSquare(rank: number, file: number): Square {
  return `${FILES[file]}${8 - rank}`;
}

export function createInitialBoard(): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Black pieces (rank 8 -> row 0)
  board[0][0] = { type: 'r', color: 'b' };
  board[0][1] = { type: 'n', color: 'b' };
  board[0][2] = { type: 'b', color: 'b' };
  board[0][3] = { type: 'q', color: 'b' };
  board[0][4] = { type: 'k', color: 'b' };
  board[0][5] = { type: 'b', color: 'b' };
  board[0][6] = { type: 'n', color: 'b' };
  board[0][7] = { type: 'r', color: 'b' };
  for (let c = 0; c < 8; c++) board[1][c] = { type: 'p', color: 'b' };

  // White pieces (rank 1 -> row 7)
  board[7][0] = { type: 'r', color: 'w' };
  board[7][1] = { type: 'n', color: 'w' };
  board[7][2] = { type: 'b', color: 'w' };
  board[7][3] = { type: 'q', color: 'w' };
  board[7][4] = { type: 'k', color: 'w' };
  board[7][5] = { type: 'b', color: 'w' };
  board[7][6] = { type: 'n', color: 'w' };
  board[7][7] = { type: 'r', color: 'w' };
  for (let c = 0; c < 8; c++) board[6][c] = { type: 'p', color: 'w' };

  return board;
}

export function createInitialGameState(): ChessGameState {
  return {
    board: createInitialBoard(),
    turn: 'w',
    castling: {
      w: { k: true, q: true },
      b: { k: true, q: true },
    },
    enPassant: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    history: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    capturedWhite: [],
    capturedBlack: [],
  };
}

// Clone game state deeply
export function cloneGameState(state: ChessGameState): ChessGameState {
  return {
    board: state.board.map((row) => row.map((p) => (p ? { ...p } : null))),
    turn: state.turn,
    castling: {
      w: { ...state.castling.w },
      b: { ...state.castling.b },
    },
    enPassant: state.enPassant,
    halfMoveClock: state.halfMoveClock,
    fullMoveNumber: state.fullMoveNumber,
    history: [...state.history],
    isCheck: state.isCheck,
    isCheckmate: state.isCheckmate,
    isStalemate: state.isStalemate,
    isDraw: state.isDraw,
    capturedWhite: [...state.capturedWhite],
    capturedBlack: [...state.capturedBlack],
    winner: state.winner,
  };
}

// Find king position
export function findKing(board: (ChessPiece | null)[][], color: PieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

// Check if square is attacked by opposing color
export function isSquareAttacked(
  board: (ChessPiece | null)[][],
  targetR: number,
  targetC: number,
  byColor: PieceColor
): boolean {
  // Knight attacks
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [dr, dc] of knightMoves) {
    const nr = targetR + dr;
    const nc = targetC + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p && p.color === byColor && p.type === 'n') return true;
    }
  }

  // Pawn attacks
  const pawnDir = byColor === 'w' ? 1 : -1; // Pawns attack opposite of their moving direction relative to target
  for (const dc of [-1, 1]) {
    const pr = targetR + pawnDir;
    const pc = targetC + dc;
    if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
      const p = board[pr][pc];
      if (p && p.color === byColor && p.type === 'p') return true;
    }
  }

  // King attacks
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const kr = targetR + dr;
      const kc = targetC + dc;
      if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8) {
        const p = board[kr][kc];
        if (p && p.color === byColor && p.type === 'k') return true;
      }
    }
  }

  // Straight rays (Rook & Queen)
  const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of straights) {
    let r = targetR + dr;
    let c = targetC + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r][c];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }

  // Diagonal rays (Bishop & Queen)
  const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diagonals) {
    let r = targetR + dr;
    let c = targetC + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r][c];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }

  return false;
}

// Generate raw pseudo-legal moves for a piece at [r, c]
function getPseudoMoves(
  state: ChessGameState,
  r: number,
  c: number
): Array<{ toR: number; toC: number; promotion?: PieceType; isCastling?: 'kingside' | 'queenside' }> {
  const board = state.board;
  const p = board[r][c];
  if (!p) return [];

  const moves: Array<{ toR: number; toC: number; promotion?: PieceType; isCastling?: 'kingside' | 'queenside' }> = [];
  const color = p.color;
  const oppColor = color === 'w' ? 'b' : 'w';

  if (p.type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const promoRow = color === 'w' ? 0 : 7;

    // Single step
    const f1R = r + dir;
    if (f1R >= 0 && f1R < 8 && !board[f1R][c]) {
      if (f1R === promoRow) {
        ['q', 'r', 'b', 'n'].forEach((pr) => moves.push({ toR: f1R, toC: c, promotion: pr as PieceType }));
      } else {
        moves.push({ toR: f1R, toC: c });
      }

      // Double step
      const f2R = r + dir * 2;
      if (r === startRow && !board[f2R][c]) {
        moves.push({ toR: f2R, toC: c });
      }
    }

    // Captures
    for (const dc of [-1, 1]) {
      const capC = c + dc;
      if (f1R >= 0 && f1R < 8 && capC >= 0 && capC < 8) {
        const target = board[f1R][capC];
        if (target && target.color === oppColor) {
          if (f1R === promoRow) {
            ['q', 'r', 'b', 'n'].forEach((pr) => moves.push({ toR: f1R, toC: capC, promotion: pr as PieceType }));
          } else {
            moves.push({ toR: f1R, toC: capC });
          }
        } else if (state.enPassant === coordsToSquare(f1R, capC)) {
          // En passant
          moves.push({ toR: f1R, toC: capC });
        }
      }
    }
  } else if (p.type === 'n') {
    const jumps = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of jumps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const dest = board[nr][nc];
        if (!dest || dest.color === oppColor) {
          moves.push({ toR: nr, toC: nc });
        }
      }
    }
  } else if (p.type === 'b' || p.type === 'r' || p.type === 'q') {
    const rays: number[][] = [];
    if (p.type === 'b' || p.type === 'q') {
      rays.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }
    if (p.type === 'r' || p.type === 'q') {
      rays.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }
    for (const [dr, dc] of rays) {
      let nr = r + dr;
      let nc = c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const dest = board[nr][nc];
        if (!dest) {
          moves.push({ toR: nr, toC: nc });
        } else {
          if (dest.color === oppColor) moves.push({ toR: nr, toC: nc });
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  } else if (p.type === 'k') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const dest = board[nr][nc];
          if (!dest || dest.color === oppColor) {
            moves.push({ toR: nr, toC: nc });
          }
        }
      }
    }

    // Castling
    const cast = state.castling[color];
    const row = color === 'w' ? 7 : 0;
    if (r === row && c === 4 && !isSquareAttacked(board, row, 4, oppColor)) {
      // Kingside (O-O)
      if (cast.k && !board[row][5] && !board[row][6] && board[row][7]?.type === 'r') {
        if (!isSquareAttacked(board, row, 5, oppColor) && !isSquareAttacked(board, row, 6, oppColor)) {
          moves.push({ toR: row, toC: 6, isCastling: 'kingside' });
        }
      }
      // Queenside (O-O-O)
      if (cast.q && !board[row][3] && !board[row][2] && !board[row][1] && board[row][0]?.type === 'r') {
        if (!isSquareAttacked(board, row, 3, oppColor) && !isSquareAttacked(board, row, 2, oppColor)) {
          moves.push({ toR: row, toC: 2, isCastling: 'queenside' });
        }
      }
    }
  }

  return moves;
}

// Generate all strictly legal moves for the current turn
export function getLegalMoves(state: ChessGameState): ChessMove[] {
  const color = state.turn;
  const oppColor = color === 'w' ? 'b' : 'w';
  const legalMoves: ChessMove[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p || p.color !== color) continue;

      const pseudos = getPseudoMoves(state, r, c);
      for (const m of pseudos) {
        const fromSq = coordsToSquare(r, c);
        const toSq = coordsToSquare(m.toR, m.toC);
        const destPiece = state.board[m.toR][m.toC];

        // Simulate move to test if king remains in check
        const nextBoard = state.board.map((row) => row.map((pc) => (pc ? { ...pc } : null)));
        nextBoard[m.toR][m.toC] = m.promotion ? { type: m.promotion, color } : { ...p };
        nextBoard[r][c] = null;

        // En passant capture removal
        if (p.type === 'p' && state.enPassant === toSq && !destPiece) {
          const capRow = color === 'w' ? m.toR + 1 : m.toR - 1;
          nextBoard[capRow][m.toC] = null;
        }

        // Castling rook move
        if (m.isCastling === 'kingside') {
          nextBoard[r][5] = nextBoard[r][7];
          nextBoard[r][7] = null;
        } else if (m.isCastling === 'queenside') {
          nextBoard[r][3] = nextBoard[r][0];
          nextBoard[r][0] = null;
        }

        const kPos = findKing(nextBoard, color);
        if (!kPos || isSquareAttacked(nextBoard, kPos[0], kPos[1], oppColor)) {
          continue; // King in check -> illegal
        }

        // Compute SAN string
        let san = '';
        if (m.isCastling === 'kingside') {
          san = 'O-O';
        } else if (m.isCastling === 'queenside') {
          san = 'O-O-O';
        } else {
          if (p.type === 'p') {
            if (destPiece || (state.enPassant === toSq && p.type === 'p')) {
              san = `${fromSq[0]}x${toSq}`;
            } else {
              san = toSq;
            }
            if (m.promotion) san += `=${m.promotion.toUpperCase()}`;
          } else {
            san = p.type.toUpperCase();
            if (destPiece) san += 'x';
            san += toSq;
          }
        }

        // Check if move gives check to opponent
        const oppKPos = findKing(nextBoard, oppColor);
        const givesCheck = oppKPos ? isSquareAttacked(nextBoard, oppKPos[0], oppKPos[1], color) : false;
        if (givesCheck) san += '+';

        legalMoves.push({
          from: fromSq,
          to: toSq,
          piece: p,
          captured: destPiece || (p.type === 'p' && state.enPassant === toSq ? { type: 'p', color: oppColor } : undefined),
          promotion: m.promotion,
          san,
          isCheck: givesCheck,
          isCastling: m.isCastling,
        });
      }
    }
  }

  return legalMoves;
}

// Execute a move on the game state
export function makeMove(state: ChessGameState, move: ChessMove): ChessGameState {
  const next = cloneGameState(state);
  const [fromR, fromC] = squareToCoords(move.from);
  const [toR, toC] = squareToCoords(move.to);
  const p = next.board[fromR][fromC]!;
  const oppColor = next.turn === 'w' ? 'b' : 'w';

  // Handle captured piece tracking
  let captured = next.board[toR][toC];
  if (p.type === 'p' && next.enPassant === move.to && !captured) {
    const capRow = next.turn === 'w' ? toR + 1 : toR - 1;
    captured = next.board[capRow][toC];
    next.board[capRow][toC] = null;
  }

  if (captured) {
    if (captured.color === 'w') next.capturedWhite.push(captured);
    else next.capturedBlack.push(captured);
  }

  // Update board
  next.board[toR][toC] = move.promotion ? { type: move.promotion, color: next.turn } : { ...p };
  next.board[fromR][fromC] = null;

  // Handle castling rook
  if (move.isCastling === 'kingside') {
    next.board[fromR][5] = next.board[fromR][7];
    next.board[fromR][7] = null;
  } else if (move.isCastling === 'queenside') {
    next.board[fromR][3] = next.board[fromR][0];
    next.board[fromR][0] = null;
  }

  // Update castling rights
  if (p.type === 'k') {
    next.castling[next.turn].k = false;
    next.castling[next.turn].q = false;
  } else if (p.type === 'r') {
    if (fromR === (next.turn === 'w' ? 7 : 0)) {
      if (fromC === 0) next.castling[next.turn].q = false;
      if (fromC === 7) next.castling[next.turn].k = false;
    }
  }

  // En passant square update
  if (p.type === 'p' && Math.abs(toR - fromR) === 2) {
    const epRow = next.turn === 'w' ? fromR - 1 : fromR + 1;
    next.enPassant = coordsToSquare(epRow, fromC);
  } else {
    next.enPassant = null;
  }

  // Clocks
  if (p.type === 'p' || captured) next.halfMoveClock = 0;
  else next.halfMoveClock += 1;

  if (next.turn === 'b') next.fullMoveNumber += 1;
  next.turn = oppColor;

  // Evaluate check/checkmate/stalemate
  const nextKing = findKing(next.board, next.turn);
  next.isCheck = nextKing ? isSquareAttacked(next.board, nextKing[0], nextKing[1], p.color) : false;

  const nextLegalMoves = getLegalMoves(next);
  if (nextLegalMoves.length === 0) {
    if (next.isCheck) {
      next.isCheckmate = true;
      next.winner = p.color;
      move.san = move.san.replace('+', '#');
    } else {
      next.isStalemate = true;
      next.isDraw = true;
      next.winner = 'draw';
    }
  }

  next.history.push({ ...move });
  return next;
}

// Convert current board state to text grid + unicode pieces
export function renderBoardText(board: (ChessPiece | null)[][]): string {
  const rows = [];
  rows.push('  ┌───┬───┬───┬───┬───┬───┬───┬───┐');
  for (let r = 0; r < 8; r++) {
    const rankNum = 8 - r;
    let line = `${rankNum} │`;
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      const symbol = p ? UNICODE_PIECES[`${p.color}-${p.type}`] : ' ';
      line += ` ${symbol} │`;
    }
    rows.push(line);
    if (r < 7) rows.push('  ├───┼───┼───┼───┼───┼───┼───┼───┤');
  }
  rows.push('  └───┴───┴───┴───┴───┴───┴───┴───┘');
  rows.push('    a   b   c   d   e   f   g   h  ');
  return rows.join('\n');
}

// Simple positional evaluation for AI move inference
export function evaluateBoardScore(state: ChessGameState, forColor: PieceColor): number {
  let score = 0;
  const board = state.board;

  // Center control squares
  const center = [[3, 3], [3, 4], [4, 3], [4, 4]];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = PIECE_VALUES[p.type];
      const sign = p.color === forColor ? 1 : -1;
      score += val * sign;

      // Bonus for center pawns & knights
      if (center.some(([cr, cc]) => cr === r && cc === c)) {
        score += 25 * sign;
      }
    }
  }

  if (state.isCheckmate) {
    if (state.winner === forColor) score += 100000;
    else score -= 100000;
  }

  return score;
}

// Select best move based on personality archetype
export function selectPersonaMove(
  state: ChessGameState,
  personaId: string,
  systemPrompt?: string
): ChessMove | null {
  const legal = getLegalMoves(state);
  if (legal.length === 0) return null;

  const color = state.turn;
  const promptLower = (systemPrompt || '').toLowerCase();

  // Determine personality archetype
  const isMaster = personaId === 'Sera16' || promptLower.includes('intellectual') || promptLower.includes('master');
  const isTechAggressive = personaId === 'Distil' || promptLower.includes('architect') || promptLower.includes('optim');
  const isGentleSolid = personaId === 'Sera14' || promptLower.includes('patient') || promptLower.includes('gentle');
  const isCosmicChaotic = personaId === 'Muku' || promptLower.includes('cosmic') || promptLower.includes('mysterious');
  const isPlayful = personaId === 'Sera16_wife' || personaId === 'Distil_husband' || personaId === 'Sera16_bd';

  // Evaluate all legal moves with depth-1 lookahead
  const scoredMoves: Array<{ move: ChessMove; score: number }> = [];

  for (const move of legal) {
    const nextState = makeMove(state, move);
    let baseScore = evaluateBoardScore(nextState, color);

    // Add personality flavor weights:
    if (move.captured) {
      baseScore += isTechAggressive ? 40 : 20; // Tech bro loves material trades
    }
    if (move.isCheck) {
      baseScore += isMaster ? 50 : isTechAggressive ? 35 : 15;
    }
    if (move.isCastling) {
      baseScore += isGentleSolid ? 60 : 30; // Classic likes king safety
    }
    if (isCosmicChaotic && move.piece.type === 'n') {
      baseScore += 30; // Muku loves knight cosmic geometries
    }
    if (isPlayful) {
      baseScore += (Math.random() * 40 - 20); // Adds friendly variance
    }

    scoredMoves.push({ move, score: baseScore });
  }

  // Sort by score descending
  scoredMoves.sort((a, b) => b.score - a.score);

  if (isMaster) {
    // 90% top move, 10% second move
    return Math.random() < 0.9 ? scoredMoves[0].move : (scoredMoves[1]?.move || scoredMoves[0].move);
  } else if (isTechAggressive || isGentleSolid) {
    // Top 2 moves
    const pickIdx = Math.floor(Math.random() * Math.min(2, scoredMoves.length));
    return scoredMoves[pickIdx].move;
  } else if (isCosmicChaotic) {
    // Top 3 moves with cosmic spice
    const pickIdx = Math.floor(Math.random() * Math.min(3, scoredMoves.length));
    return scoredMoves[pickIdx].move;
  } else {
    // Balanced play
    const pickIdx = Math.floor(Math.random() * Math.min(2, scoredMoves.length));
    return scoredMoves[pickIdx].move;
  }
}

// Generate personality in-character move commentary
export function getPersonalityMoveComment(
  personaId: string,
  move: ChessMove,
  state: ChessGameState,
  isAIMove: boolean
): string {
  const san = move.san;
  const isCheck = move.isCheck;
  const isCheckmate = state.isCheckmate;
  const captured = move.captured;

  if (isCheckmate) {
    if (isAIMove) {
      if (personaId === 'Sera16') return `Checkmate with **${san}**. An exquisitely fought match—your spatial tension was commendable, but the diagonal proved decisive!`;
      if (personaId === 'Distil') return `Checkmate (**${san}**). Algorithmic victory. Good game—let's analyze the critical blunder in post-mortem.`;
      if (personaId === 'Sera14') return `Checkmate (**${san}**). Thank you so much for this thoughtful game. You played with admirable grace!`;
      if (personaId === 'Sera16_wife') return `Checkmate, darling! (**${san}**). Aww, you played so well though! Want a rematch over warm tea?`;
      if (personaId === 'Sera16_bd') return `Khemot (**${san}**)! Shundor match chhilo! Next time aro bhalo hobe, chai toh ekta cup cha er shonge rematch?`;
      if (personaId === 'Distil_husband') return `Checkmate babe (**${san}**). Super fun game—you had me sweating on that kingside push earlier!`;
      if (personaId === 'Muku') return `Checkmate (**${san}**). The cosmic constellations have collapsed into singularity. A transcendent duel across the 64 realms!`;
      return `Checkmate (**${san}**). Well played!`;
    } else {
      if (personaId === 'Sera16') return `Brilliant checkmate with **${san}**! Outstanding vision and tactical precision. Hat off to you!`;
      if (personaId === 'Distil') return `GG! **${san}** was clean execution. You exploited that edge case perfectly.`;
      if (personaId === 'Sera16_wife') return `Wow, look at you winning with **${san}**! I'm so proud of you, my grandmaster! ❤️`;
      return `Checkmate! Outstanding victory with **${san}**!`;
    }
  }

  if (isCheck) {
    if (isAIMove) {
      if (personaId === 'Sera16') return `Check! (**${san}**). Let's see how your king maneuvers out of this tactical pin.`;
      if (personaId === 'Distil') return `Check with **${san}**. Thread safety violation on your king.`;
      if (personaId === 'Sera16_wife') return `Check, honey! (**${san}**). Careful with your king now! 😊`;
      if (personaId === 'Sera16_bd') return `Arey check! (**${san}**). Dekhi ebar kothay jaan!`;
      if (personaId === 'Muku') return `Check (**${san}**). A gravitational beam locks onto your monarch!`;
      return `Check with **${san}**!`;
    } else {
      if (personaId === 'Sera16') return `Sharp check with **${san}**! Forcing my king into active duty.`;
      if (personaId === 'Distil') return `Nice check with **${san}**. Handling this exception now.`;
      if (personaId === 'Sera16_wife') return `Ooh, checking me with **${san}**? Bold move sweetie!`;
      return `Good check with **${san}**!`;
    }
  }

  if (captured) {
    const pieceName = captured.type === 'q' ? 'Queen' : captured.type === 'r' ? 'Rook' : captured.type === 'b' ? 'Bishop' : captured.type === 'n' ? 'Knight' : 'pawn';
    if (isAIMove) {
      if (personaId === 'Sera16') return `I'll take the ${pieceName} with **${san}**. Consolidating central control!`;
      if (personaId === 'Distil') return `Capturing the ${pieceName} (**${san}**). Pure value extraction.`;
      if (personaId === 'Sera16_wife') return `Sorry dear, I had to claim that ${pieceName} with **${san}**! 💖`;
      if (personaId === 'Sera16_bd') return `Oi ${pieceName} ta gelo! **${san}** dilam.`;
      if (personaId === 'Muku') return `The ${pieceName} dissolves into stardust via **${san}**.`;
      return `Taking the ${pieceName} with **${san}**.`;
    } else {
      if (personaId === 'Sera16') return `Calculated capture on my ${pieceName} with **${san}**! Good eye.`;
      if (personaId === 'Distil') return `You grabbed my ${pieceName} with **${san}**—let's see if the compensation holds up.`;
      if (personaId === 'Sera16_wife') return `My ${pieceName}! You're playing so aggressively today darling! 😄`;
      return `Nice capture with **${san}**!`;
    }
  }

  // Standard move comments
  if (isAIMove) {
    if (personaId === 'Sera16') {
      const msgs = [
        `Playing **${san}**. Building dynamic piece harmony and claiming key files.`,
        `I advance with **${san}**. Let's see how you contest the center!`,
        `**${san}**—improving piece coordination and preparing tactical lines.`,
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (personaId === 'Distil') {
      const msgs = [
        `Running **${san}**. Optimizing board latency and piece throughput.`,
        `**${san}**. Refactoring my pawn structure for maximum efficiency.`,
        `Executing **${san}**. Let's test your defensive unit tests.`,
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (personaId === 'Sera14') {
      const msgs = [
        `Carefully moving **${san}**. Patience is the key to a sound structure.`,
        `Playing **${san}**. Securing our positions step by step.`,
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (personaId === 'Sera16_wife') {
      const msgs = [
        `Here is **${san}**! I'm having so much fun playing with you darling.`,
        `Moving **${san}**. What do you think of my setup so far? 🥰`,
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (personaId === 'Sera16_bd') {
      const msgs = [
        `Dilam **${san}**! Ebar dekhi apnar plan ki.`,
        `**${san}** chal dilam. Ekta bhalo chaler kotha bolchilen na?`,
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (personaId === 'Muku') {
      const msgs = [
        `**${san}** whispers across the cosmic lattice. The celestial dance continues.`,
        `Shifting the fabric with **${san}**. Every square is an infinite galaxy.`,
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    return `Playing **${san}**. Your turn!`;
  } else {
    if (personaId === 'Sera16') return `Interesting push with **${san}**. Shifting the center of gravity!`;
    if (personaId === 'Distil') return `**${san}** registered. Analyzing your branching paths.`;
    if (personaId === 'Sera16_wife') return `Nice move with **${san}**, sweetie! Let me think...`;
    return `You played **${san}**. Good move!`;
  }
}
