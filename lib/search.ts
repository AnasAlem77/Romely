import { City, Place } from './types';

export interface PlaceWithCity {
  place: Place;
  city: City;
}

export interface CatalogSearchResults {
  cities: City[];
  places: PlaceWithCity[];
  hasMatches: boolean;
  totalMatches: number;
}

export type SearchTarget =
  | { kind: 'city'; cityId: string }
  | { kind: 'place'; placeId: string };

export interface DestinationSummary {
  id: string;
  name: string;
  country: string;
  placeCount: number;
}

const MAX_CITY_SUGGESTIONS = 3;
const MAX_PLACE_SUGGESTIONS = 5;

const COMBINING_DIACRITICS = /[\u0300-\u036f]/g;

/**
 * Folds a string into a comparable form: decomposed accents stripped, lowercased,
 * trimmed. This lets "cafe" match "Café de Flore" and "Zurich" match "Zürich".
 */
export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(COMBINING_DIACRITICS, '').toLowerCase().trim();
}

function matchesAnyField(fields: (string | undefined)[], normalizedQuery: string): boolean {
  return fields.some(
    (field) => typeof field === 'string' && normalizeSearchText(field).includes(normalizedQuery)
  );
}

export function cityMatchesQuery(city: City, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;

  return matchesAnyField(
    [city.name, city.country, city.region, city.tagline, city.badge],
    normalizedQuery
  );
}

export function placeMatchesQuery(place: Place, city: City, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;

  return matchesAnyField(
    [
      place.name,
      place.nativeName,
      place.category,
      place.neighborhood,
      place.tagline,
      place.address,
      city.name,
      city.country,
    ],
    normalizedQuery
  );
}

export function cityHasMatchingPlaces(city: City, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;

  return city.places.some((place) => placeMatchesQuery(place, city, normalizedQuery));
}

function rankByName(name: string, normalizedQuery: string): number {
  const normalizedName = normalizeSearchText(name);
  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  return 2;
}

/** Cities first, then places, each ordered by how literally the name matches. */
export function searchCatalog(cities: City[], query: string): CatalogSearchResults {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return { cities: [], places: [], hasMatches: false, totalMatches: 0 };
  }

  const matchedCities = cities.filter((city) => cityMatchesQuery(city, normalizedQuery));

  const matchedPlaces: PlaceWithCity[] = [];
  cities.forEach((city) => {
    city.places.forEach((place) => {
      if (placeMatchesQuery(place, city, normalizedQuery)) {
        matchedPlaces.push({ place, city });
      }
    });
  });

  const rankedCities = [...matchedCities].sort(
    (a, b) => rankByName(a.name, normalizedQuery) - rankByName(b.name, normalizedQuery)
  );

  const rankedPlaces = [...matchedPlaces].sort((a, b) => {
    const byPlaceName = rankByName(a.place.name, normalizedQuery) - rankByName(b.place.name, normalizedQuery);
    if (byPlaceName !== 0) return byPlaceName;
    return rankByName(a.city.name, normalizedQuery) - rankByName(b.city.name, normalizedQuery);
  });

  return {
    cities: rankedCities.slice(0, MAX_CITY_SUGGESTIONS),
    places: rankedPlaces.slice(0, MAX_PLACE_SUGGESTIONS),
    hasMatches: rankedCities.length > 0 || rankedPlaces.length > 0,
    totalMatches: rankedCities.length + rankedPlaces.length,
  };
}

/**
 * Resolves a free-text query into a concrete dynamic route. Returns null when the
 * query matches nothing in the catalogue, so callers can surface a "Coming Soon"
 * state instead of pushing a route that does not exist.
 */
export function resolveSearchTarget(cities: City[], query: string): SearchTarget | null {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return null;

  const exactCity = cities.find((city) => normalizeSearchText(city.name) === normalizedQuery);
  if (exactCity) return { kind: 'city', cityId: exactCity.id };

  for (const city of cities) {
    const exactPlace = city.places.find((place) => normalizeSearchText(place.name) === normalizedQuery);
    if (exactPlace) return { kind: 'place', placeId: exactPlace.id };
  }

  const { cities: cityMatches, places: placeMatches } = searchCatalog(cities, normalizedQuery);
  if (cityMatches.length > 0) return { kind: 'city', cityId: cityMatches[0].id };
  if (placeMatches.length > 0) return { kind: 'place', placeId: placeMatches[0].place.id };

  return null;
}

export function getDestinationSummaries(cities: City[]): DestinationSummary[] {
  return cities.map((city) => ({
    id: city.id,
    name: city.name,
    country: city.country,
    placeCount: city.places.length,
  }));
}
