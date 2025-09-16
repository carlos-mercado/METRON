import React, { createContext, useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import app from './firebaseConfig'

type AuthContextType = {
  userId: string | null
}

const AuthContext = createContext<AuthContextType>({ userId: null })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null)
    })
    return unsubscribe
  }, [])

  return <AuthContext.Provider value={{ userId }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}