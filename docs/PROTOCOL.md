# Watch ↔ phone protocol

Transport: Huawei Wear Engine P2P messages between the watch app (`dev.madebycli.irisclock`) and the
Iris app on the phone (`app.iris`). One message is one JSON object with a type `t`, UTF-8, at most
1 KB (Wear Engine's limit). Longer answers are split into parts.

## Watch → phone

| `t` | Fields | Meaning |
|---|---|---|
| `hello` | `v` (protocol version, 1), `lang` (`de`/`en`) | The watch app opened or the language changed. |
| `listen` | | Start listening: the phone opens the watch's Bluetooth microphone and records. |
| `stop` | | The user tapped again: stop recording and answer. The phone may also stop on silence. |
| `text` | `s` | A typed or preset sentence instead of speech. |
| `confirm` | `id`, `yes` | Answer to a yes/no question of answer `id`. |

## Phone → watch

| `t` | Fields | Meaning |
|---|---|---|
| `state` | `s`: `listening`, `thinking`, `idle` | What the phone is doing, so the watch shows it. |
| `answer` | `id`, `part` (0-based), `of`, `s`, optional `card`, `ask` | One part of an answer; the watch shows it when all `of` parts arrived. `ask: true` shows Yes/No. |
| `error` | `s` | Something failed; `s` is shown as it is. |

`card` (only on part 0 or any part, the last one seen wins): `{ "kind": "Wecker", "title": "7:00 Uhr", "when": "morgen" }`.
The phone fills `kind`, `title`, `when` in the user's language; the watch only shows them.

## What the watch does not do

- **Recording on the watch.** No documented microphone API for third-party lite-wearable apps was found
  for the GT series. The phone records through the watch's Bluetooth headset microphone (the path calls use).
- **Alarms and reminders on the watch.** Iris on the phone sets them (clock app, its own reminders). The
  watch shows the confirmation card, and the watch rings because Huawei Health mirrors the phone's
  alarm and notification to it.
- **Internet.** Lite wearables have none; everything goes through the phone.
