import { chromium, Page } from "playwright"
import { db } from "../lib/firestore"
import { Listing } from "../types/data-types"

async function scrapeTrademeListings(page: Page): Promise<Listing[]> {

  const baseUrl = "https://www.realestate.co.nz/residential/rental/central-north-island/ruapehu"
  let allListings: Listing[] = []
  let currentPage = 1
  const maxPages = 3

  while (currentPage <= maxPages) {
    const url = currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 })
    await page.waitForTimeout(3000)

    const scrollHeight: number = await page.evaluate(() => document.body.scrollHeight)
    const viewportHeight: number = await page.evaluate(() => window.innerHeight)
    const steps = Math.ceil(scrollHeight / viewportHeight)

    for (let step = 1; step <= steps; step++) {
      await page.evaluate(({ s, vh }: { s: number, vh: number }) => window.scrollTo(0, s * vh * 0.85), { s: step, vh: viewportHeight })
      await page.waitForTimeout(1200) // give each batch of placeholders time to resolve
    }

    // Wait a bit more for any remaining lazy tiles
    await page.waitForTimeout(2000)

    // Wait until no placeholders remain (or timeout after 15s)
    await page.waitForFunction(
      () => document.querySelectorAll('[data-test="lazy-loaded__placeholder"]').length === 0,
      { timeout: 15000 }
    ).catch(() => console.warn('Timeout waiting for placeholders to load, proceeding with what we have...'))

    const pageListings = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allTiles: any[] = []

      function getBestImage(img: Element | null): string | null {
        if (!img) return null
        const srcset = img.getAttribute('srcset') || ''

        for (const width of ['1200w', '1075w', '900w', '767w', '650w']) {
          // Match: URL<space>WIDTH — URL starts after a comma or start of string
          const match = srcset.match(new RegExp(`(?:^|,)(https://\\S+\\.jpg\\?options=compress)\\s+${width}`))
          if (match) return match[1]
        }

        return img.getAttribute('src') || null
      }

      function getCarouselPhotos(container: Element): string[] {
        const photos: string[] = []
        container.querySelectorAll('.swiper-slide img').forEach(img => {
          const src = img.getAttribute('src') || ''
          if (src.includes('blur') || src.includes('.crop.10x')) return
          const best = getBestImage(img)
          if (best && !photos.includes(best)) photos.push(best)
        })
        return photos
      }

      // 1. Showcase/stacked tiles
      document.querySelectorAll('[data-test="stacked-tile"]').forEach(tile => {
        const siteURL = tile.querySelector('a[href]')?.getAttribute('href') || null
        const address = tile.querySelector('[data-test="homepage-carousel__listing-title"]')?.textContent?.trim() || null
        const imageURL = getBestImage(tile.querySelector('img:not(.blur-lg)'))
        const priceMatch = (tile.querySelector('h4')?.textContent?.trim() || '').match(/\$(\d+)/)
        const price = priceMatch ? Number(priceMatch[1]) : null
        const bedrooms = parseInt(tile.querySelector('[data-test="bedroom"]')?.textContent?.trim() || '0') || null
        const bathrooms = parseInt(tile.querySelector('[data-test="bathroom"]')?.textContent?.trim() || '0') || null
        const propertyType = tile.querySelector('[data-test="tile__search-result__content__features__divider"]')?.textContent?.trim() || null
        const agent = tile.querySelector('[data-test="logo__office"] img')?.getAttribute('alt') || null

        allTiles.push({
          imageURL,
          siteURL,
          address,
          rent_per_week: price,
          agent: { agentName: agent, agentEmail: null, agentNumber: null },
          photos: imageURL ? [imageURL] : null,
          date_listed: null,
          bedrooms,
          bathrooms,
          propertyType
        })
      })

      // 2. All listing tiles (featured + regular)
      document.querySelectorAll('[data-test="tile"]').forEach(tile => {
        // Skip any tile that's still a placeholder (no real content)
        if (!tile.querySelector('h3, [data-test="bedroom"]')) return

        const siteURL =
          tile.querySelector('a.listing-tile-info')?.getAttribute('href') ||
          tile.querySelector('a[href*="/residential/rent/"]')?.getAttribute('href') ||
          null

        const address =
          tile.querySelector('[data-test="premium-tile__search-result__address"]')?.textContent?.trim() ||
          tile.querySelector('[data-test="standard-tile__search-result__address"]')?.textContent?.trim() ||
          null

        const carousel = tile.querySelector('[data-test="carousel-swiper"]')
        const photos = carousel ? getCarouselPhotos(carousel) : []
        const imageURL = photos[0] || null

        const priceMatch = (tile.querySelector('[data-test="price-display__price-method"]')?.textContent?.trim() || '').match(/\$(\d+)/)
        const price = priceMatch ? Number(priceMatch[1]) : null

        const bedrooms = parseInt(tile.querySelector('[data-test="bedroom"]')?.textContent?.trim() || '0') || null
        const bathrooms = parseInt(tile.querySelector('[data-test="bathroom"]')?.textContent?.trim() || '0') || null
        const propertyType = tile.querySelector('[data-test="tile__search-result__content__features__divider"]')?.textContent?.trim() || null
        const dateText = tile.querySelector('[data-test="tile__search-result__content__date"]')?.textContent?.trim() || null
        const agent = tile.querySelector('[data-test="logo__office"] img')?.getAttribute('alt') || null

        allTiles.push({
          imageURL,
          siteURL,
          address,
          rent_per_week: price,
          agent: { agentName: agent, agentEmail: null, agentNumber: null },
          photos: photos.length > 0 ? photos : null,
          date_listed: dateText,
          bedrooms,
          bathrooms,
          propertyType
        })
      })

      return allTiles
    })

    // Log how many placeholders remain for debugging
    await page.evaluate(
      () => document.querySelectorAll('[data-test="lazy-loaded__placeholder"]').length
    )
    allListings = [...allListings, ...pageListings]

    const hasNextPage = await page.evaluate(() => {
      const currentPageElem = document.querySelector('[data-test="paginated-items__current-page"]')
      if (!currentPageElem) return false
      const nextPageNum = parseInt(currentPageElem.textContent?.trim() || '0') + 1
      return Array.from(document.querySelectorAll('.paginated-items__page-name'))
        .some(link => parseInt(link.textContent?.trim() || '0') === nextPageNum)
    })

    if (!hasNextPage || pageListings.length === 0) {

      break
    }

    currentPage++
    await page.waitForTimeout(2000)
  }

  const uniqueListings = allListings.filter((listing, index, self) =>
    listing.siteURL && index === self.findIndex((l) => l.siteURL === listing.siteURL)
  )

  const detailedData: Listing[] = []

  for (let i = 0; i < uniqueListings.length; i++) {
    const listing = uniqueListings[i]

    if (!listing.siteURL) {
      detailedData.push({ ...listing, description: null, scrapedAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), scrapeFrom: 'realestate.co.nz' })
      continue
    }

    try {
      const fullURL = listing.siteURL.startsWith('http')
        ? listing.siteURL
        : `https://www.realestate.co.nz${listing.siteURL}`

      await page.goto(fullURL, { waitUntil: "domcontentloaded", timeout: 30000 })
      await page.waitForTimeout(1500)

      const listingDetails = await page.evaluate(() => {
        const description = Array.from(document.querySelectorAll('p'))
          .map(p => p.textContent?.trim() || '')
          .filter(t => t.length > 100)
          .sort((a, b) => b.length - a.length)[0] || null

        const seen = new Set<string>()
        const photos: string[] = []
        document.querySelectorAll('.swiper-slide img, [class*="gallery"] img').forEach(img => {
          const src = img.getAttribute('src') || ''
          if (
            src.includes('mediaserver.realestate.co.nz') &&
            !src.includes('blur') &&
            !src.includes('.scale.') &&
            !src.includes('.crop.10x')
          ) {
            const upgraded = src.replace(/\.crop\.\d+x\d+\.jpg/, '.crop.1200x900.jpg')
            if (!seen.has(upgraded)) { seen.add(upgraded); photos.push(upgraded) }
          }
        })

        return { description, photos: photos.length > 0 ? photos : null }
      })

      detailedData.push({
        ...listing,
        description: listingDetails.description,
        photos: listingDetails.photos || listing.photos,
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        scrapeFrom: 'realestate.co.nz'
      })

      await page.waitForTimeout(500)

    } catch {
      detailedData.push({ ...listing, description: null, scrapedAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), scrapeFrom: 'realestate.co.nz' })
    }
  }

  return detailedData
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const listings = await scrapeTrademeListings(page)

    // Delete existing
    const existingListings = await db.collection('trademe_property_listings').get()
    const deleteBatch = db.batch()
    existingListings.docs.forEach(doc => deleteBatch.delete(doc.ref))
    await deleteBatch.commit()

    // Save new listings
    const batch = db.batch()
    const collectionRef = db.collection('trademe_property_listings')
    for (const listing of listings) {
      const docId = listing.siteURL?.replace(/[^a-zA-Z0-9]/g, '_') || `listing_${Date.now()}`
      batch.set(collectionRef.doc(docId), listing, { merge: true })
    }
    await batch.commit()

    await db.collection('scrape_metadata').doc('last_run').set({
      timestamp: new Date().toISOString(),
      listingsCount: listings.length,
      status: 'success'
    })

    console.log(`✓ Done. Saved ${listings.length} listings.`)
  } catch (error) {
    await db.collection('scrape_metadata').doc('last_run').set({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error("Error in main:", error)
  process.exit(1)
})