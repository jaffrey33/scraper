"use client"

import { auth } from "@/lib/firebase"
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from "firebase/auth"
import React, { createContext, useContext, useEffect, useState } from "react"

// Define what your context provides
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthContextProvider")
  return ctx
}

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  //   const { success, error } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const loginTimeStr = localStorage.getItem("loginTime");
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (loginTimeStr) {
          const loginTime = Number(loginTimeStr);
          if (Date.now() - loginTime > oneWeek) {
            // Force logout
            auth.signOut();
            localStorage.removeItem("loginTime");
          } else {
            setUser(firebaseUser);
          }
        } else {
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("loginTime", Date.now().toString()); // ✅ store as string
      return userCredential.user;
    } catch (err: unknown) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem("loginTime");
    } catch {
      //   error("Error logging out")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      //   success("Success! Please check your email for the reset request.")
    } catch (err: unknown) {
      //   error(getErrorMessage(firebaseError.code || 'Error sending reset password email. Please try again'))
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
