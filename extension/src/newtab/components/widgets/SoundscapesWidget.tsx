import React, { useState } from 'react';
import './SoundscapesWidget.css';

interface Sound {
  id: string;
  name: string;
  url: string;
  icon: string;
}

const SOUNDS: Sound[] = [
  { id: 'rain', name: 'Rain', url: '/sounds/rain.mp3', icon: '🌧️' },
  { id: 'ocean', name: 'Ocean', url: '/sounds/ocean.mp3', icon: '🌊' },
  { id: 'forest', name: 'Forest', url: '/sounds/forest.mp3', icon: '🌲' },
  { id: 'fire', name: 'Fireplace', url: '/sounds/fire.mp3', icon: '🔥' },
  { id: 'white-noise', name: 'White Noise', url: '/sounds/white-noise.mp3', icon: '📻' },
];

const SoundscapesWidget: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const toggleSound = (sound: Sound) => {
    if (playingId === sound.id) {
      // Stop current sound
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setAudio(null);
      }
      setPlayingId(null);
    } else {
      // Stop previous sound
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      // Play new sound
      const newAudio = new Audio(sound.url);
      newAudio.loop = true;
      newAudio.play().catch((error) => {
        console.error('Failed to play sound:', error);
        alert('Failed to play sound. Please check if the sound file exists.');
      });
      setAudio(newAudio);
      setPlayingId(sound.id);
    }
  };

  return (
    <div className="soundscapes-widget">
      <h3>Soundscapes</h3>
      <div className="sounds-grid">
        {SOUNDS.map((sound) => (
          <button
            key={sound.id}
            className={`sound-button ${playingId === sound.id ? 'playing' : ''}`}
            onClick={() => toggleSound(sound)}
          >
            <span className="sound-icon">{sound.icon}</span>
            <span className="sound-name">{sound.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SoundscapesWidget;

