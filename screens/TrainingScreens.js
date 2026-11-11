import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Button,
  Heading,
  Measure,
  PositionRail,
  SlideVisual,
  Tempo,
} from '../components/PracticeControls';
import { PARTIALS, PITCHES, POSITION_QUIZ_NOTES, pitchName } from '../lessons';
import { matchTap, rhythmPatterns } from '../practice';
import { s } from '../theme';

export function ScorePractice({ lesson, mode, audio, onDone, onQuiz }) {
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const [names, setNames] = useState(true);
  const [bpm, setBpm] = useState(80);
  const [range, setRange] = useState(-1);
  const [playing, setPlaying] = useState(-1);
  const [done, setDone] = useState(false);
  const [loop, setLoop] = useState(false);
  const start = useRef(Date.now());
  const timer = useRef(null);
  const playRevision = useRef(0);
  const notes = lesson.measures.flat();
  const first = range < 0 ? 0 : range * 4;
  const end = range < 0 ? notes.length : first + 4;
  const measure = Math.floor((playing >= 0 ? playing : index) / 4);
  const current = notes[index];
  const correct = PITCHES[current].positions.includes(position);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      playRevision.current += 1;
      audio.stop();
    },
    [],
  );

  function stop() {
    clearTimeout(timer.current);
    playRevision.current += 1;
    setPlaying(-1);
    audio.stop();
  }

  function playPhrase() {
    stop();
    const version = playRevision.current;
    const beatMs = 60000 / bpm;
    let nextTime = performance.now();
    function playBeat(next) {
      if (version !== playRevision.current) return;
      if (next >= end) {
        if (!loop) {
          stop();
          return;
        }
        next = first;
      }
      setPlaying(next);
      audio.play(PITCHES[notes[next]].midi);
      nextTime += beatMs;
      timer.current = setTimeout(
        () => playBeat(next + 1),
        Math.max(0, nextTime - performance.now()),
      );
    }
    playBeat(first);
  }

  function chooseRange(next) {
    stop();
    setRange(next);
    setIndex(next < 0 ? 0 : next * 4);
    setPosition(null);
    setDone(false);
    start.current = Date.now();
  }

  function choosePosition(next) {
    if (playing >= 0) return;
    setPosition(next);
    if (PITCHES[current].positions.includes(next)) audio.play(PITCHES[current].midi);
  }

  function advance() {
    if (!correct || done || playing >= 0) return;
    if (index + 1 === end) {
      setDone(true);
      onDone((Date.now() - start.current) / 1000, mode === 'daily' && range >= 0 ? 'music' : mode);
    } else {
      setPosition(null);
      setIndex(index + 1);
    }
  }

  return (
    <>
      <Heading title={lesson.title} subtitle="B♭ tenor trombone · Bass clef · 4/4" />
      <View style={s.card}>
        <View style={s.rowBetween}>
          <Text style={s.heading}>Measure {measure + 1}</Text>
          <Text style={s.small}>{lesson.measures.length} measures</Text>
        </View>
        <Measure
          notes={lesson.measures[measure]}
          active={playing >= 0 ? playing % 4 : done ? -1 : index % 4}
          names={names}
        />
        <View style={s.row}>
          <Button label="Full score" selected={range === -1} onPress={() => chooseRange(-1)} />
          {lesson.measures.map((_, i) => (
            <Button
              key={i}
              label={'m. ' + (i + 1)}
              selected={range === i}
              onPress={() => chooseRange(i)}
            />
          ))}
        </View>
        <View style={s.row}>
          <Button
            label={playing >= 0 ? 'Stop' : 'Play phrase'}
            primary
            onPress={playing >= 0 ? stop : playPhrase}
          />
          <Button
            label={loop ? 'Loop on' : 'Loop off'}
            disabled={playing >= 0}
            selected={loop}
            onPress={() => setLoop(!loop)}
          />
          <Tempo value={bpm} onChange={setBpm} disabled={playing >= 0} />
        </View>
      </View>
      <View style={s.card}>
        <View style={s.rowBetween}>
          <Text style={s.heading}>{done ? 'Practice complete' : 'Virtual slide'}</Text>
          {!done && (
            <Button label={names ? 'Hide names' : 'Show names'} onPress={() => setNames(!names)} />
          )}
        </View>
        {done ? (
          <View style={s.row}>
            <Button label="Practice again" onPress={() => chooseRange(range)} />
            {!!lesson.quiz?.length && <Button label="Take the quiz" primary onPress={onQuiz} />}
          </View>
        ) : (
          <>
            <Text style={s.body}>
              Beat {(index % 4) + 1}
              {names ? ' · ' + current : ''}
            </Text>
            <SlideVisual value={position} />
            <PositionRail value={position} onPress={choosePosition} />
            <Text accessibilityLiveRegion="polite" style={[s.body, correct && s.answerGood]}>
              {playing >= 0
                ? 'Listen to the phrase, then try it on the slide.'
                : position === null
                  ? 'Choose a slide position.'
                  : correct
                    ? 'Correct · ' + PITCHES[current].positions.join(' or ')
                    : 'Try another position.'}
            </Text>
            <Button
              label={index + 1 === end ? 'Finish practice' : 'Next note'}
              primary
              disabled={!correct || playing >= 0}
              onPress={advance}
            />
          </>
        )}
      </View>
    </>
  );
}

export function Quiz({ lesson, onDone }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef(Date.now());
  const question = lesson.quiz[index];

  function next() {
    if (answer === null) return;
    setScore(score + Number(answer === question.answer));
    if (index + 1 === lesson.quiz.length) {
      setDone(true);
      onDone((Date.now() - start.current) / 1000, 'quiz');
    } else {
      setIndex(index + 1);
      setAnswer(null);
    }
  }

  function reset() {
    start.current = Date.now();
    setIndex(0);
    setAnswer(null);
    setScore(0);
    setDone(false);
  }

  return (
    <>
      <Heading title="Interpretation quiz" subtitle={lesson.title} />
      <ScrollView horizontal>
        <View style={s.scoreRow}>
          {lesson.measures.map((notes, index) => (
            <View key={index} style={s.scoreMeasure}>
              <Text style={s.small}>Measure {index + 1}</Text>
              <Measure notes={notes} />
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={s.card}>
        {done ? (
          <>
            <Text style={s.heading}>
              {score} / {lesson.quiz.length} correct
            </Text>
            <Button label="Retake quiz" primary onPress={reset} />
          </>
        ) : (
          <>
            <Text style={s.small}>
              Question {index + 1} of {lesson.quiz.length}
            </Text>
            <Text style={s.heading}>{question.prompt}</Text>
            {question.choices.map((choice, i) => (
              <Button
                key={choice}
                label={choice}
                disabled={answer !== null}
                right={answer !== null && i === question.answer}
                wrong={answer === i && i !== question.answer}
                onPress={() => setAnswer(i)}
              />
            ))}
            {answer !== null && (
              <>
                <Text accessibilityLiveRegion="polite" style={s.body}>
                  {question.explanation}
                </Text>
                <Button
                  label={index + 1 === lesson.quiz.length ? 'See results' : 'Next question'}
                  primary
                  onPress={next}
                />
              </>
            )}
          </>
        )}
      </View>
    </>
  );
}

export function Flashcards({ audio, onDone, best }) {
  const [mode, setMode] = useState('practice');
  const [note, setNote] = useState(POSITION_QUIZ_NOTES[0]);
  const [feedback, setFeedback] = useState('');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const scoreRef = useRef(0);
  const begin = useRef(0);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  function newNote() {
    const choices = POSITION_QUIZ_NOTES.filter((name) => name !== note);
    setNote(choices[Math.floor(Math.random() * choices.length)]);
  }

  function start() {
    clearInterval(timer.current);
    scoreRef.current = 0;
    begin.current = performance.now();
    setScore(0);
    setSeconds(30);
    setRunning(true);
    setResult(false);
    setFeedback('');
    newNote();
    timer.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((30000 - performance.now() + begin.current) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        clearInterval(timer.current);
        setRunning(false);
        setResult(true);
        onDone(30, 'sprint', scoreRef.current);
      }
    }, 100);
  }

  function choose(position) {
    if (mode === 'sprint' && (!running || performance.now() - begin.current >= 30000)) return;
    const pitch = PITCHES[note];
    if (!pitch.positions.includes(position)) {
      setFeedback('Try another position.');
      return;
    }
    audio.play(pitch.midi);
    if (mode === 'sprint') {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
    setFeedback(note + ' · ' + pitch.positions.join(' or '));
    newNote();
  }

  return (
    <>
      <Heading title="Flashcards" subtitle="Read the note and choose its slide position." />
      <View style={s.card}>
        <View style={s.row}>
          <Button
            label="Untimed"
            selected={mode === 'practice'}
            disabled={running}
            onPress={() => {
              setMode('practice');
              setFeedback('');
            }}
          />
          <Button
            label="30-second sprint"
            selected={mode === 'sprint'}
            disabled={running}
            onPress={() => {
              setMode('sprint');
              setFeedback('');
            }}
          />
        </View>
        {mode === 'sprint' && (
          <>
            <Text style={s.heading}>
              {running
                ? seconds + ' s · ' + score + ' correct'
                : result
                  ? score + ' correct in 30 seconds'
                  : 'Best sprint · ' + best}
            </Text>
            {!running && (
              <Button label={result ? 'Try again' : 'Start sprint'} primary onPress={start} />
            )}
          </>
        )}
        {(mode === 'practice' || running) && (
          <>
            <Measure notes={[note]} />
            <PositionRail onPress={choose} />
            {!!feedback && (
              <Text style={s.body} accessibilityLiveRegion="polite">
                {feedback}
              </Text>
            )}
          </>
        )}
      </View>
    </>
  );
}

export function Rhythm({ audio, onDone }) {
  const [patternIndex, setPatternIndex] = useState(0);
  const [bpm, setBpm] = useState(80);
  const [active, setActive] = useState(false);
  const [beat, setBeat] = useState(-4);
  const [hits, setHits] = useState([]);
  const [extras, setExtras] = useState(0);
  const [result, setResult] = useState(null);
  const timer = useRef(null);
  const startTime = useRef(0);
  const recordedHits = useRef([]);
  const recordedExtras = useRef(0);
  const pattern = rhythmPatterns[patternIndex];
  const beatMs = 60000 / bpm;

  useEffect(
    () => () => {
      clearInterval(timer.current);
      audio.stop();
    },
    [],
  );

  function stop() {
    clearInterval(timer.current);
    setActive(false);
    audio.stop();
  }

  function start() {
    stop();
    setActive(true);
    setHits([]);
    setExtras(0);
    setBeat(-4);
    setResult(null);
    recordedHits.current = [];
    recordedExtras.current = 0;
    startTime.current = performance.now() + 4 * beatMs;
    let previous = -4;
    audio.play(88);
    timer.current = setInterval(() => {
      const step = (performance.now() - startTime.current) / beatMs;
      if (step >= 8) {
        const landed = recordedHits.current.length;
        const missed = pattern.beats.length - landed;
        const extra = recordedExtras.current;
        stop();
        setResult({ landed, missed, extra });
        onDone((12 * beatMs) / 1000, 'rhythm');
      } else if (Math.floor(step) > previous) {
        previous = Math.floor(step);
        setBeat(previous);
        audio.play(88);
      }
    }, 20);
  }

  function tap() {
    if (!active) return;
    const tapBeat = (performance.now() - startTime.current) / beatMs;
    const tolerance = Math.min(0.24, 180 / beatMs);
    if (tapBeat < -tolerance || tapBeat >= 8) return;
    const index = matchTap(pattern.beats, recordedHits.current, tapBeat, tolerance);
    if (index < 0) {
      recordedExtras.current += 1;
      setExtras(recordedExtras.current);
    } else {
      recordedHits.current = [...recordedHits.current, index];
      setHits(recordedHits.current);
    }
  }

  return (
    <>
      <Heading
        title="Rhythm"
        subtitle="Listen to four count-in beats, then tap the marked notes."
      />
      <View style={s.card}>
        <View style={s.row}>
          {rhythmPatterns.map((item, i) => (
            <Button
              key={item.title}
              label={item.title}
              disabled={active}
              selected={i === patternIndex}
              onPress={() => {
                setPatternIndex(i);
                setResult(null);
                setHits([]);
                setExtras(0);
              }}
            />
          ))}
        </View>
        <Tempo value={bpm} onChange={setBpm} disabled={active} />
        {[0, 4].map((offset) => (
          <View key={offset} style={s.rail}>
            {Array.from({ length: 8 }, (_, i) => {
              const target = offset + i / 2;
              const index = pattern.beats.indexOf(target);
              return (
                <View
                  key={i}
                  style={[
                    s.beatCell,
                    hits.includes(index) && s.beatHit,
                    active && beat === Math.floor(target) && s.beatActive,
                  ]}
                >
                  <Text style={s.small}>{i % 2 ? '&' : i / 2 + 1}</Text>
                  <Text style={s.body}>{index >= 0 ? '●' : '·'}</Text>
                </View>
              );
            })}
          </View>
        ))}
        {active ? (
          <>
            <Text style={s.heading}>
              {beat < 0
                ? 'Count in · ' + (beat + 5)
                : hits.length + ' on time · ' + extras + ' extra'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPressIn={tap}
              style={[s.button, s.buttonPrimary, s.tapPad]}
            >
              <Text style={s.heading}>Tap here</Text>
            </Pressable>
            <Button label="Stop" onPress={stop} />
          </>
        ) : (
          <>
            {!!result && (
              <Text style={s.body}>
                {result.landed} on time · {result.missed} missed · {result.extra} extra
              </Text>
            )}
            <Button label={result ? 'Try again' : 'Start rhythm drill'} primary onPress={start} />
          </>
        )}
      </View>
    </>
  );
}

export function Freeplay({ audio }) {
  const [partial, setPartial] = useState(0);
  const [position, setPosition] = useState(1);
  const midi = PARTIALS[partial] - position + 1;
  return (
    <>
      <Heading title="Freeplay" subtitle="Choose a partial and move the virtual slide." />
      <View style={[s.card, s.hero]}>
        <Text style={s.heroTitle}>{pitchName(midi)}</Text>
        <Text style={s.body}>
          Partial {partial + 2} · Position {position}
        </Text>
        <View style={s.row}>
          {PARTIALS.map((base, i) => (
            <Button
              key={base}
              label={'Partial ' + (i + 2)}
              selected={i === partial}
              onPress={() => {
                setPartial(i);
                audio.play(base - position + 1);
              }}
            />
          ))}
        </View>
        <SlideVisual value={position} />
        <PositionRail
          value={position}
          onPress={(next) => {
            setPosition(next);
            audio.play(PARTIALS[partial] - next + 1);
          }}
        />
        <Button label="Play note" primary onPress={() => audio.play(midi)} />
      </View>
    </>
  );
}
