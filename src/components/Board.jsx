import { load, play, soundId } from '../utils/audio';

const Board = ({ sections, settings, favorites, onPlay, onToggleFavorite }) =>
  sections.map(section => (
    <section key={section.category}>
      <h2>{section.title}</h2>
      <div className="sounds">
        {section.sounds.map(sound => {
          const isFavorite = favorites.includes(soundId(sound));
          return (
            <span className="sound" key={soundId(sound)}>
              <button
                type="button"
                onPointerEnter={() => load(sound.category, sound.name).catch(() => {})}
                onClick={() => {
                  play(
                    sound.category,
                    sound.name,
                    settings.speed,
                    settings.reverse,
                    settings.delay,
                    settings.mono
                  );
                  onPlay(sound);
                }}
              >
                {sound.title}
              </button>
              <button
                type="button"
                className="star"
                aria-pressed={isFavorite}
                aria-label={`${isFavorite ? 'Remove' : 'Add'} ${sound.title} ${isFavorite ? 'from' : 'to'} favorites`}
                onClick={() => onToggleFavorite(sound)}
              >
                {isFavorite ? '★' : '☆'}
              </button>
            </span>
          );
        })}
      </div>
    </section>
  ));

export default Board;
