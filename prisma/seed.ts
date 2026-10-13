// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Import static city data for Phase 1 seeding
import { CITIES_DATA } from '../lib/travelData'

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  console.log('🌱 Seeding Paris places via Prisma...')

  // 1️⃣ Upsert Paris city (preserve existing ID if present)
  const parisCity = await prisma.city.upsert({
    where: { slug: 'paris' },
    update: {},
    create: {
      id: 'city_paris_01',
      name: 'Paris',
      slug: 'paris',
      country: 'France',
      description: 'The global capital of style, gastronomy, and Haussmannian elegance.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    },
  })

  // 2️⃣ Load Paris‑specific places JSON (existing seed data)
  const parisFilePath = path.join(__dirname, 'paris-places.json')
  if (!fs.existsSync(parisFilePath)) {
    console.error(`❌ File not found: ${parisFilePath}`)
    return
  }
  const parisPlaces = JSON.parse(fs.readFileSync(parisFilePath, 'utf-8'))
  console.log(`📦 Found ${parisPlaces.length} Paris places. Inserting...`)

  for (const p of parisPlaces) {
    await prisma.place.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl,
        address: p.address,
        phone: p.phone,
        hours: p.hours,
        dressCode: p.dressCode,
        optimalCadence: p.optimalCadence,
        latitude: p.latitude,
        longitude: p.longitude,
      },
      create: {
        name: p.name,
        slug: p.slug,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl || null,
        address: p.address || null,
        phone: p.phone || null,
        hours: p.hours || null,
        dressCode: p.dressCode || null,
        optimalCadence: p.optimalCadence || null,
        latitude: p.latitude,
        longitude: p.longitude,
        cityId: parisCity.id,
      },
    })
  }

  console.log('✅ Paris seeding completed.')

  // ─────── Phase 1: Seed remaining static cities ───────
  console.log('🚀 Seeding remaining cities (Tokyo, Rome, Kyoto, Copenhagen)...')

  const otherCities = CITIES_DATA.filter((c) => c.id !== 'paris')

  for (const city of otherCities) {
    // Upsert city using its `id` as the slug (unique identifier)
    const dbCity = await prisma.city.upsert({
      where: { slug: city.id },
      update: {
        name: city.name,
        country: city.country,
        description: city.editorialDescription || city.tagline || null,
        imageUrl: city.heroImage || null,
      },
      create: {
        name: city.name,
        slug: city.id,
        country: city.country,
        description: city.editorialDescription || city.tagline || null,
        imageUrl: city.heroImage || null,
      },
    })

    console.log(`📍 Upserted city: ${city.name} (${city.id}) with ${city.places.length} places.`)

    for (const place of city.places) {
      // Convert the optional `hours` array into a single string for the DB column
      const hoursString = Array.isArray((place as any).hours)
        ? (place as any).hours.map((h: any) => `${h.days}: ${h.time}`).join('; ')
        : undefined

      await prisma.place.upsert({
        where: { slug: place.id },
        update: {
          name: place.name,
          category: place.category,
          description: place.description,
          imageUrl: Array.isArray((place as any).images) && (place as any).images.length > 0 ? (place as any).images[0] : null,
          address: (place as any).address || null,
          phone: (place as any).phone || null,
          hours: hoursString || null,
          dressCode: (place as any).dressCode || null,
          optimalCadence: (place as any).optimalCadence || null,
          latitude: (place as any).coordinates?.lat,
          longitude: (place as any).coordinates?.lng,
        },
        create: {
          name: place.name,
          slug: place.id,
          category: place.category,
          description: place.description,
          imageUrl: Array.isArray((place as any).images) && (place as any).images.length > 0 ? (place as any).images[0] : null,
          address: (place as any).address || null,
          phone: (place as any).phone || null,
          hours: hoursString || null,
          dressCode: (place as any).dressCode || null,
          optimalCadence: (place as any).optimalCadence || null,
          latitude: (place as any).coordinates?.lat,
          longitude: (place as any).coordinates?.lng,
          cityId: dbCity.id,
        },
      })
    }
  }

  console.log('✅ All static cities seeded.')

  // ─────── Validation ───────
  const cityCount = await prisma.city.count()
  const placeCount = await prisma.place.count()
  console.log(`🔎 Validation: ${cityCount} cities, ${placeCount} places now in the database.`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })