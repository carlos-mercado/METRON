import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import './App.css'
import logo from './assets/logo.png'
import CreateWorkout from './CreateWorkout'
import StartWorkout from './StartWorkout'
import {useState} from 'react';


function App() {
  const navigate = useNavigate();

  const [workoutKey, setWorkoutKey] = useState('-OXVeHjca32Img76Ac5g');
  const [view, setView] = useState(true);

  return (
    <>
      <Link to="/">
        <header className='mainHeader'>
            <img id="logo" src={logo} alt="Logo"></img>
        </header>
      </Link>
      <Routes>
        <Route path="/" element={
          <div className='mainContent'>
            <button onClick={() => {
              setView(true);
              navigate('/create-workout');
            }}>Create a workout</button>
            <button onClick={() => {
              setView(true);
              navigate('/start-workout'); 
            }}>Start a workout</button>

            {view && <input className='keyInput' placeholder='Enter workout key...' onChange={(e) => setWorkoutKey(e.target.value)}></input>}
          </div>
        } />
        <Route path="/create-workout" element={<CreateWorkout />} />
        <Route path="/start-workout" element={<StartWorkout dbKey={workoutKey}/>} />
      </Routes>
    </>
  )
}

export default App
