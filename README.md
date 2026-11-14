# Iris for the watch

A remote for [Iris](https://github.com/madebycli/iris-android) on the **HUAWEI WATCH GT 6** (and other
GT lite wearables): tap, speak, read the answer. Alarms, reminders, timers and lists are created by
Iris on the phone; the watch shows the confirmation and rings through Huawei Health's mirroring.

- `watch/` — the watch app (HarmonyOS lite wearable, JS/HML/CSS): start page with the microphone
  button and state, answer page with card and Yes/No, settings (language, vibration, text size, how
  long an answer stays).
- `docs/PROTOCOL.md` — the messages between watch and phone.
- `docs/PHONE_SIDE.md` — what the Iris app on the phone does, and what is still unknown.
- `tests/` — `node tests/protocol.test.mjs` checks the message rules without a watch.

## Status

The watch app is written and its JavaScript checked; it has **not been built, installed or run on a
watch**, and the phone side does not exist yet. See `docs/PHONE_SIDE.md` for the open questions
(microphone path, Wear Engine approval).

## Building

You need DevEco Studio with the lite-wearable (sports watch) SDK, a free Huawei developer account and,
in AppGallery Connect, a debug certificate and profile for your watch (its UDID, device "Sports watch").
Copy `wearengine.js` from Huawei's Wear Engine SDK for lite wearables to
`watch/entry/src/main/js/default/common/`, set `PHONE_FINGERPRINT` in `common/bridge.js` to the SHA-256
fingerprint of the Iris app's signing certificate, then build and install from DevEco Studio.

## License

GPL-3.0-or-later, see [LICENSE](LICENSE).
