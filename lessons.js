// Written pitches for B-flat tenor trombone, bass clef, without a trigger.
// step is the diatonic distance above G2, the bottom staff line.
export const PITCHES = {
  'B♭2': { midi: 46, step: 2, flat: true, positions: [1] },
  C3: { midi: 48, step: 3, positions: [6] },
  D3: { midi: 50, step: 4, positions: [4] },
  'E♭3': { midi: 51, step: 5, flat: true, positions: [3] },
  F3: { midi: 53, step: 6, positions: [1, 6] },
  G3: { midi: 55, step: 7, positions: [4] },
  E3: { midi: 52, step: 5, positions: [2] },
  A3: { midi: 57, step: 8, positions: [2] },
  'B♭3': { midi: 58, step: 9, flat: true, positions: [1] },
  C4: { midi: 60, step: 10, positions: [3] },
  D4: { midi: 62, step: 11, positions: [1] },
  E4: { midi: 64, step: 12, positions: [2] },
  F4: { midi: 65, step: 13, positions: [1] },
};

const openingQuestion = {
  prompt: 'What is the first note of this exercise?',
  choices: ['F3', 'B♭2', 'D3', 'G3'],
  answer: 1,
  explanation: 'B♭2 sits on the second line from the bottom and is marked flat.',
};

export const LIBRARY = [
  {
    id: 'arch',
    title: 'The Arch',
    description: 'Shape a rising line and ease back to B♭.',
    measures: [
      ['B♭2', 'C3', 'D3', 'E♭3'],
      ['F3', 'E♭3', 'D3', 'C3'],
      ['D3', 'F3', 'G3', 'F3'],
      ['E♭3', 'D3', 'C3', 'B♭2'],
    ],
    quiz: [
      openingQuestion,
      {
        prompt: 'If you want to emphasize the highest note, where should the crescendo peak?',
        choices: [
          'The opening B♭2',
          'G3 in measure 3',
          'The rest after the final note',
          'C3 in measure 4',
        ],
        answer: 1,
        explanation:
          'G3 is the highest note. Growing toward it can make it sound like the high point of the phrase.',
      },
      {
        prompt: 'Which choice best supports a sense of release in the last measure?',
        choices: [
          'Accent each note equally',
          'Get louder on every note',
          'Taper toward the final B♭2',
          'Make the last note the loudest',
        ],
        answer: 2,
        explanation:
          'The descending line and return to B♭ give you a musical reason to taper. This is one defensible interpretation.',
      },
    ],
  },
  {
    id: 'step-and-leap',
    title: 'Step and Leap',
    description: 'Alternate stepwise motion and larger jumps.',
    measures: [
      ['B♭2', 'D3', 'C3', 'D3'],
      ['E♭3', 'F3', 'D3', 'F3'],
      ['G3', 'F3', 'E♭3', 'D3'],
      ['F3', 'D3', 'C3', 'B♭2'],
    ],
    quiz: [
      openingQuestion,
      {
        prompt:
          'You want the first two notes to sound like one connected gesture. Which instruction fits that goal?',
        choices: [
          'Give both notes a sharp accent',
          'Leave a large gap',
          'Use a connected legato articulation',
          'Play both notes staccato',
        ],
        answer: 2,
        explanation:
          'A legato articulation supports a connected gesture even when the pitch leaps.',
      },
      {
        prompt: 'Which note starts the highest part of the exercise?',
        choices: [
          'G3 at the start of measure 3',
          'B♭2 at the start of measure 1',
          'C3 in measure 4',
          'D3 at the end of measure 3',
        ],
        answer: 0,
        explanation: 'G3 is the highest pitch here. It appears on beat 1 of measure 3.',
      },
    ],
  },
];

export function generateExercise(difficulty = 'stepwise', random = Math.random) {
  const pitches = ['B♭2', 'C3', 'D3', 'E♭3', 'F3', 'G3'];
  const maxJump = difficulty === 'leaps' ? 3 : 1;
  let cursor = 0;
  const notes = ['B♭2'];
  while (notes.length < 15) {
    const stepsLeft = 15 - notes.length;
    const choices = pitches.filter(
      (_, index) =>
        index !== cursor && Math.abs(index - cursor) <= maxJump && index <= stepsLeft * maxJump,
    );
    const chosen = choices[Math.floor(random() * choices.length)];
    notes.push(chosen);
    cursor = pitches.indexOf(chosen);
  }
  notes.push('B♭2');
  const highest = notes.reduce((peak, name) =>
    PITCHES[name].step > PITCHES[peak].step ? name : peak,
  );
  const options = pitches.filter((name) => name !== highest).slice(0, 3);
  options.splice(2, 0, highest);
  return {
    id: 'generated',
    title: difficulty === 'leaps' ? 'Sight-reading · leaps' : 'Sight-reading · stepwise',
    description: 'A new four-measure practice exercise.',
    measures: [0, 4, 8, 12].map((start) => notes.slice(start, start + 4)),
    quiz: [
      openingQuestion,
      {
        prompt: 'What is the highest note in this generated exercise?',
        choices: options,
        answer: 2,
        explanation: highest + ' sits highest on the staff among the notes in this exercise.',
      },
    ],
  };
}

export const SCALES = [
  {
    id: 'bb-scale',
    title: 'B♭ major',
    description: 'Ascending and descending, B♭2–B♭3.',
    measures: [
      ['B♭2', 'C3', 'D3', 'E♭3'],
      ['F3', 'G3', 'A3', 'B♭3'],
      ['A3', 'G3', 'F3', 'E♭3'],
      ['D3', 'C3', 'B♭2', 'B♭2'],
    ],
  },
  {
    id: 'f-scale',
    title: 'F major',
    description: 'Ascending and descending, F3–F4.',
    measures: [
      ['F3', 'G3', 'A3', 'B♭3'],
      ['C4', 'D4', 'E4', 'F4'],
      ['E4', 'D4', 'C4', 'B♭3'],
      ['A3', 'G3', 'F3', 'F3'],
    ],
  },
];

export const POSITION_QUIZ_NOTES = ['B♭2', 'C3', 'D3', 'E♭3', 'F3', 'G3', 'A3', 'B♭3'];
export const PARTIALS = [46, 53, 58, 62, 65];
export function pitchName(midi) {
  const names = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  return names[midi % 12] + (Math.floor(midi / 12) - 1);
}
