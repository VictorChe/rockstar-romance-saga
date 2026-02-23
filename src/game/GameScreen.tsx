import React, { useState } from 'react';
import { useGameState } from './useGameState';
import { setScreen, rehearse, advanceWeek, generateHirePool, hireMember, fireMember, writeSong, recordSong, releaseAlbum, buyEquipment, playConcert, getAvailableVenues } from './store';
import { CharacterCard } from './PixelAvatar';
import { EQUIPMENT_CATALOG, GENRES, SONG_THEMES, VENUES } from './constants';
import ConcertScene from './ConcertScene';
import { ConcertResult, Character } from './types';

// === GAME HUD ===
const GameHUD: React.FC = () => {
  const state = useGameState();
  if (!state) return null;

  return (
    <div className="bg-card border-b border-border p-3 font-mono text-sm">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="font-bold text-foreground">🎸 {state.bandName}</span>
          <span className="text-muted-foreground">Неделя {state.week}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-green-500">💰 ${state.money}</span>
          <span className="text-yellow-500">⭐ {state.fame}</span>
          <span className="text-pink-500">👥 {state.fans}</span>
          <span className="text-muted-foreground">🎵 {state.songs.length} песен</span>
        </div>
      </div>
    </div>
  );
};

// === NAV ===
const NavButton: React.FC<{ label: string; screen: string; current: string; onClick: () => void }> = ({ label, screen, current, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded font-mono text-sm transition-colors
      ${current === screen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
  >
    {label}
  </button>
);

// === MAIN GAME SCREEN ===
const GameScreen: React.FC = () => {
  const state = useGameState();
  const [message, setMessage] = useState('');
  const [hirePool, setHirePool] = useState<Character[]>([]);
  const [songName, setSongName] = useState('');
  const [songGenre, setSongGenre] = useState(GENRES[0].value);
  const [songTheme, setSongTheme] = useState(SONG_THEMES[0].value);
  const [albumName, setAlbumName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [concertResult, setConcertResult] = useState<ConcertResult | null>(null);
  const [concertVenue, setConcertVenue] = useState<typeof VENUES[0] | null>(null);

  if (!state) return null;

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const nav = (
    <div className="flex flex-wrap gap-1 p-2 bg-card border-b border-border">
      {[
        { label: '🏠 Штаб', screen: 'hq' },
        { label: '👥 Состав', screen: 'members' },
        { label: '🛒 Магазин', screen: 'shop' },
        { label: '🎵 Сочинять', screen: 'songwriting' },
        { label: '🎧 Репетиция', screen: 'rehearsal' },
        { label: '💿 Студия', screen: 'studio' },
        { label: '🎤 Концерт', screen: 'booking' },
      ].map(n => (
        <NavButton key={n.screen} {...n} current={state.screen} onClick={() => setScreen(n.screen as any)} />
      ))}
    </div>
  );

  const renderContent = () => {
    switch (state.screen) {
      case 'hq':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-foreground">🏠 Штаб-квартира</h2>
            {state.hasWon && (
              <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-center font-mono">
                🏆 Вы покорили стадион! Но можно продолжать!
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-mono font-bold text-card-foreground mb-2">📊 Статистика</h3>
                <div className="space-y-1 text-sm font-mono text-muted-foreground">
                  <p>Участников: {state.members.length}</p>
                  <p>Песен: {state.songs.length}</p>
                  <p>Альбомов: {state.albums.length}</p>
                  <p>Концертов: {state.concertHistory.length}</p>
                  <p>Слава: {state.fame}/1000</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-mono font-bold text-card-foreground mb-2">💡 Совет</h3>
                <p className="text-sm font-mono text-muted-foreground">
                  {state.members.length < 2 && 'Наймите участников в разделе "Состав"!'}
                  {state.members.length >= 2 && state.songs.length === 0 && 'Напишите первую песню!'}
                  {state.songs.length > 0 && state.concertHistory.length === 0 && 'Пора сыграть первый концерт!'}
                  {state.concertHistory.length > 0 && state.fame < 100 && 'Играйте больше концертов для славы!'}
                  {state.fame >= 100 && state.albums.length === 0 && 'Запишите и выпустите альбом!'}
                  {state.fame >= 100 && state.albums.length > 0 && 'Покупайте лучшее оборудование и покоряйте большие площадки!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => showMsg(advanceWeek())}
              className="px-4 py-2 bg-muted text-muted-foreground rounded font-mono hover:bg-muted/80 transition-colors"
            >
              ⏭️ Пропустить неделю
            </button>
          </div>
        );

      case 'members':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-foreground">👥 Состав группы</h2>
            <div className="grid gap-3">
              {state.members.map(m => (
                <CharacterCard key={m.id} character={m} actions={
                  !m.isPlayer && (
                    <button onClick={() => { fireMember(m.id); showMsg(`${m.name} уволен`); }}
                      className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded font-mono">
                      Уволить
                    </button>
                  )
                } />
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono font-bold text-foreground">Нанять музыканта</h3>
                <button onClick={() => setHirePool(generateHirePool())}
                  className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded font-mono">
                  🔄 Обновить список
                </button>
              </div>
              {hirePool.length === 0 && (
                <p className="text-sm text-muted-foreground font-mono">Нажмите "Обновить список"</p>
              )}
              <div className="grid gap-3">
                {hirePool.map(m => (
                  <CharacterCard key={m.id} character={m} actions={
                    <button onClick={() => { hireMember(m); setHirePool(p => p.filter(x => x.id !== m.id)); showMsg(`${m.name} нанят!`); }}
                      className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded font-mono">
                      Нанять (${m.salary}/нед)
                    </button>
                  } />
                ))}
              </div>
            </div>
          </div>
        );

      case 'shop':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-foreground">🛒 Магазин</h2>
            <div className="grid gap-2">
              {EQUIPMENT_CATALOG.filter(e => e.price > 0).map(eq => {
                const owned = state.equipment.some(e => e.id === eq.id);
                return (
                  <div key={eq.id} className="flex items-center justify-between p-3 bg-card border border-border rounded">
                    <div>
                      <span className="font-mono font-bold text-card-foreground">{eq.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{eq.description}</span>
                      <div className="text-xs text-muted-foreground font-mono">Качество: {eq.quality}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-green-500">${eq.price}</span>
                      {owned ? (
                        <span className="text-xs text-muted-foreground font-mono">✓ Есть</span>
                      ) : (
                        <button onClick={() => showMsg(buyEquipment(eq.id))}
                          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded font-mono">
                          Купить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'rehearsal':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-foreground">🎧 Репетиция</h2>
            <p className="text-muted-foreground font-mono text-sm">Стоимость: $50. Улучшает навыки всех участников.</p>
            <div className="grid gap-3">
              {state.members.map(m => <CharacterCard key={m.id} character={m} />)}
            </div>
            <button onClick={() => showMsg(rehearse())}
              className="px-6 py-3 bg-primary text-primary-foreground rounded font-mono font-bold hover:opacity-90">
              🎵 Репетировать ($50)
            </button>
          </div>
        );

      case 'songwriting':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-foreground">🎵 Сочинить песню</h2>
            <input value={songName} onChange={e => setSongName(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded font-mono text-foreground"
              placeholder="Название песни..." maxLength={30} />
            <div>
              <label className="text-sm font-mono text-muted-foreground">Жанр</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {GENRES.map(g => (
                  <button key={g.value} onClick={() => setSongGenre(g.value)}
                    className={`px-3 py-1 rounded font-mono text-sm border-2 transition-colors
                      ${songGenre === g.value ? 'border-primary bg-primary/20 text-foreground' : 'border-border text-muted-foreground'}`}>
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-mono text-muted-foreground">Тема</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SONG_THEMES.map(t => (
                  <button key={t.value} onClick={() => setSongTheme(t.value)}
                    className={`px-3 py-1 rounded font-mono text-sm border-2 transition-colors
                      ${songTheme === t.value ? 'border-primary bg-primary/20 text-foreground' : 'border-border text-muted-foreground'}`}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { if (songName.trim()) { showMsg(writeSong(songName.trim(), songGenre, songTheme)); setSongName(''); } }}
              disabled={!songName.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded font-mono font-bold hover:opacity-90 disabled:opacity-50">
              ✍️ Написать песню
            </button>

            {state.songs.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="font-mono font-bold text-foreground mb-2">📋 Ваши песни</h3>
                <div className="space-y-2">
                  {state.songs.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 bg-card border border-border rounded text-sm font-mono">
                      <div>
                        <span className="text-card-foreground">{s.name}</span>
                        <span className="ml-2 text-muted-foreground">{GENRES.find(g => g.value === s.genre)?.emoji} {SONG_THEMES.find(t => t.value === s.theme)?.emoji}</span>
                        <span className="ml-2 text-muted-foreground">Q:{s.quality}</span>
                      </div>
                      <span className={s.recorded ? 'text-green-500' : 'text-muted-foreground'}>
                        {s.recorded ? '💿 Записана' : '📝 Не записана'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'studio':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-foreground">💿 Студия</h2>
            <div className="space-y-2">
              <h3 className="font-mono text-foreground">Записать песню ($300)</h3>
              {state.songs.filter(s => !s.recorded).map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-card border border-border rounded font-mono text-sm">
                  <span className="text-card-foreground">{s.name} (Q:{s.quality})</span>
                  <button onClick={() => showMsg(recordSong(s.id))}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs">
                    Записать ($300)
                  </button>
                </div>
              ))}
              {state.songs.filter(s => !s.recorded).length === 0 && (
                <p className="text-sm text-muted-foreground font-mono">Нет незаписанных песен</p>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="font-mono font-bold text-foreground">Выпустить альбом</h3>
              <input value={albumName} onChange={e => setAlbumName(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded font-mono text-foreground"
                placeholder="Название альбома..." />
              <div className="space-y-1">
                {state.songs.filter(s => s.recorded).map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 bg-card border border-border rounded font-mono text-sm cursor-pointer">
                    <input type="checkbox" checked={selectedSongs.includes(s.id)}
                      onChange={e => setSelectedSongs(prev =>
                        e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id)
                      )} />
                    <span className="text-card-foreground">{s.name} (Q:{s.quality})</span>
                  </label>
                ))}
              </div>
              <button onClick={() => {
                if (albumName.trim()) {
                  showMsg(releaseAlbum(albumName.trim(), selectedSongs));
                  setAlbumName('');
                  setSelectedSongs([]);
                }
              }}
                disabled={!albumName.trim() || selectedSongs.length < 3}
                className="px-6 py-3 bg-primary text-primary-foreground rounded font-mono font-bold hover:opacity-90 disabled:opacity-50">
                💿 Выпустить альбом (мин. 3 песни)
              </button>
            </div>
          </div>
        );

      case 'booking':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-foreground">🎤 Забронировать концерт</h2>
            <div className="grid gap-3">
              {VENUES.map(v => {
                const available = state.fame >= v.minFame;
                return (
                  <div key={v.id} className={`p-4 border rounded-lg font-mono ${available ? 'bg-card border-border' : 'bg-muted/50 border-border/50 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-card-foreground">{v.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{v.description}</span>
                        <div className="text-xs text-muted-foreground mt-1">
                          👥 {v.capacity} мест • 💰 ${v.payPerHead}/чел • ⭐ {v.minFame} славы
                        </div>
                      </div>
                      {available ? (
                        <button onClick={() => {
                          const result = playConcert(v.id);
                          if (typeof result === 'string') {
                            showMsg(result);
                          } else {
                            setConcertResult(result);
                            setConcertVenue(v);
                            setScreen('concert');
                          }
                        }}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">
                          Играть! 🎸
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">🔒 Нужно {v.minFame} славы</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'concert':
        if (concertResult && concertVenue) {
          return (
            <ConcertScene
              members={state.members}
              venue={concertVenue}
              result={concertResult}
              genre={state.songs.length > 0 ? state.songs[state.songs.length - 1].genre : 'rock'}
              onFinish={() => {
                setScreen('concert-result');
              }}
            />
          );
        }
        return <p className="text-muted-foreground font-mono">Ошибка: нет данных концерта</p>;

      case 'concert-result':
        if (concertResult && concertVenue) {
          return (
            <div className="max-w-md mx-auto space-y-4 text-center">
              <h2 className="text-2xl font-mono font-bold text-foreground">🎤 Результаты концерта</h2>
              <div className="bg-card border border-border rounded-lg p-6 space-y-3 font-mono">
                <p className="text-lg text-card-foreground">{concertVenue.name}</p>
                <div className="space-y-2 text-sm">
                  <p>👥 Посещаемость: {concertResult.attendance}/{concertVenue.capacity}</p>
                  <p>😊 Настроение: {concertResult.crowdMood}%</p>
                  <p className="text-green-500 text-lg">💰 Заработок: ${concertResult.earnings}</p>
                  <p className="text-yellow-500">⭐ Слава: +{concertResult.fameGained}</p>
                </div>
                {concertResult.events.length > 0 && (
                  <div className="border-t border-border pt-3 space-y-1">
                    {concertResult.events.map((e, i) => (
                      <p key={i} className="text-sm text-muted-foreground">{e}</p>
                    ))}
                  </div>
                )}
                {state.hasWon && state.concertHistory.length === 1 && (
                  <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-500 font-bold">
                    🏆 Вы покорили стадион! Поздравляем!
                  </div>
                )}
              </div>
              <button onClick={() => { setConcertResult(null); setConcertVenue(null); setScreen('hq'); }}
                className="px-6 py-3 bg-primary text-primary-foreground rounded font-mono font-bold">
                Продолжить →
              </button>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GameHUD />
      {nav}
      {message && (
        <div className="fixed top-4 right-4 bg-card border border-border rounded-lg px-4 py-2 font-mono text-sm text-card-foreground shadow-lg z-50">
          {message}
        </div>
      )}
      <div className="max-w-4xl mx-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default GameScreen;
