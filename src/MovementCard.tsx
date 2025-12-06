//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND
import { useEffect, useState } from 'react';
import './MovementCard.css'

class Movement {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rest: number;

    constructor(name: string, sets: number, reps: number, weight: number, rest: number) {
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.weight = weight;
        this.rest = rest;
    }
}

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

    const [mov, setMovement] = useState<Movement>(movement);

    useEffect(() => {
        updateCallback(mov);
    }, [mov]);

    function step(variableToIncrement : string, incOrDec : string)
    {
        const polarity = incOrDec == "inc" ? 1 : -1;

        switch(variableToIncrement)
        {
            case "sets":
                setMovement(new Movement(mov.name, mov.sets + (setsInc * polarity), mov.reps, mov.weight, mov.rest))
                break;
            case "reps":
                setMovement(new Movement(mov.name, mov.sets, mov.reps + (repsInc * polarity), mov.weight, mov.rest))
                break;
            case "weight":
                setMovement(new Movement(mov.name, mov.sets, mov.reps, mov.weight + (weightInc * polarity), mov.rest))
                break;
            case "rest":
                setMovement(new Movement(mov.name, mov.sets, mov.reps, mov.weight, mov.rest + (restInc * polarity)))
                break;
        }
    }


    return (
        <div className='card'>
            <p className='name'>{mov.name}</p>
            <div className="setsInputRow">
                <button className="inc" onClick={() => step("sets", "dec")}></button>
                <p className='label'>Sets: {mov.sets}</p>
                <button className="dec" onClick={() => step("sets", "inc")}></button>
            </div>
            <div className="repsInputRow">
                <button className="inc" onClick={() => step("reps", "dec")}></button>
                <p className='label'>Reps: {mov.reps}</p>
                <button className="dec" onClick={() => step("reps", "inc")}></button>
            </div>
            <div className="weightInputRow">
                <button className="inc"onClick={() => step("weight", "dec")}></button>
                <p className='label'>Weight: {mov.weight}</p>
                <button className="dec"onClick={() => step("weight", "inc")}></button>
            </div>
            <div className="restInputRow">
                <button className="inc"onClick={() => step("rest", "dec")}></button>
                <p className='label'>Rest: {mov.rest} sec</p>
                <button className="dec"onClick={() => step("rest", "inc")}></button>
            </div>
        </div>
    );

}

export default MovementCard;
