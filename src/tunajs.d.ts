// tunajs' bundled typings declare effects as plain methods, but they're constructors at runtime
// (and its package "exports" hides the typings from bundler resolution anyway).
declare module 'tunajs' {
  // tuna patches AudioNode.connect to accept effects, so treat them as nodes
  type Effect = AudioNode;
  type EffectConstructor = new (options?: Record<string, number | boolean>) => Effect;

  export default class Tuna {
    constructor(context: AudioContext);
    Delay: EffectConstructor;
    Chorus: EffectConstructor;
    Phaser: EffectConstructor;
    Overdrive: EffectConstructor;
    Tremolo: EffectConstructor;
  }
}
