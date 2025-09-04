import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import './App.css'
import logo from './assets/logo.png'
import CreateWorkout from './CreateWorkout'
import StartWorkout from './StartWorkout'
import {useState} from 'react';


function App() {
  const navigate = useNavigate();

  const [workoutKey, setWorkoutKey] = useState('back');
  const [view, setView] = useState(false);

  return (
    <>
        <header className='mainHeader'>
          <Link to="/METRON/" className='logoLink'>
            <img id="logo" src={logo} alt="Logo"></img>
          </Link>
        </header>
      <Routes>
        <Route path="/METRON/" element=
        {
          <div className='mainContent'>
            <button className="mainButtons" onClick={() => {
              navigate('/METRON/create-workout');
            }}>✚</button>
            <button className="mainButtons" onClick={() => {
              setView(!view);
            }}>▶</button>
            <br></br>
            <br></br>
            <br></br>
            {view &&
              <>
                <input className='keyInput' placeholder='Enter workout key...' onChange={(e) => setWorkoutKey(e.target.value)}></input>
                <button onClick={() => {
                  navigate(`/METRON/start-workout/${workoutKey}`); 
                }}>GO</button>
              </>
            }

          </div>
        } 
        />
        <Route path="/METRON/create-workout/" element={<CreateWorkout/>} />
        <Route path="/METRON/start-workout/:workoutKey" element={<StartWorkout/>} />
      </Routes>
    </>
  )
}

export default App
