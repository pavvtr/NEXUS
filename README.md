# Nexus Digital Wellness — Frontend

## Requirements
- Node.js 20.9 or newer
- npm
- VS Code (recommended)

## Run locally
1. Extract this ZIP.
2. Open the `nexus-digital-wellness` folder in VS Code.
3. Open Terminal > New Terminal.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open http://localhost:3000.

## Main files
- `app/page.tsx` — all dashboard screens and interactions
- `app/globals.css` — Tailwind import and global styles
- `app/layout.tsx` — page metadata and root layout
- `postcss.config.mjs` — Tailwind v4 PostCSS plugin

## Included screens
Overview, Screen limits, Break schedule, Study mode, Reports and Settings.

## Important prototype limitation
This is a frontend-only browser prototype. Settings are saved in localStorage. Timers and reminders work while the website is open. A browser website cannot inspect or block other apps' screen time. Actual phone-wide app monitoring and enforcement requires a native Android/iOS app, OS permissions and usually a backend or local native storage.

## Notes
The sample app-category usage values are demo data. Replace them with real data only after implementing a native mobile integration.
