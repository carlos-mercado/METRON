import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import './App.css'
import logo from './assets/logo.png'
import CreateWorkout from './CreateWorkout'
import StartWorkout from './StartWorkout'
import {useState} from 'react';


function App() {
  const navigate = useNavigate();

  const [workoutKey, setWorkoutKey] = useState('back');
  const [view, setView] = useState(true);

  return (
    <>
        <header className='mainHeader'>
          <Link to="/METRON" className='logoLink'>
            <img id="logo" src={logo} alt="Logo"></img>
          </Link>
        </header>
      <Routes>
        <Route path="/METRON" element=
        {
          <div className='mainContent'>
            <button onClick={() => {
              setView(true);
              navigate('/METRON/create-workout');
            }}>Create a workout</button>
            {view && <input className='keyInput' placeholder='Enter workout key...' onChange={(e) => setWorkoutKey(e.target.value)}></input>}
            <button onClick={() => {
              setView(true);
              navigate('/METRON/start-workout'); 
            }}>Start a workout</button>

          </div>
        } 
        />
        <Route path="/METRON/create-workout" element={<CreateWorkout />} />
        <Route path="/METRON/start-workout" element={<StartWorkout dbKey={workoutKey}/>} />
      </Routes>
    </>
  )
}

export default App
