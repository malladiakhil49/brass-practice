import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PITCHES } from '../lessons';
import { s } from '../theme';

const positions = [1, 2, 3, 4, 5, 6, 7];
const staffLines = [42, 54, 66, 78, 90];

export function Button({
  label,
  onPress,
  primary,
  selected,
  disabled,
  wrong,
  right,
  style,
  accessibilityLabel,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        primary && s.buttonPrimary,
        selected && s.buttonSelected,
        wrong && s.buttonWrong,
        right && s.buttonRight,
        style,
        pressed && s.pressed,
        disabled && !wrong && !right && s.disabled,
      ]}
    >
      <Text style={s.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function Heading({ title, subtitle }) {
  return (
    <View>
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Measure({ notes, active = -1, names = false }) {
  return (
    <View style={s.measure}>
      {staffLines.map((top) => (
        <View key={top} style={[s.staffLine, { top }]} />
      ))}
      <Text style={s.clef} accessibilityLabel="Bass clef">
        𝄢
      </Text>
      {notes.map((name, index) => {
        const pitch = PITCHES[name];
        const y = 90 - pitch.step * 6;
        const down = pitch.step >= 4;
        const color = '#242a21';
        return (
          <View
            key={index}
            style={s.noteColumn}
            accessible
            accessibilityLabel={name + (active === index ? ', current note' : '')}
          >
            {active === index && <View style={s.activeNote} />}
            {[10, 12]
              .filter((step) => pitch.step >= step)
              .map((step) => (
                <View key={step} style={[s.ledger, { top: 90 - step * 6 }]} />
              ))}
            {pitch.flat && <Text style={[s.flat, { top: y - 16 }]}>♭</Text>}
            <View style={[s.noteHead, { top: y - 4, backgroundColor: color }]} />
            <View
              style={[
                s.stem,
                { top: down ? y : y - 24, marginLeft: down ? -7 : 5, backgroundColor: color },
              ]}
            />
            {names && <Text style={s.noteName}>{name}</Text>}
          </View>
        );
      })}
    </View>
  );
}

export function PositionRail({ value, onPress }) {
  const [width, setWidth] = useState(1);
  const [local, setLocal] = useState(1);
  const track = useRef(null);
  const origin = useRef(0);
  const position = value ?? local;
  function move(event) {
    const next = Math.max(1, Math.min(7, 1 + (event.nativeEvent.pageX - origin.current - 18) / Math.max(1, width - 36) * 6));
    setLocal(next);
    onPress(next);
  }
  return (
    <View>
      <View ref={track} onLayout={event => setWidth(event.nativeEvent.layout.width)}
        accessibilityRole="adjustable" accessibilityLabel="Trombone slide"
        accessibilityValue={{ min: 1, max: 7, now: position }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={event => {
          const next = Math.max(1, Math.min(7, position + (event.nativeEvent.actionName === 'increment' ? 0.1 : -0.1)));
          setLocal(next);
          onPress(next);
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={event => {
          const pageX = event.nativeEvent.pageX;
          track.current.measureInWindow(x => {
            origin.current = x;
            move({ nativeEvent: { pageX } });
          });
        }}
        onResponderMove={move}
        style={{ height: 72, justifyContent: 'center', backgroundColor: '#e7edf5', borderRadius: 16 }}>
        <View pointerEvents="none" style={{ height: 6, marginHorizontal: 18, borderRadius: 3, backgroundColor: '#b4c5d9' }} />
        <View pointerEvents="none" style={{ position: 'absolute', left: 18 + (position - 1) / 6 * (width - 36) - 16, width: 32, height: 48, borderRadius: 12, backgroundColor: '#2563eb' }} />
      </View>
      <Text style={s.small}>Drag to move · Position {position.toFixed(2)}</Text>
    </View>
  );
}

export function SlideVisual({ value }) {
  const length = (value || 1) * 11 + 12;
  return (
    <View style={s.slideVisual} accessibilityLabel={'Slide set to position ' + (value || 1)}>
      <View style={[s.slideTube, { width: length + '%', top: 13 }]} />
      <View style={[s.slideTube, { width: length + '%', top: 29 }]} />
      <View style={[s.slideGrip, { left: length + '%' }]} />
    </View>
  );
}

export function Tempo({ value, onChange, disabled }) {
  return (
    <View style={s.row}>
      <Button
        label="−"
        accessibilityLabel="Reduce tempo by 5 BPM"
        disabled={disabled || value <= 50}
        onPress={() => onChange(value - 5)}
      />
      <Text style={s.body}>{value} BPM</Text>
      <Button
        label="+"
        accessibilityLabel="Increase tempo by 5 BPM"
        disabled={disabled || value >= 160}
        onPress={() => onChange(value + 5)}
      />
    </View>
  );
}
