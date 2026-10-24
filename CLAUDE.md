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
| Frontend | Next.js 15.5.28 (app router), React 19.1.10, TypeScript 5, Tailwind 4, Framer Motion 12 | Same |
| Backend | Next.js route handlers (46, no inbound auth) | Read-only routes; admin routes guarded or removed (A3) |
| Hosting | Vercel Hobby, project `entity`, team `gcraighobbs-projects`, production `entity-three.vercel.app` | Same, then the custom domain (A4) |
| Catalog | Supabase Postgres, paused | `species.json` in the repo (A2, A3) |
| Media | Supabase Storage, paused | Cloudflare R2, custom media domain (A3) |
| Generation | Replicate and fal code already stubbed (throws or returns 503) | Removed (A3); returns in Phase B |
| Analytics | Vercel Analytics (`layout.tsx`, `useGalleryAnalytics`) | Same |

Vercel auto-deploys every push to `main` and builds a preview per branch. Hobby allows crons at most once a day; there is no cron now.

## Commands

- `npm run dev`, `npm run build`, `npm run lint` (`next lint` is deprecated in 15.5)
- `npx tsc --noEmit --incremental false` for a type check (10 known errors, F-05)
- The build skips type and lint errors (`next.config.js`, F-05), so run both checks yourself

## Env

- The build needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` because 28 modules create a Supabase client at load (F-10). Vercel holds placeholder values; A3 removes them
- Also read in `src`: `MONITORING_WEBHOOK_URL`, `ALERT_WEBHOOK_URL`, `CRON_SECRET`, `NODE_ENV`
- `.env*.example` hold placeholders only and stay tracked; every other `.env*` file is ignored

## File map

```
src/app/                 pages: / (page.tsx), admin, demo, display, exhibit, gallery, landing, simple, test; layout.tsx
src/app/api/             46 route handlers, none with inbound auth (F-04)
  admin/                 29 maintenance routes (fix-*, reset-*, migrate-*, restore-*, init-*, ...)
  species/               GET list; [id]/media GET; [id]/media/[mediaType]/[version] DELETE, PATCH
  generate/              image, video, demo-image: all return 503
  cron/cycle-check/      no longer scheduled; calls a removed method (F-05)
  (others)               import and load routes, queue/status, species-lists, sse, health, test-connection, analyze-overlap
src/components/          SpeciesDisplay (gallery), AdminPanel, MediaModal, MediaNavigator, RealTimeNotifications, VideoGallery
src/hooks/               useAutoErrorRecovery, useGalleryAnalytics, useRealTimeUpdates
src/lib/                 supabase.ts, media-storage.ts, csv-import.ts, new-csv-import.ts, error-recovery.ts,
                         monitoring.ts, generation-queue.ts
                         stubs: generation-service.ts, replicate.ts, image-generator.ts, video-generator.ts
src/types/               index.ts
database/                schema.sql, migrations 001 to 005 with rollbacks, security and verify SQL (reference for A2, A3)
data/                    133 extinct species.csv and .xlsx, extinct_species_database.csv
public/                  create-next-app starter SVGs, unused
docs/ASSESSMENT.md       findings ledger
docs/archive/            77 notes from the 2025 build, README-2025.md
docs/archive/scripts/    5 JS and 2 SQL scripts from 2025 (the Supabase ones are listed for A3)
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
