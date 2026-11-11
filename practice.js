export const initialProgress = { name: '', friends: [], history: {}, bestSprint: 0 };

export function dayKey(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => (index ? String(part).padStart(2, '0') : String(part)))
    .join('-');
}

export function dailySeed(key) {
  let seed = Number(key.replace(/-/g, '')) >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function streak(history, today = new Date()) {
  const day = new Date(today.getTime());
  const completed = (key) => history[key]?.daily === true;
  if (!completed(dayKey(day))) day.setDate(day.getDate() - 1);
  let count = 0;
  while (completed(dayKey(day))) {
    count += 1;
    day.setDate(day.getDate() - 1);
  }
  return count;
}

export function logPractice(progress, seconds, mode, score = 0, key = dayKey()) {
  const previous = progress.history[key] ?? { seconds: 0, daily: false };
  return {
    ...progress,
    bestSprint: mode === 'sprint' ? Math.max(progress.bestSprint, score) : progress.bestSprint,
    history: {
      ...progress.history,
      [key]: {
        seconds: previous.seconds + Math.max(1, Math.round(seconds)),
        daily: previous.daily || mode === 'daily',
      },
    },
  };
}

export function encodeScore(name, bestSprint) {
  return 'BP1|' + encodeURIComponent(name.trim().slice(0, 24)) + '|' + bestSprint;
}

export function decodeScore(code) {
  const fields = code.trim().split('|');
  if (fields.length !== 3 || fields[0] !== 'BP1' || !/^\d{1,3}$/.test(fields[2])) return null;
  try {
    const name = decodeURIComponent(fields[1]).trim();
    if (!name || name.length > 24 || /[\r\n]/.test(name)) return null;
    return { name, bestSprint: Number(fields[2]) };
  } catch {
    return null;
  }
}

export const rhythmPatterns = [
  { title: 'Steady quarters', beats: [0, 1, 2, 3, 4, 5, 6, 7] },
  { title: 'Eighth-note pairs', beats: [0, 0.5, 1, 2, 2.5, 3, 4, 4.5, 5, 6, 6.5, 7] },
  { title: 'Offbeat entrances', beats: [0, 1.5, 2, 3.5, 4, 5.5, 6.5, 7] },
];

export function matchTap(beats, hitIndices, tapBeat, tolerance) {
  let best = -1;
  let distance = tolerance;
  beats.forEach((beat, index) => {
    const delta = Math.abs(beat - tapBeat);
    if (!hitIndices.includes(index) && delta <= distance) {
      best = index;
      distance = delta;
    }
  });
  return best;
}
