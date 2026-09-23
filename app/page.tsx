import React from 'react';
import { CITIES_DATA } from '@/lib/travelData';
import { ExploreHome } from '@/components/ExploreHome';

export default function HomePage() {
  return <ExploreHome cities={CITIES_DATA} />;
}
