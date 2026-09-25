import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pkg from 'pg'

const { Pool } = pkg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

function generateId() {
  return 'cuid_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

async function main() {
  console.log('🌱 Connecting to Neon database securely...')
  const client = await pool.connect()

  try {
    // 1. إنشاء الجداول
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.cities (
        id VARCHAR(30) PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        country TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.places (
        id VARCHAR(30) PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        address TEXT,
        phone TEXT,
        hours TEXT,
        dress_code TEXT,
        optimal_cadence TEXT,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        city_id VARCHAR(30) REFERENCES public.cities(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // 2. إدخال أو جلب باريس
    const citySlug = 'paris'
    let cityResult = await client.query('SELECT id FROM public.cities WHERE slug = $1', [citySlug])
    
    let cityId
    if (cityResult.rows.length === 0) {
      cityId = generateId()
      await client.query(
        `INSERT INTO public.cities (id, name, slug, country, description, image_url, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          cityId,
          'Paris',
          'paris',
          'France',
          'The global capital of style, gastronomy, and Haussmannian elegance.',
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
        ]
      )
      console.log(`📍 Created City: Paris (ID: ${cityId})`)
    } else {
      cityId = cityResult.rows[0].id
      console.log(`📍 Found City: Paris (ID: ${cityId})`)
    }

    // 3. قراءة ملف الـ JSON
    const filePath = path.join(__dirname, 'paris-places.json')
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: JSON file not found at ${filePath}`)
      process.exit(1)
    }

    const places = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    console.log(`📦 Found ${places.length} places. Inserting into database...`)

    // 4. إدخال الأماكن
    for (const place of places) {
      const placeId = generateId()
      await client.query(
        `INSERT INTO public.places (id, name, slug, category, description, image_url, address, phone, hours, dress_code, optimal_cadence, latitude, longitude, city_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           description = EXCLUDED.description,
           image_url = EXCLUDED.image_url,
           address = EXCLUDED.address,
           phone = EXCLUDED.phone,
           hours = EXCLUDED.hours,
           dress_code = EXCLUDED.dress_code,
           optimal_cadence = EXCLUDED.optimal_cadence,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           updated_at = NOW()`,
        [
          placeId,
          place.name,
          place.slug,
          place.category,
          place.description || null,
          place.imageUrl || null,
          place.address || null,
          place.phone || null,
          place.hours || null,
          place.dressCode || null,
          place.optimalCadence || null,
          place.latitude,
          place.longitude,
          cityId
        ]
      )
    }

    console.log('✨ Seeding completed successfully on Neon!')
  } catch (err) {
    console.error('❌ Connection or seeding error:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

main()