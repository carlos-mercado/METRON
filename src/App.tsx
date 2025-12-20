import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import { getAuth, signOut } from "firebase/auth";
//import { useState } from 'react';
import alt_logo from './assets/alt_logo.svg';
import footer from './assets/footer.png';
import EditWorkouts from './EditWorkouts';
import CreateWorkout from './CreateWorkout'

interface AppProps
{
  callback: Function;
}


function App(props: AppProps) 
{
    const navigate = useNavigate();

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
                <img id='logo' src={alt_logo} alt="Logo"/>
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
                    <button className="logoutButton" onClick={() => {
                    handleLogout();
                    }}>▶</button>

                </div>
                </>
            } 
            />
            <Route path="/create-workout/" element={<CreateWorkout/>} />
            <Route path="/edit-workouts" element={<EditWorkouts/>} />
            </Routes>

            <footer className="appFooter">
            <img src={footer} alt="footer" />
            </footer>

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
