import { GameState, GameScreen, Character, Song, Equipment, ConcertResult, MusicGenre, SongTheme, Album } from './types';
import { INITIAL_MONEY, REHEARSAL_COST, REHEARSAL_SKILL_GAIN, RECORDING_COST_PER_SONG, FAME_FROM_CONCERT_BASE, SONG_QUALITY_FORMULA, VENUES, EQUIPMENT_CATALOG, MUSICIAN_NAMES, FAME_FROM_ALBUM, FANS_PER_FAME, WEEKLY_EXPENSES, ALBUM_RECORDING_BONUS } from './constants';

const SAVE_KEY = 'rock-tycoon-save';

// === STATE ===
let state: GameState | null = null;
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export function getState(): GameState | null {
  return state;
}

export function saveGame() {
  if (state) localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(): boolean {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      notify();
      return true;
    } catch { return false; }
  }
  return false;
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function setScreen(screen: GameScreen) {
  if (!state) return;
  state = { ...state, screen };
  saveGame();
  notify();
}

// === NEW GAME ===
export function startNewGame(playerName: string, bandName: string, playerInstrument: string, avatarSeed: number) {
  const player: Character = {
    id: 'player',
    name: playerName,
    instrument: playerInstrument as any,
    stats: { skill: 20, charisma: 25, creativity: 20, stamina: 30 },
    avatarSeed,
    salary: 0,
    isPlayer: true,
  };
  state = {
    playerName, bandName,
    members: [player],
    money: INITIAL_MONEY,
    fame: 0, fans: 0,
    week: 1,
    equipment: EQUIPMENT_CATALOG.filter(e => e.price === 0).map(e => ({ ...e })),
    songs: [], albums: [],
    concertHistory: [],
    hasWon: false,
    screen: 'hq',
  };
  saveGame();
  notify();
}

// === GENERATE HIREABLE MUSICIANS ===
export function generateHirePool(count = 4): Character[] {
  const instruments = ['guitar', 'bass', 'drums', 'vocals', 'keyboard'] as const;
  const pool: Character[] = [];
  for (let i = 0; i < count; i++) {
    const inst = instruments[Math.floor(Math.random() * instruments.length)];
    const names = MUSICIAN_NAMES[inst];
    const name = names[Math.floor(Math.random() * names.length)];
    const skillBase = 15 + Math.floor(Math.random() * 40);
    pool.push({
      id: `hire-${Date.now()}-${i}`,
      name,
      instrument: inst,
      stats: {
        skill: skillBase + Math.floor(Math.random() * 20),
        charisma: 10 + Math.floor(Math.random() * 40),
        creativity: 10 + Math.floor(Math.random() * 40),
        stamina: 20 + Math.floor(Math.random() * 30),
      },
      avatarSeed: Math.floor(Math.random() * 10000),
      salary: Math.floor(skillBase * 3 + Math.random() * 50),
      isPlayer: false,
    });
  }
  return pool;
}

export function hireMember(char: Character) {
  if (!state) return;
  state = { ...state, members: [...state.members, char] };
  saveGame(); notify();
}

export function fireMember(id: string) {
  if (!state) return;
  state = { ...state, members: state.members.filter(m => m.id !== id) };
  saveGame(); notify();
}

// === REHEARSAL ===
export function rehearse(): string {
  if (!state) return '';
  if (state.money < REHEARSAL_COST) return 'Недостаточно денег!';
  const newMembers = state.members.map(m => ({
    ...m,
    stats: {
      ...m.stats,
      skill: Math.min(100, m.stats.skill + REHEARSAL_SKILL_GAIN + Math.floor(Math.random() * 2)),
      stamina: Math.max(0, m.stats.stamina - 3),
    }
  }));
  state = { ...state, members: newMembers, money: state.money - REHEARSAL_COST };
  saveGame(); notify();
  return `Репетиция прошла! Навыки улучшены. -${REHEARSAL_COST}$`;
}

// === SONGWRITING ===
export function writeSong(name: string, genre: MusicGenre, theme: SongTheme): string {
  if (!state) return '';
  const avgSkill = state.members.reduce((s, m) => s + m.stats.skill, 0) / state.members.length;
  const avgCreativity = state.members.reduce((s, m) => s + m.stats.creativity, 0) / state.members.length;
  const eqBonus = getEquipmentBonus();
  const quality = Math.min(100, Math.floor(
    avgSkill * SONG_QUALITY_FORMULA.skillWeight +
    avgCreativity * SONG_QUALITY_FORMULA.creativityWeight +
    eqBonus * SONG_QUALITY_FORMULA.equipmentWeight +
    (Math.random() * 15 - 5)
  ));
  const song: Song = {
    id: `song-${Date.now()}`,
    name, genre, theme,
    quality: Math.max(5, quality),
    popularity: 0,
    recorded: false,
  };
  state = { ...state, songs: [...state.songs, song] };
  saveGame(); notify();
  return `Песня "${name}" написана! Качество: ${song.quality}`;
}

// === RECORDING ===
export function recordSong(songId: string): string {
  if (!state) return '';
  if (state.money < RECORDING_COST_PER_SONG) return 'Недостаточно денег!';
  const songs = state.songs.map(s => s.id === songId ? { ...s, recorded: true } : s);
  state = { ...state, songs, money: state.money - RECORDING_COST_PER_SONG };
  saveGame(); notify();
  return `Песня записана! -${RECORDING_COST_PER_SONG}$`;
}

export function releaseAlbum(name: string, songIds: string[]): string {
  if (!state) return '';
  const albumSongs = state.songs.filter(s => songIds.includes(s.id) && s.recorded);
  if (albumSongs.length < 3) return 'Нужно минимум 3 записанных песни!';
  const avgQuality = albumSongs.reduce((s, song) => s + song.quality, 0) / albumSongs.length;
  const quality = Math.floor(avgQuality * ALBUM_RECORDING_BONUS);
  const album: Album = {
    id: `album-${Date.now()}`,
    name,
    songs: songIds,
    quality,
    salesTotal: 0,
    releaseWeek: state.week,
  };
  const fameGain = Math.floor(FAME_FROM_ALBUM * (quality / 50));
  state = {
    ...state,
    albums: [...state.albums, album],
    fame: state.fame + fameGain,
    fans: state.fans + fameGain * FANS_PER_FAME,
  };
  saveGame(); notify();
  return `Альбом "${name}" выпущен! Качество: ${quality}. Слава +${fameGain}`;
}

// === SHOP ===
export function buyEquipment(eqId: string): string {
  if (!state) return '';
  const item = EQUIPMENT_CATALOG.find(e => e.id === eqId);
  if (!item) return 'Товар не найден';
  if (state.money < item.price) return 'Недостаточно денег!';
  if (state.equipment.some(e => e.id === eqId)) return 'Уже куплено!';
  state = {
    ...state,
    equipment: [...state.equipment, { ...item }],
    money: state.money - item.price,
  };
  saveGame(); notify();
  return `Куплено: ${item.name}! -${item.price}$`;
}

// === CONCERTS ===
export function playConcert(venueId: string): ConcertResult | string {
  if (!state) return 'Нет данных';
  const venue = VENUES.find(v => v.id === venueId);
  if (!venue) return 'Площадка не найдена';
  if (state.fame < venue.minFame) return 'Недостаточно славы!';
  if (state.songs.length === 0) return 'Нет песен для выступления!';
  if (state.members.length < 2) return 'Нужно минимум 2 участника!';

  const avgSkill = state.members.reduce((s, m) => s + m.stats.skill, 0) / state.members.length;
  const avgCharisma = state.members.reduce((s, m) => s + m.stats.charisma, 0) / state.members.length;
  const eqBonus = getEquipmentBonus();
  const songBonus = Math.min(50, state.songs.reduce((s, song) => s + song.quality, 0) / state.songs.length);

  const performance = (avgSkill * 0.3 + avgCharisma * 0.3 + eqBonus * 0.2 + songBonus * 0.2);
  const crowdMood = Math.min(100, Math.floor(performance + (Math.random() * 20 - 10)));
  const fillRate = Math.min(1, (crowdMood / 100) * (0.5 + state.fame / (venue.minFame + 100) * 0.5));
  const attendance = Math.floor(venue.capacity * fillRate);
  const earnings = attendance * venue.payPerHead;
  const fameGained = Math.floor(FAME_FROM_CONCERT_BASE * (crowdMood / 50) * (1 + attendance / 500));

  const events: string[] = [];
  if (crowdMood > 85) events.push('🔥 Толпа в экстазе!');
  if (crowdMood > 70) events.push('👏 Стоячие овации!');
  if (crowdMood < 30) events.push('😒 Публика скучает...');
  if (attendance >= venue.capacity * 0.95) events.push('🎟️ Sold out!');
  if (Math.random() > 0.8) events.push('📰 Музыкальный блогер в зале!');

  const result: ConcertResult = { venueId, attendance, earnings, fameGained, crowdMood, events };
  
  const isStadium = venue.type === 'stadium';
  state = {
    ...state,
    money: state.money + earnings,
    fame: Math.min(1000, state.fame + fameGained),
    fans: state.fans + attendance,
    concertHistory: [...state.concertHistory, result],
    hasWon: state.hasWon || isStadium,
    week: state.week + 1,
  };

  // Weekly expenses
  const salaries = state.members.reduce((s, m) => s + m.salary, 0);
  state.money -= (WEEKLY_EXPENSES.baseCost + salaries);

  // Album sales
  state.albums.forEach(a => {
    const weekSales = Math.floor(a.quality * state.fans / 5000 * (Math.random() * 0.5 + 0.75));
    a.salesTotal += weekSales;
    state!.money += weekSales;
  });

  // Stamina recovery
  state.members = state.members.map(m => ({
    ...m,
    stats: { ...m.stats, stamina: Math.min(100, m.stats.stamina + 5) }
  }));

  saveGame(); notify();
  return result;
}

// === HELPERS ===
function getEquipmentBonus(): number {
  if (!state) return 0;
  const qualities = state.equipment.map(e => e.quality);
  if (qualities.length === 0) return 0;
  return qualities.reduce((s, q) => s + q, 0) / qualities.length;
}

export function getAvailableVenues() {
  if (!state) return [];
  return VENUES.filter(v => v.minFame <= state!.fame);
}

export function advanceWeek(): string {
  if (!state) return '';
  state = { ...state, week: state.week + 1 };
  const salaries = state.members.reduce((s, m) => s + m.salary, 0);
  const expenses = WEEKLY_EXPENSES.baseCost + salaries;
  state.money -= expenses;

  // Creativity recovery
  state.members = state.members.map(m => ({
    ...m,
    stats: {
      ...m.stats,
      stamina: Math.min(100, m.stats.stamina + 10),
      creativity: Math.min(100, m.stats.creativity + 1),
    }
  }));

  saveGame(); notify();
  return `Неделя ${state.week}. Расходы: ${expenses}$`;
}
