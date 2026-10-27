# Assessment

Findings ledger for the Entity repo. Seeded from the A1 step 0 sweep (Oct 24, 2026). Ids never change and are not push labels; a closed finding keeps its id and records what closed it. Paths are as they stood when each finding was logged.

Severity: critical, high, medium, low. Status: open, partly fixed, fixed (with the push that fixed it).

| Id | Severity | Status | Summary | Closes in |
| --- | --- | --- | --- | --- |
| F-01 | critical | partly fixed (A1) | Supabase service_role and anon keys in public history | to-do (rotation) |
| F-02 | medium | partly fixed (A1) | CRON_SECRET value in public history | to-do (old Vercel project) |
| F-03 | high | fixed (A1) | Secret scanning, push protection, Dependabot alerts were off | A1 |
| F-04 | high | fixed (A3) | No inbound auth on any API route | A3 |
| F-05 | medium | fixed (A3) | Build ignores type and lint errors that exist | A3 |
| F-06 | low | fixed (A3b) | next.config.js and scripts lag Next.js 15.5 | A3 (config), A3a (export script), A3b (next lint) |
| F-07 | low | fixed (A3a) | Unused dependencies: node-cron, replicate (more since A3) | A3a |
| F-08 | medium | partly fixed (A3) | Generation is stubbed; fal has no code; old keys unverified | A3 (code), to-do (keys) |
| F-09 | medium | fixed (A1) | .gitignore missed a plain .env | A1 |
| F-10 | medium | fixed (A3) | 28 modules create a Supabase client at load | A3 |
| F-11 | low | fixed (A3) | Gallery page creates a Supabase client on every render | A3 |
| F-12 | low | fixed (A3) | GENERATION_CYCLE_MINUTES is set but never read | A3 |
| F-13 | low | open | Env var list on the architecture page is wrong | A1 closeout (advisor, Notion) |
| F-14 | medium | fixed (A1) | No git identity; A0 commits carry a hostname address | A1 |
| F-15 | low | fixed (A1) | Stale Vercel bot PR #1 | A1 |
| F-16 | medium | open | GitHub Pages still serves the 2025 site | A4 |
| F-17 | low | fixed (A3) | Legacy root markdown and Supabase scripts | A1 (markdown), A3 (scripts) |
| F-18 | low | fixed (A1) | README described the 2025 generator | A1 |
| F-19 | low | fixed (A3) | public/ holds only unused starter SVGs | A3 |
| F-20 | low | fixed (A3a) | package.json name is still entity-temp | A3a |
| F-21 | low | fixed (A3) | Nine routes still read the data/ CSVs that species.json supersedes | A3 |

---

### F-01: Supabase keys in public history

- Severity: critical
- Status: partly fixed (A1). Values redacted at the tip; still in history
- Where: `docs/archive/LOCAL_DEV_TROUBLESHOOTING.md` (was at the root), lines 116 (anon), 117 and 168 (service_role); line 21 held a header-only fragment. Added in `4317099` (Aug 22, 2025) and present in every later commit on every branch. GitHub secret scanning alert 1 (Supabase Service Key, line 117)
- What: real keys for the project whose ref starts `otkvdk`, issued Aug 13, 2025, expiring Aug 14, 2035. The repo has been public since 2025, so the keys must be treated as copied. They work again if the project is unpaused. A history rewrite would not help
- Closes when: the rotation task on the to-do is done (roll the JWT secret or disable the legacy keys, or delete the project after the backup). Then resolve alert 1 as revoked

### F-02: CRON_SECRET in public history

- Severity: medium
- Status: partly fixed (A1). Value redacted at the tip; still in history
- Where: `docs/archive/LOCAL_DEV_TROUBLESHOOTING.md:127`, since `4317099`
- What: the cron bearer secret of the old Vercel project (starts `entity`, 34 characters). Craig's project does not set `CRON_SECRET`, and the cron is gone
- Closes when: the old Vercel project on David's account is deleted (to-do)

### F-03: GitHub security features were off

- Severity: high
- Status: fixed (A1)
- Where: repo settings
- What: secret scanning, push protection and Dependabot alerts were all disabled on a public repo
- Closed by: A1 enabled secret scanning, push protection and Dependabot alerts. Dependabot security updates stay off by choice

### F-04: No inbound auth on any API route

- Severity: high
- Status: fixed (A3)
- Where: all 46 handlers under `src/app/api/`; there is no `middleware.ts`, and the `/admin` page has no gate
- What: the 29 routes under `/api/admin` write, reset, migrate or delete data with the service role key. Writes outside admin: `species/[id]/media/[mediaType]/[version]` (DELETE, PATCH), `import-133-species`, `simple-import-133`, `import-new-species`, `load-data` (POST), `species-lists` and `queue/status` (GET, POST). `cron/cycle-check` checks `CRON_SECRET` only when it is set, so it fails open. The only reason this is harmless today is that the Supabase variables are placeholders
- Closed by: A3 deleted every route except `GET /api/species` (static), so no route writes. `src/middleware.ts` (matcher `/admin/:path*` and `/api/:path*`) answers 403 to `/admin`, `/api/admin` and `/api/cron` and 405 to any other `/api` method than GET, HEAD or OPTIONS, with no password or env var. The `/admin` page was deleted. A3b renamed the file to `src/proxy.ts` (Next.js 16), same logic and matcher, now on the Node.js runtime

### F-05: The build hides real type and lint errors

- Severity: medium
- Status: fixed (A3)
- Where: `next.config.js:11-16` (`eslint.ignoreDuringBuilds`, `typescript.ignoreBuildErrors`)
- What: `tsc --noEmit` reports 10 errors. Four routes call `GenerationService` methods that no longer exist and would throw at runtime: `api/admin/advance-species/route.ts:6`, `api/admin/start-cycling/route.ts:6`, `api/admin/stop-cycling/route.ts:6`, `api/cron/cycle-check/route.ts:18`. Three are type mismatches: `api/load-data/route.ts:35`, `lib/csv-import.ts:45`, `lib/new-csv-import.ts:51`. Three are in Next's generated route types (the `fix-species-issues` POST return type, the `sse` route exports). ESLint reports 8 errors and 86 warnings
- Closed by: A3 deleted every file with an error and escaped the apostrophe in `landing/page.tsx`; tsc and lint report 0 errors (lint keeps 11 warnings: `<img>`, hook dependencies, an unused prop). `next.config.js` now sets both flags to false, so errors fail the build. Since A3b (Next.js 16, where `next build` no longer lints and the `eslint` option is gone), lint errors fail the build through the `build` script (`npm run lint && next build`); type errors still fail `next build`

### F-06: Config lags Next.js 15.5

- Severity: low
- Status: fixed (A3b)
- Where: `next.config.js:4-7`, `package.json:9-10`
- What: `images.domains` is deprecated in favour of `remotePatterns`. The images block is also dead: `next/image` is not imported anywhere (the app uses `<img>`). It lists `replicate.delivery` and the Supabase host. `next lint` is deprecated in 15.5 and removed in 16. The `export` script is just `next build`
- Fixed in A3: the `images` block and `serverExternalPackages` are gone; the app keeps `<img>`, so no R2 `remotePatterns`. Fixed in A3a: the `export` script is dropped from `package.json`
- Closed by: A3b upgraded to Next.js 16.4.3. `lint` is `eslint .` (ESLint CLI, native flat config from eslint-config-next 16, no FlatCompat), `build` is `npm run lint && next build`, and the `eslint` key left `next.config.js`. Nothing calls `next lint`

### F-07: Unused dependencies

- Severity: low
- Status: fixed (A3a)
- Where: `package.json:20` (`node-cron`), `:31` (`@types/node-cron`), `:24` (`replicate`)
- What: none of the three is imported anywhere. Since A3 these are unused too: `@supabase/supabase-js`, `@tanstack/react-query`, `dotenv` (never imported), `csv-parse`, `papaparse` and `@types/papaparse`, `uuid` and `@types/uuid`
- Closed by: A3a uninstalled all 11 packages (`@supabase/supabase-js`, `@tanstack/react-query`, `csv-parse`, `dotenv`, `node-cron`, `papaparse`, `replicate`, `uuid`, `@types/node-cron`, `@types/papaparse`, `@types/uuid`). The `ws`, `uuid` and `csv-parse` audit findings left with them

### F-08: Generation is stubbed; old keys unverified

- Severity: medium
- Status: partly fixed (A3)
- Where: `src/lib/replicate.ts`, `generation-service.ts`, `image-generator.ts`, `video-generator.ts`; `src/app/api/generate/*`
- What: generation was disabled after the Aug 25, 2025 incident (`docs/archive/SECURITY_INCIDENT_REPORT.md`). The lib modules throw, the routes return 503, and `REPLICATE_API_TOKEN` is read nowhere. fal has no code, only docs. No Replicate or fal key was ever committed. The brief's note that those keys sit in the old Vercel env cannot be checked from the repo
- Fixed in A3: the four stubs, `generation-queue.ts`, `api/generate/*`, `api/cron/cycle-check` and the cycling admin routes are deleted. Still open: confirm the Replicate and fal keys are revoked (to-do)

### F-09: .gitignore missed a plain .env

- Severity: medium
- Status: fixed (A1)
- Where: `.gitignore`
- What: only `.env*.local` was ignored
- Closed by: A1 replaced the env block with `.env*` and `!.env*.example`

### F-10: Supabase clients created at module load

- Severity: medium
- Status: fixed (A3)
- Where: 28 files in `src` call `createClient` at the top level with `!` on the env vars: 21 admin routes, `generate/demo-image`, `species/route.ts`, both `species/[id]/media` routes, and `lib/error-recovery.ts`, `lib/image-generator.ts`, `lib/video-generator.ts`
- What: without the three Supabase variables the build fails at module load, which is why Vercel holds placeholders. 31 files import `@supabase/supabase-js` (those 28, plus `lib/supabase.ts`, which creates its clients conditionally, `test-connection`, and the gallery page), and 9 more import `@/lib/supabase`: 40 in all
- Closed by: A3 deleted all 28 modules, `lib/supabase.ts` and every importer; nothing in `src` mentions Supabase. The build passes with the three variables unset. The placeholders were removed from Vercel on Oct 26

### F-11: Gallery creates a Supabase client on every render

- Severity: low
- Status: fixed (A3)
- Where: `src/app/gallery/page.tsx:95`
- What: a browser client is created in the component body, so a new one on every render, and in production it points at the placeholder URL
- Closed by: A3 removed the client and the realtime subscriptions; the gallery reads `/api/species` and reloads it every 5 minutes

### F-12: GENERATION_CYCLE_MINUTES is never read

- Severity: low
- Status: fixed (A3)
- Where: `vercel.json:7-9`, both `.env*.example` files
- What: nothing in `src` reads it
- Closed by: A3 removed the `env` block from `vercel.json`; both `.env*.example` files now hold only a comment, since nothing reads any variable

### F-13: Env var list on the architecture page

- Severity: low
- Status: open
- Where: Notion architecture page, Env vars
- What: `REPLICATE_API_TOKEN`, `NEXT_PUBLIC_APP_URL`, `GENERATION_CYCLE_MINUTES`, `SENTRY_DSN` and `NEXT_PUBLIC_GA_ID` are read nowhere in `src`. `ALERT_WEBHOOK_URL` is read (`src/lib/monitoring.ts:102`) and missing. Also, the page's Repo layout section was a best guess; A1 step 0 listed its errors
- Closes in: the advisor's architecture update at A1 closeout

### F-14: No git identity on this Mac

- Severity: medium
- Status: fixed (A1)
- Where: git config
- What: there was no user name or email, so the A0 commits `85ad420` and `9d4720e` carry `gcraighobbs@gs-MacBook-Pro.local`, which is not linked to the GitHub account
- Closed by: A1 set the global identity to `gcraighobbs` and the GitHub noreply address

### F-15: Stale Vercel bot PR #1

- Severity: low
- Status: fixed (A1)
- Where: PR #1, branch `vercel/react-server-components-cve-vu-2iu8hy` (Mar 10, 2026)
- What: bumped Next.js 15.4.6 to 15.4.10, superseded by A0 (15.5.28). Its body links David's old Vercel project
- Closed by: A1 closed it unmerged and deleted the branch

### F-16: GitHub Pages still serves the 2025 site

- Severity: medium
- Status: open
- Where: repo Pages settings (build type workflow, source `main` /, last built Aug 20, 2025 from `18cefc1`); About homepage `gcraighobbs.github.io/entity/`
- What: the page loads and shows a Jekyll render of the old README, with a canonical link to `wuchinow.github.io/entity`. That build predates F-01, and the workflow file is gone, so it does not rebuild today. A rebuild from `main` would publish every markdown file, `docs/archive/` included
- Closes in: A4, since entity.org may still route there (turn Pages off and update the About link)

### F-17: Legacy root files

- Severity: low
- Status: fixed (A3)
- Where: `docs/archive/` (77 markdown files), `docs/archive/scripts/` (5 JS, 2 SQL)
- What: none was referenced by code, config or package.json scripts. Scripts that use the Supabase service role: `restore-missing-species.js` (insert), `run-migrations.js` (rpc), `update-baiji-name.js` (update). `check-eastern-elk.js` and `import-133-species.js` call the local API. `fix-security-vulnerabilities.sql` and `import-133-direct.sql` are hand-run SQL
- Closed by: A1 moved the markdown. A3 deleted `docs/archive/scripts/`

### F-18: README described the 2025 generator

- Severity: low
- Status: fixed (A1)
- Where: `README.md`
- What: it described cron cycling, Replicate generation and Next.js 14
- Closed by: A1 moved it to `docs/archive/README-2025.md` and added a short current README. Craig will rewrite the description in his voice

### F-19: public/ holds unused starter SVGs

- Severity: low
- Status: fixed (A3)
- Where: `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
- What: create-next-app leftovers, referenced nowhere. No media is tracked anywhere in the repo
- Closed by: A3 deleted all five; `public/` no longer exists

### F-20: package name is still entity-temp

- Severity: low
- Status: fixed (A3a)
- Where: `package.json:2`
- What: the package is named `entity-temp`
- Closed by: A3a renamed the package to `entity` in `package.json` and the lockfile

### F-21: Routes read the data/ CSVs that species.json supersedes

- Severity: low
- Status: fixed (A3)
- Where: `api/import-133-species/route.ts:11`, `api/simple-import-133/route.ts:65`, `api/load-data/route.ts:9`, `api/admin/fix-species-types/route.ts:30`, `api/admin/load-species-data/route.ts:15`, `api/admin/debug-species-count/route.ts:39`, `api/admin/import-csv-data/route.ts:28`, `api/admin/fix-data-accuracy/route.ts:42`, `api/admin/restore-132-species/route.ts:47` (all under `src/app/`)
- What: since A2 the catalog is `src/data/species.json` (`docs/CATALOG.md`). These routes still parse `data/133 extinct species.csv` or `data/extinct_species_database.csv` and all but `debug-species-count` write the result to Supabase, so they would rebuild a second, divergent catalog. All are unauthenticated (F-04). The `data/` files stay as provenance
- Closed by: A3 deleted all nine routes with the other admin and import routes, and moved `data/` to `docs/archive/data/` as provenance. `src/lib/media-storage.ts` was deleted rather than repointed at R2: media URLs are `media_base` plus the key (`src/lib/catalog.ts`)
