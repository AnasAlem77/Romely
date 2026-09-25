import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { CityDetail } from '@/components/CityDetail';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ cityId: string }>;
}

export async function generateStaticParams() {
  const cities = await prisma.city.findMany({
    select: { slug: true },
  });
  
  return cities.map((city) => ({
    cityId: city.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { cityId } = await params;
  const city = await prisma.city.findUnique({
    where: { slug: cityId },
  });

  if (!city) {
    return {
      title: 'City Not Found — ROMELY',
    };
  }

  return {
    title: `${city.name}, ${city.country} — ROMELY Travel Guide`,
    description: city.description,
  };
}

export default async function CityPage({ params }: PageProps) {
  const { cityId } = await params;
  
  // جلب المدينة والأماكن التابعة لها من Neon
  const cityFromDb = await prisma.city.findUnique({
    where: { slug: cityId },
    include: {
      places: true,
    },
  });

  if (!cityFromDb) {
    notFound();
  }

  // تحويل الهيكل القادم من قاعدة البيانات ليتوافق تماماً مع واجهة CityDetail
  const city = {
    id: cityFromDb.slug,
    name: cityFromDb.name,
    slug: cityFromDb.slug,
    country: cityFromDb.country,
    region: 'Europe', // قيمة افتراضية للتصميم
    badge: 'Curated Edition',
    tagline: cityFromDb.description || 'The global capital of style and elegance.',
    editorialDescription: cityFromDb.description || 'A timeless destination curated for refined travelers.',
    heroImage: cityFromDb.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
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
    // تحويل الأماكن القادمة من قاعدة البيانات لتشمل الخصائص الشكلية التي يتوقعها التصميم
    places: cityFromDb.places.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category || 'Architecture',
      neighborhood: p.address ? p.address.split(',')[0] : 'Central District',
      tagline: p.description || 'A carefully vetted architectural and cultural landmark.',
      description: p.description,
      images: [p.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'],
      atmosphere: ['Quiet', 'Historic', 'Curated'],
      priceLevel: '€€€',
      rating: 9.4,
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