"use client"

import { ChevronDown, Search } from "lucide-react"
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
import AddProperty from "./add-property-form"

type ScrapeFrom = 'trademe.co.nz' | 'realestate.co.nz'

const ITEMS_PER_PAGE = 9

function MainPage({ properties }: { properties: Listing[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([])
    const [selectedDateRanges, setSelectedDateRanges] = useState<string[]>([])
    const [selectedFrom, setSelectedFrom] = useState<ScrapeFrom | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
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


    const dateRangeOptions = Array.from(
        new Set(properties.map(l => l.date_listed).filter(Boolean))
    ).sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime()) as string[]

    // Apply filters (derived state)
    const filteredListings = useMemo(() => {
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
            filtered = filtered.filter(listing =>
                listing.date_listed !== null && selectedDateRanges.includes(listing.date_listed)
            )
        }
        // Listing from filter
        if (selectedFrom) {
            filtered = filtered.filter(listing =>
                listing.scrapeFrom !== null && listing.scrapeFrom === selectedFrom
            );
        }

        return filtered
    }, [properties, searchQuery, selectedBedrooms, selectedDateRanges, selectedFrom])

    const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE))
    const paginatedListings = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredListings.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredListings, currentPage])

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
    const toggleFrom = (source: ScrapeFrom) => {
        setSelectedFrom(prev => (prev === source ? null : source));
    };



    const clearFilters = () => {
        setSearchQuery('')
        setSelectedBedrooms([])
        setSelectedDateRanges([])
        setSelectedFrom(null)
    }
    return (
        <div className="px-4 py-16 flex flex-col gap-8">
            <section className="flex justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Property Listing</h1>
                    <p className="text-muted-foreground text-sm">Browse available properties and track time on market</p>
                </div>
                <AddProperty />
            </section>

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
                    {(searchQuery || selectedBedrooms.length > 0 || selectedDateRanges.length > 0 || selectedFrom) && (
                        <Button variant="ghost" onClick={clearFilters} className="text-sm">
                            Clear all
                        </Button>
                    )}
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-muted-foreground">
                    {filteredListings.length === 0
                    ? "Showing 0 of 0 listings"
                    : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredListings.length)} of ${filteredListings.length} listings`}
                </div>
            </section>
            {/* Listing */}
            <section className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-4">
                    {paginatedListings.map((property, index) => (
                        <PropertyCard key={(currentPage - 1) * ITEMS_PER_PAGE + index} property={property} />
                    ))}
                </div>
                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                className="border-none mr-6"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}
                            <PaginationItem>
                                <PaginationNext
                                className="border-none ml-4"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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