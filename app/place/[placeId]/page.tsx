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
  const places = await prisma.place.findMany({
    select: { id: true },
  });
  
  return places.map((place) => ({
    placeId: place.id,
  }));
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
    name: placeFromDb.name,
    slug: placeFromDb.slug,
    category: placeFromDb.category || 'Architecture',
    neighborhood: placeFromDb.address ? placeFromDb.address.split(',')[0] : 'Central District',
    tagline: placeFromDb.description || 'A carefully vetted architectural landmark.',
    description: placeFromDb.description,
    images: [getPlaceImage(placeFromDb.id, placeFromDb.category, placeFromDb.imageUrl)],
    atmosphere: ['Quiet', 'Historic', 'Curated'],
    priceLevel: '€€€',
    rating: getConsistentRating(placeFromDb.id),
    address: placeFromDb.address,
    phone: placeFromDb.phone,
    hours: [
      { days: 'Daily Schedule', time: placeFromDb.hours || '10:00 AM – 8:00 PM' }
    ],
    dressCode: placeFromDb.dressCode || 'Smart Casual',
    optimalCadence: placeFromDb.optimalCadence || 'Morning or late afternoon',
    coordinates: {
      lat: placeFromDb.latitude || 48.8566,
      lng: placeFromDb.longitude || 2.3522,
    },
    curatorQuote: {
      quote: "An exceptional space maintaining rare acoustic and visual harmony.",
      curator: "Anas Alem",
      role: "Lead Architectural Contributor"
    }
  };

  const city = {
    id: placeFromDb.city.slug,
    name: placeFromDb.city.name,
    slug: placeFromDb.city.slug,
    country: placeFromDb.city.country,
    region: 'Europe',
    badge: 'Curated Edition',
    tagline: placeFromDb.city.description || 'The global capital of style and elegance.',
    editorialDescription: placeFromDb.city.description || 'A timeless destination.',
    heroImage: placeFromDb.city.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
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