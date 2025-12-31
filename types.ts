
export interface Country {
  code: string;
  name: string;
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface GameState {
  score: number;
  totalFlags: number;
  lives: number;
  timeLeft: number;
  currentCountry: Country | null;
  options: Country[];
  status: GameStatus;
  lastGuessCorrect: boolean | null;
  countryFact: string | null;
  isPaused: boolean;
}
