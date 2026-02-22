import { Equipment, Venue, MusicGenre, SongTheme } from './types';

// === EQUIPMENT CATALOG ===
export const EQUIPMENT_CATALOG: Equipment[] = [
  // Guitars
  { id: 'guitar-starter', name: 'Старая гитара', type: 'instrument', forInstrument: 'guitar', quality: 15, price: 0, description: 'Потрёпанная, но играет' },
  { id: 'guitar-mid', name: 'Fender Standard', type: 'instrument', forInstrument: 'guitar', quality: 45, price: 800, description: 'Классическое звучание' },
  { id: 'guitar-pro', name: 'Gibson Les Paul', type: 'instrument', forInstrument: 'guitar', quality: 75, price: 2500, description: 'Легендарный тон' },
  { id: 'guitar-elite', name: 'Custom Shop', type: 'instrument', forInstrument: 'guitar', quality: 95, price: 8000, description: 'Шедевр мастера' },

  // Bass
  { id: 'bass-starter', name: 'Дешёвый бас', type: 'instrument', forInstrument: 'bass', quality: 15, price: 0, description: 'Гудит, но работает' },
  { id: 'bass-mid', name: 'Fender Jazz Bass', type: 'instrument', forInstrument: 'bass', quality: 50, price: 900, description: 'Тёплый низ' },
  { id: 'bass-pro', name: 'Music Man', type: 'instrument', forInstrument: 'bass', quality: 80, price: 3000, description: 'Мощь и точность' },

  // Drums
  { id: 'drums-starter', name: 'Старая ударка', type: 'drums', forInstrument: 'drums', quality: 15, price: 0, description: 'Гремит как ведро' },
  { id: 'drums-mid', name: 'Pearl Export', type: 'drums', forInstrument: 'drums', quality: 50, price: 1200, description: 'Надёжный звук' },
  { id: 'drums-pro', name: 'DW Collector', type: 'drums', forInstrument: 'drums', quality: 85, price: 5000, description: 'Барабаны мечты' },

  // Vocals/Mic
  { id: 'mic-starter', name: 'Дешёвый микрофон', type: 'mic', forInstrument: 'vocals', quality: 15, price: 0, description: 'Фонит' },
  { id: 'mic-mid', name: 'Shure SM58', type: 'mic', forInstrument: 'vocals', quality: 55, price: 400, description: 'Стандарт индустрии' },
  { id: 'mic-pro', name: 'Neumann U87', type: 'mic', forInstrument: 'vocals', quality: 90, price: 4000, description: 'Студийная легенда' },

  // Keyboard
  { id: 'keys-starter', name: 'Синтезатор б/у', type: 'keys', forInstrument: 'keyboard', quality: 15, price: 0, description: 'Половина клавиш залипает' },
  { id: 'keys-mid', name: 'Nord Stage', type: 'keys', forInstrument: 'keyboard', quality: 60, price: 2000, description: 'Богатые тембры' },
  { id: 'keys-pro', name: 'Moog One', type: 'keys', forInstrument: 'keyboard', quality: 90, price: 6000, description: 'Аналоговая мощь' },

  // PA System
  { id: 'pa-basic', name: 'Колонки из гаража', type: 'pa', quality: 10, price: 0, description: 'Хрипят на громкости' },
  { id: 'pa-mid', name: 'QSC K12.2', type: 'pa', quality: 50, price: 1500, description: 'Чистый звук' },
  { id: 'pa-pro', name: 'Line Array', type: 'pa', quality: 85, price: 8000, description: 'Стадионный звук' },

  // Lights
  { id: 'lights-basic', name: 'Лампочка в гараже', type: 'lights', quality: 5, price: 0, description: 'Тусклая' },
  { id: 'lights-mid', name: 'LED Par Set', type: 'lights', quality: 40, price: 800, description: 'Цветные пятна' },
  { id: 'lights-pro', name: 'Pro Light Show', type: 'lights', quality: 80, price: 5000, description: 'Лазеры и стробоскопы' },
  { id: 'lights-elite', name: 'Stadium Rig', type: 'lights', quality: 100, price: 15000, description: 'Как у Pink Floyd' },
];

// === VENUES ===
export const VENUES: Venue[] = [
  { id: 'garage', name: 'Гараж друга', capacity: 20, minFame: 0, payPerHead: 5, description: 'Тесно, но душевно', type: 'bar' },
  { id: 'bar', name: 'Бар "Подвал"', capacity: 50, minFame: 10, payPerHead: 8, description: 'Пивной дым и рок', type: 'bar' },
  { id: 'pub', name: 'Паб "Три Аккорда"', capacity: 100, minFame: 30, payPerHead: 12, description: 'Живая музыка каждый вечер', type: 'bar' },
  { id: 'club-small', name: 'Клуб "Гром"', capacity: 250, minFame: 80, payPerHead: 15, description: 'Настоящая рок-площадка', type: 'club' },
  { id: 'club-big', name: 'Клуб "Вольт"', capacity: 500, minFame: 150, payPerHead: 20, description: 'Два этажа рока', type: 'club' },
  { id: 'theater', name: 'Концертный зал', capacity: 1500, minFame: 300, payPerHead: 30, description: 'Акустика мечты', type: 'theater' },
  { id: 'arena', name: 'Арена "Рок-Купол"', capacity: 5000, minFame: 500, payPerHead: 45, description: 'Свет, звук, масштаб', type: 'arena' },
  { id: 'stadium', name: 'Стадион "Олимп"', capacity: 30000, minFame: 800, payPerHead: 60, description: 'Вершина рока!', type: 'stadium' },
];

// === HIRE POOL ===
export const MUSICIAN_NAMES: Record<string, string[]> = {
  guitar: ['Слэш', 'Ангус', 'Джимми', 'Кирк', 'Ритчи', 'Тони'],
  bass: ['Фли', 'Лемми', 'Гедди', 'Клифф', 'Джон Пол', 'Дафф'],
  drums: ['Бонзо', 'Нил', 'Дэйв', 'Ларс', 'Кит', 'Чад'],
  vocals: ['Фредди', 'Роберт', 'Оззи', 'Аксель', 'Боно', 'Игги'],
  keyboard: ['Джон', 'Рик', 'Рэй', 'Кит', 'Тони', 'Ян'],
};

export const GENRES: { value: MusicGenre; label: string; emoji: string }[] = [
  { value: 'rock', label: 'Рок', emoji: '🎸' },
  { value: 'punk', label: 'Панк', emoji: '🤘' },
  { value: 'metal', label: 'Метал', emoji: '🔥' },
  { value: 'indie', label: 'Инди', emoji: '🌿' },
  { value: 'grunge', label: 'Гранж', emoji: '⛓️' },
  { value: 'alternative', label: 'Альтернатива', emoji: '🌀' },
];

export const SONG_THEMES: { value: SongTheme; label: string; emoji: string }[] = [
  { value: 'love', label: 'Любовь', emoji: '❤️' },
  { value: 'rebellion', label: 'Бунт', emoji: '✊' },
  { value: 'party', label: 'Вечеринка', emoji: '🎉' },
  { value: 'darkness', label: 'Тьма', emoji: '🌑' },
  { value: 'freedom', label: 'Свобода', emoji: '🕊️' },
  { value: 'society', label: 'Общество', emoji: '🏙️' },
  { value: 'loneliness', label: 'Одиночество', emoji: '🌧️' },
  { value: 'adventure', label: 'Приключения', emoji: '🗺️' },
];

// === BALANCE CONSTANTS ===
export const INITIAL_MONEY = 500;
export const REHEARSAL_COST = 50;
export const REHEARSAL_SKILL_GAIN = 2; // per member
export const RECORDING_COST_PER_SONG = 300;
export const ALBUM_RECORDING_BONUS = 1.2; // quality multiplier for albums

export const FAME_FROM_CONCERT_BASE = 5;
export const FAME_FROM_ALBUM = 20;
export const FANS_PER_FAME = 50;

export const SONG_QUALITY_FORMULA = {
  skillWeight: 0.4,
  creativityWeight: 0.35,
  equipmentWeight: 0.25,
};

export const WEEKLY_EXPENSES = {
  baseCost: 100, // rent etc
};
