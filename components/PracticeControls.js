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
  return (
    <View style={s.rail}>
      {positions.map((position) => (
        <Button
          key={position}
          label={String(position)}
          accessibilityLabel={'Slide position ' + position}
          selected={position === value}
          style={s.railButton}
          onPress={() => onPress(position)}
        />
      ))}
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
