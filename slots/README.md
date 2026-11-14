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

## Build, sign and install

Step by step (German): [`docs/ANLEITUNG.md`](../docs/ANLEITUNG.md).
