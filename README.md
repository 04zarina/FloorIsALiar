# FloorIsALiar

A 3D browser game: cross a floating dance floor of colored tiles to reach the exit portal. Each round announces a rule about one tile color ("Orange tiles are slippery!"). The rule may be **true or a lie**. Trust it or ignore it.

**Live:** https://floor-is-a-liar.vercel.app/
**Author:** Zarina Iqbal Buriro · Web 3D Programming

## Features
- Sign up, log in, log out (Supabase Auth), protected routes
- 3D game (Three.js): 3 levels, random tile colors every round, lives, timer, combos, sound, confetti
- Dashboard, history and leaderboard from real saved data

## Tech
React + Vite + TypeScript, Three.js (@react-three/fiber, drei), Tailwind CSS, Supabase (Auth + PostgreSQL), Recharts, Zod, Vitest, Vercel.

## How to play
Move with WASD / arrow keys, or click a neighbouring tile. Stepping off the floor means falling. Only the announced color can be bouncy, slippery or crumbly; every other color is safe. Reach the exit before the timer ends. 3 lives, 3 levels. Esc or P pauses.

## Run locally
```
npm install
copy .env.example .env      (then fill in the two values)
npm run dev
npm test
npm run build
```
`.env` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the publishable key only, never the secret key).

## Database setup
Run the SQL files in `supabase/migrations/` in the Supabase SQL Editor.

| Table | Columns (main) |
|---|---|
| profiles | id (= auth user id), display_name (3-20 chars) |
| game_sessions | id, user_id, score, rounds_survived, falls, accuracy, avg_reaction_ms, duration_seconds, level, reached_exit, created_at |

**Row Level Security** is on for both tables:
- `profiles`: a user can select, insert and update only their own row
- `game_sessions`: a user can select and insert only their own rows. No update or delete, so saved scores can't be changed.

**Functions:** `save_game_session` (runs as the user; `user_id` comes from `auth.uid()`, impossible values are rejected), `get_leaderboard` (returns only display name, best score, level, run count), `handle_new_user` (creates a profile on sign-up).

## Folder structure
```
src/
  components/common/   buttons, forms, navbar, protected route
  context/             AuthContext (session), ToastContext
  game/graph/          level maps, tile graph, movement queue
  game/logic/          game state, rules, scoring, movement (plain TypeScript)
  game/scene/          Three.js scene, tiles, player, portal, particles
  game/hud/            HUD and start/game-over screens
  game/audio/          synthesized sound (Web Audio API)
  lib/                 Supabase client, data functions, stats, validation
  pages/               Landing, Login, Signup, Game, Dashboard, History, Leaderboard, Profile
supabase/migrations/   SQL
test/                  Vitest tests
prompts/               AI prompts used
docs/raycasting.md     raycasting explained
```

## Login and sessions
Supabase Auth handles passwords (hashed, never stored by the app). The session is kept in the browser and restored on refresh. `ProtectedRoute` redirects logged-out users to login, and the database RLS enforces access even if the frontend is bypassed.

## How the game works
- **3D scene:** a React Three Fiber canvas with lights, a disco-hall backdrop, floating tiles and a follow camera.
- **Raycasting:** on a click, the pointer position is converted to normalized screen coordinates, a ray is cast from the camera through that point, and the nearest tile mesh it hits receives the event. Details in `docs/raycasting.md`.
- **Movement:** a tile graph; the player moves to a neighbouring cell. Empty cells mean a fall.
- **Score per round:** `(route bonus + speed bonus + trust bonus) x combo multiplier`
  - route bonus: 500 x (2 - route ratio), so shorter routes score more
  - speed bonus: up to 300, falling to 0 over 5 seconds of decision time
  - trust bonus: 150 if your trust decision was correct
  - combo multiplier: 1 + 0.5 per 2 wins in a row, capped at 4x
- **Trust accuracy:** correct trust decisions / rounds (0 when no rounds).
- **Decision time:** from the rule announcement to the first move.
- **Saving:** when a run ends, one session is saved through `save_game_session`. The dashboard calculates totals and averages from the saved rows.

## Security
- Zod validation on login, sign-up and saved scores; passwords need 8+ characters with a letter and a number
- No `dangerouslySetInnerHTML`; React escapes all text
- Redirects only go to in-app paths
- `.env` is git-ignored; only the public (publishable) key is used in the browser
- RLS on all tables; leaderboard exposes only display names and scores

## Tests
- Automated (Vitest): 12 files, 69 tests, all passing. Covers scoring, accuracy, game state, rules, movement, levels, raycasting, validation, redirects, stats.
- Manual: sign-up, wrong password, session refresh, route protection, run saving, dashboard, two-account data isolation, leaderboard, win and failure screens, pause menu: all passed. 
- `npm audit --omit=dev`: 2 moderate (react-router 6.x: open redirect, SSR hydration). The app doesn't use SSR and navigates only to fixed paths. Not upgraded because the fix is a breaking major version.

## Limitations
- Scores are sent from the browser, so a determined user could fake a plausible score. The database rejects impossible values only.
- Only finished runs are saved.
- No login-alert emails (would need an Edge Function and an email service).
- Dev-tool vulnerabilities (Vite/Vitest) remain.

## Version control
Work was committed to GitHub (`main`) in stages: setup, theme and Supabase, 3D scene, game logic, audio and effects, Supabase saving and dashboard, validation, deployment.

## Credits and AI use
Character model "Block Character" by J-Toastie. Antigravity built the first stages; after its credits ran out, the rest was written with Claude (Anthropic) and pasted in manually, then tested by the author.
