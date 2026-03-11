import { NextResponse } from "next/server"
import { db } from "@/lib/firestore"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const daysAgoParam = url.searchParams.get("daysAgo")
    const dateParam = url.searchParams.get("date") // YYYY-MM-DD

    let bodyDaysAgo: unknown = undefined
    let bodyDate: unknown = undefined
    try {
      const ct = request.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        const body = await request.json()
        bodyDaysAgo = body?.daysAgo
        bodyDate = body?.date
      }
    } catch {
      // ignore
    }

    const daysAgoRaw = daysAgoParam ?? (typeof bodyDaysAgo === "string" || typeof bodyDaysAgo === "number" ? String(bodyDaysAgo) : null)
    const dateRaw = dateParam ?? (typeof bodyDate === "string" ? bodyDate : null)

    const startOfDayUtcIso = (d: Date) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)).toISOString()
    const startOfNextDayUtcIso = (d: Date) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0)).toISOString()

    let startIso: string | null = null
    let endIso: string | null = null

    if (dateRaw) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateRaw)
      if (m) {
        const y = Number(m[1])
        const mo = Number(m[2]) - 1
        const da = Number(m[3])
        const d = new Date(Date.UTC(y, mo, da, 0, 0, 0, 0))
        if (!Number.isNaN(d.getTime())) {
          startIso = startOfDayUtcIso(d)
          endIso = startOfNextDayUtcIso(d)
        }
      }
    } else if (daysAgoRaw != null) {
      const n = Math.max(0, Math.min(30, Number.parseInt(daysAgoRaw, 10)))
      if (!Number.isNaN(n)) {
        const d = new Date()
        d.setUTCDate(d.getUTCDate() - n)
        startIso = startOfDayUtcIso(d)
        endIso = startOfNextDayUtcIso(d)
      }
    }

    // Get last scrape metadata
    const metadataDoc = await db.collection('scrape_metadata').doc('last_run').get()
    const metadata = metadataDoc.data()

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection('trademe_property_listings')

    if (startIso && endIso) {
      query = query
        .where('scrapedAt', '>=', startIso)
        .where('scrapedAt', '<', endIso)
        .orderBy('scrapedAt', 'desc')
    }

    const snapshot = await query.get()
    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    const historyDates = Array.from(
      new Set(
        listings
          .map((l) => {
            const scrapedAt = (l as Record<string, unknown>)["scrapedAt"]
            return typeof scrapedAt === "string" ? scrapedAt.slice(0, 10) : null
          })
          .filter(Boolean) as string[]
      )
    ).sort((a, b) => (a < b ? 1 : -1))


    return NextResponse.json({
      listings,
      metadata,
      count: listings.length,
      historyDates,
      range: startIso && endIso ? { startIso, endIso } : null
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch listings',
      details: error instanceof Error ? error.message : "Unknown error"
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
      agent: {
        agentName: body.agent.agentName ?? null,
        agentNumber: body.agent.agentNumber ?? null,
        agentEmail: body.agent.agentEmail ?? null,
      },
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
    console.error("POST listing error:", error)
    return NextResponse.json(
      { error: "Failed to add listing", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}