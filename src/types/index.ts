// One entry in src/data/species.json (see docs/CATALOG.md)
export interface CatalogSpecies {
  id: string;
  display_order: number;
  scientific_name: string;
  common_name: string;
  year_extinct: string;
  last_seen: string;
  extinction_cause: string;
  habitat: string;
  description: string;
  image_key: string;
  video_key: string | null;
}

export interface Catalog {
  media_base: string;
  species: CatalogSpecies[];
}

// What /api/species returns: a catalog entry with full media URLs (src/lib/catalog.ts)
export interface GallerySpecies {
  id: string;
  display_order: number;
  scientific_name: string;
  common_name: string;
  year_extinct: string;
  last_seen: string;
  extinction_cause: string;
  habitat: string;
  description: string;
  image_url: string;
  video_url?: string; // absent when the species has no video
}
