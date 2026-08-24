"use client"

import { ChevronDown, LoaderCircle, Search, TimerReset } from "lucide-react"
import PropertyCard from "./property-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Listing } from "@/types/data-types"
import { useMemo, useState } from "react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./ui/pagination"
import Image from "next/image"
import DataNumbers from "./data-numbers"
import { daysAgo, getRegionFromAddress, MONTH_BUCKETS, parseDateListed, REGION_ORDER, sortByNewest } from "@/lib/utils"


type ScrapeFrom = 'trademe.co.nz' | 'realestate.co.nz'

const ITEMS_PER_PAGE = 5

function MainPage({ properties }: { properties: Listing[] }) {
    const [displayProperties, setDisplayProperties] = useState<Listing[]>(properties)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([])
    const [selectedMonthBucket, setSelectedMonthBucket] = useState<number | null>(null)
    const [selectedFrom, setSelectedFrom] = useState<ScrapeFrom | null>('realestate.co.nz')
    const [selectedRegions, setSelectedRegions] = useState<string[]>(['Ruapehu'])
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedHistoryDaysAgo, setSelectedHistoryDaysAgo] = useState<number>(0)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const handleSearch = () => {
        // Search is already handled by useEffect
    }

    // Get unique bedroom counts
    const bedroomOptions = Array.from(
        new Set(displayProperties.map(l => l.bedrooms).filter(b => b !== null))
    ).sort((a, b) => (a || 0) - (b || 0))


    // get regions 
    const regionOptions = REGION_ORDER
    
    // Apply filters (derived state)
    const filteredListings = useMemo(() => {
        let filtered = [...displayProperties]
        setCurrentPage(1)
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

        // Month bucket filter
        if (selectedMonthBucket !== null) {
            const cutoff = new Date()
            cutoff.setMonth(cutoff.getMonth() - selectedMonthBucket)
            filtered = filtered.filter(listing => {
                if (!listing.date_listed) return false
                const d = parseDateListed(listing.date_listed)
                return d !== null && d >= cutoff
            })
        }
        // Listing from filter
        if (selectedFrom) {
            filtered = filtered.filter(listing =>
                listing.scrapeFrom !== null && listing.scrapeFrom === selectedFrom
            );
        }

        // Region filter
        if (selectedRegions.length > 0) {
            filtered = filtered.filter(listing =>
                selectedRegions.includes(getRegionFromAddress(listing.address))
            )
        }

        return sortByNewest(filtered)
    }, [displayProperties, searchQuery, selectedBedrooms, selectedMonthBucket, selectedFrom, selectedRegions])

    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE))

    // Update currentPage if it exceeds totalPages
    const paginatedListings = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredListings.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredListings, currentPage])

    // Pagination logic
    const pageNumbers = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }
        const pages: (number | "ellipsis")[] = []
        pages.push(1)
        if (currentPage > 3) pages.push("ellipsis")
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (!pages.includes(i)) pages.push(i)
        }
        if (currentPage < totalPages - 2) pages.push("ellipsis")
        if (totalPages > 1) pages.push(totalPages)
        return pages
    }, [currentPage, totalPages])

    // Toggle bedroom filter
    const toggleBedroom = (bedroom: number) => {
        setSelectedBedrooms(prev =>
            prev.includes(bedroom)
                ? prev.filter(b => b !== bedroom)
                : [...prev, bedroom]
        )
    }

    // Toggle month bucket filter
    const toggleMonthBucket = (months: number) => {
        setSelectedMonthBucket(prev => (prev === months ? null : months))
    }

    // Toggle listing from filter
    const toggleFrom = (source: ScrapeFrom) => {
        setSelectedFrom(prev => (prev === source ? null : source));
    };

    // Toggle region filter
    const toggleRegion = (region: string) => {
        setSelectedRegions(prev =>
            prev.includes(region)
                ? prev.filter(r => r !== region)
                : [...prev, region]
        )
    }

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setSelectedBedrooms([])
        setSelectedMonthBucket(null)
        setSelectedFrom(null)
        setSelectedRegions([])
    }

    const fetchHistory = async (daysAgo: number) => {
        setIsLoadingHistory(true)
        try {
            const [tmRes, reRes] = await Promise.all([
                fetch(`/api/listing?daysAgo=${daysAgo}`, { method: "GET" }),
                fetch(`/api/realestate-listing?daysAgo=${daysAgo}`, { method: "GET" }),
            ])

            const [tm, re] = await Promise.all([tmRes.json(), reRes.json()])
            let merged = [...(tm?.listings ?? []), ...(re?.listings ?? [])] as Listing[]

            // If today's data is empty, silently fall back to yesterday
            if (merged.length === 0 && daysAgo === 0) {
                const [tmYest, reYest] = await Promise.all([
                    fetch(`/api/listing?daysAgo=1`, { method: "GET" }),
                    fetch(`/api/realestate-listing?daysAgo=1`, { method: "GET" }),
                ])
                const [tmY, reY] = await Promise.all([tmYest.json(), reYest.json()])
                merged = [...(tmY?.listings ?? []), ...(reY?.listings ?? [])] as Listing[]
                setSelectedHistoryDaysAgo(1)
            } else {
                setSelectedHistoryDaysAgo(daysAgo)
            }

            setDisplayProperties(merged)
            setCurrentPage(1)
            clearFilters()
        } finally {
            setIsLoadingHistory(false)
        }
    }

    return (
        <div className="px-4 py-16 flex flex-col gap-8">
            <section className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Property Listing</h1>
                    <p className="text-muted-foreground text-sm">Browse available properties and track time on market</p>
                </div>
                {/* scrape history */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' disabled={isLoadingHistory}>
                            <TimerReset />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {[0, 1, 2, 3, 4].map((n) => (
                            <DropdownMenuCheckboxItem
                                key={n}
                                checked={selectedHistoryDaysAgo === n}
                                onCheckedChange={() => fetchHistory(n)}
                                disabled={isLoadingHistory}
                            >
                                {daysAgo(n).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}{(n === 0 && ' (Today)')}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* <AddProperty /> */}
            </section>

            { /* Data numbers */}
            <DataNumbers
                displayProperties={displayProperties}
                isLoadingHistory={isLoadingHistory}
                selectedHistoryDaysAgo={selectedHistoryDaysAgo}
                daysAgo={daysAgo}
            />

            {/* search */}
            <section>
                <div className="flex gap-1">
                    <div className="flex items-center gap-2 border px-2  rounded w-full">
                        <Search />
                        <Input
                            placeholder="Search location"
                            className="border-none rounded-md shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button className="rounded-md h-10 px-6 bg-accent text-muted-foreground hover:bg-muted hover:text-black cursor-pointer border" onClick={handleSearch}>
                        <Search />Search
                    </Button>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <div className="gap-2 flex items-center flex-wrap">
                        {/* Region Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' className="rounded-full">
                                    Region {selectedRegions.length > 0 && `(${selectedRegions.length})`}
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {regionOptions.map((region) => (
                                    <DropdownMenuCheckboxItem
                                        key={region}
                                        checked={selectedRegions.includes(region)}
                                        onCheckedChange={() => toggleRegion(region)}
                                    >
                                        {region}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                    Listed Within {selectedMonthBucket !== null ? `(${selectedMonthBucket}mo)` : ''}
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {MONTH_BUCKETS.map((months) => (
                                    <DropdownMenuCheckboxItem
                                        key={months}
                                        checked={selectedMonthBucket === months}
                                        onCheckedChange={() => toggleMonthBucket(months)}
                                    >
                                        {months} months
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Listing From */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' className="rounded-full">
                                    Listing From {selectedFrom !== null && `(${selectedFrom})`}
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuCheckboxItem
                                    checked={selectedFrom === 'trademe.co.nz'}
                                    onCheckedChange={() => toggleFrom('trademe.co.nz')}
                                >
                                    trademe.co.nz
                                </DropdownMenuCheckboxItem>

                                <DropdownMenuCheckboxItem
                                    checked={selectedFrom === 'realestate.co.nz'}
                                    onCheckedChange={() => toggleFrom('realestate.co.nz')}
                                >
                                    realestate.co.nz
                                </DropdownMenuCheckboxItem>

                            </DropdownMenuContent>
                        </DropdownMenu>


                    </div>

                    {/* Clear Filters */}
                    {(searchQuery || selectedBedrooms.length > 0 || selectedMonthBucket !== null || selectedFrom || selectedRegions.length > 0) && (
                        <Button variant="ghost" onClick={clearFilters} className="text-sm ml-auto">
                            Clear all
                        </Button>
                    )}
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-muted-foreground flex justify-between">
                    <div className="flex items-center gap-2">
                        {filteredListings.length === 0
                            ? "Showing 0 of 0 listings"
                            : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredListings.length)} of ${filteredListings.length} listings`}
                        <div className="flex flex-wrap items-center gap-0.5">
                            {selectedRegions.slice(0, 2).map((region) => (
                                <span
                                    key={region}
                                    className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1  rounded-full"
                                >
                                    {region}
                                </span>
                            ))}
                            {selectedRegions.length > 2 && (
                                <span className="text-xs text-neutral-400 px-2 py-1">
                                    +{selectedRegions.length - 2} more
                                </span>
                            )}
                        </div>
                    </div>
                    <p>{pageNumbers.length > 1 && `Page ${currentPage} of ${totalPages}`}</p>

                </div>
            </section>

            {/* Listing */}
            <section className="flex flex-col gap-6">

                <div className="grid grid-cols-1 gap-4">
                    {isLoadingHistory ?
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <LoaderCircle className="animate-spin text-muted-foreground" />
                            <h3 className="text-lg text-muted-foreground mt-4">Loading history...</h3>
                        </div> : paginatedListings.length > 0 ? paginatedListings.map((property, index) => (
                            <PropertyCard key={(currentPage - 1) * ITEMS_PER_PAGE + index} property={property} />
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="text-6xl mb-4">
                                    <Image
                                        src="/house.svg"
                                        alt="No results"
                                        width={120}
                                        height={120}
                                    />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Try adjusting your filters to find more listings in your desired area or time frame.
                                </p>
                            </div>
                        )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className="border-none mr-4 w-fit"
                                    onClick={() => {
                                        window.scrollTo({
                                            top: 0,
                                            left: 0,
                                            behavior: 'smooth'
                                        });
                                        setCurrentPage((p) => Math.max(1, p - 1))
                                    }}
                                    disabled={currentPage <= 1}
                                />
                            </PaginationItem>
                            {pageNumbers.map((page, i) =>
                                page === "ellipsis" ? (
                                    <PaginationItem key={`ellipsis-${i}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            isActive={currentPage === page}
                                            onClick={() => {
                                                window.scrollTo({
                                                    top: 0,
                                                    left: 0,
                                                    behavior: 'smooth'
                                                });
                                                setCurrentPage(page)
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    className="border-none ml-4  w-fit"
                                    onClick={() => {
                                        window.scrollTo({
                                            top: 0,
                                            left: 0,
                                            behavior: 'smooth'
                                        });
                                        setCurrentPage((p) => Math.min(totalPages, p + 1));

                                    }}
                                    disabled={currentPage >= totalPages}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}

            </section>
        </div>
    )
}

export default MainPage