import { PrismaClient } from '@prisma/client'

type CommonsPage = {
  title: string
  imageinfo?: Array<{ thumburl?: string; url?: string; mime?: string }>
}

const prisma = new PrismaClient()
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function findVerifiedCommonsImage(name: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${name} Paris`,
    gsrnamespace: '6',
    gsrlimit: '3',
    prop: 'imageinfo',
    iiprop: 'url|mime',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  })
  let response: Response | undefined
  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': 'Romely image repair (contact: project maintainer)' },
      signal: AbortSignal.timeout(8_000),
    })
    if (response.status !== 429) break
    await delay(3_000 * (attempt + 1))
  }
  if (!response?.ok) throw new Error(`Commons search failed for ${name}: ${response?.status}`)

  const body = (await response.json()) as { query?: { pages?: Record<string, CommonsPage> } }
  const pages = Object.values(body.query?.pages ?? {})

  for (const page of pages) {
    const info = page.imageinfo?.[0]
    const imageUrl = info?.thumburl ?? info?.url
    if (!imageUrl || !info?.mime?.startsWith('image/')) continue

    const imageResponse = await fetch(imageUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5_000),
    }).catch(() => null)
    if (imageResponse?.ok && imageResponse.headers.get('content-type')?.toLowerCase().startsWith('image/')) {
      return imageUrl
    }
  }

  return null
}

async function main() {
  const brokenPlaces = await prisma.place.findMany({
    where: { imageUrl: { contains: 'source.unsplash.com' } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  const brokenCities = await prisma.city.findMany({
    where: { imageUrl: { contains: 'source.unsplash.com' } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  let fixedPlaces = 0
  const unresolved: string[] = []

  let nextPlace = 0
  async function worker() {
    while (nextPlace < brokenPlaces.length) {
      const place = brokenPlaces[nextPlace++]
      const imageUrl = await findVerifiedCommonsImage(place.name)
      if (imageUrl) {
        // Save each fully verified result immediately. The script is intentionally
        // resumable because remote image providers can throttle long migrations.
        await prisma.place.update({ where: { id: place.id }, data: { imageUrl } })
        fixedPlaces += 1
        console.log(`fixed: ${place.name}`)
      } else unresolved.push(place.name)
      // Commons asks API consumers to avoid request bursts. This also keeps the
      // direct-image verification requests comfortably below its rate limit.
      await delay(1_000)
    }
  }
  await Promise.all(Array.from({ length: 3 }, worker))

  const remaining = await prisma.place.count({ where: { imageUrl: { contains: 'source.unsplash.com' } } })
  console.log(JSON.stringify({ fixedPlaces, affectedCities: brokenCities.length, remaining, unresolved }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
