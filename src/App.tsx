import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import CreateWorkout from './CreateWorkout'
import StartWorkout from './StartWorkout'
import { getAuth, signOut } from "firebase/auth";
import { useState } from 'react';

interface AppProps
{
  callback: Function;
}


function App(props: AppProps) {
  const navigate = useNavigate();
  const [workoutKey, setWorkoutKey] = useState('back');
  const [view, setView] = useState(false);

  let handleLogout = async () =>
  {
    try {
      await signOut(getAuth());
      // optional: reset UI state
      setView(false);
      setWorkoutKey('back');
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
          <img id='logo' src={"./src/assets/logo.png"} alt="Logo"/>
        </a>
      </header>
      <Routes>
        <Route path="/" element=
        {
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
            {view &&
              <div className='startWorkoutForm'>
                <input className='keyInput' placeholder='Enter workout key...' onChange={(e) => setWorkoutKey(e.target.value)}></input>
                <button onClick={() => {
                  navigate(`/start-workout/${workoutKey}`); 
                }}>GO</button>
              </div>
            }

          </div>
        } 
        />
        <Route path="/create-workout/" element={<CreateWorkout/>} />
        <Route path="/start-workout/:workoutKey" element={<StartWorkout/>} />
      </Routes>

      <footer className="appFooter">
        <img src="./src/assets/footer.png" alt="footer" />
      </footer>

    </>
  )
}

export default App
