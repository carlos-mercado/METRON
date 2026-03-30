import React, { createContext, useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import app from './firebaseConfig'

const API_BASE = 'https://metron-api.duckdns.org'

type AuthContextType = {
  userId: string | null
  ready: boolean
}

const AuthContext = createContext<AuthContextType>({ userId: null, ready: false })

// Log activity to the backend (once per calendar day)
async function logActivityIfNewDay(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const storageKey = `metron-last-activity-${userId}`
  const lastLogged = localStorage.getItem(storageKey)

  // Skip if already logged today
  if (lastLogged === today) return

  try {
    await fetch(`${API_BASE}/activity/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId }),
    })
    localStorage.setItem(storageKey, today)
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const newUserId = user ? user.uid : null
      setUserId(newUserId)
      setReady(true)

      // Log activity once per calendar day
      if (newUserId) {
        logActivityIfNewDay(newUserId)
      }
    })
    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ userId, ready }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}