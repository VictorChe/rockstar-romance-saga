// === CORE GAME TYPES ===

export type InstrumentType = 'guitar' | 'bass' | 'drums' | 'vocals' | 'keyboard';
export type MusicGenre = 'rock' | 'punk' | 'metal' | 'indie' | 'grunge' | 'alternative';
export type SongTheme = 'love' | 'rebellion' | 'party' | 'darkness' | 'freedom' | 'society' | 'loneliness' | 'adventure';

export interface CharacterStats {
  skill: number;       // 1-100
  charisma: number;    // 1-100
  creativity: number;  // 1-100
  stamina: number;     // 1-100
}

export interface Character {
  id: string;
  name: string;
  instrument: InstrumentType;
  stats: CharacterStats;
  avatarSeed: number; // for pixel art generation
  salary: number; // weekly cost
  isPlayer: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'instrument' | 'amp' | 'mic' | 'drums' | 'keys' | 'pa' | 'lights';
  forInstrument?: InstrumentType;
  quality: number; // 1-100
  price: number;
  description: string;
}

export interface Song {
  id: string;
  name: string;
  genre: MusicGenre;
  theme: SongTheme;
  quality: number; // calculated from band skills + creativity
  popularity: number; // grows over time with concerts/radio
  recorded: boolean;
}

export interface Album {
  id: string;
  name: string;
  songs: string[]; // song ids
  quality: number;
  salesTotal: number;
  releaseWeek: number;
}

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  minFame: number;
  payPerHead: number;
  description: string;
  type: 'bar' | 'club' | 'theater' | 'arena' | 'stadium';
}

export interface ConcertResult {
  venueId: string;
  attendance: number;
  earnings: number;
  fameGained: number;
  crowdMood: number; // 0-100
  events: string[]; // special events during concert
}

export interface GameState {
  playerName: string;
  bandName: string;
  members: Character[];
  money: number;
  fame: number; // 0-1000
  fans: number;
  week: number;
  equipment: Equipment[];
  songs: Song[];
  albums: Album[];
  concertHistory: ConcertResult[];
  hasWon: boolean;
  screen: GameScreen;
}

export type GameScreen = 
  | 'menu' 
  | 'create' 
  | 'hq' 
  | 'members' 
  | 'shop' 
  | 'rehearsal' 
  | 'songwriting' 
  | 'studio' 
  | 'booking' 
  | 'concert'
  | 'concert-result'
  | 'album';
