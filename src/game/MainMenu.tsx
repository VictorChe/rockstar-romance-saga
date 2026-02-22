import React, { useState } from 'react';
import { startNewGame, loadGame, deleteSave } from './store';
import { useGameState } from './useGameState';

const INSTRUMENTS = [
  { value: 'guitar', label: 'Гитара', emoji: '🎸' },
  { value: 'bass', label: 'Бас-гитара', emoji: '🎸' },
  { value: 'drums', label: 'Ударные', emoji: '🥁' },
  { value: 'vocals', label: 'Вокал', emoji: '🎤' },
  { value: 'keyboard', label: 'Клавиши', emoji: '🎹' },
];

const AVATARS = [0, 1, 2, 3, 4, 5, 6, 7];

const MainMenu: React.FC = () => {
  const [mode, setMode] = useState<'menu' | 'create'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [bandName, setBandName] = useState('');
  const [instrument, setInstrument] = useState('guitar');
  const [avatarSeed, setAvatarSeed] = useState(0);

  const hasSave = localStorage.getItem('rock-tycoon-save') !== null;

  const handleNew = () => setMode('create');
  const handleContinue = () => loadGame();
  const handleStart = () => {
    if (!playerName.trim() || !bandName.trim()) return;
    startNewGame(playerName.trim(), bandName.trim(), instrument, avatarSeed);
  };

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-mono font-bold text-center text-foreground">
            🎸 Создание персонажа
          </h1>

          <div className="space-y-2">
            <label className="block text-sm font-mono text-muted-foreground">Твоё имя</label>
            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded font-mono text-foreground"
              placeholder="Рок-звезда..."
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-mono text-muted-foreground">Название группы</label>
            <input
              value={bandName}
              onChange={e => setBandName(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded font-mono text-foreground"
              placeholder="The Rockers..."
              maxLength={25}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-mono text-muted-foreground">Аватар</label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map(seed => (
                <button
                  key={seed}
                  onClick={() => setAvatarSeed(seed)}
                  className={`w-12 h-12 rounded border-2 transition-colors flex items-center justify-center text-xl
                    ${avatarSeed === seed ? 'border-primary bg-primary/20' : 'border-border bg-card hover:border-primary/50'}`}
                >
                  {['🧑‍🎤', '👨‍🎤', '👩‍🎤', '🧔', '👱', '🧑‍🦱', '🧑‍🦰', '🧑‍🦳'][seed]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-mono text-muted-foreground">Инструмент</label>
            <div className="grid grid-cols-2 gap-2">
              {INSTRUMENTS.map(inst => (
                <button
                  key={inst.value}
                  onClick={() => setInstrument(inst.value)}
                  className={`px-3 py-2 rounded border-2 font-mono text-sm transition-colors
                    ${instrument === inst.value
                      ? 'border-primary bg-primary/20 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'}`}
                >
                  {inst.emoji} {inst.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode('menu')}
              className="flex-1 px-4 py-3 border border-border rounded font-mono text-muted-foreground hover:bg-muted transition-colors"
            >
              ← Назад
            </button>
            <button
              onClick={handleStart}
              disabled={!playerName.trim() || !bandName.trim()}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded font-mono font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Начать! 🎵
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-mono font-bold text-foreground tracking-tight">
            🎸 ROCK TYCOON
          </h1>
          <p className="text-lg text-muted-foreground font-mono">
            Создай свою рок-группу. Покори стадионы.
          </p>
        </div>

        <div className="space-y-3 max-w-xs mx-auto">
          <button
            onClick={handleNew}
            className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg font-mono font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Новая игра
          </button>
          {hasSave && (
            <>
              <button
                onClick={handleContinue}
                className="w-full px-6 py-3 border-2 border-primary text-foreground rounded-lg font-mono hover:bg-primary/10 transition-colors"
              >
                Продолжить
              </button>
              <button
                onClick={() => { deleteSave(); window.location.reload(); }}
                className="w-full px-6 py-2 text-sm text-destructive font-mono hover:underline"
              >
                Удалить сохранение
              </button>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-mono space-y-1">
          <p>🎵 Пиши песни • 🎤 Играй концерты • 💿 Записывай альбомы</p>
          <p>🏟️ Цель: сольный концерт на стадионе!</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
