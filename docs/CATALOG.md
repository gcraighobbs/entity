# Catalog

`src/data/species.json` is the species catalog: 130 species, each with an image and (for 129 of them) a video in R2. It is the source of truth and is edited by hand. It was generated once in A2 (Oct 2026); no generator is kept in the repo.

## Shape

```json
{
  "media_base": "https://media.gcraighobbs.com",
  "species": [
    {
      "id": "thylacinus-cynocephalus",
      "display_order": 12,
      "scientific_name": "Thylacinus cynocephalus",
      "common_name": "Thylacine",
      "year_extinct": "1936",
      "last_seen": "Hobart Zoo, 1936",
      "extinction_cause": "Hunting, disease, competition",
      "habitat": "Forests, grasslands",
      "description": "Tasmanian Tiger, largest marsupial predator",
      "image_key": "images/thylacine_82f143d1_v1_1756071541518.png",
      "video_key": "videos/thylacine_82f143d1_v1_1756076786999.mp4"
    }
  ]
}
```

- `id`: the scientific name, lowercased, non-alphanumerics to hyphens
- `display_order`: 1 to 130, following the old `display_order`, ties broken by `created_at`
- `year_extinct`, `last_seen`, `extinction_cause`, `habitat`, `description`: verbatim from the backup. `year_extinct` is a string because some values are decades
- `image_key`, `video_key`: R2 object keys relative to `media_base`, case-exact. `video_key` is `null` when there is no video
- Types: `Catalog` and `CatalogSpecies` in `src/types/index.ts`

## Checks

- `npm run verify:catalog`: offline shape check (https base, unique ids and scientific names, required strings, key format). Runs on every build as `prebuild`
- `npm run verify:media`: HEADs every key at `media_base` and fails on anything but a 200 with the right content type and a non-zero length. Not part of the build. Run it after any key change

## Where it came from

- Rows: the `species` table from the Jun 2026 Supabase backup, 136 rows. `species_media` and `species_lists` were not in the backup, so the 2025 per-version picks and the 129-species exhibit list are lost
- The 136 rows are 3 seed rows (Jul 23, 2025) plus a 133-row CSV import (Jul 24, 2025), the same data as `data/133 extinct species.csv`. They hold 130 distinct scientific names
- Media: the 257 PNGs and 254 MP4s copied to R2 under `images/` and `videos/` with their 2025 file names. Files for 14 species outside the 130 (Alpine Newt to Cape Platanna, from the 238-species list) are in R2 but not in the catalog

## Dedupe (136 to 130)

- Exact repeats (Thylacine, Passenger Pigeon): kept the Jul 24 CSV row, dropped the Jul 23 seed row
- Levuana Moth (in the CSV twice): kept the first row
- Synonym pairs: kept Sardinian Pika (dropped Corsican-Sardinian Pika), Przewalski's Horse (dropped Mongolian Wild Horse), Xerces Blue (dropped Xerces Blue Butterfly). Media pooled from both names

The A2 PR lists every dropped row's differing fields.

## Media file names and picks

2025 file names are `<common_name_slug>_<8hex>[_v<N>]_<13-digit ms timestamp>.<ext>`. The 8 hex characters are the start of the species id in the Aug 2025 database, not the backup, so files were matched by name. The slugger replaced each non-alphanumeric character with `_` (`s_o_tom__grosbeak`, `atitl_n_grebe`). Aliases used: `dodo` (Dodo Bird), `baiji_dolphin` (Baiji), `toromiro` and `Sophora_toromiro` (Toromiro). A few hand-named files have no prefix or timestamp (`*_12`, `acacia_acanthoclada_1`, `_2`).

One image and one video per species, picked in this order:

1. An image and video that share the same prefix and version (videos were generated from images). Highest version, then newest timestamp. An unversioned file counts as v0
2. Otherwise a hand-named file
3. Otherwise the highest version, then the newest timestamp

53 species had more than one version. These 14 do not have a matched pair, so their image and video may not belong together; worth a look in the gallery:

- Same prefix, image v0 and video v1 (likely the same pair, named before images got versions): Bachman's Warbler, Arabian Oryx, Ash Meadows Killifish, Alabama Canebrake Pitcher Plant, Auroch
- Same prefix, image v2 and video v1: Alaotra Grebe
- Hand-named `_12` video with a generated image: Steller's Sea Cow, Round Island Boa, Tecopa Pupfish, Tennessee Purple Coneflower, Texas Red Wolf, Aldabra Banded Snail
- Hand-named pair with the same stem: Toromiro (`Sophora_toromiro_12`)
- No video: Round Island Burrowing Boa

## Known gaps

- Round Island Burrowing Boa (`bolyeria-multocarinata`): no video was ever generated (the 2025 exhibit deleted it as a duplicate of Round Island Boa, a different species), so `video_key` is `null`
- Eelgrass Limpet: `last_seen` is `1929`, a year with no place
- Decade years in `year_extinct`: Hawaiian Tree Snails, Texas Wild Rice, Regal Fritillary (1990s), Small Whorled Pogonia (1980s), Fender's Blue Butterfly, Golden Lancehead (2000s), Henderson Petrel (1900s)
- Vague `last_seen`: Small Whorled Pogonia and Regal Fritillary (`Various locations`), Hawaiian Tree Snails (`Oahu, various dates`), Forest Owlet (`Rediscovered 1997`), American Burying Beetle (`Block Island, ongoing`)
- `last_seen` is free text: usually `Place, Year`, sometimes a place only. The year in it can differ from `year_extinct` (last sighting versus declared extinct)

Content corrections (names, dates, species that are not extinct) are tracked in the feedback database in Notion, not here. After editing `species.json`, run `npm run verify:catalog`, and `npm run verify:media` if a key changed.
