import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Main from '../../src/components/Main';
import { play, stopAll } from '../../src/utils/audio';

vi.mock('../../src/utils/audio', () => ({
  effectNames: ['delay', 'reverb'],
  soundId: s => `${s.category}/${s.name}`,
  load: vi.fn(() => Promise.resolve()),
  play: vi.fn(() => Promise.resolve()),
  stopAll: vi.fn()
}));
vi.mock('../../src/components/Visualizer', () => ({ default: () => <canvas /> }));

const files = [
  {
    title: 'Bob',
    category: 'bob',
    sounds: [
      { title: 'Hello', name: 'hello.mp3' },
      { title: 'Goodbye', name: 'bye.mp3' }
    ]
  },
  { title: 'Ann', category: 'ann', sounds: [{ title: 'Yo', name: 'yo.mp3' }] }
];

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, '', '/');
});

describe('Main', () => {
  it('renders sections and hides empty favorites/recents', () => {
    render(<Main files={files} />);
    expect(screen.getByText('Hello')).toBeTruthy();
    expect(screen.queryByText('Favorites')).toBeNull();
    expect(screen.queryByText('Recently played')).toBeNull();
  });

  it('plays a clip with settings and records it in recents', async () => {
    render(<Main files={files} />);
    fireEvent.click(screen.getByText('Hello'));
    await waitFor(() => expect(screen.getByText('Recently played')).toBeTruthy());
    expect(play).toHaveBeenCalledWith(
      { title: 'Hello', name: 'hello.mp3', category: 'bob' },
      expect.objectContaining({ speed: 1, reverse: false, mono: false })
    );
    expect(JSON.parse(localStorage.getItem('recents'))).toEqual(['bob/hello.mp3']);
  });

  it('toggles favorites and persists them', () => {
    render(<Main files={files} />);
    fireEvent.click(screen.getAllByLabelText('Add Hello to favorites')[0]);
    expect(screen.getByText('Favorites')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('favorites'))).toEqual(['bob/hello.mp3']);
    fireEvent.click(screen.getAllByLabelText('Remove Hello from favorites')[0]);
    expect(screen.queryByText('Favorites')).toBeNull();
  });

  it('filters by sound title and by section title', () => {
    render(<Main files={files} />);
    const search = screen.getByLabelText('Search sounds');
    fireEvent.change(search, { target: { value: 'good' } });
    expect(screen.queryByText('Hello')).toBeNull();
    expect(screen.getByText('Goodbye')).toBeTruthy();
    fireEvent.change(search, { target: { value: 'ann' } });
    expect(screen.getByText('Yo')).toBeTruthy();
    expect(screen.queryByText('Goodbye')).toBeNull();
  });

  describe('keyboard', () => {
    it('Escape stops all', () => {
      render(<Main files={files} />);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(stopAll).toHaveBeenCalled();
    });

    it('r plays a random clip', () => {
      render(<Main files={files} />);
      fireEvent.keyDown(window, { key: 'r' });
      expect(play).toHaveBeenCalledTimes(1);
    });

    it('digit plays the matching favorite', () => {
      localStorage.setItem('favorites', JSON.stringify(['ann/yo.mp3']));
      render(<Main files={files} />);
      fireEvent.keyDown(window, { key: '1' });
      expect(play).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'yo.mp3' }),
        expect.any(Object)
      );
      fireEvent.keyDown(window, { key: '2' });
      expect(play).toHaveBeenCalledTimes(1);
    });

    it('ignores modified keys, repeats and typing in search', () => {
      render(<Main files={files} />);
      fireEvent.keyDown(window, { key: 'r', ctrlKey: true });
      fireEvent.keyDown(window, { key: 'r', repeat: true });
      fireEvent.keyDown(screen.getByLabelText('Search sounds'), { key: 'r' });
      expect(play).not.toHaveBeenCalled();
    });
  });

  describe('share link', () => {
    it('reads settings and clip from the hash and plays/dismisses it', () => {
      history.replaceState(null, '', '/#clip=bob/hello.mp3&speed=1.5&reverse=1&fx=reverb');
      render(<Main files={files} />);
      expect(screen.getByText(/Shared clip/)).toBeTruthy();
      fireEvent.click(screen.getByText(/▶ Hello/));
      expect(play).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'hello.mp3' }),
        expect.objectContaining({ speed: 1.5, reverse: true, reverb: true, delay: false })
      );
      expect(screen.queryByText(/Shared clip/)).toBeNull();
      expect(location.hash).toBe('');
    });

    it('falls back to speed 1 for an unknown speed', () => {
      history.replaceState(null, '', '/#clip=bob/hello.mp3&speed=9');
      render(<Main files={files} />);
      fireEvent.click(screen.getByText(/▶ Hello/));
      expect(play).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ speed: 1 }));
    });

    it('dismiss button hides the shared clip without playing', () => {
      history.replaceState(null, '', '/#clip=bob/hello.mp3');
      render(<Main files={files} />);
      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(screen.queryByText(/Shared clip/)).toBeNull();
      expect(play).not.toHaveBeenCalled();
    });

    it('copies a link with last clip and settings', async () => {
      const writeText = vi.fn(() => Promise.resolve());
      Object.assign(navigator, { clipboard: { writeText } });
      render(<Main files={files} />);
      fireEvent.click(screen.getByText('Hello'));
      await waitFor(() => screen.getByText('Recently played'));
      fireEvent.click(screen.getByLabelText('reverb'));
      fireEvent.click(screen.getByText('Copy link'));
      await waitFor(() => expect(writeText).toHaveBeenCalled());
      const url = new URL(writeText.mock.calls[0][0]);
      const params = new URLSearchParams(url.hash.slice(1));
      expect(params.get('clip')).toBe('bob/hello.mp3');
      expect(params.get('fx')).toBe('reverb');
      expect(params.get('speed')).toBe('1');
    });
  });
});
