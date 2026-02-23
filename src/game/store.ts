import { GameState, GameScreen, Character, Song, Equipment, ConcertResult, MusicGenre, SongTheme, Album, CrewMember, GigFormatId } from './types';
import {
  INITIAL_MONEY, REHEARSAL_COST, REHEARSAL_SKILL_GAIN, RECORDING_COST_PER_SONG,
  FAME_FROM_CONCERT_BASE, SONG_QUALITY_FORMULA, VENUES, EQUIPMENT_CATALOG, MUSICIAN_NAMES,
  FAME_FROM_ALBUM, FANS_PER_FAME, WEEKLY_EXPENSES, ALBUM_RECORDING_BONUS,
  GIG_FORMATS, MIN_FAME_HEADLINE, CREW_NAMES, FRIEND_SHARE_PERCENT,
  STREET_GIG_BASE, STREET_GIG_FAME_FACTOR, RADIO_PAY_BASE, RADIO_FAME_FACTOR, RADIO_FAME_GAIN,
  INTERVIEW_PAY_BASE, INTERVIEW_FAME_GAIN, MANAGER_PAY_MULTIPLIER, MANAGER_FAME_MULTIPLIER,
  SOUND_ENGINEER_MOOD_BONUS,
} from './constants';

const SAVE_KEY = 'rock-tycoon-save';

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

function migrateState(s: GameState): GameState {
  const crew = s.crew ?? [];
  const members = (s.members ?? []).map(m => ({
    ...m,
    role: m.role ?? 'musician' as const,
    contract: m.contract ?? 'pro' as const,
  }));
  return { ...s, crew, members };
}

export function loadGame(): boolean {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      state = migrateState(parsed);
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
    instrument: playerInstrument as Character['instrument'],
    stats: { skill: 20, charisma: 25, creativity: 20, stamina: 30 },
    avatarSeed,
    salary: 0,
    isPlayer: true,
    role: 'musician',
    contract: 'pro',
  };
  state = {
    playerName, bandName,
    members: [player],
    crew: [],
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

function getMusicians(): Character[] {
  if (!state) return [];
  return state.members.filter(m => m.role === 'musician' || !m.role);
}

// === GENERATE HIREABLE MUSICIANS (pros) ===
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
      role: 'musician',
      contract: 'pro',
    });
  }
  return pool;
}

// === FRIEND MUSICIANS (no salary, share of concert) ===
export function generateFriendPool(count = 3): Character[] {
  const instruments = ['guitar', 'bass', 'drums', 'vocals', 'keyboard'] as const;
  const pool: Character[] = [];
  for (let i = 0; i < count; i++) {
    const inst = instruments[Math.floor(Math.random() * instruments.length)];
    const names = MUSICIAN_NAMES[inst];
    const name = names[Math.floor(Math.random() * names.length)];
    const skill = 20 + Math.floor(Math.random() * 35); // max ~55
    pool.push({
      id: `friend-${Date.now()}-${i}`,
      name,
      instrument: inst,
      stats: {
        skill,
        charisma: 10 + Math.floor(Math.random() * 30),
        creativity: 10 + Math.floor(Math.random() * 30),
        stamina: 25 + Math.floor(Math.random() * 25),
      },
      avatarSeed: Math.floor(Math.random() * 10000),
      salary: 0,
      isPlayer: false,
      role: 'musician',
      contract: 'friend',
    });
  }
  return pool;
}

export function hireMember(char: Character) {
  if (!state) return;
  state = { ...state, members: [...state.members, char] };
  saveGame();
  notify();
}

export function fireMember(id: string) {
  if (!state) return;
  state = { ...state, members: state.members.filter(m => m.id !== id) };
  saveGame();
  notify();
}

// === CREW (manager, sound_engineer, tech) ===
export function generateCrewPool(role: CrewMember['role'], count = 2): CrewMember[] {
  const names = CREW_NAMES[role];
  const pool: CrewMember[] = [];
  const salaryBase = role === 'manager' ? 120 : role === 'sound_engineer' ? 150 : 80;
  for (let i = 0; i < count; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    pool.push({
      id: `crew-${role}-${Date.now()}-${i}`,
      name,
      role,
      salary: salaryBase + Math.floor(Math.random() * 60),
    });
  }
  return pool;
}

export function hireCrew(crew: CrewMember): string {
  if (!state) return '';
  if (state.money < crew.salary) return 'Недостаточно денег!';
  const after = state.money - crew.salary;
  if (after < 0) return 'Недостаточно денег!';
  state = { ...state, crew: [...state.crew, crew], money: after };
  saveGame();
  notify();
  return `Нанят: ${crew.name} (${crew.role}). -${crew.salary}$/нед`;
}

export function fireCrew(id: string) {
  if (!state) return;
  state = { ...state, crew: state.crew.filter(c => c.id !== id) };
  saveGame();
  notify();
}

// === REHEARSAL (no negative money) ===
export function rehearse(): string {
  if (!state) return '';
  if (state.money < REHEARSAL_COST) return 'Недостаточно денег!';
  const newMembers = state.members.map(m => ({
    ...m,
    stats: {
      ...m.stats,
      skill: Math.min(100, m.stats.skill + REHEARSAL_SKILL_GAIN + Math.floor(Math.random() * 2)),
      stamina: Math.max(0, m.stats.stamina - 3),
    },
  }));
  state = { ...state, members: newMembers, money: state.money - REHEARSAL_COST };
  saveGame();
  notify();
  return `Репетиция прошла! Навыки улучшены. -${REHEARSAL_COST}$`;
}

// === SONGWRITING ===
export function writeSong(name: string, genre: MusicGenre, theme: SongTheme): string {
  if (!state) return '';
  const musicians = getMusicians();
  const avgSkill = musicians.length ? musicians.reduce((s, m) => s + m.stats.skill, 0) / musicians.length : 20;
  const avgCreativity = musicians.length ? musicians.reduce((s, m) => s + m.stats.creativity, 0) / musicians.length : 20;
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
  saveGame();
  notify();
  return `Песня "${name}" написана! Качество: ${song.quality}`;
}

// === RECORDING (no negative money) ===
export function recordSong(songId: string): string {
  if (!state) return '';
  if (state.money < RECORDING_COST_PER_SONG) return 'Недостаточно денег!';
  const songs = state.songs.map(s => s.id === songId ? { ...s, recorded: true } : s);
  state = { ...state, songs, money: state.money - RECORDING_COST_PER_SONG };
  saveGame();
  notify();
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
  saveGame();
  notify();
  return `Альбом "${name}" выпущен! Качество: ${quality}. Слава +${fameGain}`;
}

// === SHOP (no negative money) ===
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
  saveGame();
  notify();
  return `Куплено: ${item.name}! -${item.price}$`;
}

// === VENUE REQUIREMENTS ===
function venueRequirementsMet(venueId: string): { ok: boolean; msg?: string } {
  if (!state) return { ok: false, msg: 'Нет данных' };
  const venue = VENUES.find(v => v.id === venueId);
  if (!venue) return { ok: false, msg: 'Площадка не найдена' };
  const ids = venue.requiredEquipmentIds ?? [];
  for (const id of ids) {
    if (!state.equipment.some(e => e.id === id)) {
      const eq = EQUIPMENT_CATALOG.find(e => e.id === id);
      return { ok: false, msg: `Нужно оборудование: ${eq?.name ?? id}` };
    }
  }
  if (venue.requiresSoundEngineer) {
    const hasSound = state.crew.some(c => c.role === 'sound_engineer' || c.role === 'tech');
    if (!hasSound) return { ok: false, msg: 'Нужен звуковик или техник' };
  }
  return { ok: true };
}

// === PROCESS WEEK END (expenses, album sales, stamina) ===
function processWeekEnd(concertEarningsDelta: number = 0): void {
  if (!state) return;
  state.money += concertEarningsDelta;
  const memberSalaries = state.members.reduce((s, m) => s + (m.salary ?? 0), 0);
  const crewSalaries = state.crew.reduce((s, c) => s + c.salary, 0);
  const expenses = WEEKLY_EXPENSES.baseCost + memberSalaries + crewSalaries;
  state.money -= expenses;
  if (state.money < 0) state.money = 0;

  state.albums.forEach(a => {
    const weekSales = Math.floor(a.quality * state!.fans / 5000 * (Math.random() * 0.5 + 0.75));
    a.salesTotal += weekSales;
    state!.money += weekSales;
  });

  state.members = state.members.map(m => ({
    ...m,
    stats: { ...m.stats, stamina: Math.min(100, m.stats.stamina + 5) },
  }));
  state.week += 1;
}

// === CONCERTS (with format, venue requirements, friend share, manager/sound) ===
export function playConcert(venueId: string, gigFormatId: GigFormatId): ConcertResult | string {
  if (!state) return 'Нет данных';
  const venue = VENUES.find(v => v.id === venueId);
  if (!venue) return 'Площадка не найдена';
  const format = GIG_FORMATS.find(f => f.id === gigFormatId);
  if (!format) return 'Формат не найден';

  const req = venueRequirementsMet(venueId);
  if (!req.ok) return req.msg!;
  if (state.fame < venue.minFame) return 'Недостаточно славы!';
  if (state.songs.length < format.minSongs) return `Нужно минимум ${format.minSongs} песен для формата "${format.name}"`;
  if (format.minFame != null && state.fame < format.minFame) return `Для хедлайнера нужно ${format.minFame} славы`;

  const musicians = getMusicians();
  if (musicians.length < 2) return 'Нужно минимум 2 музыканта!';

  const avgSkill = musicians.reduce((s, m) => s + m.stats.skill, 0) / musicians.length;
  const avgCharisma = musicians.reduce((s, m) => s + m.stats.charisma, 0) / musicians.length;
  const eqBonus = getEquipmentBonus();
  const songBonus = Math.min(50, state.songs.reduce((s, song) => s + song.quality, 0) / state.songs.length);
  const hasSoundEngineer = state.crew.some(c => c.role === 'sound_engineer' || c.role === 'tech');
  const moodBonus = hasSoundEngineer ? SOUND_ENGINEER_MOOD_BONUS : 0;

  const performance = (avgSkill * 0.3 + avgCharisma * 0.3 + eqBonus * 0.2 + songBonus * 0.2) + moodBonus;
  const crowdMood = Math.min(100, Math.floor(performance + (Math.random() * 20 - 10)));
  const fillRate = Math.min(1, (crowdMood / 100) * (0.5 + state.fame / (venue.minFame + 100) * 0.5));
  const attendance = Math.floor(venue.capacity * fillRate);
  let earnings = Math.floor(attendance * venue.payPerHead * format.payMultiplier);
  let fameGained = Math.floor(FAME_FROM_CONCERT_BASE * (crowdMood / 50) * (1 + attendance / 500) * format.fameMultiplier);

  const hasManager = state.crew.some(c => c.role === 'manager');
  if (hasManager) {
    earnings = Math.floor(earnings * MANAGER_PAY_MULTIPLIER);
    fameGained = Math.floor(fameGained * MANAGER_FAME_MULTIPLIER);
  }

  const friends = state.members.filter(m => m.contract === 'friend');
  const rawFriendShare = friends.length > 0 ? Math.floor(earnings * (FRIEND_SHARE_PERCENT / 100)) : 0;
  const expenses = WEEKLY_EXPENSES.baseCost +
    state.members.reduce((s, m) => s + (m.salary ?? 0), 0) +
    state.crew.reduce((s, c) => s + c.salary, 0);
  const minNet = Math.max(0, expenses - state.money);
  const friendShare = Math.min(rawFriendShare, Math.max(0, earnings - minNet));
  const netEarnings = earnings - friendShare;
  state.money += netEarnings;

  const events: string[] = [];
  if (crowdMood > 85) events.push('🔥 Толпа в экстазе!');
  if (crowdMood > 70) events.push('👏 Стоячие овации!');
  if (crowdMood < 30) events.push('😒 Публика скучает...');
  if (attendance >= venue.capacity * 0.95) events.push('🎟️ Sold out!');
  if (Math.random() > 0.8) events.push('📰 Музыкальный блогер в зале!');

  const result: ConcertResult = {
    venueId,
    gigFormatId,
    attendance,
    earnings: netEarnings,
    fameGained,
    crowdMood,
    events,
  };

  state.fame = Math.min(1000, state.fame + fameGained);
  state.fans = state.fans + attendance;
  state.concertHistory = [...state.concertHistory, result];
  if (venue.type === 'stadium') state.hasWon = true;

  processWeekEnd(0);
  saveGame();
  notify();
  return result;
}

// === ALTERNATIVE INCOME ===
export function performStreetGig(): string {
  if (!state) return '';
  const musicians = getMusicians();
  if (musicians.length < 1) return 'Нужен хотя бы один музыкант!';
  const pay = STREET_GIG_BASE + Math.floor((state.fame / 10) * STREET_GIG_FAME_FACTOR);
  const fameGain = 1;
  state.money += pay;
  state.fame = Math.min(1000, state.fame + fameGain);
  processWeekEnd(0);
  if (state.money < 0) state.money = 0;
  saveGame();
  notify();
  return `Уличное выступление: +${pay}$, слава +${fameGain}. Неделя прошла.`;
}

export function doRadioShow(): string {
  if (!state) return '';
  const pay = RADIO_PAY_BASE + Math.floor((state.fame / 10) * RADIO_FAME_FACTOR);
  state.money += pay;
  state.fame = Math.min(1000, state.fame + RADIO_FAME_GAIN);
  processWeekEnd(0);
  if (state.money < 0) state.money = 0;
  saveGame();
  notify();
  return `Радио: +${pay}$, слава +${RADIO_FAME_GAIN}. Неделя прошла.`;
}

export function doInterview(): string {
  if (!state) return '';
  state.money += INTERVIEW_PAY_BASE;
  state.fame = Math.min(1000, state.fame + INTERVIEW_FAME_GAIN);
  processWeekEnd(0);
  if (state.money < 0) state.money = 0;
  saveGame();
  notify();
  return `Интервью: +${INTERVIEW_PAY_BASE}$, слава +${INTERVIEW_FAME_GAIN}. Неделя прошла.`;
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

export function getVenueRequirementError(venueId: string): string | null {
  const r = venueRequirementsMet(venueId);
  return r.ok ? null : r.msg ?? null;
}

export function getCanPlayFormat(venueId: string, gigFormatId: GigFormatId): { ok: boolean; msg?: string } {
  if (!state) return { ok: false, msg: 'Нет данных' };
  const venue = VENUES.find(v => v.id === venueId);
  const format = GIG_FORMATS.find(f => f.id === gigFormatId);
  if (!venue || !format) return { ok: false, msg: 'Не найдено' };
  const req = venueRequirementsMet(venueId);
  if (!req.ok) return { ok: false, msg: req.msg };
  if (state.fame < venue.minFame) return { ok: false, msg: `Нужно ${venue.minFame} славы` };
  if (state.songs.length < format.minSongs) return { ok: false, msg: `Нужно ${format.minSongs} песен` };
  if (format.minFame != null && state.fame < format.minFame) return { ok: false, msg: `Для хедлайнера нужно ${format.minFame} славы` };
  if (getMusicians().length < 2) return { ok: false, msg: 'Нужно 2 музыканта' };
  return { ok: true };
}

export function advanceWeek(): string {
  if (!state) return '';
  const expenses = WEEKLY_EXPENSES.baseCost +
    state.members.reduce((s, m) => s + (m.salary ?? 0), 0) +
    state.crew.reduce((s, c) => s + c.salary, 0);
  if (state.money < expenses) return 'Недостаточно денег для расходов за неделю!';
  processWeekEnd(0);
  state.members = state.members.map(m => ({
    ...m,
    stats: {
      ...m.stats,
      stamina: Math.min(100, m.stats.stamina + 10),
      creativity: Math.min(100, m.stats.creativity + 1),
    },
  }));
  saveGame();
  notify();
  return `Неделя ${state.week}. Расходы: ${expenses}$`;
}
