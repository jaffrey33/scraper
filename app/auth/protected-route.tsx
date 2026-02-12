"use client"

import { useAuth } from "@/context/authContext";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
           <LoaderCircle className="animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return children
}
