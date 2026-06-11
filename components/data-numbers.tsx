import { Listing } from "@/types/data-types"
import { useCallback, useMemo } from "react"
import { Skeleton } from "./ui/skeleton"

function DataNumbers({ displayProperties, isLoadingHistory, selectedHistoryDaysAgo, daysAgo }: {
    displayProperties: Listing[],
    isLoadingHistory: boolean
    selectedHistoryDaysAgo: number,
    daysAgo: (n: number) => any
}) {

    // Function to count properties from a specific source
    const selectedFromLength = useCallback((value: string) => {
        if (!value) return 0
        return displayProperties.filter(
            p => p.scrapeFrom === value
        ).length
    }, [displayProperties])

    // Calculate the most common property type
    const topPropertyType = useMemo(() => {
        if (!displayProperties?.length) return null;

        const counts: Record<string, number> = {};

        displayProperties.forEach(p => {
            if (!p.propertyType) return;
            counts[p.propertyType] = (counts[p.propertyType] || 0) + 1;
        });

        let topType = null;
        let max = 0;

        for (const type in counts) {
            if (counts[type] > max) {
                max = counts[type];
                topType = type;
            }
        }

        return { type: topType, count: max };
    }, [displayProperties]);

    // Calculate the average rent   
    const { averageRent, lowestRent } = useMemo(() => {
        if (!displayProperties?.length) return { averageRent: 0, lowestRent: 0 };

        const totalRent = displayProperties.reduce(
            (sum, property) => sum + (property.rent_per_week || 0),
            0
        );

        const lowest = Math.min(...displayProperties.map(p => p.rent_per_week || 0));

        return {
            averageRent: totalRent / displayProperties.length,
            lowestRent: lowest,
        };
    }, [displayProperties]);


    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <article className="bg-white border p-4 rounded-xl space-y-2">
                {isLoadingHistory ?
                    <>
                        <Skeleton className="w-full h-3 mb-4" />
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-1/2 h-3" />
                    </> :
                    <>
                        <p className="text-neutral-500 uppercase text-sm">Total Listing</p>
                        <h2 className="text-3xl font-bold ">{displayProperties.length}</h2>
                        <p className="text-xs text-neutral-500">{selectedFromLength('trademe.co.nz')}  Trademe · {selectedFromLength('realestate.co.nz')} RealEstate</p>

                    </>
                }
            </article>
            <article className="bg-white border p-4 rounded-xl space-y-2">
                {isLoadingHistory ?
                    <>
                        <Skeleton className="w-full h-3 mb-4" />
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-1/2 h-3" />
                    </> :
                    <>
                        <p className="text-neutral-500 uppercase text-sm">Average Rent / Week</p>
                        <h2 className="text-3xl font-bold">${averageRent.toFixed(2)}</h2>
                        <p className="text-xs text-neutral-500">Lowest rent ${lowestRent}</p>

                    </>
                }
            </article>
            <article className="bg-white border p-4 rounded-xl space-y-2">
                {isLoadingHistory ?
                    <>
                        <Skeleton className="w-full h-3 mb-4" />
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-1/2 h-3" />
                    </> :
                    <>
                        <p className="text-neutral-500 uppercase text-sm">Top property type</p>
                        <h2 className="text-3xl font-bold">{topPropertyType?.type || 'N/A'}</h2>
                        <p className="text-xs text-neutral-500">{topPropertyType?.count || 0} Listings</p>
                    </>
                }

            </article>
            <article className="bg-white border p-4 rounded-xl space-y-2">
                {isLoadingHistory ?
                    <>
                        <Skeleton className="w-full h-3 mb-4" />
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-1/2 h-3" />
                    </> :
                    <>
                        <p className="text-neutral-500 uppercase text-sm">Last scraped</p>
                        <h2 className="text-3xl font-bold">{selectedHistoryDaysAgo === 0 ? 'Today' : `${selectedHistoryDaysAgo} day${selectedHistoryDaysAgo !== 1 ? 's' : ''} ago`}</h2>
                        <p className="text-xs text-neutral-500"> {daysAgo(selectedHistoryDaysAgo).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </>
                }
            </article>
        </section>
    )
}

export default DataNumbers