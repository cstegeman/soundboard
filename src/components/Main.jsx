import Header from './Header';
import Board from './Board';
import { useEffect, useMemo, useState } from 'react';
import { play, soundId, stopAll } from '../utils/audio';
import { useLocalStorage } from '../utils/useLocalStorage';

const MAX_RECENTS = 10;
const MAX_SHORTCUTS = 9;

const Main = ({ files }) => {
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState({ reverse: false, delay: false, mono: false, speed: 1 });
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [recents, setRecents] = useLocalStorage('recents', []);

  // every sound carries its category, so pinned sections can mix categories
  const all = useMemo(
    () =>
      files.map(file => ({
        ...file,
        sounds: file.sounds.map(sound => ({ ...sound, category: file.category }))
      })),
    [files]
  );
  const allSounds = useMemo(() => all.flatMap(file => file.sounds), [all]);
  const byId = useMemo(() => new Map(allSounds.map(sound => [soundId(sound), sound])), [allSounds]);
  const pick = ids => ids.map(id => byId.get(id)).filter(Boolean);
  const favoriteSounds = useMemo(() => pick(favorites), [favorites, byId]);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [
      { category: 'favorites', title: 'Favorites', sounds: favoriteSounds },
      { category: 'recents', title: 'Recently played', sounds: pick(recents) },
      ...all
    ]
      .map(section =>
        !q || section.title.toLowerCase().includes(q)
          ? section
          : { ...section, sounds: section.sounds.filter(s => s.title.toLowerCase().includes(q)) }
      )
      .filter(section => section.sounds.length > 0);
  }, [all, favoriteSounds, recents, query]);

  // keys 1-9 play the first favorites; the badge in the Favorites section shows the key
  const shortcuts = Object.fromEntries(
    favoriteSounds.slice(0, MAX_SHORTCUTS).map((sound, i) => [soundId(sound), String(i + 1)])
  );

  const toggleFavorite = sound => {
    const id = soundId(sound);
    setFavorites(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
  };

  const playSound = sound => {
    const id = soundId(sound);
    play(
      sound.category,
      sound.name,
      settings.speed,
      settings.reverse,
      settings.delay,
      settings.mono
    );
    setRecents(prev => [id, ...prev.filter(r => r !== id)].slice(0, MAX_RECENTS));
  };

  const playRandom = sounds =>
    sounds.length && playSound(sounds[Math.floor(Math.random() * sounds.length)]);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (event.target.type === 'search') {
        return;
      }
      const favorite = /^[1-9]$/.test(event.key) && favoriteSounds[Number(event.key) - 1];
      if (event.key === 'Escape') {
        stopAll();
      } else if (event.key.toLowerCase() === 'r') {
        playRandom(allSounds);
      } else if (favorite) {
        playSound(favorite);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <>
      <Header
        settings={settings}
        onChange={(key, value) => setSettings({ ...settings, [key]: value })}
        onRandom={() => playRandom(allSounds)}
      />
      <main>
        <input
          type="search"
          placeholder="Search sounds"
          aria-label="Search sounds"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <Board
          sections={sections}
          favorites={favorites}
          shortcuts={shortcuts}
          onPlay={playSound}
          onRandom={playRandom}
          onToggleFavorite={toggleFavorite}
        />
      </main>
      <footer>&copy; 2021&ndash;{new Date().getFullYear()}</footer>
    </>
  );
};

export default Main;
