import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { CityDetail } from '@/components/CityDetail';
import { getPlaceImage, getCityImage } from '@/lib/placeImages';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

interface PageProps {
  params: Promise<{ cityId: string }>;
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
    const cities = await prisma.city.findMany({
      select: { slug: true },
    });
    return cities.map((city) => ({
      cityId: city.slug,
    }));
  } catch {
    return [{ cityId: 'paris' }, { cityId: 'tokyo' }, { cityId: 'rome' }];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { cityId } = await params;
  try {
    const city = await prisma.city.findUnique({
      where: { slug: cityId },
    });

    if (!city) {
      return { title: 'City Not Found — ROMELY' };
    }

    return {
      title: `${city.name}, ${city.country} — ROMELY Travel Guide`,
      description: city.description,
    };
  } catch {
    return { title: `${cityId.toUpperCase()} — ROMELY Travel Guide` };
  }
}

export default async function CityPage({ params }: PageProps) {
  const { cityId } = await params;
  
  let cityFromDb = null;
  try {
    cityFromDb = await prisma.city.findUnique({
      where: { slug: cityId },
      include: {
        places: true,
      },
    });
  } catch (error) {
    console.error("Database connection warning:", error);
  }

  if (!cityFromDb) {
    notFound();
  }

  const city = {
    id: cityFromDb.slug,
    name: cityFromDb.name,
    slug: cityFromDb.slug,
    country: cityFromDb.country,
    region: 'Europe' as const,
    badge: 'Curated Edition',
    tagline: cityFromDb.description || 'The global capital of style and elegance.',
    editorialDescription: cityFromDb.description || 'A timeless destination curated for refined travelers.',
    heroImage: getCityImage(cityFromDb.slug, cityFromDb.imageUrl),
    galleryImages: [
      getCityImage(cityFromDb.slug, cityFromDb.imageUrl),
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80'
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
    },
    coordinates: {
      lat: 48.8566,
      lng: 2.3522,
    },
    insiderTips: [
      {
        id: 'tip_1',
        category: 'Architecture',
        title: 'The Haussmannian Alignment',
        description: 'Observe the precise strictness of balcony heights along the grand boulevards during early morning light.',
        curatorName: 'Anas Alem',
        curatorRole: 'Lead Architect',
      },
      {
        id: 'tip_2',
        category: 'Acoustics',
        title: 'Morning Silence in Passages',
        description: 'The 19th-century covered arcades offer a unique acoustic shelter before the city wakes up at 10 AM.',
        curatorName: 'Romely Team',
        curatorRole: 'Editor',
      },
      {
        id: 'tip_3',
        category: 'Gastronomy',
        title: 'The Mid-Day Pause',
        description: 'True locals avoid service hours between 3 PM and 7 PM. Use this window for gallery strolls.',
        curatorName: 'Local Correspondent',
        curatorRole: 'Gastronomy Contributor',
      },
    ],
    places: cityFromDb.places.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category || 'Architecture',
      neighborhood: p.address ? p.address.split(',')[0] : 'Central District',
      tagline: p.description || 'A carefully vetted architectural landmark.',
      description: p.description,
      images: [getPlaceImage(p.name, p.category, p.imageUrl)],
      atmosphere: ['Quiet', 'Historic', 'Curated'],
      priceLevel: '€€€',
      rating: getConsistentRating(p.id),
      address: p.address,
      phone: p.phone,
      hours: p.hours,
      dressCode: p.dressCode,
      optimalCadence: p.optimalCadence,
      latitude: p.latitude || 48.8566,
      longitude: p.longitude || 2.3522,
    })),
  };

  return <CityDetail city={city} />;
}