import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Settings } from '../../src/types';

vi.mock('tunajs', () => {
  const effect = () =>
    class {
      connect = vi.fn();
    };
  return {
    default: class {
      Delay = effect();
      Chorus = effect();
      Phaser = effect();
      Overdrive = effect();
      Tremolo = effect();
    }
  };
});

const node = () => ({ connect: vi.fn(), disconnect: vi.fn(), gain: { value: 1 } });

function makeContext() {
  const buffer = (channels = 1, length = 3) => {
    const data = Array.from(
      { length: channels },
      () => new Float32Array([1, 2, 3]) as Float32Array<ArrayBufferLike>
    );
    return {
      numberOfChannels: channels,
      length,
      sampleRate: 8,
      data,
      getChannelData: (i: number) => data[i],
      copyToChannel: vi.fn((arr: Float32Array, i: number) => (data[i] = arr))
    };
  };
  return {
    state: 'running',
    sampleRate: 8,
    destination: {},
    resume: vi.fn(),
    createAnalyser: () => ({ ...node(), fftSize: 0 }),
    createBiquadFilter: () => ({ ...node(), frequency: { value: 0 } }),
    createGain: vi.fn(node),
    createConvolver: () => node(),
    createBuffer: vi.fn(buffer),
    createBufferSource: vi.fn(() => ({
      ...node(),
      start: vi.fn(),
      stop: vi.fn(),
      playbackRate: { value: 1 }
    })),
    decodeAudioData: vi.fn(async () => buffer())
  };
}

let audio: typeof import('../../src/utils/audio');
let context: ReturnType<typeof makeContext>;
const sound = { category: 'cat', name: 'a.mp3' };
const settings = { speed: 1.5, reverse: false, mono: false } as Settings;
const rows = (buffer: unknown) => (buffer as { data: Float32Array[] }).data;

beforeEach(async () => {
  vi.resetModules();
  context = makeContext();
  vi.stubGlobal(
    'AudioContext',
    vi.fn(function () {
      return context;
    })
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ arrayBuffer: async () => new ArrayBuffer(1) }))
  );
  audio = await import('../../src/utils/audio.js');
});

describe('soundId', () => {
  it('joins category and name', () => {
    expect(audio.soundId(sound)).toBe('cat/a.mp3');
  });
});

describe('effectNames', () => {
  it('lists tuna effects and reverb', () => {
    expect(audio.effectNames).toEqual([
      'delay',
      'chorus',
      'phaser',
      'overdrive',
      'tremolo',
      'reverb'
    ]);
  });
});

describe('load', () => {
  it('fetches and decodes once per url', async () => {
    const [a, b] = [audio.load('cat', 'a.mp3'), audio.load('cat', 'a.mp3')];
    expect(a).toBe(b);
    await a;
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/audio/cat/a.mp3');
    expect(context.decodeAudioData).toHaveBeenCalledTimes(1);
  });

  it('drops failed loads so a retry can succeed', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'));
    await expect(audio.load('cat', 'a.mp3')).rejects.toThrow('offline');
    await Promise.resolve(); // let the cache-eviction catch run
    await expect(audio.load('cat', 'a.mp3')).resolves.toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('play', () => {
  it('plays at the requested speed, straight into master without effects', async () => {
    await audio.play(sound, settings);
    const source = context.createBufferSource.mock.results[0].value;
    expect(source.playbackRate.value).toBe(1.5);
    expect(source.start).toHaveBeenCalled();
    expect(source.connect).toHaveBeenCalledTimes(1);
  });

  it('plays a reversed copy and leaves the cached buffer alone', async () => {
    const original = await audio.load('cat', 'a.mp3');
    await audio.play(sound, { ...settings, reverse: true });
    const source = context.createBufferSource.mock.results[0].value;
    expect(source.buffer).not.toBe(original);
    expect([...rows(source.buffer)[0]!]).toEqual([3, 2, 1]);
    expect([...rows(original)[0]!]).toEqual([1, 2, 3]);
  });

  it('splits level 1/n across enabled effects', async () => {
    await audio.play(sound, { ...settings, delay: true, reverb: true });
    const source = context.createBufferSource.mock.results[0].value;
    const split = context.createGain.mock.results.at(-1)!.value;
    expect(split.gain.value).toBe(0.5);
    expect(source.connect).toHaveBeenCalledWith(split);
    expect(split.connect).toHaveBeenCalledTimes(2);
  });

  it('disconnects the effect split when the clip ends', async () => {
    await audio.play(sound, { ...settings, delay: true });
    const source = context.createBufferSource.mock.results[0].value;
    const split = context.createGain.mock.results.at(-1)!.value;
    source.onended();
    expect(split.disconnect).toHaveBeenCalled();
  });

  it('resumes a suspended context', async () => {
    context.state = 'suspended';
    await audio.play(sound, settings);
    expect(context.resume).toHaveBeenCalled();
  });

  it('mono stops clips that are already playing', async () => {
    await audio.play(sound, settings);
    await audio.play(sound, { ...settings, mono: true });
    const [first, second] = context.createBufferSource.mock.results.map(r => r.value);
    expect(first.stop).toHaveBeenCalled();
    expect(second.stop).not.toHaveBeenCalled();
  });

  it('warns instead of throwing when loading fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValueOnce(new Error('nope'));
    await expect(audio.play(sound, settings)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});

describe('stopAll', () => {
  it('stops every active source once', async () => {
    await audio.play(sound, settings);
    audio.stopAll();
    audio.stopAll();
    const source = context.createBufferSource.mock.results[0].value;
    expect(source.stop).toHaveBeenCalledTimes(1);
  });
});
