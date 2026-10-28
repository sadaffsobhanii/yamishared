# Yami prototype updates (Oct 27, 2026)

Open `yami-prototype.html` in any browser to try it. This is the version on the shared Yami prototype link.

## What changed
- **USC look:** cardinal and gold, Unbounded and Instrument Sans fonts, thick outlines, and "pop" shadows, matching yami-usc.netlify.app.
- **Trojan Yami** is the mascot everywhere, including every onboarding screen.
- **New onboarding** in ZOE's order: welcome, credibility (FDA Daily Values, USDA, real USC menus), stats, why we built Yami, data promise, birth year, goals, weight, long-term health, what you want from Yami, how it works, the Fuel Score breakdown, a try-a-meal demo, snap, result, day 1, first score, snap goal, what gets in the way, small wins, commitment, and setup.
- **Fuel Score breakdown:** fiber 35 points (FDA 28 g a day), protein 25 (FDA 50 g a day), plants 20, and 20 for staying under FDA limits on sodium, saturated fat, and added sugar. Each plate is compared to one third of a day.
- **Example meals** from TCC (Seeds, Taco-Taco, Panda Express, Burger Crush), the Village (sweetgreen, CAVA, Bruxie), and Starbucks, using Connor's dataset. The Seeds poke values are estimates.
- **Home:** Yami logo, a 7-day strip with a score ring per day, the Fuel Score card, and "Recently uploaded" meals with their scores.
- **Tabs:** Home, Snap, and Cart. Order Smart now lives inside Cart.
- **Removed** 6 onboarding questions (trip-ups, past food apps, meal sources, cooking, meal prep, and grocery frequency).

## To do in the Cursor code
1. Copy these changes into the source code. This file is a built export, so editing it directly won't update the codebase.
2. Add `ANTHROPIC_API_KEY` to `.env.local` so photos are read by Claude instead of MobileNet.
3. Add a personal USDA key as `VITE_USDA_API_KEY`.
4. Make Home's daily Fuel Score use the same FDA-based points as the onboarding.
5. Ask Connor to add Seeds Marketplace's poke menu and a "sourced or estimated" column.
