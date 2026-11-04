import { load, play } from '../utils/audio';

const Board = ({ files, settings }) =>
  files.map(file => (
    <section key={file.category}>
      <h2>{file.title}</h2>
      <div className="sounds">
        {file.sounds.map(sound => (
          <button
            type="button"
            key={sound.name}
            onPointerEnter={() => load(file.category, sound.name).catch(() => {})}
            onClick={() =>
              play(
                file.category,
                sound.name,
                settings.speed,
                settings.reverse,
                settings.delay,
                settings.mono
              )
            }
          >
            {sound.title}
          </button>
        ))}
      </div>
    </section>
  ));

export default Board;
