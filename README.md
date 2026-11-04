# Yami

A warm nutrition companion — mobile-first prototype.

## Official version (as of Nov 4, 2026)

**`yami-prototype.html` is the one version everyone uses.** It's the Oct 27 app (USC look, Trojan Yami, new onboarding, Home, Snap and Cart tabs, dairy and gluten labels) plus Liz's Oct 30 edits (real meal photos, home-screen app icon, Taco-Taco card removed, iced Americano on the Starbucks card).

- Live link: https://yami-usc.netlify.app/app/
- `app/` is an exact copy of the live app folder (photos, icons, manifest). `app/index.html` is the same file as `yami-prototype.html`.
- **Make touch-ups in `yami-prototype.html` only.** Then copy it to `app/index.html` in Liz's repo (garard-cpu/yami-website) so it goes live.
- **Don't edit the `src` folder for now.** It's older code that doesn't have the Oct 27 screens. If it gets built and published, those screens disappear.

The setup steps below are for the older `src` code.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints.

Voice onboarding personalizes the home screen, meal ideas, grocery list, and insights widgets. Meal recognition and prices in this prototype are estimates, not medical advice.

## Nutrition from USDA FoodData Central

After someone confirms the foods in a meal photo, Yami looks each food up in [USDA FoodData Central](https://fdc.nal.usda.gov/) and uses those numbers (a typical serving's protein, fiber, carbs, fat and calories) for the meal score and tips. Foods USDA can't match fall back to Yami's own estimates. The code is in `src/proto/usda.ts`.

Get a free key at https://api.data.gov/signup and add it to a `.env.local` file in the project folder:

```bash
VITE_USDA_API_KEY=your-key-here
```

Without a key it uses USDA's shared `DEMO_KEY`, which only allows about 10 lookups an hour. Lookups are cached in the browser, so each food is fetched once. The key is bundled into the built app, which is fine for this free, rate-limited key.
