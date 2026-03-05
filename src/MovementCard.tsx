//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND
import { useState } from 'react';
import './MovementCard.css'
import { PriorMovement, Movement } from './Structs';
import { useUnits } from './Context';

interface CardProps
{
    key: any
    movement : Movement
    updateCallback : any
}

function MovementCard({movement, updateCallback} : CardProps)
{
    const setsInc = 1;
    const repsInc = 0.5;
    const weightInc = 2.5;
    const restInc = 15;


    const { units } = useUnits();

    const [mov, setMovement] = useState<Movement>(movement);

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
                let new_history = [...old_history, new PriorMovement(Date.now().toString(), mov.reps, mov.weight)];
                newMovement = new Movement(mov.name, mov.sets, mov.reps + (repsInc * polarity), mov.weight, mov.rest, new_history);
                break;
            }
            case "weight":
            {
                let old_history = mov.history;
                let new_history = [...old_history, new PriorMovement(Date.now().toString(), mov.reps, mov.weight)];
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


    return (
        <div className='card'>
            <p className='name'>{mov.name}</p>
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
                <p className='label'>Weight: {mov.weight} {units}</p>
                <button className="inc" onClick={() => step("weight", "inc")}>+</button>
            </div>
            <div className="restInputRow">
                <button className="dec" onClick={() => step("rest", "dec")}>−</button>
                <p className='label'>Rest: {mov.rest} sec</p>
                <button className="inc" onClick={() => step("rest", "inc")}>+</button>
            </div>
        </div>
    );

}

export default MovementCard;
