export interface Listing {
  imageURL: string | null
  siteURL: string | null
  address: string | null
  rent_per_week: number | null
  date_listed: string | null
  bedrooms: number | null
  bathrooms: number | null
  description: string | null
  propertyType: string | null
  photos: string[] | null
  scrapedAt: string
  lastUpdated: string
  scrapeFrom: 'trademe.co.nz' | 'realestate.co.nz'
  agent: {
    agentName: string | null
    agentEmail: string | null
    agentNumber: number | null
  }

}