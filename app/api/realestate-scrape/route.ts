export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes for Vercel Pro
import { db } from "@/lib/firestore"
import { Listing } from "@/types/data-types"
import { NextResponse } from "next/server"
import { chromium } from "playwright"

// async function scrapeRealEstateListings(page: any): Promise<Listing[]> {
//     await page.goto(
//         "https://www.realestate.co.nz/residential/rental/central-north-island/ruapehu",
//         { waitUntil: "domcontentloaded" }
//     )

//     // Wait for initial listings to load
//     try {
//         await page.waitForSelector('article.listing-tile, div[data-test="tile"], .property-list-item', { timeout: 30000 })
//     } catch (error) {
//         console.error('No listings found on RealEstate.co.nz')
//         return []
//     }

//     // Scroll to load all listings (handle infinite scroll)
//     let previousHeight = 0
//     let scrollAttempts = 0
//     const maxScrollAttempts = 10

//     while (scrollAttempts < maxScrollAttempts) {
//         // Get current scroll height
//         const currentHeight = await page.evaluate(() => document.body.scrollHeight)

//         if (currentHeight === previousHeight) {
//             // No more content loaded, break
//             break
//         }

//         // Scroll to bottom
//         await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

//         // Wait for new content to load
//         await page.waitForTimeout(2000)

//         previousHeight = currentHeight
//         scrollAttempts++

//         console.log(`RealEstate scroll attempt ${scrollAttempts}, height: ${currentHeight}`)
//     }

//     // Scroll back to top
//     await page.evaluate(() => window.scrollTo(0, 0))
//     await page.waitForTimeout(1000)

//     const listingLinks = await page.$$eval(
//         '.tile, div[data-test="tile"]',
//         (cards: any[]) => {
//             return cards.map(card => {
//                 const link = card.querySelector('a[href*="/rental/"]')
//                 const siteURL = link?.getAttribute('href') || null

//                 const address =
//                     card.querySelector('.listing-tile__title, [data-testid="search-card-title"]')?.textContent?.trim() ||
//                     card.querySelector('h2, h3')?.textContent?.trim() ||
//                     null

//                 const imageURL =
//                     card.querySelector('img')?.getAttribute('src') ||
//                     card.querySelector('img')?.getAttribute('data-src') ||
//                     null

//                 const priceElement =
//                     card.querySelector('.listing-tile__price, [data-testid="search-card-price"]') ||
//                     card.querySelector('[class*="price"]')
//                 const price = priceElement?.textContent?.trim() || null

//                 const agent =
//                     card.querySelector('.listing-tile__agent, [data-testid="search-card-agent"]')?.textContent?.trim() ||
//                     card.querySelector('[class*="agent"]')?.textContent?.trim() ||
//                     null

//                 const listedDate =
//                     card.querySelector('.listing-tile__date, [data-testid="search-card-date"]')?.textContent?.trim() ||
//                     null

//                 // Extract bedrooms and bathrooms
//                 const bedroomsEl =
//                     card.querySelector('[data-testid="bedrooms"], .listing-tile__bedrooms, [class*="bedroom"]')
//                 const bathroomsEl =
//                     card.querySelector('[data-testid="bathrooms"], .listing-tile__bathrooms, [class*="bathroom"]')

//                 const bedrooms = bedroomsEl
//                     ? parseInt(bedroomsEl.textContent?.replace(/\D/g, '') || '0') || null
//                     : null
//                 const bathrooms = bathroomsEl
//                     ? parseInt(bathroomsEl.textContent?.replace(/\D/g, '') || '0') || null
//                     : null

//                 return {
//                     imageURL,
//                     siteURL,
//                     address,
//                     rent_per_week: price ? Number(price.replace(/[^\d]/g, "")) : null,
//                     agent,
//                     photos: imageURL ? [imageURL] : null,
//                     date_listed: listedDate,
//                     bedrooms,
//                     bathrooms
//                 }
//             })
//         }
//     )

//     const detailedData: Listing[] = []

//     for (const listing of listingLinks) {
//         if (!listing.siteURL) {
//             detailedData.push({
//                 ...listing,
//                 description: null,
//                 propertyType: null,
//                 scrapedAt: new Date().toISOString(),
//                 lastUpdated: new Date().toISOString(),
//                 source: 'realestate.co.nz'
//             })
//             continue
//         }

//         try {
//             const fullURL = listing.siteURL.startsWith('http')
//                 ? listing.siteURL
//                 : `https://www.realestate.co.nz${listing.siteURL}`

//             await page.goto(fullURL, { waitUntil: "domcontentloaded", timeout: 30000 })
//             await page.waitForTimeout(1500)

//             const listingDetails = await page.evaluate(() => {
//                 const description =
//                     document.querySelector('.listing-description, [data-testid="listing-description"]')?.textContent?.trim() ||
//                     document.querySelector('.property-description')?.textContent?.trim() ||
//                     null

//                 const propertyType =
//                     document.querySelector('.property-type, [data-testid="property-type"]')?.textContent?.trim() ||
//                     Array.from(document.querySelectorAll('.property-attributes li, .listing-attributes li'))
//                         .find(el => el.textContent?.toLowerCase().includes('type'))?.textContent?.trim() ||
//                     null

//                 const photoElements = Array.from(
//                     document.querySelectorAll('.property-gallery img, .image-gallery img, [data-testid="listing-image"]')
//                 )

//                 const photos = photoElements
//                     .map(img => img.getAttribute('src') || img.getAttribute('data-src'))
//                     .filter(src => src && !src.includes('placeholder'))
//                     .filter((src, index, self) => self.indexOf(src) === index)

//                 return {
//                     description,
//                     propertyType,
//                     photos: photos.length > 0 ? photos : null
//                 }
//             })

//             detailedData.push({
//                 ...listing,
//                 ...listingDetails,
//                 scrapedAt: new Date().toISOString(),
//                 lastUpdated: new Date().toISOString(),
//                 source: 'realestate.co.nz'
//             })

//             await page.waitForTimeout(500)

//         } catch (error) {
//             console.error(`Error scraping RealEstate.co.nz listing ${listing.siteURL}:`, error)
//             detailedData.push({
//                 ...listing,
//                 description: null,
//                 propertyType: null,
//                 scrapedAt: new Date().toISOString(),
//                 lastUpdated: new Date().toISOString(),
//                 scrapeFrom: 'realestate.co.nz'
//             })
//         }
//     }

//     return detailedData
// }
async function scrapeRealEstateListings(page: any): Promise<Listing[]> {
  await page.goto(
    "https://www.realestate.co.nz/residential/rental/central-north-island/ruapehu",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  )

  // Wait for listings to load
  await page.waitForSelector('div.tile.listing-tile', { timeout: 30000 })
  await page.waitForTimeout(3000)

  // Get initial count
  const initialCount = await page.evaluate(() => {
    return document.querySelectorAll('div.tile.listing-tile').length
  })
  
  console.log(`Initial load: Found ${initialCount} listings`)

  // Scroll to load all listings
  console.log('Scrolling to load more listings...')
  let previousCount = initialCount
  let stableCount = 0
  let scrollAttempts = 0
  const maxScrollAttempts = 10
  
  while (scrollAttempts < maxScrollAttempts) {
    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    
    // Wait for potential new content
    await page.waitForTimeout(3000)
    
    // Count again using evaluate to ensure fresh count
    const currentCount = await page.evaluate(() => {
      return document.querySelectorAll('div.tile.listing-tile').length
    })
    
    console.log(`Scroll ${scrollAttempts + 1}: Found ${currentCount} listings (previous: ${previousCount})`)
    
    // If count hasn't changed for 3 attempts, we're done
    if (currentCount === previousCount) {
      stableCount++
      if (stableCount >= 3) {
        console.log('No new listings loaded after 3 attempts, stopping')
        break
      }
    } else {
      stableCount = 0
      console.log(`Loaded ${currentCount - previousCount} new listings`)
    }
    
    previousCount = currentCount
    scrollAttempts++
  }

  const finalCount = await page.evaluate(() => {
    return document.querySelectorAll('div.tile.listing-tile').length
  })
  
  console.log(`Total listings found: ${finalCount}`)

  // Extract listing data - use evaluate to get everything in one go
  const listingLinks = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('div.tile.listing-tile'))
    console.log(`Extracting data from ${tiles.length} tiles`)
    
    return tiles.map((tile, index) => {
      // Get the main link
      const link = tile.querySelector('a.listing-tile-info')
      const siteURL = link?.getAttribute('href') || null
      
      // Get address from h3
      const address = tile.querySelector('h3[data-test="standard-tile__search-result__address"]')?.textContent?.trim() || null
      
      // Get image from the first swiper slide
      const imageURL = tile.querySelector('.swiper-slide img')?.getAttribute('src') || null
      
      // Get price
      const priceElement = tile.querySelector('[data-test="price-display__price-method"]')
      const priceText = priceElement?.textContent?.trim() || ''
      const priceMatch = priceText.match(/\$(\d+)/)
      const price = priceMatch ? priceMatch[1] : null
      
      // Get bedrooms
      const bedroomElement = tile.querySelector('[data-test="bedroom"]')
      const bedrooms = bedroomElement ? parseInt(bedroomElement.textContent?.trim() || '0') : null
      
      // Get bathrooms
      const bathroomElement = tile.querySelector('[data-test="bathroom"]')
      const bathrooms = bathroomElement ? parseInt(bathroomElement.textContent?.trim() || '0') : null
      
      // Get property type
      const propertyType = tile.querySelector('[data-test="tile__search-result__content__features__divider"]')?.textContent?.trim() || null
      
      // Get listing date
      const dateElement = tile.querySelector('.listed-date, [data-test="tile__search-result__content__date"]')
      const listedDate = dateElement?.textContent?.trim() || null
      
      // Get agent/office logo alt text
      const agentLogo = tile.querySelector('[data-test="logo__office"] img')
      const agent = agentLogo?.getAttribute('alt') || null
      
      if (index < 3) {
        console.log(`Listing ${index + 1}: ${address} - $${price}/week`)
      }
      
      return {
        imageURL,
        siteURL: siteURL ? (siteURL.startsWith('http') ? siteURL : `https://www.realestate.co.nz${siteURL}`) : null,
        address,
        rent_per_week: price ? Number(price) : null,
        agent,
        photos: imageURL ? [imageURL] : null,
        date_listed: listedDate,
        bedrooms,
        bathrooms,
        propertyType
      }
    })
  })

  console.log(`Successfully extracted ${listingLinks.length} listings from search page`)

  const detailedData: Listing[] = []
  
  for (let i = 0; i < listingLinks.length; i++) {
    const listing = listingLinks[i]
    console.log(`Processing detail page ${i + 1}/${listingLinks.length}: ${listing.address}`)
    
    if (!listing.siteURL) {
      detailedData.push({
        ...listing,
        description: null,
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        source: 'realestate.co.nz'
      })
      continue
    }

    try {
      const fullURL = listing.siteURL.startsWith('http') 
        ? listing.siteURL 
        : `https://www.realestate.co.nz${listing.siteURL}`
      
      await page.goto(fullURL, { waitUntil: "domcontentloaded", timeout: 30000 })
      await page.waitForTimeout(2000)

      const listingDetails = await page.evaluate(() => {
        // Get description - look for largest text block
        const paragraphs = Array.from(document.querySelectorAll('p'))
        const description = paragraphs
          .map(p => p.textContent?.trim())
          .filter(t => t && t.length > 100)
          .sort((a, b) => (b?.length || 0) - (a?.length || 0))[0] || null

        // Get all photos from swiper or gallery
        const photoElements = Array.from(
          document.querySelectorAll('.swiper-slide img, .property-gallery img, [class*="gallery"] img')
        )
        
        const photos = photoElements
          .map(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src')
            return src?.replace(/\.crop\.\d+x\d+\.jpg/, '.crop.1200x800.jpg') || src
          })
          .filter(src => src && 
                  src.includes('mediaserver.realestate.co.nz') && 
                  !src.includes('blur') &&
                  !src.includes('.scale.'))
          .filter((src, index, self) => self.indexOf(src) === index)

        return {
          description,
          photos: photos.length > 0 ? photos : null
        }
      })

      detailedData.push({
        ...listing,
        description: listingDetails.description,
        photos: listingDetails.photos || listing.photos,
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        source: 'realestate.co.nz'
      })

      await page.waitForTimeout(500)

    } catch (error) {
      console.error(`Error scraping listing ${listing.siteURL}:`, error)
      detailedData.push({
        ...listing,
        description: null,
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        source: 'realestate.co.nz'
      })
    }
  }

  console.log(`Successfully scraped ${detailedData.length} RealEstate.co.nz listings with details`)
  return detailedData
}

export async function GET(request: Request) {
    try {
        // Verify cron secret for scheduled requests
        // const authHeader = request.headers.get('authorization')
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // }
        const browser = await chromium.launch({ headless: true })
        const page = await browser.newPage()
        const listings = await scrapeRealEstateListings(page)

        // Delete batch
        const existingListings = await db.collection('realestate_property_listings').get()
        const deleteBatch = db.batch()
        existingListings.docs.forEach(doc => {
            deleteBatch.delete(doc.ref)
        })
        await deleteBatch.commit()

        // Save to Firestore
        const batch = db.batch()
        const collectionRef = db.collection('realestate_property_listings')

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