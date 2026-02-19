import { NextResponse } from "next/server"
import { db } from "@/lib/firestore"

export async function GET() {
  try {

    // Get last scrape metadata
    const metadataDoc = await db.collection('scrape_metadata').doc('last_run').get()
    const metadata = metadataDoc.data()


    const snapshot = await db.collection('realestate_property_listings').get()
    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))



    return NextResponse.json({
      listings,
      metadata,
      count:listings.length
    })
  } catch {
    return NextResponse.json({
      error: 'Failed to fetch listings'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const docId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    const listing = {
      address: body.address ?? null,
      date_listed: body.date_listed ?? null,
      bedrooms: body.bedrooms != null ? Number(body.bedrooms) : null,
      bathrooms: body.bathrooms != null ? Number(body.bathrooms) : null,
      rent_per_week: body.rent_per_week != null ? Number(body.rent_per_week) : null,
      agent: body.agent ?? null,
      agentNumber: body.agentNumber ?? null,
      agentEmail: body.agentEmail ?? null,
      description: body.description ?? null,
      propertyType: body.propertyType ?? null,
      imageURL: body.imageURL ?? null,
      siteURL: body.siteURL ?? null,
      photos: body.imageURL ? [body.imageURL] : null,
      scrapeFrom: "manual" as const,
      scrapedAt: now,
      lastUpdated: now,
    }

    await db.collection("realestate_property_listings").doc(docId).set(listing)

    return NextResponse.json({ success: true, id: docId })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add listing", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}