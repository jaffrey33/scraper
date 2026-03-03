'use client'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Plus, Loader2 } from "lucide-react"
import { Textarea } from "./ui/textarea"
import { Listing } from "@/types/data-types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"

const initialForm: Listing = {
    address: "",
    date_listed: "",
    bedrooms: 0,
    bathrooms: 0,
    rent_per_week: 0,
    agent: {
        agentName: null,
        agentNumber: null,
        agentEmail: null,
    },
    description: "",
    propertyType: "",
    imageURL: "",
    siteURL: "",
    photos: null,
    scrapedAt: "",
    lastUpdated: "",
    scrapeFrom: "realestate.co.nz",
}

function AddProperty() {
    const router = useRouter()
    const [formData, setFormData] = useState(initialForm)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleOnChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target

        setFormData((prev) => {
            // map camelCase to snake_case
            const key = name === "dateListed" ? "date_listed" : name

            // ✅ nested agent fields
            if (key.startsWith("agent.")) {
                const agentKey = key.replace("agent.", "") as
                    | "agentName"
                    | "agentEmail"
                    | "agentNumber"

                return {
                    ...prev,
                    agent: {
                        ...prev.agent,
                        [agentKey]: value,
                    },
                }
            }

            // ✅ number fields
            if (key === "bedrooms" || key === "bathrooms" || key === "rent_per_week") {
                return {
                    ...prev,
                    [key]: value === "" ? 0 : Number(value),
                }
            }

            return {
                ...prev,
                [key]: value,
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const form = e.currentTarget
        const fileInput = form.elements.namedItem("image") as HTMLInputElement
        const file = fileInput?.files?.[0]
        if (!file) {
            setError("Please select an image.")
            setLoading(false)
            return
        }
        try {
            const storageRef = ref(storage, `property-images/${Date.now()}_${file.name}`)
            await uploadBytes(storageRef, file)
            const imageURL = await getDownloadURL(storageRef)
            console.log("Image uploaded to Firebase Storage:",
                {
                    address: formData.address || null,
                    date_listed: formData.date_listed || null,
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    rent_per_week: formData.rent_per_week,
                    agent: {
                        agentName: formData.agent?.agentName || null,
                        agentNumber: formData.agent?.agentNumber || null,
                        agentEmail: formData.agent?.agentEmail || null,
                    },
                    description: formData.description || null,
                    propertyType: formData.propertyType || null,
                    imageURL,
                    siteURL: null,
                }

            )
            const res = await fetch("/api/listing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    address: formData.address || null,
                    date_listed: formData.date_listed || null,
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    rent_per_week: formData.rent_per_week,
                    agent: {
                        agentName: formData.agent?.agentName || null,
                        agentNumber: formData.agent?.agentNumber || null,
                        agentEmail: formData.agent?.agentEmail || null,
                    },
                    description: formData.description || null,
                    propertyType: formData.propertyType || null,
                    imageURL,
                    siteURL: null,
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.details || data.error || "Failed to save property")
            }
            setFormData(initialForm)
            fileInput.value = ""
            setOpen(false)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounde-md bg-accent text-muted-foreground hover:bg-muted hover:text-black cursor-pointer border" type="button"><Plus />Add Property</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add New Property</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
                    )}
                    {/* Property Address */}
                    <div className="space-y-1">
                        <Label htmlFor="address">Property Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleOnChange}
                            placeholder="123 Main Street"
                            required
                        />
                    </div>
                    {/* Description */}
                    <div className="space-y-1">
                        <Label htmlFor="description">Property Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description || ""}
                            onChange={handleOnChange}
                            placeholder="Brief description of the property"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="image">Property Image</Label>
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            required
                        />
                    </div>

                    {/* Date Listed */}
                    <div className="space-y-1">
                        <Label htmlFor="dateListed">Date Listed</Label>
                        <Input
                            id="dateListed"
                            name="dateListed"
                            value={formData.date_listed ?? ""}
                            onChange={handleOnChange}
                            type="date"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Bedrooms */}
                        <div className="space-y-1">
                            <Label htmlFor="bedrooms">Number of bedrooms</Label>
                            <Input
                                id="bedrooms"
                                name="bedrooms"
                                type="number"
                                value={formData.bedrooms || ""}
                                onChange={handleOnChange}
                                min={0}
                                required
                            />
                        </div>

                        {/* Bathrooms */}
                        <div className="space-y-1">
                            <Label htmlFor="bathrooms">Number of bathrooms</Label>
                            <Input
                                id="bathrooms"
                                name="bathrooms"
                                value={formData.bathrooms || ""}
                                onChange={handleOnChange}
                                type="number"
                                min={0}
                                step="0.5"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Amount per week */}
                        <div className="space-y-1 w-full">
                            <Label htmlFor="rent_per_week">Amount</Label>
                            <Input
                                id="rent_per_week"
                                name="rent_per_week"
                                type="number"
                                value={formData.rent_per_week || ""}
                                onChange={handleOnChange}
                                min={0}
                                placeholder="500"
                                required
                            />
                        </div>

                        {/* Property type */}
                        <div className="space-y-1">
                            <Label>House or apartment</Label>
                            <Select
                                value={formData.propertyType ?? ""}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        propertyType: value,
                                    }))
                                }
                                required
                                aria-required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="house">House</SelectItem>
                                    <SelectItem value="apartment">Apartment</SelectItem>
                                    <SelectItem value="unit">Unit</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                    </div>

                    <hr />
                    <h3 className="font-semibold">Agent Information</h3>
                    {/* Agent name */}
                    <div className="space-y-1">
                        <Label htmlFor="agentName">Agent Name</Label>
                        <Input
                            id="agent"
                            name="agent.agentName"
                            value={formData.agent.agentName || ""}
                            onChange={handleOnChange}
                            placeholder="John Smith"
                        />
                    </div>
                    {/* Agent Mobile */}
                    <div className="space-y-1">
                        <Label htmlFor="agentNumber">Agent Number</Label>
                        <Input
                            id="agentNumber"
                            name="agent.agentNumber"
                            value={formData.agent.agentNumber || ""}
                            onChange={handleOnChange}
                            placeholder="0222 0222 22"
                        />
                    </div>
                    {/* Agent Email */}
                    <div className="space-y-1">
                        <Label htmlFor="agentEmail">Agent Email</Label>
                        <Input
                            type="email"
                            id="agentEmail"
                            name="agent.agentEmail"
                            value={formData.agent.agentEmail || ""}
                            onChange={handleOnChange}
                            placeholder="john.smith@email.com"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save property"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddProperty