
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/authContext"
import Link from "next/link"
import { useState } from "react"
import { sileo } from "sileo"

function SignIn() {
    const { login, loading } = useAuth()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        sileo.promise(login(email, password), {
            loading: { title: "Loading..." },
            success: {
                title: "Login Successfully",
                fill: "black",
                styles: {
                    title: "text-white!",
                    description: "text-white/75!",
                },
            },
            error: { title: "Invalid email or password" },

        });
    }

    return (
        <Card className="lg:w-1/4 md:w-1/2 w-full m-4">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl ">Welcome</CardTitle>
                <CardDescription>Login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" >
                    <div>
                        <Label>Email</Label>
                        <Input name="email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                    </div>

                    <div>
                        <Label>Password</Label>
                        <Input name="password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
                        <div className="mt-1 flex justify-between">
                            <div className="flex gap-1">
                                <Checkbox />
                                <Label>Remember me?</Label>
                            </div>
                            <Link href="#" className="text-sm">Forgot password?</Link>
                        </div>

                    </div>

                    <Button
                        disabled={!email || !password || loading}
                        type="submit" className="w-full rounded-none">Submit</Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default SignIn