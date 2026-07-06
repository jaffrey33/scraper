"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Badge } from "./ui/badge"
import { Bath, Bed, ChevronLeft, ChevronRight, Mail, Phone, SquareArrowOutUpRight, User } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Listing } from "@/types/data-types"
function PropertyCard({ property }: { property: Listing }) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [imgSrc, setImgSrc] = useState(
        property.photos ? property.photos[currentPhotoIndex] : property.imageURL || 'https://placehold.net/building.svg'
    );

    const nextPhoto = () => {
        const total = property.photos?.length ?? 0;
        if (!total) return;

        setCurrentPhotoIndex((prev) => (prev + 1) % total);
    };

    const prevPhoto = () => {
        const total = property.photos?.length ?? 0;
        if (!total) return;

        setCurrentPhotoIndex((prev) => (prev - 1 + total) % total);
    };

    // Reset imgSrc when currentPhotoIndex or property changes
    useEffect(() => {
        setImgSrc(
            property.photos ? property.photos[currentPhotoIndex] : property.imageURL || 'https://placehold.net/building.svg'
        );
    }, [currentPhotoIndex, property]);
    return (
        <Card className="pt-0 md:pb-0 grid md:grid-cols-2 gap-4">
            <CardHeader className="md:p-4 md:px-12 p-0 relative bg-muted overflow-hidden max-md:rounded-t-xl md:rounded-l-xl">
                {/* Photo Carousel */}
                <div className="relative w-full h-72 max-md:h-64 ">
                    <Image
                        src={property.scrapeFrom == 'trademe.co.nz' ? '/tm-logo-2025-v2.svg' : '/re-logo-2022-light.svg'}
                        width={100}
                        height={100}
                        alt="property-logo"
                        className="absolute bottom-2 left-2 w-32 z-20 "
                    />
                    <Image
                        src={imgSrc}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) and (max-width: 1023px) calc(50vw - 32px), calc(100vw - 24px)"
                        loading="eager"
                        alt='property-photo'
                        className="w-full h-full object-cover"
                        onError={() => setImgSrc('https://placehold.net/building.svg')}
                    />
                </div>
                {property?.photos != null && property.photos.length > 1 && (
                    <>
                        <button
                            onClick={prevPhoto}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextPhoto}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                            aria-label="Next photo"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {currentPhotoIndex + 1} / {property.photos.length}
                        </div>
                    </>
                )}
            </CardHeader>
            <div className="md:py-4">
                <CardContent>
                    <section className="mb-4 border-b pb-4">
                        <div className="flex justify-between items-center gap-2">
                            <h3 className="text-xl font-semibold">{property.address}</h3>
                            <Badge className="shrink-0 bg-accent text-black">
                                {property.propertyType}
                            </Badge>
                        </div>
                        <CardDescription className="mb-4 mt-2 line-clamp-2">{property.description}</CardDescription>

                        <div className="flex gap-3 text-sm">
                            <div className="flex items-center gap-1">
                                <Bed className="h-4 w-4" />
                                <p>{property.bedrooms} bedroom</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Bath className="h-4 w-4" />
                                <p>{property.bathrooms} bathroom</p>
                            </div>
                        </div>
                    </section>
                    <section className=" border-b mb-4 ">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold  mb-4">{property.scrapeFrom === 'trademe.co.nz' ? `$${property.rent_per_week}` : property.rent_per_week} per week</h3>
                            <a
                                href={property.scrapeFrom === 'trademe.co.nz' ? `https://www.trademe.co.nz${property.siteURL}` : `https://www.realestate.co.nz${property.siteURL}` || ''}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View on source website"
                            >
                                <SquareArrowOutUpRight className="w-4 h-4" />
                            </a>
                        </div>
                        <CardDescription className="mb-4">
                            <p>{property.date_listed}</p>
                        </CardDescription>
                    </section>
                </CardContent>
                <CardFooter>
                    {property.agent && <section className="text-sm">
                        <p className="font-semibold mb-2">Listing Agent</p>
                        <div className="space-y-1">
                            <div className="flex gap-1 items-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <p> {property.agent.agentName || 'N/A'}</p>
                            </div>
                            {property.agent.agentNumber &&
                                <div className="flex gap-1 items-center">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p> {property.agent.agentNumber}</p>
                                </div>}
                            {property.agent.agentEmail &&
                                <div className="flex gap-1 items-center">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p>{property.agent.agentEmail}</p>
                                </div>}
                        </div>
                    </section>}
                </CardFooter>
            </div>
        </Card>
    )
}

export default PropertyCard