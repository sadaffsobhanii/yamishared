# Yami

A warm nutrition companion — mobile-first prototype.

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
