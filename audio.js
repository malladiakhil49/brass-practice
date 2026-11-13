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
    if (!Number.isFinite(midi)) return;
    const note = Math.max(28, Math.min(88, Math.round(midi)));
    const version = ++revision.current;
    try {
      current.current?.pause();
      if (!players.current.has(note)) {
        players.current.set(note, createAudioPlayer(tones[note]));
      }
      const player = players.current.get(note);
      current.current = player;
      player.shouldCorrectPitch = false;
      player.setPlaybackRate(2 ** ((midi - note) / 12));
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
