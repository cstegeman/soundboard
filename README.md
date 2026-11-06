# Soundboard

## Requirements

Node 24 (see `.nvmrc`; run `nvm use`). The `generate` script runs TypeScript
directly with Node, which needs native type stripping.

## Scripts

Run these in the project directory with `npm run <script>`.

### `npm start` (alias `npm run dev`)

Runs the app in development mode with hot reload.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder with Vite. The build is
minified and the filenames include hashes.

### `npm run preview`

Serves the production build locally.

### `npm run analyze`

Builds with sourcemaps and opens a bundle size report.

### `npm test`

Runs the unit tests once with Vitest.

### `npm run test:e2e`

Runs the Playwright acceptance tests in `e2e/` against the dev server (started automatically).
Install the browser once with `npx playwright install chromium`.

### `npm run lint`

Checks formatting with Prettier, code with oxlint (config in `.oxlintrc.json`) and types with `tsc`.

### `npm run typecheck`

Runs `tsc` only.

### `npm run generate`

Generates `public/sounds.json` from the audio files in `public/audio`.\
Put the audio files in a subfolder of `public/audio`. Folder names must be
URL-safe, and each file needs ID3 tags with at least a title and an album name.
