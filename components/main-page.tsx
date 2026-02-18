"use client"

import { ChevronDown, Search } from "lucide-react"
import PropertyCard from "./property-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import AddProperty from "./add-property-form"
import { Listing } from "@/types/data-types"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu"


function MainPage({ properties }: { properties: Listing[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([])
    const [selectedDateRanges, setSelectedDateRanges] = useState<string[]>([])
    const [filteredListings, setFilteredListings] = useState<Listing[]>([])

    const handleSearch = () => {
        // Search is already handled by useEffect
    }

    // Get unique locations from listings
    // const locations = Array.from(
    //     new Set(
    //         properties
    //             .map(l => l.address?.split(',').pop()?.trim())
    //             .filter(Boolean)
    //     )
    // ).sort()

    // Get unique bedroom counts
    
    const bedroomOptions = Array.from(
        new Set(properties.map(l => l.bedrooms).filter(b => b !== null))
    ).sort((a, b) => (a || 0) - (b || 0))

    // Date range helper
  const getDateRange = (dateString: string | null): string => {
    if (!dateString) return 'Unknown'
    
    const lowerDate = dateString.toLowerCase()
    
    // Handle "Listed Today"
    if (lowerDate.includes('today')) {
      return 'Today'
    }
    
    // Handle "Listed Yesterday"
    if (lowerDate.includes('yesterday')) {
      return 'Yesterday'
    }
    
    // Handle specific dates like "Listed Fri, 24 Oct"
    // Parse the date and compare
    try {
      // Remove "Listed " prefix if present
      const cleanDate = dateString.replace(/^Listed\s+/i, '').trim()
      
      // Try to parse dates like "Fri, 24 Oct" or "24 Oct"
      const currentYear = new Date().getFullYear()
      const datePattern = /(?:\w+,?\s+)?(\d+)\s+(\w+)(?:\s+(\d{4}))?/
      const match = cleanDate.match(datePattern)
      
      if (match) {
        const day = parseInt(match[1])
        const monthStr = match[2]
        const year = match[3] ? parseInt(match[3]) : currentYear
        
        // Convert month abbreviation to number
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const monthIndex = months.findIndex(m => monthStr.toLowerCase().startsWith(m))
        
        if (monthIndex !== -1) {
          const listedDate = new Date(year, monthIndex, day)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const diffTime = today.getTime() - listedDate.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 0) return 'Today'
          if (diffDays === 1) return 'Yesterday'
          if (diffDays <= 7) return 'This week'
          if (diffDays <= 30) return 'This month'
          return 'Older than a month'
        }
      }
    } catch (error) {
      console.error('Error parsing date:', dateString, error)
    }
    
    return 'Unknown'
  }

  const dateRangeOptions = ['Today', 'Yesterday', 'This week', 'This month', 'Older than a month']
    // Apply filters
    useEffect(() => {
        let filtered = [...properties]

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(listing =>
                listing.address?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Bedrooms filter
        if (selectedBedrooms.length > 0) {
            filtered = filtered.filter(listing =>
                listing.bedrooms !== null && selectedBedrooms.includes(listing.bedrooms)
            )
        }

        // Date range filter
        if (selectedDateRanges.length > 0) {
            filtered = filtered.filter(listing => {
                const range = getDateRange(listing.date_listed)
                return selectedDateRanges.includes(range)
            })
        }

        setFilteredListings(filtered)
    }, [searchQuery, selectedBedrooms, selectedDateRanges, properties])


    const toggleBedroom = (bedroom: number) => {
        setSelectedBedrooms(prev =>
            prev.includes(bedroom)
                ? prev.filter(b => b !== bedroom)
                : [...prev, bedroom]
        )
    }

    const toggleDateRange = (range: string) => {
        setSelectedDateRanges(prev =>
            prev.includes(range)
                ? prev.filter(r => r !== range)
                : [...prev, range]
        )
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedBedrooms([])
        setSelectedDateRanges([])
    }
    return (
        <div className="px-4 py-16 flex flex-col gap-8">
            <section className="flex justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Property Listing</h1>
                    <p className="text-muted-foreground">Browse available properties and track time on market</p>
                </div>
                <AddProperty />
            </section>

            {/* search */}
            <section>
                <div className="flex gap-1">
                    <div className="flex items-center gap-2 border px-2 h-12 rounded w-full">
                        <Search />
                        <Input
                            placeholder="Search location"
                            className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button className="rounded-none h-12 px-6" onClick={handleSearch}>
                        <Search />Search
                    </Button>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <div className="space-x-2 flex-1">
                        {/* Bedrooms Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' className="rounded-full">
                                    Bedrooms {selectedBedrooms.length > 0 && `(${selectedBedrooms.length})`}
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {bedroomOptions.map((bedroom) => (
                                    <DropdownMenuCheckboxItem
                                        key={bedroom}
                                        checked={selectedBedrooms.includes(bedroom || 0)}
                                        onCheckedChange={() => toggleBedroom(bedroom || 0)}
                                    >
                                        {bedroom === 0 ? 'Studio' : `${bedroom} Bedroom${bedroom > 1 ? 's' : ''}`}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Listing Dates Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' className="rounded-full">
                                    Listing Dates {selectedDateRanges.length > 0 && `(${selectedDateRanges.length})`}
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {dateRangeOptions.map((range) => (
                                    <DropdownMenuCheckboxItem
                                        key={range}
                                        checked={selectedDateRanges.includes(range)}
                                        onCheckedChange={() => toggleDateRange(range)}
                                    >
                                        {range}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Clear Filters */}
                    {(searchQuery || selectedBedrooms.length > 0 || selectedDateRanges.length > 0) && (
                        <Button variant="ghost" onClick={clearFilters} className="text-sm">
                            Clear all
                        </Button>
                    )}
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-muted-foreground">
                    Showing {filteredListings.length} of {properties.length} listings
                </div>
            </section>
            {/* Listing */}
            <section>
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredListings.map((property, index) => (
                        <PropertyCard key={index} property={property} />
                    ))}
                </div>
            </section>
        </div>
    )
}

export default MainPage