//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND

import { useEffect, useState, useRef } from 'react';
import {useAuth} from './Auth'
import { useParams } from 'react-router-dom';
import './StartWorkout.css'
import MovementCard from './MovementCard'


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



function Workout()
{
    const { workoutKey = ''} = useParams();
    const my_workoutKey = workoutKey;
    const { userId } = useAuth();
    const [movements, setMovements] = useState<(Movement)[]>([]); 
    const [found, setFound] = useState(true);
    const [movementIdx, setMovementIdx] = useState<number>(0);
    const isFirstRender = useRef(true);


    async function getWorkout() {
        const params = new URLSearchParams({
            id: userId ? String(userId) : '',
            workout: String(my_workoutKey),
        });
        const response = await fetch(`https://metron-backend.onrender.com/workouts?${params.toString()}`, {
            method: 'GET',
        });
        if (response.status === 404) {
            return { notFound: true };
        }
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return response.json();
    }

    useEffect(() => {
        if (!userId) {
            alert('Please sign in first');
            return;
        }
        async function fetchWorkout() {
            try {
                const movementsResponse = await getWorkout();
                if (movementsResponse.notFound) {
                    setFound(false);
                    return;
                }
                setMovements(movementsResponse.movements);
                console.log(movementsResponse.movements);
            } catch (err) {
                console.error(err);
            }
        }
        fetchWorkout();
    }, [my_workoutKey]);

    useEffect(() => {
        if (movements.length === 0) return;
        if (isFirstRender.current) 
        {
            isFirstRender.current = false;
            return;
        }

        const json_body = {
            id: userId,
            [my_workoutKey] : movements
        };

        fetch('https://metron-backend.onrender.com/workouts/edit', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(json_body), // replace retJSON with your data object
        })
        .then(response => response.json())
        .then(_ => { console.log('Success: updated workout.'); })
        .catch(error => {
            console.error('Error:', error);
        });
    }, [movements])


    async function update(updatedMovement : Movement) {

        setMovements(prevMovements =>
            prevMovements.map((movement, idx) =>
            idx === movementIdx ? updatedMovement : movement
        ));

        return 0;
    }

    if(found)
    {
        if (movements === null) { return <p>loading...</p>; }
        if (movements.length === 0) { return <p>loading...</p>; }
    }
    else {
        return <p>Workout Not Found</p>
    }

    return (
        <>
            <MovementCard key={movementIdx} movement={movements[movementIdx]} updateCallback={update} />
            <div className='nav'>
                <button onClick={() => setMovementIdx(Math.max(movementIdx - 1, 0))}>{"←"}</button>
                <button onClick={() => setMovementIdx(Math.min(movementIdx + 1, movements.length - 1))}>{"→"}</button>
            </div>

        </>
    );
}

export default Workout;
