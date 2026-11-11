import { useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { tones } from './tones';

export function usePracticeAudio() {
  const players = useRef(new Map());
  const current = useRef(null);
  const revision = useRef(0);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    const cache = players.current;
    return () => {
      revision.current += 1;
      cache.forEach((player) => player.remove());
      cache.clear();
    };
  }, []);

  async function play(midi) {
    const version = ++revision.current;
    try {
      current.current?.pause();
      if (!players.current.has(midi)) {
        players.current.set(midi, createAudioPlayer(tones[midi]));
      }
      const player = players.current.get(midi);
      current.current = player;
      await player.seekTo(0);
      if (version === revision.current) player.play();
    } catch {
      // The score and visual drills are still usable if audio is unavailable.
    }
  }

  function stop() {
    revision.current += 1;
    current.current?.pause();
  }

  return { play, stop };
}
