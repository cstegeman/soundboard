import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Board from '../../src/components/Board';
import { load } from '../../src/utils/audio';

vi.mock('../../src/utils/audio', () => ({
  load: vi.fn(() => Promise.resolve()),
  soundId: (s: { category: string; name: string }) => `${s.category}/${s.name}`
}));

const a = { category: 'c', name: 'a.mp3', title: 'Alpha' };
const b = { category: 'c', name: 'b.mp3', title: 'Beta' };

const setup = (props = {}) => {
  const handlers = { onPlay: vi.fn(), onRandom: vi.fn(), onToggleFavorite: vi.fn() };
  render(
    <Board
      sections={[{ category: 'c', title: 'Cat', sounds: [a, b] }]}
      favorites={[]}
      shortcuts={{}}
      loading={[]}
      {...handlers}
      {...props}
    />
  );
  return handlers;
};

describe('Board', () => {
  it('renders section title and sounds', () => {
    setup();
    expect(screen.getByRole('heading', { name: /Cat/ })).toBeTruthy();
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
  });

  it('plays, randomizes and toggles favorite', () => {
    const h = setup();
    fireEvent.click(screen.getByText('Alpha'));
    fireEvent.click(screen.getByText('Random'));
    fireEvent.click(screen.getByLabelText('Add Alpha to favorites'));
    expect(h.onPlay).toHaveBeenCalledWith(a);
    expect(h.onRandom).toHaveBeenCalledWith([a, b]);
    expect(h.onToggleFavorite).toHaveBeenCalledWith(a);
  });

  it('shows favorite state', () => {
    setup({ favorites: ['c/a.mp3'] });
    const star = screen.getByLabelText('Remove Alpha from favorites');
    expect(star.getAttribute('aria-pressed')).toBe('true');
    expect(star.textContent).toBe('★');
  });

  it('marks loading clips busy', () => {
    setup({ loading: ['c/b.mp3'] });
    expect(screen.getByText('Beta').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Alpha').getAttribute('aria-busy')).toBe('false');
  });

  it('preloads on pointer enter', () => {
    setup();
    fireEvent.pointerEnter(screen.getByText('Alpha'));
    expect(load).toHaveBeenCalledWith('c', 'a.mp3');
  });

  it('shows shortcut badge only in the favorites section', () => {
    setup({
      sections: [
        { category: 'favorites', title: 'Favorites', sounds: [a] },
        { category: 'c', title: 'Cat', sounds: [a] }
      ],
      shortcuts: { 'c/a.mp3': '1' }
    });
    expect(screen.getAllByText('1')).toHaveLength(1);
  });
});
