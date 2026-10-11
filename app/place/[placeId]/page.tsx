import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { PlaceDetail } from '@/components/PlaceDetail';
import { getPlaceImage } from '@/lib/placeImages';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ placeId: string }>;
}

function getConsistentRating(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = 8.7 + (Math.abs(hash) % 12) / 10;
  return Number(rating.toFixed(1));
}

export async function generateStaticParams() {
  try {
    const places = await prisma.place.findMany({
      select: { id: true },
    });
    return places.map((place) => ({
      placeId: place.id,
    }));
  } catch (err) {
    console.warn('Prisma connection failed during place static generation, returning empty params', err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { placeId } = await params;
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    include: { city: true },
  });

  if (!place) {
    return {
      title: 'Sanctuary Not Found — ROMELY',
    };
  }

  return {
    title: `${place.name} — ${place.city.name} — ROMELY Sanctuary Guide`,
    description: place.description || 'A curated architectural and cultural landmark.',
  };
}

export default async function PlacePage({ params }: PageProps) {
  const { placeId } = await params;

  const placeFromDb = await prisma.place.findUnique({
    where: { id: placeId },
    include: { city: true },
  });

  if (!placeFromDb) {
    notFound();
  }

  const place = {
    id: placeFromDb.id,
    cityId: placeFromDb.city.slug,
    name: placeFromDb.name,
    nativeName: placeFromDb.name,
    category: ((['Landmarks', 'Cafes', 'Museums', 'Restaurants', 'Boutiques'].includes(placeFromDb.category as any)
      ? placeFromDb.category
      : 'Landmarks') as any),
    tagline: placeFromDb.description || 'A carefully vetted architectural landmark.',
    description: placeFromDb.description || 'An architectural sanctuary of quiet contemplation and timeless design.',
    editorialVerdict: 'An essential visit for discerning travelers valuing atmosphere over spectacle.',
    images: [getPlaceImage(placeFromDb.id, placeFromDb.category, placeFromDb.imageUrl)],
    atmosphere: ['Quiet', 'Historic', 'Curated'],
    priceLevel: '€€€' as const,
    rating: getConsistentRating(placeFromDb.id),
    curatorScore: `${getConsistentRating(placeFromDb.id)} / 10`,
    neighborhood: placeFromDb.address ? placeFromDb.address.split(',')[0] : 'Central District',
    address: placeFromDb.address || 'Address provided upon reservation',
    phone: placeFromDb.phone || '+33 1 42 68 00 00',
    website: 'https://romely.com',
    hours: [
      { days: 'Daily Schedule', time: placeFromDb.hours || '10:00 AM – 8:00 PM' }
    ],
    bestTimeToVisit: placeFromDb.optimalCadence || 'Early morning or late afternoon for optimal natural light.',
    dressCode: placeFromDb.dressCode || 'Smart Casual',
    coordinates: {
      lat: placeFromDb.latitude || 48.8566,
      lng: placeFromDb.longitude || 2.3522,
    },
    insiderTip: 'Arrive early before opening to appreciate the façade in quiet tranquility.',
    curatorQuote: {
      text: "An exceptional space maintaining rare acoustic and visual harmony.",
      curator: "Anas Alem",
      role: "Lead Architectural Contributor"
    }
  };

  const city = {
    id: placeFromDb.city.slug,
    name: placeFromDb.city.name,
    slug: placeFromDb.city.slug,
    country: placeFromDb.city.country,
    region: 'Europe' as const,
    badge: 'Curated Edition',
    tagline: placeFromDb.city.description || 'The global capital of style and elegance.',
    editorialDescription: placeFromDb.city.description || 'A timeless destination.',
    heroImage: placeFromDb.city.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      placeFromDb.city.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
    ],
    timezone: 'Europe/Paris',
    weather: {
      tempC: 22,
      tempF: 72,
      condition: 'Pleasant & Clear',
      icon: '☀️',
      goldenHour: '19:42',
      wind: '12 km/h NW',
      humidity: '48%',
      uvIndex: 'Moderate (4)',
      highLow: '24° / 15°',
    },
    coordinates: {
      lat: 48.8566,
      lng: 2.3522,
    },
    insiderTips: [],
    places: [],
  };

  return <PlaceDetail place={place} city={city} />;
}