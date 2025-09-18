import React, { createContext, useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import app from './firebaseConfig'

type AuthContextType = {
  userId: string | null
  ready: boolean
}

const AuthContext = createContext<AuthContextType>({ userId: null, ready: false })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = getAuth(app)
    // set persistence if you want; omitted here for brevity
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null)
      setReady(true) // mark ready after first auth check
    })
    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ userId, ready }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}