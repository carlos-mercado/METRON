# METRON

A workout tracking app built with React, TypeScript, and Vite.

## Features

- Create workouts from scratch or pick from pre-built templates.
- Track sets, reps, and weight for each movement.
- View workout / movement stats with interactive charts
- Heatmap for daily usage.
- Google Sign-In via Firebase Auth.
- Daily nutrition log: calories, protein, carbs, and fat; manual entry or barcode lookup; edit/delete and previous-day logging.

## Nutrition

Open Nutrition from the home screen. Enter nutrition per serving, per 100 g,
per 100 ml, per 1 g, per 1 ml, per 1 oz, or per 1 fl oz, then the amount eaten
in any unit of the same kind: g, oz, or lb for weight; ml, fl oz, cup, tbsp, or
tsp for volume. Weight and volume never convert into each other.

An optional serving size (the gram or milliliter figure on the label, e.g. 28
for "1 oz (28 g)") links servings to weight or volume, so a per-serving label
can be logged in grams and a per-100 g label in servings. Barcode lookups fill
it from Open Food Facts when the product lists one and default to one serving.
When exactly one of calories, protein, carbs, and fat is blank, it is estimated
from the others (4 kcal/g protein and carbs, 9 kcal/g fat) and marked as such. No goals or meal groups.
Entries are stored locally in this browser, scoped to the signed-in user and
local calendar date. They do not sync with the Flask backend or other devices;
clearing browser storage removes them.

Barcode lookup uses Open Food Facts. Review the returned values and their basis
against the packaging, especially for liquids; missing nutrients must be entered
manually. Camera scanning requires HTTPS, camera permission, and a browser with
camera access. Type the barcode when scanning is unavailable.

Scanning uses the native `BarcodeDetector` when the browser supports it
(e.g. Chrome on Android), otherwise the `barcode-detector` ponyfill's zxing-cpp
WebAssembly decoder. The `.wasm` file is bundled and served by the app rather
than fetched from a CDN, and is preloaded when the Nutrition page opens. Only
grocery formats (EAN-13, EAN-8, UPC-A, UPC-E) are decoded, from an HD rear
camera stream sampled every 100 ms.

Product data is attributed to Open Food Facts under ODbL in the nutrition page.

Run calculation and barcode response checks with `npm run test:nutrition`.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Auth:** Firebase Authentication (Google OAuth)
- **Database:** Firebase Realtime Database
- **API:** Flask REST API
- **Charts:** Recharts, react-activity-calendar
- **Nutrition:** Open Food Facts API, barcode-detector (zxing-cpp WebAssembly)
- **Hosting:** Vercel, EC2
