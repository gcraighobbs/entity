import { NextResponse } from 'next/server';
import { getGallerySpecies } from '@/lib/catalog';

// Built once from src/data/species.json and served as a static file
export const dynamic = 'force-static';

export function GET() {
  const species = getGallerySpecies();
  return NextResponse.json({ species, count: species.length });
}
