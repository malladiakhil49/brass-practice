# Brass Practice

Brass Practice is a mobile app for practicing B♭ tenor trombone away from the instrument. Pick a short piece, read the bass-clef part, and work through it one slide position at a time. You can hear the notes, slow the piece down, or loop a single measure.

## What’s in v1.0.0

This is the first public release. The library starts with two original trombone pieces, **The Arch** and **Step and Leap**.

- **Music and slide practice.** Practice the whole piece or a single measure. Play the phrase at an adjustable tempo, loop it, and hear a reference tone when you choose a correct position.
- **Sight-reading and scales.** Generate a four-measure exercise with mostly steps or wider leaps. Practice B♭ major and F major.
- **Rhythm and flashcards.** Tap rhythms after a count-in, review positions at your own pace, or try a 30-second sprint.
- **Daily practice and freeplay.** Work through a daily exercise, track your streak, or explore how changing position and partial changes the note.
- **Interpretation quizzes.** Answer questions about articulation, phrase shape, and choices such as where a crescendo might peak. The included interpretation questions are written for the built-in pieces.
- **Friends and leaderboard.** Share your best sprint as a score code. Friends can paste it into their app and compare the imported scores on their own device.

The audio uses synthesized reference tones. Practice history and imported scores are saved on the device.

## Run it locally

You’ll need Node.js and npm on your computer. To try the mobile app, use an Expo Go version that supports this project's Expo SDK 58.

From the project folder, run:

```bash
npm ci
npm start
```

Keep your phone and computer on the same Wi-Fi and scan the QR code Expo shows. Open **Music**, choose **The Arch**, and tap **Play phrase**. Use **Control+C** in Terminal to stop the server. If you downloaded the ZIP, `bash setup.sh` from the project folder runs the same setup.

## Upcoming updates

| Planned feature                        | What I want it to do                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Grade 1–5 trombone repertoire**      | Build a substantial, searchable library of trombone pieces with playable sheet music. Filter by grade, range, style, and skills like legato or syncopation. The source still needs to be decided. I’ll look for scores that can be distributed with the app, record the source and permissions for each edition, and prefer MusicXML so the notation can support playback and practice tools. |
| **Programmable metronome**             | Let players set a starting tempo and add changes by measure or beat. A piece could start at 72 BPM, move to 88 BPM at measure 9, and slow to 64 BPM at measure 17. The metronome would follow the same plan when a section is looped.                                                                                                                                                         |
| **Trombone tuner**                     | Use the microphone to show the detected concert pitch, whether it’s sharp or flat, and how steady it stays during a long tone.                                                                                                                                                                                                                                                                |
| **Camera import and AI practice help** | Take a photo of a trombone part and upload it. Show the recognized notation for correction, then let the player hear the passage, slow it down, or ask the coach to explain a rhythm, suggest slide positions, or create interpretation questions. [MakeMusic’s Conn Selmer page](https://www.makemusic.com/connselmer/) is a reference for this workflow.                                    |
| **Play-along feedback**                | Play along with a count-in and optional backing track. After a take, highlight notes that were missed, late, or out of tune and replay those spots.                                                                                                                                                                                                                                           |
| **Articulation and listening coach**   | Compare two takes of the same passage, listen for legato, staccato, and tenuto, and replay the transitions that differed. Start with labeled recordings and test feedback on players the model hasn’t heard before.                                                                                                                                                                           |
| **Tempo ladder and targeted drills**   | Set a goal tempo and raise it in steps after a successful repeat. Suggest a short drill for a rhythm, position, or transition the player keeps missing.                                                                                                                                                                                                                                       |
| **More brass instruments**             | Reuse the score and practice tools for trumpet and baritone, with valve controls and instrument-specific ranges and fingerings.                                                                                                                                                                                                                                                               |

## Project layout

- `App.js` handles navigation and saved progress.
- `components/PracticeControls.js` contains the score display and shared practice controls.
- `screens/` contains the drills, quizzes, and score-sharing screens.
- `lessons.js` holds the built-in pieces, slide positions, scales, and sight-reading generator.
- `practice.js` handles rhythm scoring, daily progress, and score codes.
- `audio.js`, `tones.js`, and `assets/tones/` handle reference playback.

The light navigation and yellow practice controls were inspired by [Glisso](https://glisso.net/friends).
