import { useState } from 'react';
import Visualizer from './Visualizer';
import { effectNames, stopAll } from '../utils/audio';

const toggles = [
  ['reverse', 'Reverse playback'],
  ['mono', 'One at a time']
];
export const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75];

const Checkbox = ({ name, label, settings, onChange }) => (
  <label>
    <input
      type="checkbox"
      checked={settings[name]}
      onChange={event => onChange(name, event.target.checked)}
    />
    {label}
  </label>
);

const Header = ({ settings, onChange, onRandom, onShare }) => {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      await onShare();
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <>
      <header>
        <h1>Soundboard</h1>
      </header>
      <div className="controls">
        <div className="row">
          {toggles.map(([name, label]) => (
            <Checkbox key={name} {...{ name, label, settings, onChange }} />
          ))}
          <button type="button" onClick={onRandom}>
            Random
          </button>
          <button type="button" className="stop" onClick={stopAll}>
            Stop all
          </button>
          <button
            type="button"
            title="Copy a link to the last played clip with these settings"
            onClick={share}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
        <fieldset className="row effects">
          <legend>Effects</legend>
          {effectNames.map(name => (
            <Checkbox key={name} {...{ name, label: name, settings, onChange }} />
          ))}
        </fieldset>
        <fieldset className="row">
          <legend>Speed</legend>
          {speeds.map(speed => (
            <label key={speed}>
              <input
                type="radio"
                name="speed"
                checked={settings.speed === speed}
                onChange={() => onChange('speed', speed)}
              />
              {speed === 1 ? 'Normal' : speed.toFixed(2)}
            </label>
          ))}
        </fieldset>
        <Visualizer />
      </div>
    </>
  );
};

export default Header;
