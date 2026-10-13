import { notFound } from 'next/navigation';
import { CityDetail } from '@/components/CityDetail';
import { mapCity, prisma } from '@/lib/catalog';

interface PageProps {
  params: Promise<{ cityId: string }>;
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
    return [];
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
    return { title: 'City Not Found — ROMELY' };
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

  const city = mapCity(cityFromDb);

  return <CityDetail city={city} />;
}
