// @vitest-environment node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import NodeID3 from 'node-id3';
import { afterAll, describe, expect, it } from 'vitest';

const script = path.resolve('tools/json-generator.ts');
const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'soundboard-gen-'));
afterAll(() => fs.rmSync(cwd, { recursive: true, force: true }));

const mp3 = (dir: string, name: string, tags: NodeID3.Tags) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), NodeID3.write(tags, Buffer.alloc(16)));
};

describe('json-generator', () => {
  it('writes sounds.json grouped by category using ID3 tags', () => {
    const audio = path.join(cwd, 'public/audio');
    mp3(path.join(audio, 'bob'), 'one.mp3', { title: 'One', album: 'Bob' });
    mp3(path.join(audio, 'bob'), 'two.mp3', { title: 'Two', album: 'Bob' });
    mp3(path.join(audio, 'ann'), 'hi.mp3', { title: 'Hi', album: 'Ann' });

    const out = execFileSync('node', [script], { cwd, encoding: 'utf8' });
    expect(out).toContain('All done!');

    const sounds = JSON.parse(fs.readFileSync(path.join(cwd, 'public/sounds.json'), 'utf8'));
    expect(sounds).toEqual([
      { title: 'Ann', category: 'ann', sounds: [{ title: 'Hi', name: 'hi.mp3' }] },
      {
        title: 'Bob',
        category: 'bob',
        sounds: [
          { title: 'One', name: 'one.mp3' },
          { title: 'Two', name: 'two.mp3' }
        ]
      }
    ]);
  });
});
