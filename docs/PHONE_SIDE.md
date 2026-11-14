# The phone side (in the Iris Android app)

The watch app is only a remote: a button, a state, an answer. Everything else is Iris on the phone,
so the watch gets every skill of the Rust core and the Kotlin services without its own code.

```
watch: tap ─ listen ─▶ phone: open Bluetooth SCO to the watch ─▶ record (VOICE_COMMUNICATION)
                                ─▶ speech recognition (Marmalade STT, as for the phone's own microphone)
                                ─▶ Assistant.respond (Rust core first, Kotlin services for the rest)
watch: shows ◀─ answer parts (≤1 KB each) + card ◀─ phone
```

## To build in `madebycli/iris-android`

1. **Wear Engine SDK** for Android (phone side) from Huawei's Maven repository, and the Wear Engine
   service applied for in AppGallery Connect for the Iris app (developer account, app project, the
   signing certificate's SHA-256 fingerprint). Huawei Health must be installed on the phone.
2. **`WatchLink`** (new, `app/iris/watch/`): registers a P2P receiver for the watch app's package,
   parses the messages of `PROTOCOL.md`, sends `state` and `answer` (split into ≤1 KB parts).
3. **Recording through the watch**: on `listen`, select the watch as communication device
   (`AudioManager.setCommunicationDevice` with the Bluetooth SCO/HFP device, Android 12+; before that
   `startBluetoothSco`), record with `AudioRecord(VOICE_COMMUNICATION)`, stop on `stop` or silence, and
   hand the audio to the existing speech recognition. Release the device afterwards.
4. **Answer**: `Assistant.respond(text)`; `Reply.text` as `answer` parts, a card from `Reply.card`
   (alarm, reminder, timer, list), `ask` when the reply is a question (the core reports `kind: question`).
5. **Settings**: the watch's language from `hello` decides the recognition language for its requests.

## Unknowns, to check on a real GT 6 first

- Whether Android can open SCO to the GT 6 outside a phone call (the watch exposes the headset profile
  for calls; this is the assumption the design rests on).
- Whether Wear Engine is granted for an individual developer and how long the review takes.
- Battery and latency of SCO for short requests.
