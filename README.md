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
or per 100 ml, then enter the amount consumed. No goals or meal groups.
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
