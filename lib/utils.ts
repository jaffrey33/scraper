import { Listing } from "@/types/data-types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// months buckets for filtering listings
export const MONTH_BUCKETS = [3, 6, 12, 24]

export const REGION_ORDER = [
  'Northland', 'Auckland', 'The Coromandel', 'Bay of Plenty', 'Rotorua',
  'Gisborne & Eastland', "Hawke's Bay", 'Taupo', 'Ruapehu',
  'Waikato & Waitomo', 'Taranaki', 'Whanganui', 'Manawatu',
  'Wellington', 'Wairarapa',
]

// regions
export const TOWN_TO_REGION: Record<string, string> = {
  // 1. Northland
  'whangarei': 'Northland',
  'kerikeri': 'Northland',
  'paihia': 'Northland',
  'kaitaia': 'Northland',
  'dargaville': 'Northland',
  'kaikohe': 'Northland',
  'russell': 'Northland',
  'waipu': 'Northland',
  'mangonui': 'Northland',
  'kawakawa': 'Northland',
  'opononi': 'Northland',
  'kaeo': 'Northland',

  // 2. Auckland
  'auckland': 'Auckland',
  'manukau': 'Auckland',
  'waitakere': 'Auckland',
  'north shore': 'Auckland',
  'pukekohe': 'Auckland',
  'waiheke island': 'Auckland',
  'waiheke': 'Auckland',
  'warkworth': 'Auckland',
  'helensville': 'Auckland',
  'orewa': 'Auckland',
  'papakura': 'Auckland',
  'devonport': 'Auckland',

  // 3. The Coromandel
  'thames': 'The Coromandel',
  'whitianga': 'The Coromandel',
  'coromandel': 'The Coromandel',
  'coromandel town': 'The Coromandel',
  'whangamata': 'The Coromandel',
  'tairua': 'The Coromandel',
  'pauanui': 'The Coromandel',

  // 4. Bay of Plenty
  'tauranga': 'Bay of Plenty',
  'mount maunganui': 'Bay of Plenty',
  'mt maunganui': 'Bay of Plenty',
  'whakatane': 'Bay of Plenty',
  'opotiki': 'Bay of Plenty',
  'katikati': 'Bay of Plenty',
  'te puke': 'Bay of Plenty',
  'papamoa': 'Bay of Plenty',

  // 5. Rotorua
  'rotorua': 'Rotorua',
  'ngongotaha': 'Rotorua',

  // 6. Gisborne & Eastland
  'gisborne': 'Gisborne & Eastland',
  'te araroa': 'Gisborne & Eastland',
  'ruatoria': 'Gisborne & Eastland',
  'tolaga bay': 'Gisborne & Eastland',
  'tokomaru bay': 'Gisborne & Eastland',

  // 7. Hawke's Bay
  'napier': "Hawke's Bay",
  'hastings': "Hawke's Bay",
  'havelock north': "Hawke's Bay",
  'waipukurau': "Hawke's Bay",
  'wairoa': "Hawke's Bay",
  'waipawa': "Hawke's Bay",

  // 8. Taupo
  'taupo': 'Taupo',
  'turangi': 'Taupo',
  'kinloch': 'Taupo',
  'mangakino': 'Taupo',

  // 9. Ruapehu
  'ohakune': 'Ruapehu',
  'national park': 'Ruapehu',
  'national park village': 'Ruapehu',
  'raetihi': 'Ruapehu',
  'taumarunui': 'Ruapehu',
  'owhango': 'Ruapehu',
  'waiouru': 'Ruapehu',
  'manunui': 'Ruapehu',
  'pipiriki': 'Ruapehu',
  'horopito': 'Ruapehu',
  'ohura': 'Ruapehu',
  'rangataua': 'Ruapehu',
  'kakahi': 'Ruapehu',
  'whakapapa village': 'Ruapehu',

  // 10. Waikato & Waitomo
  'hamilton': 'Waikato & Waitomo',
  'cambridge': 'Waikato & Waitomo',
  'te awamutu': 'Waikato & Waitomo',
  'otorohanga': 'Waikato & Waitomo',
  'te kuiti': 'Waikato & Waitomo',
  'matamata': 'Waikato & Waitomo',
  'morrinsville': 'Waikato & Waitomo',
  'huntly': 'Waikato & Waitomo',
  'raglan': 'Waikato & Waitomo',
  'waitomo': 'Waikato & Waitomo',
  'ngaruawahia': 'Waikato & Waitomo',
  'tokoroa': 'Waikato & Waitomo',
  'putaruru': 'Waikato & Waitomo',

  // 11. Taranaki
  'new plymouth': 'Taranaki',
  'stratford': 'Taranaki',
  'hawera': 'Taranaki',
  'inglewood': 'Taranaki',
  'opunake': 'Taranaki',
  'waitara': 'Taranaki',

  // 12. Whanganui
  'whanganui': 'Whanganui',
  'wanganui': 'Whanganui',

  // 13. Manawatu
  'palmerston north': 'Manawatu',
  'feilding': 'Manawatu',
  'levin': 'Manawatu',
  'foxton': 'Manawatu',
  'dannevirke': 'Manawatu',
  'woodville': 'Manawatu',
  'marton': 'Manawatu',
  'bulls': 'Manawatu',

  // 14. Wellington
  'wellington': 'Wellington',
  'lower hutt': 'Wellington',
  'upper hutt': 'Wellington',
  'porirua': 'Wellington',
  'paraparaumu': 'Wellington',
  'kapiti': 'Wellington',
  'waikanae': 'Wellington',

  // 15. Wairarapa
  'masterton': 'Wairarapa',
  'carterton': 'Wairarapa',
  'greytown': 'Wairarapa',
  'featherston': 'Wairarapa',
  'martinborough': 'Wairarapa',
}

// get region from address
export const getRegionFromAddress = (address: string | null | undefined): string => {
  if (!address) return 'Other'
  const parts = address.split(',').map(p => p.trim()).filter(Boolean)
  const town = parts[parts.length - 1]
  if (!town) return 'Other'
  const mapped = TOWN_TO_REGION[town.toLowerCase()]
  return mapped || town
}

// sort listings by date listed, newest first
export const parseDateListed = (raw: string): Date | null => {
  const now = new Date()
  const s = raw.replace(/^Listed\s*/i, '').trim()

  if (/^today$/i.test(s)) return now
  if (/^yesterday$/i.test(s)) { const d = new Date(now); d.setDate(d.getDate() - 1); return d }

  const daysMatch = s.match(/^(\d+)\s+days?\s+ago$/i)
  if (daysMatch) { const d = new Date(now); d.setDate(d.getDate() - parseInt(daysMatch[1])); return d }

  const weeksMatch = s.match(/^(\d+|a)\s+weeks?\s+ago$/i)
  if (weeksMatch) { const n = weeksMatch[1] === 'a' ? 1 : parseInt(weeksMatch[1]); const d = new Date(now); d.setDate(d.getDate() - n * 7); return d }

  const monthsMatch = s.match(/^(\d+|a)\s+months?\s+ago$/i)
  if (monthsMatch) { const n = monthsMatch[1] === 'a' ? 1 : parseInt(monthsMatch[1]); const d = new Date(now); d.setMonth(d.getMonth() - n); return d }

  // "Mon, 8 Sep" or "Fri, 27 Jun" — no year, infer it
  const shortDate = s.match(/^\w+,\s+\d+\s+\w+$/)
  if (shortDate) {
    const year = now.getFullYear()
    const parsed = new Date(`${s} ${year}`)
    if (!isNaN(parsed.getTime())) {
      // If parsed date is in the future, it belongs to prior year
      return parsed > now ? new Date(`${s} ${year - 1}`) : parsed
    }
  }

  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// sort listings by date listed, newest first
export const parseFetchedDateListed = (str: string | null): Date => {
  if (!str) return new Date(0)

  const clean = str.replace(/^Listed\s*/i, "").trim()
  const now = new Date()

  if (/^now$/i.test(clean)) return new Date(8640000000000000)
  const hoursMatch = clean.match(/^(\d+)\s+hours?\s+ago$/i)
  if (hoursMatch) {
    const d = new Date(now)
    d.setHours(d.getHours() - parseInt(hoursMatch[1]))
    return d
  }
  if (/^today$/i.test(clean)) return new Date(8640000000000000)

  if (/^yesterday$/i.test(clean)) {
    const d = new Date(now)
    d.setDate(d.getDate() - 1)
    return d
  }

  const daysMatch = clean.match(/^(\d+)\s+days?\s+ago$/i)
  if (daysMatch) {
    const d = new Date(now)
    d.setDate(d.getDate() - parseInt(daysMatch[1]))
    return d
  }

  const weeksMatch = clean.match(/^(a|\d+)\s+weeks?\s+ago$/i)
  if (weeksMatch) {
    const n = weeksMatch[1] === "a" ? 1 : parseInt(weeksMatch[1])
    const d = new Date(now)
    d.setDate(d.getDate() - n * 7)
    return d
  }

  const monthsMatch = clean.match(/^(a|\d+)\s+months?\s+ago$/i)
  if (monthsMatch) {
    const n = monthsMatch[1] === "a" ? 1 : parseInt(monthsMatch[1])
    const d = new Date(now)
    d.setMonth(d.getMonth() - n)
    return d
  }

  // "Mon, 8 Sep" style
  const match = clean.match(/(\w+),\s*(\d+)\s*(\w+)/)
  if (match) {
    const [, , day, monthStr] = match
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3,
      May: 4, Jun: 5, Jul: 6, Aug: 7,
      Sep: 8, Oct: 9, Nov: 10, Dec: 11
    }
    const month = months[monthStr] ?? 0
    const year = now.getFullYear()
    return month > now.getMonth()
      ? new Date(year - 1, month, Number(day))
      : new Date(year, month, Number(day))
  }

  return new Date(0)
}

// sort listings by date listed, newest first
export const sortByNewest = (listings: Listing[]) => {
  if (!Array.isArray(listings) || listings.length === 0) return []

  return [...listings].sort((a, b) => {
    const dateA = parseFetchedDateListed(a.date_listed).getTime()
    const dateB = parseFetchedDateListed(b.date_listed).getTime()

    if (dateB !== dateA) return dateB - dateA

    // fallback: use lastUpdated
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  })
}


//scrape History
export const daysAgo = (n: number) => {
  let d = new Date();
  d.setDate(d.getDate() - Math.abs(n));
  return d;
};