import { useState } from 'react';
import { Share, Text, TextInput, View } from 'react-native';
import { Button, Heading } from '../components/PracticeControls';
import { decodeScore, encodeScore } from '../practice';
import { s } from '../theme';

export function Friends({ progress, setProgress }) {
  const [name, setName] = useState(progress.name);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const myCode = name.trim() ? encodeScore(name, progress.bestSprint) : '';
  function add() {
    const friend = decodeScore(code);
    if (!friend) {
      setMessage('Enter a valid Brass Practice score code.');
      return;
    }
    if (friend.name.toLowerCase() === name.trim().toLowerCase()) {
      setMessage('That code uses your display name. Use a different name for each player.');
      return;
    }
    setProgress((old) => ({
      ...old,
      friends: [
        ...old.friends.filter((item) => item.name.toLowerCase() !== friend.name.toLowerCase()),
        friend,
      ],
    }));
    setCode('');
    setMessage(friend.name + '’s sprint score was saved.');
  }
  return (
    <>
      <Heading
        title="Friends"
        subtitle="Exchange sprint scores with a friend using a score code."
      />
      <View style={s.card}>
        <Text style={s.heading}>Your score card</Text>
        <TextInput
          accessibilityLabel="Display name"
          placeholder="Display name"
          placeholderTextColor="#727a6d"
          style={s.input}
          value={name}
          maxLength={24}
          onChangeText={(value) => {
            setName(value);
            setProgress((old) => ({ ...old, name: value.trim() }));
          }}
        />
        <Text style={s.body}>Best sprint · {progress.bestSprint}</Text>
        {!!myCode && (
          <Text selectable style={s.small}>
            {myCode}
          </Text>
        )}
        <Button
          label="Share score code"
          primary
          disabled={!myCode}
          onPress={() =>
            Share.share({ message: myCode }).catch(() =>
              setMessage('You can copy the code shown above.'),
            )
          }
        />
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Add a friend’s score</Text>
        <TextInput
          accessibilityLabel="Friend score code"
          value={code}
          onChangeText={setCode}
          style={s.input}
          maxLength={330}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Paste score code"
          placeholderTextColor="#727a6d"
        />
        <Button label="Save score" disabled={!code.trim()} onPress={add} />
        {!!message && (
          <Text accessibilityLiveRegion="polite" style={s.body}>
            {message}
          </Text>
        )}
        {progress.friends.map((friend) => (
          <Text key={friend.name} style={s.body}>
            {friend.name} · {friend.bestSprint} correct
          </Text>
        ))}
      </View>
    </>
  );
}

export function Scores({ progress, openFriends }) {
  const rows = [
    {
      name: (progress.name || 'You') + (progress.name ? ' (you)' : ''),
      bestSprint: progress.bestSprint,
      self: true,
    },
    ...progress.friends,
  ].sort((a, b) => b.bestSprint - a.bestSprint || a.name.localeCompare(b.name));
  return (
    <>
      <Heading
        title="Leaderboard"
        subtitle="Best scores from your 30-second flashcard sprints and imported score cards."
      />
      <View style={s.card}>
        {rows.map((entry, index) => (
          <View key={entry.self ? 'me' : entry.name} style={[s.rowBetween, s.scoreLine]}>
            <Text style={s.body}>
              {index + 1}. {entry.name}
            </Text>
            <Text style={s.heading}>{entry.bestSprint}</Text>
          </View>
        ))}
        <Button label="Add a friend’s score" onPress={openFriends} />
      </View>
    </>
  );
}
