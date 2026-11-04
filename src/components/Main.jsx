import Header from './Header';
import Board from './Board';
import { useMemo, useState } from 'react';

const Main = ({ files }) => {
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState({ reverse: false, delay: false, mono: false, speed: 1 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return files;
    }
    return files
      .map(file =>
        file.title.toLowerCase().includes(q)
          ? file
          : { ...file, sounds: file.sounds.filter(sound => sound.title.toLowerCase().includes(q)) }
      )
      .filter(file => file.sounds.length > 0);
  }, [files, query]);

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
        <Board files={filtered} settings={settings} />
      </main>
      <footer>&copy; Copyright 2021</footer>
    </>
  );
};

export default Main;
