import catalogJson from '@/data/species.json';
import { Catalog, CatalogSpecies, GallerySpecies } from '@/types';

// The species catalog (docs/CATALOG.md). A media URL is media_base plus the key.
const catalog = catalogJson as Catalog;

function mediaUrl(key: string): string {
  return `${catalog.media_base}/${key}`;
}

function toGallerySpecies(s: CatalogSpecies): GallerySpecies {
  const { image_key, video_key, ...fields } = s;
  return {
    ...fields,
    image_url: mediaUrl(image_key),
    ...(video_key !== null ? { video_url: mediaUrl(video_key) } : {}),
  };
}

// Every species, alphabetical by common name
export function getGallerySpecies(): GallerySpecies[] {
  return catalog.species
    .map(toGallerySpecies)
    .sort((a, b) => a.common_name.localeCompare(b.common_name, 'en'));
}
