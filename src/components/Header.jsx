import { stopAll } from '../utils/audio';

const toggles = [
  ['reverse', 'Reverse playback'],
  ['delay', 'Delay'],
  ['mono', 'One at a time']
];
const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75];

const Header = ({ settings, onChange }) => (
  <>
    <header>
      <h1>Soundboard</h1>
    </header>
    <div className="controls">
      <div className="row">
        {toggles.map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={event => onChange(key, event.target.checked)}
            />
            {label}
          </label>
        ))}
        <button type="button" className="stop" onClick={stopAll}>
          Stop all
        </button>
      </div>
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
    </div>
  </>
);

export default Header;
