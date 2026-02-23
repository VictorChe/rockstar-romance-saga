import { Equipment, Venue, MusicGenre, SongTheme, GigFormat } from './types';

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
  // Amps
  { id: 'amp-basic', name: 'Усилитель 15W', type: 'amp', forInstrument: 'guitar', quality: 20, price: 150, description: 'Для репетиций' },
  { id: 'amp-mid', name: 'Marshall 50W', type: 'amp', forInstrument: 'guitar', quality: 55, price: 1200, description: 'Классический рок' },
  { id: 'amp-pro', name: 'Mesa Boogie', type: 'amp', forInstrument: 'guitar', quality: 85, price: 3500, description: 'Студийный уровень' },
];

// === GIG FORMATS (any venue can be played in any format) ===
export const GIG_FORMATS: GigFormat[] = [
  { id: 'festival_slot', name: 'Слот на фестивале', minSongs: 2, payMultiplier: 0.4, fameMultiplier: 0.5 },
  { id: 'headline', name: 'Хедлайнер', minSongs: 3, minFame: 100, payMultiplier: 1.0, fameMultiplier: 1.0 },
  { id: 'support_act', name: 'Разогрев', minSongs: 5, payMultiplier: 0.7, fameMultiplier: 0.6 },
  { id: 'solo_show', name: 'Сольный концерт', minSongs: 10, payMultiplier: 1.5, fameMultiplier: 1.3 },
];
export const MIN_FAME_HEADLINE = 100;

// === VENUES ===
export const VENUES: Venue[] = [
  { id: 'garage', name: 'Гараж друга', capacity: 20, minFame: 0, payPerHead: 8, description: 'Тесно, но душевно', type: 'bar' },
  { id: 'bar', name: 'Бар "Подвал"', capacity: 50, minFame: 5, payPerHead: 10, description: 'Пивной дым и рок', type: 'bar' },
  { id: 'pub', name: 'Паб "Три Аккорда"', capacity: 100, minFame: 20, payPerHead: 14, description: 'Живая музыка каждый вечер', type: 'bar', requiredEquipmentIds: ['pa-basic', 'mic-starter'] },
  { id: 'club-small', name: 'Клуб "Гром"', capacity: 250, minFame: 60, payPerHead: 18, description: 'Настоящая рок-площадка', type: 'club', requiredEquipmentIds: ['pa-mid', 'mic-mid'], requiresSoundEngineer: true },
  { id: 'club-big', name: 'Клуб "Вольт"', capacity: 500, minFame: 120, payPerHead: 24, description: 'Два этажа рока', type: 'club', requiredEquipmentIds: ['pa-mid', 'mic-mid'], requiresSoundEngineer: true },
  { id: 'theater', name: 'Концертный зал', capacity: 1500, minFame: 250, payPerHead: 35, description: 'Акустика мечты', type: 'theater', requiredEquipmentIds: ['pa-pro', 'mic-pro'], requiresSoundEngineer: true },
  { id: 'arena', name: 'Арена "Рок-Купол"', capacity: 5000, minFame: 450, payPerHead: 50, description: 'Свет, звук, масштаб', type: 'arena', requiredEquipmentIds: ['pa-pro', 'mic-pro', 'lights-pro'], requiresSoundEngineer: true },
  { id: 'stadium', name: 'Стадион "Олимп"', capacity: 30000, minFame: 750, payPerHead: 65, description: 'Вершина рока!', type: 'stadium', requiredEquipmentIds: ['pa-pro', 'mic-pro', 'lights-elite'], requiresSoundEngineer: true },
];

// === HIRE POOL ===
export const MUSICIAN_NAMES: Record<string, string[]> = {
  guitar: ['Слэш', 'Ангус', 'Джимми', 'Кирк', 'Ритчи', 'Тони'],
  bass: ['Фли', 'Лемми', 'Гедди', 'Клифф', 'Джон Пол', 'Дафф'],
  drums: ['Бонзо', 'Нил', 'Дэйв', 'Ларс', 'Кит', 'Чад'],
  vocals: ['Фредди', 'Роберт', 'Оззи', 'Аксель', 'Боно', 'Игги'],
  keyboard: ['Джон', 'Рик', 'Рэй', 'Кит', 'Тони', 'Ян'],
};

export const CREW_NAMES: Record<string, string[]> = {
  manager: ['Макс', 'Дима', 'Олег', 'Саша', 'Костя', 'Владимир'],
  sound_engineer: ['Артём', 'Миша', 'Женя', 'Паша', 'Сергей', 'Андрей'],
  tech: ['Кирилл', 'Никита', 'Илья', 'Рома', 'Денис', 'Стас'],
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
export const INITIAL_MONEY = 800;
export const REHEARSAL_COST = 30;
export const REHEARSAL_SKILL_GAIN = 3; // per member
export const RECORDING_COST_PER_SONG = 200;
export const ALBUM_RECORDING_BONUS = 1.25; // quality multiplier for albums

export const FAME_FROM_CONCERT_BASE = 8;
export const FAME_FROM_ALBUM = 30;
export const FANS_PER_FAME = 40;

export const SONG_QUALITY_FORMULA = {
  skillWeight: 0.35,
  creativityWeight: 0.35,
  equipmentWeight: 0.3,
};

export const WEEKLY_EXPENSES = {
  baseCost: 60,
};

// Friend musicians: share of concert earnings (total for all friends)
export const FRIEND_SHARE_PERCENT = 20;

// Alternative income (when money is low)
export const STREET_GIG_BASE = 15;
export const STREET_GIG_FAME_FACTOR = 2; // +2$ per 10 fame
export const RADIO_PAY_BASE = 80;
export const RADIO_FAME_FACTOR = 3;
export const RADIO_FAME_GAIN = 5;
export const INTERVIEW_PAY_BASE = 50;
export const INTERVIEW_FAME_GAIN = 8;

// Manager/Sound bonuses
export const MANAGER_PAY_MULTIPLIER = 1.15;
export const MANAGER_FAME_MULTIPLIER = 1.1;
export const SOUND_ENGINEER_MOOD_BONUS = 5;
