import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  console.log('🌱 Seeding Paris places via Prisma...')

  // 1. إنشاء أو جلب مدينة باريس
  const city = await prisma.city.upsert({
    where: { slug: 'paris' },
    update: {},
    create: {
      id: 'city_paris_01',
      name: 'Paris',
      slug: 'paris',
      country: 'France',
      description: 'The global capital of style, gastronomy, and Haussmannian elegance.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
    }
  })

  // 2. قراءة ملف الأماكن
  const filePath = path.join(__dirname, 'paris-places.json')
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    return
  }

  const places = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  console.log(`📦 Found ${places.length} places. Inserting...`)

  // 3. إدخال الأماكن
  for (const p of places) {
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
        id: 'place_' + Math.random().toString(36).substring(2, 9),
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
        cityId: city.id
      }
    })
  }

  console.log('✨ Done! All 75 places seeded successfully.')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })