import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import CreateWorkout from './CreateWorkout'
import StartWorkout from './StartWorkout'
import EditWorkout from './EditWorkout'
//import FakeCard from './FakeCard'
import { getAuth, signOut } from "firebase/auth";
import { useState } from 'react';
import logo from './assets/logo.png';
import footer from './assets/footer.png';

interface AppProps
{
  callback: Function;
}


function App(props: AppProps) {
  const navigate = useNavigate();
  const [workoutKey, setWorkoutKey] = useState("");
  const [view, setView] = useState(false);

  let handleLogout = async () =>
  {
    try {
      await signOut(getAuth());
      // optional: reset UI state
      setView(false);
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
          <img id='logo' src={logo} alt="Logo"/>
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
              <button className="mainButtons" onClick={() => {
                setView(!view);
              }}>▶</button>
              <button className="logoutButton" onClick={() => {
                setView(!view);
                handleLogout();
              }}>▶</button>

            </div>
            {view &&
              <div className='startWorkoutForm'>
                <input className='keyInput' placeholder='Enter workout key...' onChange={(e) => setWorkoutKey(e.target.value)}></input>
                <button className="goButton" onClick={() => {
                  navigate(`/start-workout/${workoutKey}`); 
                }}>GO</button>
              </div>
            }
          </>
        } 
        />
        <Route path="/create-workout/" element={<CreateWorkout/>} />
        <Route path="/start-workout/:workoutKey" element={<StartWorkout/>} />
        <Route path="/edit-workout/" element={<EditWorkout/>} />
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
 */
