/**
 * Chess Engine - p4wn adapted for Lalela Web Games
 * 
 * Original: p4wn, AKA 5k chess - by Douglas Bagnall <douglas@paradise.net.nz>
 * SPDX-License-Identifier: Unlicense (Public Domain)
 * 
 * Adapted from GCompris chess activity engine.js
 */

// Piece constants
export const P4_PAWN = 2;
export const P4_ROOK = 4;
export const P4_KNIGHT = 6;
export const P4_BISHOP = 8;
export const P4_KING = 10;
export const P4_QUEEN = 12;
export const P4_EDGE = 16;

// Move directions for each piece type
const P4_MOVES = [
    [], [],
    [], [],
    [1, 10, -1, -10], [],  // Rook
    [21, 19, 12, 8, -21, -19, -12, -8], [],  // Knight
    [11, 9, -11, -9], [],  // Bishop
    [1, 10, 11, 9, -1, -10, -11, -9], [],  // King
    [1, 10, 11, 9, -1, -10, -11, -9], []   // Queen
];

// Piece values for evaluation
const P4_VALUES = [
    0, 0,      // Empty
    20, 20,    // Pawns
    100, 100,  // Rooks
    60, 60,    // Knights
    61, 61,    // Bishops
    8000, 8000,// Kings
    180, 180,  // Queens
    0
];

const P4_KING_VALUE = P4_VALUES[10];
const P4_WIN = P4_KING_VALUE >> 1;
const P4_WIN_DECAY = 300;
const P4_WIN_NOW = P4_KING_VALUE - 250;
const P4_MAX_SCORE = 9999;
const P4_MIN_SCORE = -P4_MAX_SCORE;

// Move flags
export const P4_MOVE_FLAG_OK = 1;
export const P4_MOVE_FLAG_CHECK = 2;
export const P4_MOVE_FLAG_MATE = 4;
export const P4_MOVE_FLAG_CAPTURE = 8;
export const P4_MOVE_FLAG_CASTLE_KING = 16;
export const P4_MOVE_FLAG_CASTLE_QUEEN = 32;
export const P4_MOVE_FLAG_DRAW = 64;
export const P4_MOVE_ILLEGAL = 0;

const P4_INITIAL_BOARD = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 1 1";

const P4_PIECE_LUT = {
    P: 2, p: 3,
    R: 4, r: 5,
    N: 6, n: 7,
    B: 8, b: 9,
    K: 10, k: 11,
    Q: 12, q: 13
};

const P4_ENCODE_LUT = '  PPRRNNBBKKQQ';

// Weight arrays
let P4_CENTRALISING_WEIGHTS;
let P4_BASE_PAWN_WEIGHTS;
let P4_KNIGHT_WEIGHTS;

function p4_zero_array() {
    return new Int32Array(120);
}

// Initialize the chess state
export function p4_initialise_state() {
    const board = p4_zero_array();
    // Set edge squares
    for (let i = 0; i < 120; i++) {
        const row = Math.floor(i / 10);
        const col = i % 10;
        if (row < 2 || row > 9 || col < 1 || col > 8) {
            board[i] = P4_EDGE;
        }
    }
    
    // Initialize weight arrays
    P4_CENTRALISING_WEIGHTS = p4_zero_array();
    P4_BASE_PAWN_WEIGHTS = [p4_zero_array(), p4_zero_array()];
    P4_KNIGHT_WEIGHTS = p4_zero_array();
    
    for (let y = 2; y < 10; y++) {
        for (let x = 1; x < 9; x++) {
            const i = y * 10 + x;
            const cx = Math.abs(4.5 - x);
            const cy = Math.abs(5.5 - y);
            P4_CENTRALISING_WEIGHTS[i] = Math.floor(6 - cx - cy);
            P4_KNIGHT_WEIGHTS[i] = Math.floor(8 - cx * cx - cy * cy);
            P4_BASE_PAWN_WEIGHTS[0][i] = (y - 2) * 2;
            P4_BASE_PAWN_WEIGHTS[1][i] = (9 - y) * 2;
        }
    }
    
    return {
        board: board,
        pieces: [[], []],
        to_play: 0,
        castles: 15,
        enpassant: 0,
        history: [],
        moveno: 0,
        draw_timeout: 0,
        position_counts: {},
        current_repetitions: 0,
        prepared: false,
        weights: [p4_zero_array(), p4_zero_array()],
        values: [[], []],
        stalemate_scores: [0, 0],
        best_pieces: [0, 0]
    };
}

// Parse FEN string to state
export function p4_fen2state(fen, state) {
    if (state === undefined) {
        state = p4_initialise_state();
    }
    
    const parts = fen.split(' ');
    const rows = parts[0].split('/');
    const board = state.board;
    
    // Clear board (except edges)
    for (let i = 21; i < 99; i++) {
        if (board[i] !== P4_EDGE) {
            board[i] = 0;
        }
    }
    
    // Place pieces
    let boardIndex = 91;
    for (let r = 0; r < 8; r++) {
        const row = rows[r];
        for (let c = 0; c < row.length; c++) {
            const char = row[c];
            if (char >= '1' && char <= '8') {
                boardIndex += parseInt(char);
            } else {
                const piece = P4_PIECE_LUT[char];
                if (piece !== undefined) {
                    board[boardIndex] = piece;
                }
                boardIndex++;
            }
        }
        boardIndex -= 18;
    }
    
    // Turn
    state.to_play = (parts[1] === 'b') ? 1 : 0;
    
    // Castling rights
    state.castles = 0;
    if (parts[2]) {
        if (parts[2].includes('K')) state.castles |= 1;
        if (parts[2].includes('Q')) state.castles |= 2;
        if (parts[2].includes('k')) state.castles |= 4;
        if (parts[2].includes('q')) state.castles |= 8;
    }
    
    // En passant
    state.enpassant = 0;
    if (parts[3] && parts[3] !== '-') {
        const col = parts[3].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
        const row = parseInt(parts[3][1]) + 1;
        state.enpassant = row * 10 + col;
    }
    
    // Move counters
    state.draw_timeout = parts[4] ? parseInt(parts[4]) : 0;
    state.moveno = parts[5] ? (parseInt(parts[5]) - 1) * 2 + state.to_play : 0;
    
    state.history = [];
    state.position_counts = {};
    state.current_repetitions = 0;
    state.prepared = false;
    state.beginning = fen;
    
    // Populate pieces array from board
    state.pieces = [[], []];
    for (let i = 20; i < 100; i++) {
        const piece = state.board[i];
        if (piece && piece !== P4_EDGE) {
            const colour = piece & 1;
            state.pieces[colour].push([piece, i]);
        }
    }
    
    return state;
}

// Prepare state for move generation
export function p4_prepare(state) {
    const pieces = state.pieces = [[], []];
    const moveno = state.moveno >> 1;
    const board = state.board;
    
    const earliness_weight = (moveno > 50) ? 0 : Math.floor(6 * Math.exp(moveno * -0.07));
    
    const kings = [0, 0];
    const material = [0, 0];
    const best_pieces = [0, 0];
    
    for (let i = 20; i < 100; i++) {
        const piece = board[i];
        if (piece && piece !== P4_EDGE) {
            const colour = piece & 1;
            pieces[colour].push([piece, i]);
            if ((piece & 14) === P4_KING) {
                kings[colour] = i;
            } else {
                const value = P4_VALUES[piece];
                material[colour] += value;
                if (value > best_pieces[colour]) {
                    best_pieces[colour] = value;
                }
            }
        }
    }
    
    state.values = [[], []];
    const qvalue = P4_VALUES[P4_QUEEN];
    const material_sum = material[0] + material[1] + 2 * qvalue;
    const wmul = 2 * (material[1] + qvalue) / material_sum;
    const bmul = 2 * (material[0] + qvalue) / material_sum;
    
    state.stalemate_scores = [
        Math.floor(0.5 + (wmul - 1) * 2 * qvalue),
        Math.floor(0.5 + (bmul - 1) * 2 * qvalue)
    ];
    
    for (let i = 0; i < P4_VALUES.length; i++) {
        state.values[0][i] = Math.floor(P4_VALUES[i] * wmul + 0.5);
        state.values[1][i] = Math.floor(P4_VALUES[i] * bmul + 0.5);
    }
    
    state.best_pieces = [
        Math.floor(best_pieces[0] * wmul + 0.5),
        Math.floor(best_pieces[1] * bmul + 0.5)
    ];
    
    // Initialize weights
    const weights = state.weights = [p4_zero_array(), p4_zero_array()];
    
    for (let y = 2; y < 10; y++) {
        for (let x = 1; x < 9; x++) {
            const i = y * 10 + x;
            weights[0][i] = P4_CENTRALISING_WEIGHTS[i] * earliness_weight;
            weights[1][i] = P4_CENTRALISING_WEIGHTS[i] * earliness_weight;
        }
    }
    
    state.prepared = true;
}

function p4_maybe_prepare(state) {
    if (!state.prepared) {
        p4_prepare(state);
    }
}

// Parse all possible moves for a colour
export function p4_parse(state, colour, ep, score) {
    const board = state.board;
    const dir = 10 - 20 * colour;
    const movelist = [];
    const captures = [];
    const pieces = state.pieces[colour];
    const castle_flags = (state.castles >> (colour * 2)) & 3;
    const other_colour = 1 - colour;
    
    for (let j = pieces.length - 1; j >= 0; j--) {
        const piece = pieces[j][0];
        const s = pieces[j][1];
        const dominated = piece & 14;
        
        if (dominated === P4_PAWN) {
            // Pawn moves
            let e = s + dir;
            if (!board[e]) {
                movelist.push([0, s, e]);
                // Double push from starting rank
                const startRank = colour ? 8 : 3;
                if (Math.floor(s / 10) === startRank) {
                    e = s + 2 * dir;
                    if (!board[e]) {
                        movelist.push([0, s, e]);
                    }
                }
            }
            // Captures
            for (const dx of [-1, 1]) {
                e = s + dir + dx;
                const target = board[e];
                if (target && target !== P4_EDGE && (target & 1) !== colour) {
                    captures.push([P4_VALUES[target], s, e]);
                }
            }
        } else if (dominated === P4_KNIGHT) {
            for (const move of P4_MOVES[P4_KNIGHT]) {
                const e = s + move;
                const target = board[e];
                if (!target) {
                    movelist.push([0, s, e]);
                } else if (target !== P4_EDGE && (target & 1) !== colour) {
                    captures.push([P4_VALUES[target], s, e]);
                }
            }
        } else if (dominated === P4_KING) {
            for (const move of P4_MOVES[P4_KING]) {
                const e = s + move;
                const target = board[e];
                if (!target) {
                    movelist.push([0, s, e]);
                } else if (target !== P4_EDGE && (target & 1) !== colour) {
                    captures.push([P4_VALUES[target], s, e]);
                }
            }
            // Castling
            if (castle_flags) {
                if ((castle_flags & 1) && !board[s + 1] && !board[s + 2]) {
                    if (p4_check_castling(board, s, colour, dir, 1)) {
                        movelist.push([0, s, s + 2]);
                    }
                }
                if ((castle_flags & 2) && !board[s - 1] && !board[s - 2] && !board[s - 3]) {
                    if (p4_check_castling(board, s, colour, dir, -1)) {
                        movelist.push([0, s, s - 2]);
                    }
                }
            }
        } else {
            // Sliding pieces (rook, bishop, queen)
            const directions = dominated === P4_ROOK ? P4_MOVES[P4_ROOK] :
                             dominated === P4_BISHOP ? P4_MOVES[P4_BISHOP] :
                             P4_MOVES[P4_QUEEN];
            for (const delta of directions) {
                let e = s + delta;
                while (!board[e]) {
                    movelist.push([0, s, e]);
                    e += delta;
                }
                if (board[e] !== P4_EDGE && (board[e] & 1) !== colour) {
                    captures.push([P4_VALUES[board[e]], s, e]);
                }
            }
        }
    }
    
    // En passant
    if (ep) {
        for (const dx of [-1, 1]) {
            const s = ep - dir + dx;
            if (board[s] === (P4_PAWN | colour)) {
                captures.push([P4_VALUES[P4_PAWN], s, ep]);
            }
        }
    }
    
    return captures.concat(movelist);
}

// Check if castling is legal
function p4_check_castling(board, s, colour, dir, side) {
    const other_colour = 1 - colour;
    const knight = P4_KNIGHT | other_colour;
    const king_pawn = 2 | other_colour;
    
    // Check the three squares the king passes through
    for (let p = s; p < s + 3; p++) {
        // Check for attacks from pawns and king
        if ((board[p + dir - 1] & 14) === 2 && (board[p + dir - 1] & 1) === other_colour) return 0;
        if ((board[p + dir + 1] & 14) === 2 && (board[p + dir + 1] & 1) === other_colour) return 0;
        
        // Check for knights
        for (const move of P4_MOVES[P4_KNIGHT]) {
            if (board[p + move] === knight) return 0;
        }
        
        // Check for sliding pieces (vertical/horizontal)
        for (const delta of P4_MOVES[P4_ROOK]) {
            let e = p + delta;
            while (!board[e]) e += delta;
            const piece = board[e];
            if (piece !== P4_EDGE && (piece & 1) === other_colour) {
                if ((piece & 14) === P4_ROOK || (piece & 14) === P4_QUEEN) return 0;
            }
        }
        
        // Check for diagonal attacks
        for (const delta of P4_MOVES[P4_BISHOP]) {
            let e = p + delta;
            while (!board[e]) e += delta;
            const piece = board[e];
            if (piece !== P4_EDGE && (piece & 1) === other_colour) {
                if ((piece & 14) === P4_BISHOP || (piece & 14) === P4_QUEEN) return 0;
            }
        }
    }
    
    return 1;
}

// Check if the given colour's king is in check
export function p4_check_check(state, colour) {
    const board = state.board;
    const pieces = state.pieces[colour];
    const king = P4_KING | colour;
    
    // Find the king
    let s = 0;
    for (let i = pieces.length - 1; i >= 0; i--) {
        if (pieces[i][0] === king) {
            s = pieces[i][1];
            break;
        }
    }
    
    if (!s) return false;
    
    const other_colour = 1 - colour;
    const dir = 10 - 20 * colour;
    
    // Check for pawn attacks
    if (board[s + dir - 1] === (P4_PAWN | other_colour) ||
        board[s + dir + 1] === (P4_PAWN | other_colour)) {
        return true;
    }
    
    // Check for knight attacks
    const knight = P4_KNIGHT | other_colour;
    for (const move of P4_MOVES[P4_KNIGHT]) {
        if (board[s + move] === knight) return true;
    }
    
    // Check for king attacks
    const enemyKing = P4_KING | other_colour;
    for (const move of P4_MOVES[P4_KING]) {
        if (board[s + move] === enemyKing) return true;
    }
    
    // Check for sliding piece attacks (rook/queen on ranks/files)
    for (const delta of P4_MOVES[P4_ROOK]) {
        let e = s + delta;
        while (!board[e]) e += delta;
        const piece = board[e];
        if (piece !== P4_EDGE && (piece & 1) === other_colour) {
            if ((piece & 14) === P4_ROOK || (piece & 14) === P4_QUEEN) return true;
        }
    }
    
    // Check for sliding piece attacks (bishop/queen on diagonals)
    for (const delta of P4_MOVES[P4_BISHOP]) {
        let e = s + delta;
        while (!board[e]) e += delta;
        const piece = board[e];
        if (piece !== P4_EDGE && (piece & 1) === other_colour) {
            if ((piece & 14) === P4_BISHOP || (piece & 14) === P4_QUEEN) return true;
        }
    }
    
    return false;
}

// Make a move on the board
export function p4_make_move(state, s, e, promotion) {
    const board = state.board;
    const S = board[s];
    const E = board[e];
    
    board[e] = S;
    board[s] = 0;
    
    const piece = S & 14;
    const moved_colour = S & 1;
    let end_piece = S;
    
    let rs = 0, re = 0, rook = 0;
    let ep_taken = 0, ep_position = 0;
    let ep = 0;
    
    if (piece === P4_PAWN) {
        // En passant capture
        if (e === state.enpassant) {
            const captured_pos = e - (10 - 20 * moved_colour);
            ep_taken = board[captured_pos];
            ep_position = captured_pos;
            board[captured_pos] = 0;
        }
        // Double push creates en passant square
        if (Math.abs(s - e) === 20) {
            ep = (s + e) / 2;
        }
        // Promotion
        const promoRank = moved_colour ? 2 : 9;
        if (Math.floor(e / 10) === promoRank) {
            end_piece = (promotion || P4_QUEEN) | moved_colour;
            board[e] = end_piece;
        }
    } else if (piece === P4_KING) {
        // Castling
        if (e - s === 2) {
            rs = s + 3;
            re = s + 1;
            rook = board[rs];
            board[re] = rook;
            board[rs] = 0;
        } else if (s - e === 2) {
            rs = s - 4;
            re = s - 1;
            rook = board[rs];
            board[re] = rook;
            board[rs] = 0;
        }
    }
    
    const old_castle_state = state.castles;
    // Update castling rights
    if (state.castles) {
        if (piece === P4_KING) {
            state.castles &= moved_colour ? 3 : 12;
        }
        if (s === 21 || e === 21) state.castles &= 13;
        if (s === 28 || e === 28) state.castles &= 14;
        if (s === 91 || e === 91) state.castles &= 7;
        if (s === 98 || e === 98) state.castles &= 11;
    }
    
    // Update pieces list
    const old_pieces = [state.pieces[0].slice(), state.pieces[1].slice()];
    const our_pieces = old_pieces[moved_colour];
    const dest = state.pieces[moved_colour] = [];
    
    for (let i = 0; i < our_pieces.length; i++) {
        if (our_pieces[i][1] !== s && our_pieces[i][1] !== rs) {
            dest.push(our_pieces[i]);
        }
    }
    dest.push([end_piece, e]);
    if (rook) {
        dest.push([rook, re]);
    }
    
    // Remove captured piece
    if (E || ep_taken) {
        const captured = E || ep_taken;
        const cap_pos = E ? e : ep_position;
        const their_pieces = old_pieces[1 - moved_colour];
        const new_their = state.pieces[1 - moved_colour] = [];
        for (let i = 0; i < their_pieces.length; i++) {
            if (their_pieces[i][1] !== cap_pos) {
                new_their.push(their_pieces[i]);
            }
        }
    }
    
    return {
        s, e, S, E, ep,
        castles: old_castle_state,
        rs, re, rook,
        ep_position, ep_taken,
        pieces: old_pieces
    };
}

// Unmake a move
export function p4_unmake_move(state, move) {
    const board = state.board;
    
    if (move.ep_position) {
        board[move.ep_position] = move.ep_taken;
    }
    
    board[move.s] = move.S;
    board[move.e] = move.E;
    
    if (move.rs) {
        board[move.rs] = move.rook;
        board[move.re] = 0;
    }
    
    state.pieces = move.pieces;
    state.castles = move.castles;
}

// Alpha-beta search for best move
function p4_alphabeta_treeclimber(state, count, colour, score, s, e, alpha, beta) {
    const move = p4_make_move(state, s, e, P4_QUEEN);
    const ncolour = 1 - colour;
    const movelist = p4_parse(state, colour, move.ep, -score);
    let movecount = movelist.length;
    
    if (count) {
        for (let i = 0; i < movecount; i++) {
            const mv = movelist[i];
            const mscore = mv[0] - score;
            const t = -p4_alphabeta_treeclimber(state, count - 1, ncolour, mscore,
                                                  mv[1], mv[2], -beta, -alpha);
            if (t > alpha) alpha = t;
            if (alpha >= beta) break;
        }
        if (alpha < -P4_WIN && !p4_check_check(state, colour)) {
            alpha = state.stalemate_scores[colour];
        }
    } else {
        alpha = score;
        while (beta > alpha && --movecount >= 0) {
            const mv = movelist[movecount];
            alpha = Math.max(alpha, mv[0] - score);
        }
    }
    
    p4_unmake_move(state, move);
    return alpha;
}

// Find best move for a colour
export function p4_findmove(state, level, colour, ep) {
    p4_prepare(state);
    
    if (colour === undefined) {
        colour = state.to_play;
        ep = state.enpassant;
    }
    
    const movelist = p4_parse(state, colour, ep, 0);
    let alpha = P4_MIN_SCORE;
    let bs = 0, be = 0;
    
    if (level <= 0) {
        // Random move
        const idx = Math.floor(Math.random() * movelist.length);
        return [movelist[idx][1], movelist[idx][2], 0];
    }
    
    for (let i = 0; i < movelist.length; i++) {
        const mv = movelist[i];
        const t = -p4_alphabeta_treeclimber(state, level - 1, 1 - colour, mv[0],
                                             mv[1], mv[2], -P4_MAX_SCORE, -alpha);
        if (t > alpha) {
            alpha = t;
            bs = mv[1];
            be = mv[2];
        }
    }
    
    if (alpha < -P4_WIN_NOW && !p4_check_check(state, colour)) {
        alpha = state.stalemate_scores[colour];
    }
    
    return [bs, be, alpha];
}

// Execute a move and update game state
export function p4_move(state, s, e, promotion) {
    const board = state.board;
    const colour = state.to_play;
    const other_colour = 1 - colour;
    
    if (promotion === undefined) {
        promotion = P4_QUEEN;
    }
    
    const E = board[e];
    const S = board[s];
    
    // Check if move is legal
    p4_maybe_prepare(state);
    const moves = p4_parse(state, colour, state.enpassant, 0);
    let legal = false;
    
    for (let i = 0; i < moves.length; i++) {
        if (moves[i][1] === s && moves[i][2] === e) {
            legal = true;
            break;
        }
    }
    
    if (!legal) {
        return { ok: false, flags: P4_MOVE_ILLEGAL };
    }
    
    // Try the move
    const changes = p4_make_move(state, s, e, promotion);
    
    // Check if our king is in check after the move
    if (p4_check_check(state, colour)) {
        p4_unmake_move(state, changes);
        return { ok: false, flags: P4_MOVE_ILLEGAL };
    }
    
    // Move is legal
    let flags = P4_MOVE_FLAG_OK;
    
    state.enpassant = changes.ep;
    state.history.push([s, e, promotion]);
    
    // Update draw timeout
    if (changes.E || changes.ep_position) {
        state.draw_timeout = 0;
        flags |= P4_MOVE_FLAG_CAPTURE;
    } else if ((S & 14) === P4_PAWN) {
        state.draw_timeout = 0;
    } else {
        state.draw_timeout++;
    }
    
    // Castling flags
    if (changes.rs) {
        if (changes.re > changes.rs) {
            flags |= P4_MOVE_FLAG_CASTLE_KING;
        } else {
            flags |= P4_MOVE_FLAG_CASTLE_QUEEN;
        }
    }
    
    state.moveno++;
    state.to_play = other_colour;
    
    // Check if opponent is in check
    if (p4_check_check(state, other_colour)) {
        flags |= P4_MOVE_FLAG_CHECK;
    }
    
    // Check for checkmate or stalemate
    const replies = p4_parse(state, other_colour, changes.ep, 0);
    let is_mate = true;
    
    for (let i = 0; i < replies.length; i++) {
        const reply = replies[i];
        const testMove = p4_make_move(state, reply[1], reply[2], P4_QUEEN);
        if (!p4_check_check(state, other_colour)) {
            is_mate = false;
            p4_unmake_move(state, testMove);
            break;
        }
        p4_unmake_move(state, testMove);
    }
    
    if (is_mate) {
        flags |= P4_MOVE_FLAG_MATE;
    }
    
    // Check for draw
    if (state.draw_timeout >= 100) {
        flags |= P4_MOVE_FLAG_DRAW;
    }
    
    state.prepared = false;
    
    return {
        ok: true,
        flags: flags
    };
}

// Create a new game
export function p4_new_game() {
    return p4_fen2state(P4_INITIAL_BOARD);
}

// Convert engine position to view position (0-63)
export function engineToViewPos(pos) {
    return pos - 21 - Math.floor((pos - 20) / 10) * 2;
}

// Convert view position (0-63) to engine position
export function viewPosToEngine(pos) {
    return Math.floor(pos / 8 + 2) * 10 + (pos % 8) + 1;
}

// Get piece character for display
export function getPieceChar(piece) {
    if (!piece || piece === P4_EDGE) return null;
    const colour = piece & 1;
    const type = piece & 14;
    const prefix = colour ? 'b' : 'w';
    
    switch (type) {
        case P4_PAWN: return prefix + 'p';
        case P4_ROOK: return prefix + 'r';
        case P4_KNIGHT: return prefix + 'n';
        case P4_BISHOP: return prefix + 'b';
        case P4_QUEEN: return prefix + 'q';
        case P4_KING: return prefix + 'k';
        default: return null;
    }
}
