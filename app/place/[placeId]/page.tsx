import { notFound } from 'next/navigation';
import { PlaceDetail } from '@/components/PlaceDetail';
import { mapCity, mapPlace, prisma } from '@/lib/catalog';

interface PageProps {
  params: Promise<{ placeId: string }>;
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
    description: place.description ?? undefined,
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

  const place = { ...mapPlace(placeFromDb), cityId: placeFromDb.city.slug };
  const city = mapCity({ ...placeFromDb.city, places: [] });

  return <PlaceDetail place={place} city={city} />;
}
