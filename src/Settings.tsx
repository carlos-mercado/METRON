import { getAuth, signOut } from 'firebase/auth';
import { useTheme, useUnits } from './Context';
import Activity from './Activity';
import './styles/Settings.css'

interface SettingsProps {
    callback: Function;
}

function Settings({ callback }: SettingsProps)
{
    const { theme, toggleTheme } = useTheme();
    const { units, toggleUnits } = useUnits();

    const handleLogout = async () => {
        try {
            await signOut(getAuth());
            callback(false);
        } catch (err) {
            console.error('Logout failed', err);
            alert('Logout failed');
        }
    };

    return (
        <div className="settingsContainer">
            <div className="settingsRow">
                <span className="settingsLabel">Units:</span>
                <div className="toggleSwitch">
                    <span className={`toggleOption ${units === 'kg' ? 'active' : ''}`}>kg</span>
                    <button 
                        className={`toggleTrack ${units === 'lbs' ? 'toggled' : ''}`}
                        onClick={toggleUnits}
                        aria-label="Toggle units"
                    >
                        <span className="toggleThumb"></span>
                    </button>
                    <span className={`toggleOption ${units === 'lbs' ? 'active' : ''}`}>lbs</span>
                </div>
            </div>

            <div className="settingsRow">
                <span className="settingsLabel">Theme:</span>
                <div className="toggleSwitch">
                    <span className={`toggleOption ${theme === 'light' ? 'active' : ''}`}>light</span>
                    <button 
                        className={`toggleTrack ${theme === 'dark' ? 'toggled' : ''}`}
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        <span className="toggleThumb"></span>
                    </button>
                    <span className={`toggleOption ${theme === 'dark' ? 'active' : ''}`}>dark</span>
                </div>
            </div>


            <Activity/>

            <div className="settingsRow">
                <button className="settingsLogoutButton" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default Settings;
