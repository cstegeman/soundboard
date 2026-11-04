import Header from './Header';
import Board from './Board';
import { useMemo, useState } from 'react';
import { soundId } from '../utils/audio';
import { useLocalStorage } from '../utils/useLocalStorage';

const MAX_RECENTS = 10;

const Main = ({ files }) => {
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState({ reverse: false, delay: false, mono: false, speed: 1 });
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [recents, setRecents] = useLocalStorage('recents', []);

  const sections = useMemo(() => {
    // every sound carries its category, so pinned sections can mix categories
    const all = files.map(file => ({
      ...file,
      sounds: file.sounds.map(sound => ({ ...sound, category: file.category }))
    }));
    const byId = new Map(all.flatMap(file => file.sounds).map(sound => [soundId(sound), sound]));
    const pick = ids => ids.map(id => byId.get(id)).filter(Boolean);
    const q = query.trim().toLowerCase();

    return [
      { category: 'favorites', title: 'Favorites', sounds: pick(favorites) },
      { category: 'recents', title: 'Recently played', sounds: pick(recents) },
      ...all
    ]
      .map(section =>
        !q || section.title.toLowerCase().includes(q)
          ? section
          : { ...section, sounds: section.sounds.filter(s => s.title.toLowerCase().includes(q)) }
      )
      .filter(section => section.sounds.length > 0);
  }, [files, favorites, recents, query]);

  const toggleFavorite = sound => {
    const id = soundId(sound);
    setFavorites(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
  };

  const addRecent = sound => {
    const id = soundId(sound);
    setRecents(prev => [id, ...prev.filter(r => r !== id)].slice(0, MAX_RECENTS));
  };

  return (
    <>
      <Header
        settings={settings}
        onChange={(key, value) => setSettings({ ...settings, [key]: value })}
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
          settings={settings}
          favorites={favorites}
          onPlay={addRecent}
          onToggleFavorite={toggleFavorite}
        />
      </main>
      <footer>&copy; Copyright 2021</footer>
    </>
  );
};

export default Main;
