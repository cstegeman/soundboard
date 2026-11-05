import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Visualizer from '../../src/components/Visualizer';

vi.mock('../../src/utils/audio', () => ({
  analyser: { frequencyBinCount: 4, getByteFrequencyData: vi.fn(d => d.fill(255)) }
}));

const ctx = { clearRect: vi.fn(), fillRect: vi.fn(), fillStyle: '' };

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(40);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(10);
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 7)
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

describe('Visualizer', () => {
  it('draws one bar per frequency bin and sizes the canvas', () => {
    const { container } = render(<Visualizer />);
    const canvas = container.querySelector('canvas');
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
    expect(canvas.width).toBe(40);
    expect(ctx.fillRect).toHaveBeenCalledTimes(4);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 9, 10);
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('cancels the animation on unmount', () => {
    render(<Visualizer />).unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
  });
});
