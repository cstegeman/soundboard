import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Header from '../../src/components/Header';
import { stopAll } from '../../src/utils/audio';

vi.mock('../../src/utils/audio', () => ({
  effectNames: ['delay', 'reverb'],
  stopAll: vi.fn()
}));
vi.mock('../../src/components/Visualizer', () => ({ default: () => <canvas /> }));

const settings = {
  reverse: false,
  mono: false,
  speed: 1,
  delay: false,
  chorus: false,
  phaser: false,
  overdrive: false,
  tremolo: false,
  reverb: true
};

const setup = (props = {}) => {
  const handlers = { onChange: vi.fn(), onRandom: vi.fn(), onShare: vi.fn(async () => {}) };
  render(<Header settings={settings} {...handlers} {...props} />);
  return handlers;
};

describe('Header', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('reports checkbox and speed changes', () => {
    const h = setup();
    fireEvent.click(screen.getByLabelText('Reverse playback'));
    fireEvent.click(screen.getByLabelText('delay'));
    fireEvent.click(screen.getByLabelText('1.50'));
    expect(h.onChange).toHaveBeenCalledWith('reverse', true);
    expect(h.onChange).toHaveBeenCalledWith('delay', true);
    expect(h.onChange).toHaveBeenCalledWith('speed', 1.5);
  });

  it('reflects settings', () => {
    setup();
    expect((screen.getByLabelText('reverb') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Normal') as HTMLInputElement).checked).toBe(true);
  });

  it('random and stop buttons call handlers', () => {
    const h = setup();
    fireEvent.click(screen.getByText('Random'));
    fireEvent.click(screen.getByText('Stop all'));
    expect(h.onRandom).toHaveBeenCalled();
    expect(stopAll).toHaveBeenCalled();
  });

  it('shows "Copied!" briefly after sharing', async () => {
    const h = setup();
    await act(async () => fireEvent.click(screen.getByText('Copy link')));
    expect(h.onShare).toHaveBeenCalled();
    expect(screen.getByText('Copied!')).toBeTruthy();
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByText('Copy link')).toBeTruthy();
  });

  it('warns when sharing fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setup({ onShare: vi.fn(async () => Promise.reject(new Error('denied'))) });
    await act(async () => fireEvent.click(screen.getByText('Copy link')));
    expect(warn).toHaveBeenCalled();
    expect(screen.queryByText('Copied!')).toBeNull();
  });
});
