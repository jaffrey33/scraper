'use client'

import { useAuth } from "@/context/authContext"
import SignIn from "./signin-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function AuthPage() {
    const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/")
    }
  }, [user, loading, router])
  return (
    <div className="flex justify-center h-screen items-center">
      <SignIn />
    </div>
  )
}

export default AuthPage