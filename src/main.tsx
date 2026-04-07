import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.tsx'
//import Loading from './Loading.tsx'
import Login from './Login.tsx'
import { AuthProvider, useAuth } from './Auth.tsx'
import { AppProvider } from './Context.tsx'

function Root() {
    const { userId, ready } = useAuth()
    const [loggedIn, setLoggedIn] = useState<boolean>(true)

    useEffect(() => {
        setLoggedIn(!!userId)
    }, [userId])

    function callback(choice: boolean) {
        setLoggedIn(choice)
    }

    if (!ready) return <></>;

    return (
        <BrowserRouter>
            {!loggedIn && <Login callback={callback}/>}
            {loggedIn && <App callback={callback}/>}
        </BrowserRouter>
    )
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppProvider>
            <AuthProvider>
                <Root />
            </AuthProvider>
        </AppProvider>
    </StrictMode>,
)
