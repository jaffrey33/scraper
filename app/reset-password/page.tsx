"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/authContext"
import { useState } from "react"

function ResetPassword() {
   const [email, setEmail] = useState("")
  const { resetPassword, loading, successMsg, errorMsg } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    await resetPassword(email)
  }
  if (successMsg) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-neutral-500 mb-4 max-w-sm">{successMsg}</p>
          <Button className="w-full max-w-sm mx-auto rounded-none" onClick={() => window.location.href = "/auth"}>
            Back to Sign In
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen flex justify-center items-center p-4">
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Forgot your password?</h2> 
            <p className="text-neutral-500 mb-4 max-w-sm">Enter your email address and we'll send you a link to reset your password.</p>
            <Input 
                type="email" 
                placeholder="Email address" 
                className="mb-4 w-full max-w-sm mx-auto" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button className="w-full max-w-sm mx-auto rounded-none" disabled={!email} onClick={handleSubmit}>
                {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            {errorMsg && (
                <p className="text-red-500 mt-4">{errorMsg}</p>
            )}
        </div>
    </div>
  )
}

export default ResetPassword