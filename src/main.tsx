import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './Login.tsx'
import { AuthProvider } from './Auth.tsx'

function Root() {
  const [loggedIn, setLoggedIn] = useState(false);

  function callback()
  {
    setLoggedIn(true);
  }

  return (
    <BrowserRouter>
      {!loggedIn && <Login callback={callback}/>}
      {loggedIn && <App />}
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
