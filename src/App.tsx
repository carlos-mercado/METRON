import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTheme } from './Context';

import alt_logo from './assets/alt_logo.svg';
import alt_logo_dark from './assets/alt_logo2.svg';
import './styles/App.css'

// Componenets
import CreateWorkout from './CreateWorkout'
import Stats from './Stats';
import Settings from './Settings';
import WorkoutTemplates from './Templates';
import SessionSelect from './SessionSelect';
import StartWorkout from './StartWorkout';

interface AppProps { callback: Function; }

function App(props: AppProps) 
{
    const navigate = useNavigate();
    const { theme } = useTheme();

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
                            }}>▶︎</button>
                            <button className="startButton" onClick={() => {
                                navigate('/start');
                            }}>▶︎</button>
                            <button className="statsButton" onClick={() => {
                                navigate('/stats');
                            }}>📈</button>
                        </div>
                    </>
                } 
                />
                <Route path="/create-workout/" element={<CreateWorkout/>} />
                <Route path="/start" element={<StartWorkout/>} />
                <Route path="/stats" element={<Stats/>} />
                <Route path="/settings" element={<Settings callback={props.callback}/>} />
                <Route path="/templates" element={<WorkoutTemplates/>} />
                <Route path="/session-select" element={<SessionSelect/>} />
            </Routes>

            <button className="settingsButton" onClick={() => navigate('/settings')} title="Settings">
            </button>
        </>
    )
}

export default App
