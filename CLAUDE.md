# CLAUDE.md

Read this first in every session. This repo is the source of truth for Entity's code and repo docs. How work gets done is in the Notion runbook; what ships next is in the roadmap (ids below). Numbers in Notion are a snapshot: the repo and Vercel win.

## Hard rules

- The repo is public. No key, token or secret value ever goes in any file, commit message, PR, chat or Notion page. Report a secret by location and its first 6 characters only, and build any search so full values never print.
- Step 0 is read-only: no branch, no edits, no installs, no Notion writes. Report and stop. The build is always a second, labeled paste.
- A stop point means stop, even when the next step looks obvious.
- Merge only on the bare word "merge" from Craig. A question or a sentence that mentions merging is not approval. Before merging, list the PR's commits and confirm every agreed fix landed. Merge with `gh pr merge` and delete the branch.
- One push is one branch, one PR, one deploy, one changelog row. Push labels are the phase letter plus a number (A1, A2a).
- Finding ids (F-nn) in `docs/ASSESSMENT.md` never change and are not push labels.
- Commits use the global noreply identity: `gcraighobbs` and `25311032+gcraighobbs@users.noreply.github.com` (`git config --global`). Check `git config user.email` before the first commit of a push.
- Never bypass GitHub push protection. If it blocks a push, stop and report.
- `~/Developer/Entity/Staging` (media) is never copied, linked or referenced from the repo.
- Build with no `.env`, to match Vercel.
- Use the Notion ids below, never the Transcript Pro pages of the same names. A Notion read that doesn't end with "end of page" is truncated and gets no write. Notion edits are targeted search-and-replace.
- Permission mode is set in the Code tab UI, never by a prompt: step 0 in Manual, the build in Auto unless the brief says otherwise, Plan mode for anything touching data, auth or money.
- No em-dashes anywhere, in copy or docs.
- After a security upgrade, check the advisory's package with `npm ls`; a lockfile can keep a vulnerable transitive version.

## Stack

| Layer | Now | Target (Phase A) |
| --- | --- | --- |
| Frontend | Next.js 16.4.3 (app router, Turbopack), React 19.3.1, TypeScript 5, Tailwind 4, Framer Motion 12 (A3b) | Same |
| Backend | One route handler, `GET /api/species` (static); `src/proxy.ts` refuses writes (A3; the middleware file until A3b) | Same |
| Hosting | Vercel Hobby, project `entity`, team `gcraighobbs-projects`, production `https://entityai.org` (A4; www redirects 308 to the apex, and `entity-three.vercel.app` still answers) | Same |
| Catalog | `src/data/species.json` (A2, 130 species), read by `/api/species` (A3) | Same |
| Media | Cloudflare R2, `https://media.gcraighobbs.com` (A3) | Same |
| Generation | None; the stubs and routes were deleted in A3 | Returns in Phase B |
| Analytics | Vercel Analytics (`layout.tsx`, `useGalleryAnalytics`) | Same |

Vercel auto-deploys every push to `main` and builds a preview per branch. Hobby allows crons at most once a day; there is no cron now.

## Read path

- `src/lib/catalog.ts` loads `species.json` and maps each entry to a `GallerySpecies`: the catalog fields plus `image_url` (`media_base` + `/` + `image_key`) and, only when `video_key` is not null, `video_url`. Sorted by `common_name`
- `GET /api/species` returns `{ species, count }`, `force-static`, so it is built once per deploy
- `/gallery` loads it on mount and reloads it every 5 minutes, keeping the current selection. `/display` (images) and `/exhibit` (videos) load it once and cycle every 5 s
- A species with no video (Round Island Burrowing Boa) shows its image and no video button; `/exhibit` skips it
- No database, no realtime, nothing that can pause

## Proxy

`src/proxy.ts` (Next.js 16's name for middleware; `src/middleware.ts` until A3b), export `proxy`, Node.js runtime, matcher `['/admin/:path*', '/api/:path*']`. 403 for `/admin`, `/api/admin` and `/api/cron` and anything under them, any method; 405 for any other `/api` request that is not GET, HEAD or OPTIONS. No password, no env var. A route that writes needs a real auth design first (Phase B).

OPTIONS on a static route is answered after the proxy lets it through: `next start` returns 405 (`Allow: GET` and `Allow: HEAD`, the same on 15.5), while Vercel answers 204. That 405 is not the proxy's, which sends one `Allow: GET, HEAD, OPTIONS` header.

## Commands

- `npm run dev`, `npm run build`, `npm run lint`
- `npm run lint` is `eslint .`, with native flat config in `eslint.config.mjs` (eslint-config-next 16, core-web-vitals and typescript). `next lint` was removed in Next.js 16 (A3b)
- `npm run build` is `npm run lint && next build`, after `prebuild`. Next.js 16's `next build` no longer lints, so the script is what keeps lint errors fatal
- `npm run verify:catalog`: offline check of `src/data/species.json`; also runs as `prebuild` on every build
- `npm run verify:media`: HEADs every catalog key on the R2 media domain (network). Not in the build; run it after any key change
- The catalog is edited by hand; how it was built, the pick rules and the known gaps are in `docs/CATALOG.md`
- `npx tsc --noEmit --incremental false` for a type check (0 errors since A3)
- Type and lint errors fail the build; lint warnings do not. Types: `next build` type-checks (`typescript.ignoreBuildErrors` false in `next.config.js`). Lint: the build script (A3b). The react-hooks 7 rules `set-state-in-effect` and `immutability` are set to warn in `eslint.config.mjs` until a later push fixes the code they flag (18 warnings since A3b)
- Install scripts run only for packages in `allowScripts` in `package.json` (A3a: `@tailwindcss/oxide`, `unrs-resolver`). Approvals are pinned to a version, so any bump to either needs `npm install-scripts approve` again (A3b left both versions unchanged); `npm install-scripts ls` should come back empty

## Env

- Nothing in `src` reads an environment variable. The build and the app need none
- Vercel has no environment variables; the three placeholder Supabase variables were removed Oct 26
- `.env*.example` hold a comment only and stay tracked; every other `.env*` file is ignored

## File map

```
src/app/                 pages: / (redirects to /landing), landing, gallery, display (image slides),
                         exhibit (video slides); layout.tsx (title "Entity: a gallery of extinct species")
src/app/api/species/     route.ts: GET, force-static; the only route
src/proxy.ts             403 on /admin, /api/admin and /api/cron; 405 on any /api write method
src/components/          SpeciesDisplay (/display), VideoGallery (/exhibit)
src/hooks/               useGalleryAnalytics
src/lib/                 catalog.ts: species.json to GallerySpecies with media URLs
src/types/               index.ts: Catalog, CatalogSpecies, GallerySpecies
src/data/species.json    the species catalog, source of truth (A2)
scripts/                 verify-catalog.mjs (prebuild), verify-media.mjs
database/                schema.sql, migrations 001 to 005 with rollbacks, security and verify SQL (2025 reference)
docs/ASSESSMENT.md       findings ledger
docs/CATALOG.md          catalog source, dedupe and pick rules, known gaps
docs/archive/            77 notes from the 2025 build, README-2025.md
docs/archive/data/       133 extinct species.csv and .xlsx, extinct_species_database.csv (the 238 list);
                         superseded by species.json, kept as provenance (moved from data/ in A3)
root                     README.md, CLAUDE.md, next.config.js, vercel.json, package.json, tsconfig.json,
                         eslint.config.mjs, postcss.config.mjs, tailwind.config.ts, .env*.example
```

On disk: this repo is `~/Developer/Entity/Repo`; media is `~/Developer/Entity/Staging` (257 PNGs, 254 MP4s), outside the repo and already in R2.

## Notion

All under entity > dev in Craig's workspace.

- roadmap `4017b052bb6d81b1972ad36d2899869d`
- next session `4017b052bb6d8142b18cf6febc75af00`
- runbook `4017b052bb6d81b59c11de3953f01205`
- architecture `4017b052bb6d81feb6bee1d338d57b01`
- changelog page `4017b052bb6d81399eb5f5c9b51167da`, database `collection://9071d76c-da6f-4e78-b350-2bacdf42d75a`
- feedback page `4017b052bb6d8126a7b8fe51ccf82511`, database `collection://a4be6f1f-8c8b-4880-b42f-06bf0b7e58c6`
- to-do (under admin) `f347b052bb6d824c8ab681fce763e97b`

## Workflow

1. Step 0 (read-only report) and stop
2. Craig takes the report to the advisor, who drafts the build block
3. Build on a branch, commit, push, open the PR with `gh`, stop
4. Review on the Vercel preview; each agreed fix is another commit on the branch
5. Merge on the bare word "merge"
6. Confirm about 90 seconds later: the deployment is READY and the live page shows a string the push added

## Closeout duties (Claude Code)

- Add one row to the changelog database with a page create: Push (the label), Date, Order (highest plus one), Commit / deployment (commits, merge commit, PR, Vercel deployment id), Summary (one line), Added by (Claude Code), and the full what-shipped text in the row's page body. Never edit another row
- Update `CLAUDE.md` and `docs/ASSESSMENT.md` for anything the push changed, in the same PR or a docs follow-up
- End the report with the inserted changelog row, quoted
- Make no other Notion edits
