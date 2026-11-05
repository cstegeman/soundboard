import Tuna from 'tunajs';
import type { EffectName, Settings, Sound } from '../types';

const context = new AudioContext();
const tuna = new Tuna(context);

/** Everything audible ends up here, so the visualizer can read it. */
export const analyser = context.createAnalyser();
analyser.fftSize = 256;
analyser.connect(context.destination);

/** Master input. Some tuna effects (overdrive, tremolo) output a constant DC offset even when idle; the high-pass strips it. */
const master = context.createBiquadFilter();
master.type = 'highpass';
master.frequency.value = 20;
master.connect(analyser);

/** Reverb: generated noise-decay impulse response, dry signal kept. */
function createReverb(seconds = 2, decay = 2) {
  const input = context.createGain();
  const output = context.createGain();
  const wet = context.createGain();
  const convolver = context.createConvolver();
  const length = context.sampleRate * seconds;
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  convolver.buffer = impulse;
  wet.gain.value = 0.5;
  input.connect(output);
  input.connect(convolver);
  convolver.connect(wet);
  wet.connect(output);
  output.connect(master);
  return input;
}

const tunaEffects = {
  delay: new tuna.Delay({ delayTime: 300 }),
  chorus: new tuna.Chorus({ rate: 1.5, feedback: 0.2, delay: 0.0045, bypass: 0 }),
  phaser: new tuna.Phaser({
    rate: 1.2,
    depth: 0.3,
    feedback: 0.2,
    stereoPhase: 30,
    baseModulationFrequency: 700,
    bypass: 0
  }),
  overdrive: new tuna.Overdrive({
    outputGain: 0.5,
    drive: 0.7,
    curveAmount: 1,
    algorithmIndex: 0,
    bypass: 0
  }),
  tremolo: new tuna.Tremolo({ intensity: 0.3, rate: 4, stereoPhase: 0, bypass: 0 })
};
Object.values(tunaEffects).forEach(effect => effect.connect(master));

/** Effect inputs by name; a setting with the same key turns the effect on. */
const inputs: Record<EffectName, AudioNode> = {
  ...tunaEffects,
  reverb: createReverb()
};
export const effectNames = Object.keys(inputs) as EffectName[];

/** Decoded buffers by url. */
const cache = new Map<string, Promise<AudioBuffer>>();
const active = new Set<AudioBufferSourceNode>();

/** Stable id of a sound ({category, name}), used for favorites and recents. */
export const soundId = (sound: Pick<Sound, 'category' | 'name'>) =>
  `${sound.category}/${sound.name}`;

/**
 * Fetch + decode once per url, then reuse.
 */
export function load(category: string, name: string): Promise<AudioBuffer> {
  const url = `/audio/${category}/${name}`;
  if (!cache.has(url)) {
    const promise = fetch(url)
      .then(response => response.arrayBuffer())
      .then(data => context.decodeAudioData(data));
    // don't keep failed loads, so a retry can succeed
    promise.catch(() => cache.delete(url));
    cache.set(url, promise);
  }
  return cache.get(url)!;
}

/**
 * Resolves once the clip is loaded and started (or failed).
 */
export async function play(sound: Pick<Sound, 'category' | 'name'>, settings: Settings) {
  try {
    const buffer = await load(sound.category, sound.name);
    if (settings.mono) {
      stopAll();
    }
    if (context.state === 'suspended') {
      context.resume();
    }
    const source = context.createBufferSource();
    source.buffer = settings.reverse ? reversed(buffer) : buffer;
    source.playbackRate.value = settings.speed;

    const sends = effectNames.filter(name => settings[name]);
    let split: GainNode | undefined;
    if (sends.length === 0) {
      source.connect(master);
    } else {
      // effects mix in their own dry signal, so scale by 1/n to keep the level steady
      const gain = context.createGain();
      split = gain;
      gain.gain.value = 1 / sends.length;
      source.connect(gain);
      sends.forEach(name => gain.connect(inputs[name]));
    }

    active.add(source);
    source.onended = () => {
      active.delete(source);
      split?.disconnect();
    };
    source.start();
  } catch (error) {
    console.warn(error);
  }
}

export function stopAll() {
  active.forEach(source => source.stop());
  active.clear();
}

/**
 * Reversed copy; the cached buffer must stay untouched.
 */
function reversed(buffer: AudioBuffer): AudioBuffer {
  const copy = context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    copy.copyToChannel(buffer.getChannelData(i).slice().reverse(), i);
  }
  return copy;
}
