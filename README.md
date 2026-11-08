# Yami

A warm nutrition companion — mobile-first prototype.

## The app moved: one version only (Nov 8, 2026)

**The one and only Yami app now lives in the website repo: [garard-cpu/yami-website](https://github.com/garard-cpu/yami-website), file `app/index.html`.** It's Saf's Nov 7 version (groceries helper, caffeine tracking, badges and share card) plus logins (email, Google) and the meal photos.

- Live link: https://yami-usc.netlify.app/app/
- **Make all edits there.** Changes merged to its `main` go live automatically; every pull request gets its own preview link first.
- The old copies (`yami-prototype.html` and `app/`) were removed from this repo so nobody edits a version without logins by mistake. They're still in this repo's history if ever needed.
- **Don't edit the `src` folder.** It's older code without the Oct 27 screens.

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
