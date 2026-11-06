import Header, { speeds } from './Header';
import Board from './Board';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CatalogSection, EffectName, Section, Settings, Sound } from '../types';
import { effectNames, play, soundId, stopAll } from '../utils/audio';
import { useLocalStorage } from '../utils/useLocalStorage';

const YEAR = new Date().getFullYear();
const MAX_RECENTS = 10;
const MAX_SHORTCUTS = 9;

/** Settings and clip from a share link: #clip=<id>&speed=1.5&reverse=1&fx=delay,reverb */
function readHash(): { clip: string | null; settings: Settings } {
  const params = new URLSearchParams(location.hash.slice(1));
  const fx = (params.get('fx') ?? '').split(',');
  const speed = Number(params.get('speed'));
  return {
    clip: params.get('clip'),
    settings: {
      reverse: params.get('reverse') === '1',
      mono: false,
      speed: speeds.includes(speed) ? speed : 1,
      ...(Object.fromEntries(effectNames.map(name => [name, fx.includes(name)])) as Record<
        EffectName,
        boolean
      >)
    }
  };
}

const Main = ({ files }: { files: CatalogSection[] }) => {
  const [shared] = useState(readHash);
  const [sharedId, setSharedId] = useState(shared.clip);
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState(shared.settings);
  const [loading, setLoading] = useState<string[]>([]);
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);
  const [recents, setRecents] = useLocalStorage<string[]>('recents', []);

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
  const pick = useCallback(
    (ids: string[]) => ids.map(id => byId.get(id)).filter(sound => sound !== undefined),
    [byId]
  );
  const favoriteSounds = useMemo(() => pick(favorites), [favorites, pick]);

  const sections = useMemo<Section[]>(() => {
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
  }, [all, favoriteSounds, recents, query, pick]);

  // keys 1-9 play the first favorites; the badge in the Favorites section shows the key
  const shortcuts = Object.fromEntries(
    favoriteSounds.slice(0, MAX_SHORTCUTS).map((sound, i) => [soundId(sound), String(i + 1)])
  );

  const toggleFavorite = (sound: Sound) => {
    const id = soundId(sound);
    setFavorites(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
  };

  const playSound = async (sound: Sound) => {
    const id = soundId(sound);
    setRecents(prev => [id, ...prev.filter(r => r !== id)].slice(0, MAX_RECENTS));
    setLoading(prev => [...prev, id]);
    await play(sound, settings);
    setLoading(prev => prev.filter(l => l !== id));
  };

  const shareLink = () => {
    const params = new URLSearchParams();
    if (recents[0]) {
      params.set('clip', recents[0]);
    }
    params.set('speed', String(settings.speed));
    if (settings.reverse) {
      params.set('reverse', '1');
    }
    const fx = effectNames.filter(name => settings[name]);
    if (fx.length > 0) {
      params.set('fx', fx.join(','));
    }
    return navigator.clipboard.writeText(`${location.origin}${location.pathname}#${params}`);
  };

  const dismissShared = () => {
    setSharedId(null);
    history.replaceState(null, '', location.pathname);
  };
  const sharedSound = sharedId ? byId.get(sharedId) : undefined;

  const playRandom = (sounds: Sound[]) =>
    sounds.length && playSound(sounds[Math.floor(Math.random() * sounds.length)]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if ((event.target as HTMLInputElement).type === 'search') {
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
        onShare={shareLink}
      />
      <main>
        {sharedSound && (
          <div className="shared">
            Shared clip:
            <button
              type="button"
              onClick={() => {
                playSound(sharedSound);
                dismissShared();
              }}
            >
              &#9654; {sharedSound.title}
            </button>
            <button type="button" className="stop" aria-label="Dismiss" onClick={dismissShared}>
              &times;
            </button>
          </div>
        )}
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
          loading={loading}
          onPlay={playSound}
          onRandom={playRandom}
          onToggleFavorite={toggleFavorite}
        />
      </main>
      <footer>&copy; 2021&ndash;{YEAR}</footer>
    </>
  );
};

export default Main;
