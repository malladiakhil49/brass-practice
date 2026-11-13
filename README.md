# Brass Practice v2 preview

An Expo mobile trombone practice app.

## Run
Install Node.js, extract this folder, open a terminal here, and run:

    npm ci
    npx expo start

Scan the QR code with a compatible Expo Go installation. Dependencies retain the supplied v1 Expo SDK versions.

## Changes
- Drag the slide continuously in score practice, flashcards, and freeplay.
- Answers within 0.22 of a target slide position count as correct.
- Blue-gray score surface and blue active-note highlighting.
- Bundled synthesized sounds for every semitone from E1 to E6.
- Fractional pitches use playback-rate adjustment.

## Verification and limitations
Audio files were generated and checked for nonzero sample data. Native playback and gesture behavior require testing on a phone. Audio is synthesized, not recorded trombone samples. Rapid dragging retriggers notes and can sound stepped; this is an initial slide implementation, not a validated acoustic model. The staff renderer currently supports the original quarter-note exercises.

## Pending roadmap
Programmable metronome, microphone tuner, MusicXML import, camera recognition, expanded graded repertoire, AI interpretation quizzes, and performance analysis remain future work. This preview does not implement the full proposed v2 roadmap.
