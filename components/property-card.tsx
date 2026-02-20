"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Badge } from "./ui/badge"
import { ChevronLeft, ChevronRight, House, Mail, Phone, User } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Listing } from "@/types/data-types"
function PropertyCard({ property }: { property: Listing }) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
    return (
        <Card className="pt-0">
            <CardHeader className="relative p-0 overflow-hidden rounded-t-xl">
                {/* Photo Carousel */}
                <div className="relative w-full h-64 bg-muted">
                    <Image
                        src={property.scrapeFrom == 'trademe.co.nz' ? '/tm-logo-2025-v2.svg' : '/re-logo-2022-light.svg'}
                        width={100}
                        height={100}
                        alt="property-logo"
                        className="absolute bottom-2 left-2 w-32 z-20 "
                    />
                    <Image
                        src={`${property.photos ? property.photos[currentPhotoIndex] : property.imageURL || 'https://placehold.net/building.svg'}`}
                        fill
                        alt='property-photo'
                        className="w-full h-full object-cover"
                    />
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

                </div>
            </CardHeader>
            <CardContent>
                <section className="mb-4 border-b pb-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">{property.address}</h3>
                        <Badge className="shrink-0">
                            {property.propertyType}
                        </Badge>
                    </div>
                    <CardDescription className="mb-4 mt-2 line-clamp-2">{property.description}</CardDescription>

                    <div className="flex gap-3 text-sm">
                        <div className="flex items-center gap-1">
                            <House className="h-4 w-4" />
                            <p>{property.bedrooms} bedroom</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <House className="h-4 w-4" />
                            <p>{property.bathrooms} bathroom</p>
                        </div>
                    </div>
                </section>
                <section className=" border-b ">
                    <h3 className="text-2xl font-bold  mb-4">${property.rent_per_week}/mo</h3>
                    <CardDescription className="mb-4">
                        <p>{property.date_listed}</p>
                    </CardDescription>
                </section>
            </CardContent>
            <CardFooter>
                <section className="text-sm">
                    <p className="font-semibold mb-2">Listing Agent</p>
                    <div className="space-y-1">
                        <div className="flex gap-1 items-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p> {property.agent || 'N/A'}</p>
                        </div>
                        {property.agentNumber && <div className="flex gap-1 items-center">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p> {property.agentNumber}</p>
                        </div>}
                        {property.agentEmail && <div className="flex gap-1 items-center">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <p>{property.agentEmail}</p>
                        </div>}
                    </div>
                </section>
            </CardFooter>
        </Card>
    )
}

export default PropertyCard