/** A playable clip. `category` is added by Main when the catalog is loaded. */
export type Sound = { title: string; name: string; category: string };

/** A group of sounds, as listed in sounds.json (plus pinned sections built by Main). */
export type Section = { category: string; title: string; sounds: Sound[] };

/** The shape of sounds.json before Main stamps each sound with its category. */
export type CatalogSection = Omit<Section, 'sounds'> & { sounds: Omit<Sound, 'category'>[] };

export type EffectName = 'delay' | 'chorus' | 'phaser' | 'overdrive' | 'tremolo' | 'reverb';

export type Settings = { speed: number; reverse: boolean; mono: boolean } & Record<
  EffectName,
  boolean
>;
