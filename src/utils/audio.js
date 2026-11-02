import Tuna from 'tunajs';

const context = new AudioContext();
const tuna = new Tuna(context);
const delay = new tuna.Delay({
  delayTime: 300
});

/** @type {Map<string, Promise<AudioBuffer>>} decoded buffers by url */
const cache = new Map();
/** @type {Set<AudioBufferSourceNode>} */
const active = new Set();

/**
 * Fetch + decode once per url, then reuse.
 * @param {string} category
 * @param {string} name
 * @returns {Promise<AudioBuffer>}
 */
export function load(category, name) {
  const url = `/audio/${category}/${name}`;
  if (!cache.has(url)) {
    const promise = fetch(url)
      .then(response => response.arrayBuffer())
      .then(data => context.decodeAudioData(data));
    // don't keep failed loads, so a retry can succeed
    promise.catch(() => cache.delete(url));
    cache.set(url, promise);
  }
  return cache.get(url);
}

/**
 * @param {string} category
 * @param {string} name
 * @param {number} playSpeed
 * @param {boolean} reversePlayback
 * @param {boolean} enableDelay
 * @param {boolean} oneAtATime
 */
export async function play(category, name, playSpeed, reversePlayback, enableDelay, oneAtATime) {
  try {
    const buffer = await load(category, name);
    if (oneAtATime) {
      stopAll();
    }
    const bufferSource = context.createBufferSource();
    bufferSource.buffer = reversePlayback ? reversed(buffer) : buffer;
    bufferSource.connect(context.destination);
    if (enableDelay) {
      bufferSource.connect(delay);
      delay.connect(context.destination);
    }
    bufferSource.playbackRate.value = playSpeed;
    active.add(bufferSource);
    bufferSource.onended = () => active.delete(bufferSource);
    bufferSource.start();
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
 * @param {AudioBuffer} buffer
 * @returns {AudioBuffer}
 */
function reversed(buffer) {
  const copy = context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    copy.copyToChannel(buffer.getChannelData(i).slice().reverse(), i);
  }
  return copy;
}
