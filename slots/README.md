# Iris Slots

A one-armed bandit for the HUAWEI WATCH GT 6, written to test building and installing an own app on
the watch (private, debug build, no real money).

- **Play:** tap DREHEN, swipe down or turn the crown. One credit per round, the middle row pays.
  Start with 100 credits; at 0 there is a refill (counted in the statistics).
- **Machine:** 3 reels × 22 stops, each reel with its own mix of 7, BAR³, BAR, bell, cherry, lemon.
  Long-run return 93.7 %, a win in 28.6 % of rounds, 7 7 7 once in 10,648 rounds — exact numbers from
  going through every combination, checked against a million simulated rounds (`node tests/slots.test.mjs`).
- **Pages:** machine (swipe left: statistics, up: last 20 rounds, right: instructions).
- **Statistics:** rounds, credits, refills, bet, won, measured return next to the machine's, hit rate,
  biggest win, losing streak, every winning line, and per reel how often each symbol landed on the
  payline against its share of the 22 stops.

## Build, sign and install (with Gadgetbridge, no Huawei Health)

The watch checks a signature: an app installs only as a **debug build signed with a profile that names
this exact watch**. Rooting the phone does not change that.

1. **Huawei developer account** (free) at developer.huawei.com.
2. **DevEco Studio** with the lite wearable (sports watch) SDK. Open `slots/` as the project.
3. **AppGallery Connect**: create a HarmonyOS app with device type "Sports watch" and bundle name
   `dev.madebycli.slots`; create a debug certificate (from a CSR made in DevEco Studio); register your
   watch as a test device with its UDID; create a debug profile (`.p7b`) for the app and the watch.
4. **Build** a debug package in DevEco Studio, signed with that certificate and profile.
5. **Install with Gadgetbridge**: open the watch in Gadgetbridge and install the built `.bin` with its
   app installer (see Gadgetbridge issue #4175 for the current state of Huawei app installs).

Not done here: the build itself. The OpenHarmony and Huawei tool sources could not be reached from the
machine this was written on, so the app has not been compiled or run on a watch. Unverified details:
the crown event (`onrotation`) on GT 6 lite apps, and where Gadgetbridge shows the watch's UDID.
