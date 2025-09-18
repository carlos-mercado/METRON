import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './Login.tsx'
import { AuthProvider, useAuth } from './Auth.tsx'

function Root() {
  const { userId, ready } = useAuth()
  const [loggedIn, setLoggedIn] = useState<boolean>(true)

  useEffect(() => {
    setLoggedIn(!!userId) // keep local state in sync with auth
  }, [userId])

  function callback(choice: boolean) {
    setLoggedIn(choice)
  }

  if(!ready) return null;

  return (
    <BrowserRouter>
      {!loggedIn && <Login callback={callback} />}
      {loggedIn && <App callback={callback} />}
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
