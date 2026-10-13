import { PrismaClient } from '@prisma/client';
import type { City, Place } from '@/lib/types';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function ratingFor(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = id.charCodeAt(index) + ((hash << 5) - hash);
  return Number((8.7 + (Math.abs(hash) % 12) / 10).toFixed(1));
}

function regionFor(country: string): City['region'] {
  const normalized = country.toLowerCase();
  if (['japan', 'indonesia', 'china', 'south korea', 'thailand'].includes(normalized)) return 'Asia';
  if (['united states', 'canada', 'mexico', 'brazil', 'argentina'].includes(normalized)) return 'Americas';
  if (['italy', 'greece', 'croatia', 'turkey'].includes(normalized)) return 'Mediterranean';
  return 'Europe';
}

export function mapPlace(place: {
  id: string; name: string; category: string; description: string | null; imageUrl: string | null;
  address: string | null; phone: string | null; hours: string | null; dressCode: string | null;
  optimalCadence: string | null; latitude: number; longitude: number; cityId: string;
}): Place {
  const rating = ratingFor(place.id);
  return {
    id: place.id, cityId: place.cityId, name: place.name, nativeName: place.name,
    category: place.category as Place['category'], tagline: place.description ?? '', description: place.description ?? '',
    editorialVerdict: '', atmosphere: [], rating, curatorScore: `${rating} / 10`, priceLevel: '€€€',
    neighborhood: place.address?.split(',')[0] ?? '', address: place.address ?? '', phone: place.phone ?? '',
    website: '', hours: place.hours ? [{ days: 'Daily Schedule', time: place.hours }] : [],
    bestTimeToVisit: place.optimalCadence ?? '', dressCode: place.dressCode ?? '',
    images: place.imageUrl ? [place.imageUrl] : [], coordinates: { lat: place.latitude, lng: place.longitude },
    insiderTip: '', curatorQuote: { text: '', curator: '', role: '' },
  };
}

export function mapCity(city: {
  id: string; name: string; slug: string; country: string; description: string | null; imageUrl: string | null;
  places: Parameters<typeof mapPlace>[0][];
}): City {
  return {
    id: city.slug, name: city.name, country: city.country, region: regionFor(city.country),
    tagline: city.description ?? '', editorialDescription: city.description ?? '', badge: 'Curated Edition',
    heroImage: city.imageUrl ?? '', galleryImages: city.imageUrl ? [city.imageUrl] : [], timezone: 'UTC',
    coordinates: { lat: city.places[0]?.latitude ?? 0, lng: city.places[0]?.longitude ?? 0 },
    weather: { tempC: 0, tempF: 32, condition: '', humidity: '', wind: '', goldenHour: '', uvIndex: '', highLow: '' },
    insiderTips: [], places: city.places.map((place) => mapPlace({ ...place, cityId: city.slug })),
  };
}

export async function getCatalog(): Promise<City[]> {
  try {
    const cities = await prisma.city.findMany({ include: { places: { orderBy: { name: 'asc' } } }, orderBy: { name: 'asc' } });
    return cities.map(mapCity);
  } catch (error) {
    // A transient database outage must not prevent the shared layout (and thus
    // the homepage) from rendering. Route-level data remains database-backed.
    console.error('Romely catalogue is temporarily unavailable', error);
    return [];
  }
}
