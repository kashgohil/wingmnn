import { Games } from "./constants";

interface GameConfig {
  id: Games;
  name: string;
  description: string;
  picture: string;
  to: string;
}

export const GAMES_CONFIG: Record<Games, GameConfig> = {
  [Games.TETRIS]: {
    id: Games.TETRIS,
    name: "Tetris",
    description: "Classic Tetris game",
    picture: `${STATIC_URL}/games/${Games.TETRIS}.png`,
    to: `/games/${Games.TETRIS}`,
  },
  [Games.SNAKE]: {
    id: Games.SNAKE,
    name: "Snake",
    description: "Classic Snake game",
    picture: `${STATIC_URL}/games/${Games.SNAKE}.png`,
    to: `/games/${Games.SNAKE}`,
  },
  [Games.PONG]: {
    id: Games.PONG,
    name: "Pong",
    description: "Classic Pong game",
    picture: `${STATIC_URL}/games/${Games.PONG}.png`,
    to: `/games/${Games.PONG}`,
  },
  [Games.TIC_TAC_TOE]: {
    id: Games.TIC_TAC_TOE,
    name: "Tic Tac Toe",
    description: "Classic Tic Tac Toe game",
    picture: `${STATIC_URL}/games/${Games.TIC_TAC_TOE}.png`,
    to: `/games/${Games.TIC_TAC_TOE}`,
  },
  [Games.CHECKERS]: {
    id: Games.CHECKERS,
    name: "Checkers",
    description: "Classic Checkers game",
    picture: `${STATIC_URL}/games/${Games.CHECKERS}.png`,
    to: `/games/${Games.CHECKERS}`,
  },
  [Games.GOMOKU]: {
    id: Games.GOMOKU,
    name: "Gomoku",
    description: "Classic Gomoku game",
    picture: `${STATIC_URL}/games/${Games.GOMOKU}.png`,
    to: `/games/${Games.GOMOKU}`,
  },
  [Games.GAME_OF_LIFE]: {
    id: Games.GAME_OF_LIFE,
    name: "Game of Life",
    description: "Classic Game of Life simulation",
    picture: `${STATIC_URL}/games/${Games.GAME_OF_LIFE}.png`,
    to: `/games/${Games.GAME_OF_LIFE}`,
  },
  [Games.GO]: {
    id: Games.GO,
    name: "Go",
    description: "Classic Go game",
    picture: `${STATIC_URL}/games/${Games.GO}.png`,
    to: `/games/${Games.GO}`,
  },
  [Games.CHESS]: {
    id: Games.CHESS,
    name: "Chess",
    description: "Classic Chess game",
    picture: `${STATIC_URL}/games/${Games.CHESS}.png`,
    to: `/games/${Games.CHESS}`,
  },
  [Games.CONNECT_FOUR]: {
    id: Games.CONNECT_FOUR,
    name: "Connect Four",
    description: "Classic Connect Four game",
    picture: `${STATIC_URL}/games/${Games.CONNECT_FOUR}.png`,
    to: `/games/${Games.CONNECT_FOUR}`,
  },
  [Games.SUDOKU]: {
    id: Games.SUDOKU,
    name: "Sudoku",
    description: "Classic Sudoku game",
    picture: `${STATIC_URL}/games/${Games.SUDOKU}.png`,
    to: `/games/${Games.SUDOKU}`,
  },
  [Games.CROSSWORD]: {
    id: Games.CROSSWORD,
    name: "Crossword",
    description: "Classic Crossword game",
    picture: `${STATIC_URL}/games/${Games.CROSSWORD}.png`,
    to: `/games/${Games.CROSSWORD}`,
  },
  [Games.WORDLE]: {
    id: Games.WORDLE,
    name: "Wordle",
    description: "Classic Wordle game",
    picture: `${STATIC_URL}/games/${Games.WORDLE}.png`,
    to: `/games/${Games.WORDLE}`,
  },
  [Games.SCRABBLE]: {
    id: Games.SCRABBLE,
    name: "Scrabble",
    description: "Classic Scrabble game",
    picture: `${STATIC_URL}/games/${Games.SCRABBLE}.png`,
    to: `/games/${Games.SCRABBLE}`,
  },
  [Games.SPACE_INVADERS]: {
    id: Games.SPACE_INVADERS,
    name: "Space Invaders",
    description: "Classic Space Invaders game",
    picture: `${STATIC_URL}/games/${Games.SPACE_INVADERS}.png`,
    to: `/games/${Games.SPACE_INVADERS}`,
  },
};
