import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { AppState, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { usePracticeAudio } from './audio';
import { Button, Heading } from './components/PracticeControls';
import { generateExercise, LIBRARY, SCALES } from './lessons';
import { dailySeed, dayKey, initialProgress, logPractice, streak } from './practice';
import { Friends, Scores } from './screens/ScoreSharing';
import { Flashcards, Freeplay, Quiz, Rhythm, ScorePractice } from './screens/TrainingScreens';
import { s } from './theme';

const navigation = [
  ['daily', 'Daily', '◷'],
  ['music', 'Music', '♫'],
  ['sight', 'Sight-reading', '◈'],
  ['rhythm', 'Rhythm', '♩'],
  ['flash', 'Flashcards', '▣'],
  ['scales', 'Scales', '↗'],
  ['quiz', 'Quiz', '?'],
  ['freeplay', 'Freeplay', '↔'],
  ['friends', 'Friends', '♡'],
  ['rankings', 'Leaderboard', '★'],
];
const storageKey = 'brass-practice-progress-v2';

function PracticeApp() {
  const [screen, setScreen] = useState('daily');
  const [lesson, setLesson] = useState(LIBRARY[0]);
  const [mode, setMode] = useState('music');
  const [session, setSession] = useState(0);
  const [progress, setProgress] = useState(initialProgress);
  const [loaded, setLoaded] = useState(false);
  const { width } = useWindowDimensions();
  const wide = width >= 740;
  const audio = usePracticeAudio();
  const scroll = useRef(null);
  const today = dayKey();
  const todayProgress = progress.history[today];

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey)
      .then((value) => {
        if (!mounted || !value) return;
        const saved = JSON.parse(value);
        if (saved.history && Array.isArray(saved.friends))
          setProgress({ ...initialProgress, ...saved });
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(storageKey, JSON.stringify(progress)).catch(() => {});
  }, [progress, loaded]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') audio.stop();
    });
    return () => subscription.remove();
  }, []);

  function navigate(next) {
    if (next === screen) return;
    audio.stop();
    setScreen(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  function openLesson(nextLesson, nextMode) {
    setLesson(nextLesson);
    setMode(nextMode);
    setSession((count) => count + 1);
    navigate('practice');
  }

  function record(seconds, activity, score) {
    setProgress((old) => logPractice(old, seconds, activity, score));
  }

  function daily() {
    const exercise = generateExercise('stepwise', dailySeed(today));
    openLesson({ ...exercise, title: 'Daily challenge' }, 'daily');
  }

  const chosen = screen === 'practice' ? mode : screen;
  const menu = navigation.map(([key, label, icon]) => (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: chosen === key }}
      key={key}
      onPress={() => navigate(key)}
      style={[s.navItem, chosen === key && s.navActive]}
    >
      <Text style={s.navIcon}>{icon}</Text>
      <Text style={s.navText}>{label}</Text>
    </Pressable>
  ));

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <View style={[s.frame, wide && s.wide]}>
        {wide ? (
          <ScrollView style={s.sidebar}>
            <Text style={s.wordmark}>
              brass<Text style={s.wordmarkMark}>.</Text>
            </Text>
            <View style={s.navList}>{menu}</View>
          </ScrollView>
        ) : (
          <View style={s.mobileNav}>
            <Text style={s.wordmark}>
              brass<Text style={s.wordmarkMark}>.</Text>
            </Text>
            <ScrollView horizontal contentContainerStyle={s.navList} showsHorizontalScrollIndicator>
              {menu}
            </ScrollView>
          </View>
        )}
        <ScrollView
          ref={scroll}
          style={s.appBody}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {!loaded ? (
            <Text style={s.body}>Loading practice history…</Text>
          ) : (
            <>
              {screen === 'daily' && (
                <>
                  <Heading title="Practice today" subtitle="B♭ tenor trombone" />
                  <View style={[s.card, s.hero]}>
                    <Text style={s.heroTitle}>Daily challenge</Text>
                    <Text style={s.body}>
                      {todayProgress?.daily
                        ? 'Completed today. Play it again any time.'
                        : 'Practice today’s four-measure slide exercise.'}
                    </Text>
                    <View style={s.columns}>
                      <View style={s.stat}>
                        <Text style={s.statNumber}>{streak(progress.history)}</Text>
                        <Text style={s.small}>Day streak</Text>
                      </View>
                      <View style={s.stat}>
                        <Text style={s.statNumber}>
                          {Math.round((todayProgress?.seconds || 0) / 60)} min
                        </Text>
                        <Text style={s.small}>Practiced today</Text>
                      </View>
                      <View style={s.stat}>
                        <Text style={s.statNumber}>{progress.bestSprint}</Text>
                        <Text style={s.small}>Best sprint</Text>
                      </View>
                    </View>
                    <Button
                      label={todayProgress?.daily ? 'Replay challenge' : 'Start daily challenge'}
                      primary
                      onPress={daily}
                    />
                  </View>
                  <View style={s.columns}>
                    {[
                      ['music', 'Music', 'Play and loop a passage.', s.cardBlue],
                      ['flash', 'Flashcards', 'Train your slide positions.', s.cardGreen],
                      ['rhythm', 'Rhythm', 'Tap with the metronome.', s.cardRose],
                    ].map(([key, title, body, theme]) => (
                      <View style={[s.card, s.tile, theme]} key={key}>
                        <Text style={s.heading}>{title}</Text>
                        <Text style={s.body}>{body}</Text>
                        <Button label={'Open ' + title} onPress={() => navigate(key)} />
                      </View>
                    ))}
                  </View>
                </>
              )}
              {screen === 'music' && (
                <>
                  <Heading
                    title="Music"
                    subtitle="Original trombone pieces for your practice session."
                  />
                  {LIBRARY.map((item) => (
                    <View style={s.card} key={item.id}>
                      <Text style={s.heading}>{item.title}</Text>
                      <Text style={s.body}>{item.description}</Text>
                      <Button
                        label="Open score"
                        primary
                        onPress={() => openLesson(item, 'music')}
                      />
                    </View>
                  ))}
                </>
              )}
              {screen === 'sight' && (
                <>
                  <Heading
                    title="Sight-reading"
                    subtitle="Generate a new four-measure score in bass clef."
                  />
                  <View style={[s.card, s.cardBlue]}>
                    <Text style={s.heading}>Choose the movement</Text>
                    <Button
                      label="Mostly steps"
                      primary
                      onPress={() => openLesson(generateExercise(), 'sight')}
                    />
                    <Button
                      label="Add leaps"
                      onPress={() => openLesson(generateExercise('leaps'), 'sight')}
                    />
                  </View>
                </>
              )}
              {screen === 'scales' && (
                <>
                  <Heading
                    title="Scales"
                    subtitle="Practice slide positions and listen to the scale at your tempo."
                  />
                  {SCALES.map((item) => (
                    <View style={s.card} key={item.id}>
                      <Text style={s.heading}>{item.title}</Text>
                      <Text style={s.body}>{item.description}</Text>
                      <Button
                        label="Practice scale"
                        primary
                        onPress={() => openLesson(item, 'scales')}
                      />
                    </View>
                  ))}
                </>
              )}
              {screen === 'practice' && (
                <ScorePractice
                  key={session}
                  lesson={lesson}
                  mode={mode}
                  audio={audio}
                  onDone={record}
                  onQuiz={() => navigate('quiz')}
                />
              )}
              {screen === 'quiz' && (
                <Quiz
                  key={session}
                  lesson={lesson.quiz?.length ? lesson : LIBRARY[0]}
                  onDone={record}
                />
              )}
              {screen === 'rhythm' && <Rhythm audio={audio} onDone={record} />}
              {screen === 'flash' && (
                <Flashcards audio={audio} best={progress.bestSprint} onDone={record} />
              )}
              {screen === 'freeplay' && <Freeplay audio={audio} />}
              {screen === 'friends' && <Friends progress={progress} setProgress={setProgress} />}
              {screen === 'rankings' && (
                <Scores progress={progress} openFriends={() => navigate('friends')} />
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PracticeApp />
    </SafeAreaProvider>
  );
}
