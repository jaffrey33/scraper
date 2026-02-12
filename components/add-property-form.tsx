'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Plus } from "lucide-react"
function AddProperty() {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)

        const data = {
            address: formData.get("address"),
            dateListed: formData.get("dateListed"),
            bedrooms: formData.get("bedrooms"),
            bathrooms: formData.get("bathrooms"),
            amountPerWeek: formData.get("amountPerWeek"),
            propertyType: formData.get("propertyType"),
            agentName: formData.get("agentName"),
        }

        console.log(data)
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="rounded-none"><Plus />Add Property</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add New Property</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Property Address */}
                    <div className="space-y-1">
                        <Label htmlFor="address">Property Address</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="123 Main Street"
                            required
                        />
                    </div>

                    {/* Date Listed */}
                    <div className="space-y-1">
                        <Label htmlFor="dateListed">Date Listed</Label>
                        <Input
                            id="dateListed"
                            name="dateListed"
                            type="date"
                            required
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
                            <Label htmlFor="amountPerWeek">Amount per week</Label>
                            <Input
                                id="amountPerWeek"
                                name="amountPerWeek"
                                type="number"
                                min={0}
                                placeholder="500"
                                required
                            />
                        </div>

                        {/* Property type */}
                        <div className="space-y-1">
                            <Label>House or apartment</Label>
                            <Select name="propertyType" required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="house">House</SelectItem>
                                    <SelectItem value="apartment">Apartment</SelectItem>
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
                            id="agentName"
                            name="agentName"
                            placeholder="John Smith"
                            required
                        />
                    </div>
                              {/* Agent Mobile */}
                    <div className="space-y-1">
                        <Label htmlFor="agentNumber">Agent Number</Label>
                        <Input
    
                            id="agentNumber"
                            name="agentNumber"
                            placeholder="0222 0222 22"
                            required
                        />
                    </div>
                    {/* Agent Email */}
                    <div className="space-y-1">
                        <Label htmlFor="agentEmail">Agent Email</Label>
                        <Input
                            type="email"
                            id="agentEmail"
                            name="agentEmail"
                            placeholder="john.smith@email.com"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Save property
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddProperty