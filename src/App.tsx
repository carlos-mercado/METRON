import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import { getAuth, signOut } from "firebase/auth";
//import { useState } from 'react';
import alt_logo from './assets/alt_logo.svg';
import alt_logo_dark from './assets/alt_logo2.svg';
import EditWorkouts from './EditWorkouts';
import CreateWorkout from './CreateWorkout'
import { useTheme } from './ThemeContext';

import Stats from './Stats';

interface AppProps
{
  callback: Function;
}


function App(props: AppProps) 
{
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    let handleLogout = async () =>
    {
        try {
            await signOut(getAuth());
            props.callback(false);
        } catch (err) {
            console.error('Logout failed', err);
            alert('Logout failed');
        }
    }

    return (
        <>
        <header className="mainHeader">
            <a href="/">
                <img id='logo' src={theme === 'light' ? alt_logo : alt_logo_dark} alt="Logo"/>
            </a>
        </header>
        <Routes>
            <Route path="/" element=
            {
                <>
                <div className='mainContent'>
                    <button className="mainButtons" onClick={() => {
                    navigate('/create-workout');
                    }}>✚</button>
                    <button className="editButton" onClick={() => {
                    navigate('/edit-workouts');
                    }}>▶︎</button>
                    <button className="statsButton" onClick={() => {
                    navigate('/stats');
                    }}>📈</button>
                    <button className="logoutButton" onClick={() => {
                    handleLogout();
                    }}>▶</button>

                </div>
                </>
            } 
            />
            <Route path="/create-workout/" element={<CreateWorkout/>} />
            <Route path="/edit-workouts" element={<EditWorkouts/>} />
            <Route path="/stats" element={<Stats/>} />
            </Routes>

        <button className="themeToggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙' : '☀️'}
        </button>

        </>
    )
}

export default App

/*
              <button className="editButton" onClick={() => {
                navigate('/edit-workout');
                setView(false);
              }}>▶</button>
        <Route path="/edit-workout/" element={<EditWorkout/>} />
 */
