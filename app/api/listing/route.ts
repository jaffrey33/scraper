import { NextResponse } from "next/server"
import { db } from "@/lib/firestore"

export async function GET() {
  try {

    // Get last scrape metadata
    const metadataDoc = await db.collection('scrape_metadata').doc('last_run').get()
    const metadata = metadataDoc.data()


    const snapshot = await db.collection('property_listings').get()
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