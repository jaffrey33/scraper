export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes for Vercel Pro
import { db } from "@/lib/firestore"
import { Listing } from "@/types/data-types"
import { NextResponse } from "next/server"
import { chromium } from "playwright"

// export async function scrapeListings(): Promise<Listing[]> {
//   const browser = await chromium.launch({ headless: true })
//   const page = await browser.newPage()

//   await page.goto(
//     "https://www.trademe.co.nz/a/property/residential/rent/manawatu-whanganui/ruapehu",
//     { waitUntil: "domcontentloaded" }
//   )

//   // wait for the exact element you showed
//   await page.waitForSelector(
//     "tm-property-search-card-listing-title",
//     { timeout: 30000 }
//   )

//   const listingLinks = await page.$$eval(
//     "tm-property-search-card-listing-title",
//     titles => {
//       return titles.map(t => {
//         const card =
//           t.closest("tm-property-search-card") ||
//           t.closest("article") ||
//           t.parentElement

//         const siteURL =
//           card
//             ?.querySelector("a.tm-property-search-card__link")
//             ?.getAttribute("href") || null
//         const address =
//           t.textContent?.trim() || null
//         const imageURL =
//           card
//             ?.querySelector("img.tm-progressive-image-loader__full")
//             ?.getAttribute("src") || null
//         const price =
//           card
//             ?.querySelector("tm-property-search-card-price-attribute")
//             ?.textContent
//             ?.trim() || null

//         const agent =
//           card
//             ?.querySelector("tm-property-search-card-agents-name")
//             ?.textContent
//             ?.trim() || null

//         const listedDate =
//           card
//             ?.querySelector("tm-property-search-card-listed-date")
//             ?.textContent
//             ?.trim() || null
//         const metrics = Array.from(
//           card?.querySelectorAll(
//             "li.tm-property-search-card-attribute-icons__metric"
//           ) || []
//         )

//         let bedrooms = null
//         let bathrooms = null

//         for (const li of metrics) {
//           const type =
//             li.querySelector("tg-icon")?.getAttribute("alt")?.toLowerCase()

//           const valueText =
//             li
//               .querySelector(
//                 ".tm-property-search-card-attribute-icons__metric-value"
//               )
//               ?.textContent
//               ?.trim()

//           const value = valueText ? Number(valueText) : null

//           if (type?.includes("bed")) bedrooms = value
//           if (type?.includes("bath")) bathrooms = value
//         }
//      // Get all photos from the image viewer
//         const photos = Array.from(
//           card?.querySelectorAll("tg-image-viewer-item img.tm-progressive-image-loader__full") || []
//         )
//           .map(img => img.getAttribute("src"))
//           .filter(src => src && src.includes("trademe.tmcdn.co.nz"))

//         // Alternative: get from source elements
//         const photoSources = Array.from(
//           card?.querySelectorAll("tg-image-viewer-item source") || []
//         )
//           .map(source => source.getAttribute("srcset"))
//           .filter(src => src && src.includes("trademe.tmcdn.co.nz"))
//           .filter((src, index, self) => self.indexOf(src) === index) // Remove duplicates

//         const allPhotos = photos.length > 0 ? photos : photoSources
//         return {
//           imageURL,
//           siteURL,
//           address,
//           rent_per_week: price
//             ? Number(price.replace(/[^\d]/g, ""))
//             : null,
//           agent,
//           date_listed: listedDate,
//           bedrooms,
//           bathrooms,
//                photos: allPhotos.length > 0 ? allPhotos : null
//         }
//       })
//     }
//   )

//   // Now scrape each individual listing page
//   const detailedData : Listing[] = []

//   for (const listing of listingLinks) {
//     if (!listing.siteURL) {
//       detailedData.push(listing)
//       continue
//     }

//     try {
//       const fullURL = listing.siteURL.startsWith('http') 
//         ? listing.siteURL 
//         : `https://www.trademe.co.nz/a/${listing.siteURL}`

//       await page.goto(fullURL, { waitUntil: "domcontentloaded", timeout: 30000 })

//       // Scrape additional data from the listing page
//       const listingDetails = await page.evaluate(() => {
//         // Description
//         const description = 
//           document.querySelector('.tm-markdown')?.textContent?.trim() ||
//           document.querySelector('[data-testid="listing-description"]')?.textContent?.trim() ||
//           null

//       // Property Type from the table
//         let propertyType = null
//         const tableRows = Array.from(document.querySelectorAll('table.o-table tbody tr'))
//         for (const row of tableRows) {
//           const attributeCell = row.querySelector('td[data-th="Attribute"]')
//           const valueCell = row.querySelector('td[data-th="Value"]')

//           if (attributeCell?.textContent?.trim().toLowerCase().includes('property type')) {
//             propertyType = valueCell?.textContent?.trim() || null
//             break
//           }
//         }


//         return {
//           description,
//           propertyType,
//         }
//       })

//       detailedData.push({
//         ...listing,
//         ...listingDetails
//       })

//       // Small delay to avoid overwhelming the server
//       await page.waitForTimeout(500)

//     } catch (error) {
//       // Add the listing without the additional details if scraping fails
//       detailedData.push({
//         ...listing,
//         description: null,
//         propertyType: null,
//       })
//     }
//   }

//   await browser.close()
//  return detailedData
//   // return NextResponse.json(detailedData)
// }

async function scrapeListings(): Promise<Listing[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(
    "https://www.trademe.co.nz/a/property/residential/rent/manawatu-whanganui/ruapehu",
    { waitUntil: "domcontentloaded" }
  )

  await page.waitForSelector(
    "tm-property-search-card-listing-title",
    { timeout: 30000 }
  )

  const listingLinks = await page.$$eval(
    "tm-property-search-card-listing-title",
    titles => {
      return titles.map(t => {
        const card =
          t.closest("tm-property-search-card") ||
          t.closest("article") ||
          t.parentElement

        const siteURL =
          card
            ?.querySelector("a.tm-property-search-card__link")
            ?.getAttribute("href") || null
        const address =
          t.textContent?.trim() || null
        const imageURL =
          card
            ?.querySelector("img.tm-progressive-image-loader__full")
            ?.getAttribute("src") || null
        const price =
          card
            ?.querySelector("tm-property-search-card-price-attribute")
            ?.textContent
            ?.trim() || null

        const agent =
          card
            ?.querySelector("tm-property-search-card-agents-name")
            ?.textContent
            ?.trim() || null

        const listedDate =
          card
            ?.querySelector("tm-property-search-card-listed-date")
            ?.textContent
            ?.trim() || null
        const metrics = Array.from(
          card?.querySelectorAll(
            "li.tm-property-search-card-attribute-icons__metric"
          ) || []
        )

        let bedrooms = null
        let bathrooms = null

        for (const li of metrics) {
          const type =
            li.querySelector("tg-icon")?.getAttribute("alt")?.toLowerCase()

          const valueText =
            li
              .querySelector(
                ".tm-property-search-card-attribute-icons__metric-value"
              )
              ?.textContent
              ?.trim()

          const value = valueText ? Number(valueText) : null

          if (type?.includes("bed")) bedrooms = value
          if (type?.includes("bath")) bathrooms = value
        }

        return {
          imageURL,
          siteURL,
          address,
          rent_per_week: price
            ? Number(price.replace(/[^\d]/g, ""))
            : null,
          agent,
          date_listed: listedDate,
          bedrooms,
          bathrooms
        }
      })
    }
  )

  const detailedData: Listing[] = []

  for (const listing of listingLinks) {
    if (!listing.siteURL) {
      detailedData.push({
        ...listing,
        description: null,
        propertyType: null,
        photos: null,
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
      await page.waitForTimeout(1000)

      const listingDetails = await page.evaluate(() => {
        const description =
          document.querySelector('.tm-markdown')?.textContent?.trim() ||
          document.querySelector('[data-testid="listing-description"]')?.textContent?.trim() ||
          null

        let propertyType = null
        const tableRows = Array.from(document.querySelectorAll('table.o-table tbody tr'))
        for (const row of tableRows) {
          const attributeCell = row.querySelector('td[data-th="Attribute"]')
          const valueCell = row.querySelector('td[data-th="Value"]')

          if (attributeCell?.textContent?.trim().toLowerCase().includes('property type')) {
            propertyType = valueCell?.textContent?.trim() || null
            break
          }
        }

        const photoElements = Array.from(
          document.querySelectorAll('tg-image-viewer-item img, .tm-image-gallery__image img, img[data-testid="listing-image"]')
        )

        const photos = photoElements
          .map(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src')
            return src?.replace(/\/\d+x\d+[a-z]?\//, '/full/') || src
          })
          .filter(src => src && src.includes('trademe.tmcdn.co.nz'))
          .filter((src, index, self) => self.indexOf(src) === index)

        return {
          description,
          propertyType,
          photos: photos.length > 0 ? photos : null
        }
      })

      detailedData.push({
        ...listing,
        ...listingDetails,
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      } as Listing)
      await page.waitForTimeout(500)

    } catch (error) {
      console.error(`Error scraping ${listing.siteURL}:`, error)
      detailedData.push({
        ...listing,
        description: null,
        propertyType: null,
        photos: null,
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })
    }
  }

  await browser.close()
  return detailedData
}

export async function GET(request: Request) {
  try {
    // Verify cron secret for scheduled requests
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const listings = await scrapeListings()

    // Delete batch
    const existingListings = await db.collection('property_listings').get()
    const deleteBatch = db.batch()
    existingListings.docs.forEach(doc => {
      deleteBatch.delete(doc.ref)
    })
    await deleteBatch.commit()

    // Save to Firestore
    const batch = db.batch()
    const collectionRef = db.collection('property_listings')

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



// export const runtime = "nodejs"

// import { NextResponse } from "next/server"
// import { chromium } from "playwright"

// const BASE = "https://www.trademe.co.nz/a/"

// export async function GET() {
//   const browser = await chromium.launch({
//     headless: true
//   })

//   // important: real browser context
//   const context = await browser.newContext({
//     userAgent:
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//   })

//   const page = await context.newPage()

//   await page.goto(
//     "https://www.trademe.co.nz/a/property/residential/rent/manawatu-whanganui/ruapehu",
//     { waitUntil: "domcontentloaded" }
//   )

//   // wait until cards exist
//   await page.waitForSelector("tm-property-search-card")

//   // only get links
//   const links = await page.$$eval(
//     "tm-property-search-card a.tm-property-search-card__link",
//     els => {
//       const set = new Set()

//       els.forEach(a => {
//         const href = a.getAttribute("href")
//         if (href) set.add(href)
//       })

//       return Array.from(set)
//     }
//   )

//   const results: any[] = []

//   // visit each listing
//   for (const href of links) {
//     const url = href.startsWith("http") ? href : BASE + href

//     const p = await context.newPage()

//     try {
//       await p.goto(url, {
//         waitUntil: "networkidle",
//         timeout: 30000
//       })

//       // wait for real rendered content
//       await p.waitForSelector(
//         "tg-col",
//         { timeout: 30000 }
//       )

//       const data = await p.evaluate(() => {
//         const clean = (t?: string | null) =>
//           t?.replace(/\s+/g, " ").trim() || null

//         const address = clean(
//           document.querySelector(
//             "h1.tm-property-listing-body__location"
//           )?.textContent
//         )

//         const title = clean(
//           document.querySelector(
//             "h2.tm-property-listing-body__title"
//           )?.textContent
//         )

//         const priceText = clean(
//           document.querySelector(
//             "h2.tm-property-listing-body__price strong"
//           )?.textContent
//         )

//         const rent_per_week = priceText
//           ? Number(priceText.replace(/[^\d]/g, ""))
//           : null

//         const listedDate = clean(
//           document.querySelector(
//             ".tm-property-listing-body__date"
//           )?.textContent
//         )

//         let bedrooms: number | null = null
//         let bathrooms: number | null = null

//         const tags = Array.from(
//           document.querySelectorAll(
//             ".tm-property-listing-attribute-tag__tag--content"
//           )
//         )

//         for (const el of tags) {
//           const text = clean(el.textContent)
//           if (!text) continue

//           if (text.toLowerCase().includes("bed")) {
//             const n = text.match(/\d+/)?.[0]
//             if (n) bedrooms = Number(n)
//           }

//           if (text.toLowerCase().includes("bath")) {
//             const n = text.match(/\d+/)?.[0]
//             if (n) bathrooms = Number(n)
//           }
//         }

//         const attributes: Record<string, string> = {}

//         const rows = Array.from(
//           document.querySelectorAll(
//             "tm-property-listing-attributes table.o-table tbody tr"
//           )
//         )

//         for (const row of rows) {
//           const key = clean(
//             row.querySelector(
//               'td[data-th="Attribute"]'
//             )?.textContent
//           )

//           const value = clean(
//             row.querySelector(
//               'td[data-th="Value"]'
//             )?.textContent
//           )

//           if (key && value) {
//             attributes[key] = value
//           }
//         }

//         const description = clean(
//           document.querySelector(
//             "tm-property-listing-description .tm-markdown"
//           )?.textContent
//         )

//         return {
//           address,
//           title,
//           rent_per_week,
//           listedDate,
//           bedrooms,
//           bathrooms,
//           attributes,
//           description
//         }
//       })

//       results.push({
//         url,
//         ...data
//       })
//     } catch (err) {
//       results.push({
//         url,
//         error: "failed to scrape listing"
//       })
//     } finally {
//       await p.close()
//     }
//   }

//   await browser.close()

//   return NextResponse.json({
//     count: results.length,
//     results
//   })
// }
