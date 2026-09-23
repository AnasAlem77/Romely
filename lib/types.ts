export type Category = 'Landmarks' | 'Cafes' | 'Museums' | 'Restaurants' | 'Boutiques';

export interface Place {
  id: string;
  cityId: string;
  name: string;
  nativeName?: string;
  category: Category;
  tagline: string;
  description: string;
  editorialVerdict: string;
  atmosphere: string[];
  rating: number; // e.g. 9.8
  curatorScore: string;
  priceLevel: '€' | '€€' | '€€€' | '€€€€';
  neighborhood: string;
  address: string;
  phone: string;
  website: string;
  hours: { days: string; time: string }[];
  bestTimeToVisit: string;
  dressCode: string;
  images: string[];
  coordinates: { lat: number; lng: number };
  insiderTip: string;
  curatorQuote: {
    text: string;
    curator: string;
    role: string;
  };
}

export interface InsiderTip {
  id: string;
  title: string;
  category: string;
  description: string;
  curatorName: string;
  curatorRole: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: 'Europe' | 'Asia' | 'Americas' | 'Mediterranean';
  tagline: string;
  editorialDescription: string;
  badge: string;
  heroImage: string;
  galleryImages: string[];
  timezone: string;
  coordinates: { lat: number; lng: number };
  weather: {
    tempC: number;
    tempF: number;
    condition: string;
    humidity: string;
    wind: string;
    goldenHour: string;
    uvIndex: string;
    highLow: string;
  };
  insiderTips: InsiderTip[];
  places: Place[];
}
