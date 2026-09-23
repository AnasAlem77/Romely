import { notFound } from 'next/navigation';
import { CITIES_DATA } from '@/lib/travelData';
import { PlaceDetail } from '@/components/PlaceDetail';

interface PageProps {
  params: Promise<{ placeId: string }>;
}

export async function generateStaticParams() {
  const params: { placeId: string }[] = [];
  CITIES_DATA.forEach((city) => {
    city.places.forEach((place) => {
      params.push({ placeId: place.id });
    });
  });
  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { placeId } = await params;
  for (const city of CITIES_DATA) {
    const place = city.places.find((p) => p.id === placeId);
    if (place) {
      return {
        title: `${place.name} — ${city.name} — ROMELY Sanctuary Guide`,
        description: place.tagline,
      };
    }
  }

  return {
    title: 'Sanctuary Not Found — ROMELY',
  };
}

export default async function PlacePage({ params }: PageProps) {
  const { placeId } = await params;

  for (const city of CITIES_DATA) {
    const place = city.places.find((p) => p.id === placeId);
    if (place) {
      return <PlaceDetail place={place} city={city} />;
    }
  }

  notFound();
}

