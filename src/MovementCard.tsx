//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND
import { useState, useRef } from 'react';
import './styles/MovementCard.css'
import { PriorMovement, Movement } from './Structs';
import { useUnits } from './Context';

interface CardProps {
    key: any
    movement : Movement
    updateCallback : any
    appendCallback : any
    deleteCallback : any
}

type Mode = "Normal" | "Edit";

function MovementCard({movement, updateCallback, appendCallback, deleteCallback} : CardProps) { const setsInc = 1;
    const repsInc = 0.5;
    const weightInc = 2.5;
    const restInc = 15;
    const { units } = useUnits();
    const [mov, setMovement] = useState<Movement>(movement);
    const [mode, setMode] = useState<Mode>("Normal");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleHold() {
        timerRef.current = setTimeout(() => {
            setMode(mode === "Normal" ? "Edit" : "Normal");
        }, 700);
    }

    function handleRelease() {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }

    function handleRename(newName : string) {
        let newMov : Movement = new Movement(newName, mov.sets, mov.reps, mov.weight, mov.reps, mov.history);
        setMovement(newMov);
        updateCallback(newMov);
    }

    function step(variableToIncrement : string, incOrDec : string)
    {
        const polarity = (incOrDec == "inc" ? 1 : -1);
        let newMovement: Movement;

        switch(variableToIncrement)
        {
            case "sets":
            {
                newMovement = new Movement(mov.name, mov.sets + (setsInc * polarity), mov.reps, mov.weight, mov.rest, mov.history);
                break;
            }
            case "reps":
            {
                let old_history = mov.history;
                let new_history = [...old_history, new PriorMovement(Date.now().toString(), mov.reps + (repsInc * polarity), mov.weight)];
                newMovement = new Movement(mov.name, mov.sets, mov.reps + (repsInc * polarity), mov.weight, mov.rest, new_history);
                break;
            }
            case "weight":
            {
                let old_history = mov.history;
                let new_history = [...old_history, new PriorMovement(Date.now().toString(), mov.reps, mov.weight + (weightInc * polarity))];
                newMovement = new Movement(mov.name, mov.sets, mov.reps, mov.weight + (weightInc * polarity), mov.rest, new_history);
                break;
            }
            case "rest":
            {
                newMovement = new Movement(mov.name, mov.sets, mov.reps, mov.weight, mov.rest + (restInc * polarity), mov.history);
                break;
            }
            default:
                return;
        }

        setMovement(newMovement);
        updateCallback(newMovement);
    }

    function handleWeightChange(e: React.ChangeEvent<HTMLInputElement>)
    {
        const value = e.target.value;

        // Allow empty string so user can clear and retype
        if (value === '' || value === '-')
        {
            const newMovement = new Movement(mov.name, mov.sets, mov.reps, 0, mov.rest, mov.history);
            setMovement(newMovement);
            updateCallback(newMovement);
            return;
        }

        const parsed = parseFloat(value);
        if (!isNaN(parsed))
        {
            let old_history = mov.history;
            let new_history = [...old_history, new PriorMovement(Date.now().toString(), mov.reps, parsed)];
            const newMovement = new Movement(mov.name, mov.sets, mov.reps, parsed, mov.rest, new_history);
            setMovement(newMovement);
            updateCallback(newMovement);
        }
    }


    return (
        <>
            <div className='card' 
                onMouseDown={ handleHold }
                onTouchStart={ handleHold }
                onMouseUpCapture={ handleRelease }
                onTouchEnd={ handleRelease }
            >
                { mode == "Normal" && 
                    <p className='name'>{mov.name}</p>
                }
                { mode == "Edit" && 
                    <input 
                        type='text' 
                        value={movement.name}
                        onChange={(e) => handleRename(e.target.value)}
                    />
                }
                <div className="setsInputRow">
                    <button className="dec" onClick={() => step("sets", "dec")}>−</button>
                    <p className='label'>Sets: {mov.sets}</p>
                    <button className="inc" onClick={() => step("sets", "inc")}>+</button>
                </div>
                <div className="repsInputRow">
                    <button className="dec" onClick={() => step("reps", "dec")}>−</button>
                    <p className='label'>Reps: {mov.reps}</p>
                    <button className="inc" onClick={() => step("reps", "inc")}>+</button>
                </div>
                <div className="weightInputRow">
                    <button className="dec" onClick={() => step("weight", "dec")}>−</button>
                    <div className='label weight-label'>
                        <input
                            className='weight-input'
                            type="number"
                            value={mov.weight}
                            onChange={handleWeightChange}
                            step={weightInc}
                            style={{ width: `${Math.max(String(mov.weight).length, 1) + 1}ch` }}
                        />
                        <span className='unitsLabel'>{units}</span>
                    </div>
                    <button className="inc" onClick={() => step("weight", "inc")}>+</button>
                </div>
                <div className="restInputRow">
                    <button className="dec" onClick={() => step("rest", "dec")}>−</button>
                    <p className='label'>Rest: {mov.rest} sec</p>
                    <button className="inc" onClick={() => step("rest", "inc")}>+</button>
                </div>
            </div>

            {mode == "Edit" && 
                <div className='editButtons'>
                    <button className='minus' onClick={deleteCallback}></button>
                    <button className='plus' onClick={appendCallback}></button>
                </div>
            }
        </>
    );

}

export default MovementCard;
