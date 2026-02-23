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

export type CrewRole = 'musician' | 'manager' | 'sound_engineer' | 'tech';
export type ContractType = 'pro' | 'friend'; // pro = salary, friend = share of gig

export interface Character {
  id: string;
  name: string;
  instrument: InstrumentType;
  stats: CharacterStats;
  avatarSeed: number;
  salary: number;
  isPlayer: boolean;
  /** musician | manager | sound_engineer | tech; default musician */
  role?: CrewRole;
  /** pro = salary per week, friend = no salary, share of concert; default pro */
  contract?: ContractType;
}

/** Роль команды, для которой предназначен товар (менеджер, звуковик, техник). */
export type EquipmentCrewRole = 'manager' | 'sound_engineer' | 'tech';

export interface Equipment {
  id: string;
  name: string;
  type: 'instrument' | 'amp' | 'mic' | 'drums' | 'keys' | 'pa' | 'lights' | 'manager_gear' | 'sound_gear' | 'tech_gear';
  forInstrument?: InstrumentType;
  /** Для кого: музыкант (указывается forInstrument) или член команды (forCrewRole). */
  forCrewRole?: EquipmentCrewRole;
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
  /** Required equipment ids (e.g. pa-mid). Without these, cannot play. */
  requiredEquipmentIds?: string[];
  /** If true, need at least one sound_engineer or tech in crew. */
  requiresSoundEngineer?: boolean;
}

/** Gig format: same venue can be played as slot / headline / support / solo. */
export type GigFormatId = 'festival_slot' | 'headline' | 'support_act' | 'solo_show';

export interface GigFormat {
  id: GigFormatId;
  name: string;
  minSongs: number;
  /** Only for headline: min fame required. */
  minFame?: number;
  payMultiplier: number;
  fameMultiplier: number;
}

export interface ConcertResult {
  venueId: string;
  gigFormatId?: GigFormatId;
  attendance: number;
  earnings: number;
  fameGained: number;
  crowdMood: number;
  events: string[];
}

/** Crew member (non-musician): manager, sound_engineer, tech. */
export interface CrewMember {
  id: string;
  name: string;
  role: 'manager' | 'sound_engineer' | 'tech';
  salary: number;
}

/** Минимальные данные сгенерированного Suno-трека для воспроизведения на концерте */
export interface SunoTrackStored {
  id: string;
  audioUrl: string;
  streamAudioUrl?: string;
  title: string;
}

export interface GameState {
  playerName: string;
  bandName: string;
  members: Character[];
  crew: CrewMember[];
  money: number;
  fame: number;
  fans: number;
  week: number;
  equipment: Equipment[];
  songs: Song[];
  albums: Album[];
  /** Сохранённые треки Suno для воспроизведения на выступлениях */
  sunoTracks: SunoTrackStored[];
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
