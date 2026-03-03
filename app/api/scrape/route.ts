export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes for Vercel Pro
import { db } from "@/lib/firestore"
import { Listing } from "@/types/data-types"
import { NextResponse } from "next/server"
import { chromium } from "playwright"

async function scrapeTrademeListings(page: any): Promise<Listing[]> {
  console.log('Navigating to TradeMe...')

  await page.goto(
    "https://www.trademe.co.nz/a/property/residential/rent/manawatu-whanganui/ruapehu",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  )

  await page.waitForSelector("tm-property-search-card-listing-title", { timeout: 30000 })
  await page.waitForTimeout(2000)

  // Scroll incrementally to load all cards
  console.log('Scrolling to load all listings...')
  const scrollHeight: number = await page.evaluate(() => document.body.scrollHeight)
  const viewportHeight: number = await page.evaluate(() => window.innerHeight)
  const steps = Math.ceil(scrollHeight / viewportHeight)
  for (let step = 1; step <= steps; step++) {
    await page.evaluate(({ s, vh }: { s: number, vh: number }) => window.scrollTo(0, s * vh * 0.85), { s: step, vh: viewportHeight })
    await page.waitForTimeout(800)
  }
  await page.waitForTimeout(1500)

  const listingLinks = await page.evaluate(() => {
    const results: any[] = []

    // Helper to get best image from a card
    function getImageURL(card: Element): string | null {
      // Prefer the full-size src from the active/loaded image
      const img = card.querySelector('img.tm-progressive-image-loader__full')
      if (img) {
        const src = img.getAttribute('src') || ''
        // Ensure we always use /full/ size
        return src.replace(/\/photoserver\/[^/]+\//, '/photoserver/full/')
      }
      // Fallback: grab from <source> tags (prefer full or 1024sq)
      const sources = Array.from(card.querySelectorAll('picture source'))
      for (const size of ['full', '1024sq', '480m', '352x264c']) {
        const source = sources.find(s => s.getAttribute('srcset')?.includes(`/${size}/`))
        if (source) return source.getAttribute('srcset') || null
      }
      return null
    }

    // --- Premium listing cards ---
    document.querySelectorAll('tm-property-premium-listing-card').forEach(card => {
      const siteURL = card.querySelector('a.tm-property-premium-listing-card__link')?.getAttribute('href') || null
      const address = card.querySelector('tm-property-search-card-listing-title')?.textContent?.trim() || null
      const imageURL = getImageURL(card)
      const priceText = card.querySelector('tm-property-search-card-price-attribute')?.textContent?.trim() || ''
      const listedDate = card.querySelector('tm-property-search-card-listed-date')?.textContent?.trim() || null
      // Premium cards show agent name in a different element
      const agent =
        card.querySelector('.tm-property-premium-listing-card__agents-name')?.textContent?.trim() ||
        card.querySelector('tm-property-search-card-agents-name')?.textContent?.trim() ||
        null

      let bedrooms: number | null = null
      let bathrooms: number | null = null
      card.querySelectorAll('li.tm-property-search-card-attribute-icons__metric').forEach(li => {
        const type = li.querySelector('tg-icon')?.getAttribute('alt')?.toLowerCase() || ''
        const value = parseInt(li.querySelector('.tm-property-search-card-attribute-icons__metric-value')?.textContent?.trim() || '') || null
        if (type.includes('bed')) bedrooms = value
        if (type.includes('bath')) bathrooms = value
      })

      results.push({
        imageURL,
        siteURL,
        address,
        rent_per_week: priceText ? Number(priceText.replace(/[^\d]/g, '')) || null : null,
        agent: { agentName: agent, agentEmail: null, agentNumber: null },
        photos: imageURL ? [imageURL] : null,
        date_listed: listedDate,
        bedrooms,
        bathrooms
      })
    })

    // --- Standard listing cards ---
    document.querySelectorAll('tm-property-search-card').forEach(card => {
      const siteURL = card.querySelector('a.tm-property-search-card__link')?.getAttribute('href') || null
      const address = card.querySelector('tm-property-search-card-listing-title')?.textContent?.trim() || null
      const imageURL = getImageURL(card)
      const priceText = card.querySelector('tm-property-search-card-price-attribute')?.textContent?.trim() || ''
      const listedDate = card.querySelector('tm-property-search-card-listed-date')?.textContent?.trim() || null
      const agent = card.querySelector('tm-property-search-card-agents-name')?.textContent?.trim() || null

      let bedrooms: number | null = null
      let bathrooms: number | null = null
      card.querySelectorAll('li.tm-property-search-card-attribute-icons__metric').forEach(li => {
        const type = li.querySelector('tg-icon')?.getAttribute('alt')?.toLowerCase() || ''
        const value = parseInt(li.querySelector('.tm-property-search-card-attribute-icons__metric-value')?.textContent?.trim() || '') || null
        if (type.includes('bed')) bedrooms = value
        if (type.includes('bath')) bathrooms = value
      })

      results.push({
        imageURL,
        siteURL,
        address,
        rent_per_week: priceText ? Number(priceText.replace(/[^\d]/g, '')) || null : null,
        agent: { agentName: agent, agentEmail: null, agentNumber: null },
        photos: imageURL ? [imageURL] : null,
        date_listed: listedDate,
        bedrooms,
        bathrooms
      })
    })

    return results
  })

  // Deduplicate by siteURL
  const uniqueListings = listingLinks.filter(
    (listing: Listing, index, self) =>
      listing.siteURL &&
      index === self.findIndex(
        (l: Listing) => l.siteURL === listing.siteURL
      )
  )

  console.log(`Found ${uniqueListings.length} unique listings`)

  // Fetch detail pages
  const detailedData: Listing[] = []

  for (let i = 0; i < uniqueListings.length; i++) {
    const listing = uniqueListings[i]
    console.log(`\n[${i + 1}/${uniqueListings.length}] Processing: ${listing.address}`)

    if (!listing.siteURL) {
      detailedData.push({
        ...listing,
        description: null,
        propertyType: null,
        scrapeFrom: 'trademe.co.nz',
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })
      continue
    }

    try {
      const fullURL = listing.siteURL.startsWith('http')
        ? listing.siteURL
        : `https://www.trademe.co.nz${listing.siteURL}`

      await page.goto(fullURL, { waitUntil: "domcontentloaded", timeout: 30000 })
      await page.waitForTimeout(1500)

      const listingDetails = await page.evaluate(() => {
        const description =
          document.querySelector('.tm-markdown')?.textContent?.trim() ||
          document.querySelector('[data-testid="listing-description"]')?.textContent?.trim() ||
          null

        // Property type from attributes table
        let propertyType: string | null = null
        document.querySelectorAll('table.o-table tbody tr').forEach(row => {
          const attr = row.querySelector('td[data-th="Attribute"]')?.textContent?.trim().toLowerCase() || ''
          if (attr.includes('property type')) {
            propertyType = row.querySelector('td[data-th="Value"]')?.textContent?.trim() || null
          }
        })

        // All photos — use /full/ size and deduplicate
        const seen = new Set<string>()
        const photos: string[] = []
        document.querySelectorAll('tg-image-viewer-item img, .tm-image-gallery__image img').forEach(img => {
          const src = (img.getAttribute('src') || img.getAttribute('data-src') || '')
            .replace(/\/photoserver\/[^/]+\//, '/photoserver/full/')
          if (src.includes('trademe.tmcdn.co.nz') && !seen.has(src)) {
            seen.add(src)
            photos.push(src)
          }
        })

        return { description, propertyType, photos: photos.length > 0 ? photos : null }
      })

      detailedData.push({
        ...listing,
        ...listingDetails,
        photos: listingDetails.photos || listing.photos,
        scrapeFrom: 'trademe.co.nz',
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      } as Listing)

      await page.waitForTimeout(500)

    } catch (error) {
      console.error(`  ✗ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      detailedData.push({
        ...listing,
        description: null,
        propertyType: null,
        scrapeFrom: 'trademe.co.nz',
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })
    }
  }

  console.log(`\n✓ Successfully scraped ${detailedData.length} TradeMe listings\n`)
  return detailedData
}

export async function GET(request: Request) {
  try {
    // Verify cron secret for scheduled requests
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    const listings = await scrapeTrademeListings(page)

    // Delete batch
    const existingListings = await db.collection('trademe_property_listings').get()
    const deleteBatch = db.batch()
    existingListings.docs.forEach(doc => {
      deleteBatch.delete(doc.ref)
    })
    await deleteBatch.commit()

    // Save to Firestore
    const batch = db.batch()
    const collectionRef = db.collection('trademe_property_listings')

    for (const listing of listings) {
      // Use siteURL as document ID (cleaned)
      const docId = listing.siteURL?.replace(/[^a-zA-Z0-9]/g, '_') || `listing_${Date.now()}`
      const docRef = collectionRef.doc(docId)
      batch.set(docRef, listing, { merge: true })
    }

    await batch.commit()

    // Store metadata about last scrape
    await db.collection('scrape_metadata').doc('last_run').set({
      timestamp: new Date().toISOString(),
      listingsCount: listings.length,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      count: listings.length,
      message: 'Listings scraped and saved successfully'
    })
  } catch (error) {
    // Log error to Firestore
    await db.collection('scrape_metadata').doc('last_run').set({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json({
      error: 'Failed to scrape listings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
