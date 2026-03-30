import { useTheme, useUnits } from './Context';
import Activity from './Activity';

function Settings()
{
    const { theme, toggleTheme } = useTheme();
    const { units, toggleUnits } = useUnits();

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
        </div>
    );
}

export default Settings;
