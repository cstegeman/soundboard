import { load, soundId } from '../utils/audio';

const Board = ({ sections, favorites, shortcuts, onPlay, onRandom, onToggleFavorite }) =>
  sections.map(section => (
    <section key={section.category}>
      <h2>
        {section.title}
        <button type="button" className="random" onClick={() => onRandom(section.sounds)}>
          Random
        </button>
      </h2>
      <div className="sounds">
        {section.sounds.map(sound => {
          const isFavorite = favorites.includes(soundId(sound));
          return (
            <span className="sound" key={soundId(sound)}>
              <button
                type="button"
                onPointerEnter={() => load(sound.category, sound.name).catch(() => {})}
                onClick={() => onPlay(sound)}
              >
                {section.category === 'favorites' && shortcuts[soundId(sound)] && (
                  <kbd>{shortcuts[soundId(sound)]}</kbd>
                )}
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
