import { notFound } from 'next/navigation';
import { CITIES_DATA } from '@/lib/travelData';
import { CityDetail } from '@/components/CityDetail';

interface PageProps {
  params: Promise<{ cityId: string }>;
}

export async function generateStaticParams() {
  return CITIES_DATA.map((city) => ({
    cityId: city.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { cityId } = await params;
  const city = CITIES_DATA.find((c) => c.id === cityId);

  if (!city) {
    return {
      title: 'City Not Found — ROMELY',
    };
  }

  return {
    title: `${city.name}, ${city.country} — ROMELY Travel Guide`,
    description: city.tagline,
  };
}

export default async function CityPage({ params }: PageProps) {
  const { cityId } = await params;
  const city = CITIES_DATA.find((c) => c.id === cityId);

  if (!city) {
    notFound();
  }

  return <CityDetail city={city} />;
}

