//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND

import { useEffect, useState } from 'react';
import {useAuth} from './Auth'
import './EditWorkouts.css'
import MovementCard from './MovementCard'

class Movement {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rest: number;

    constructor(name: string, sets: number, reps: number, weight: number, rest: number) {
        this.name = name;
        this.sets = sets; this.reps = reps;
        this.weight = weight;
        this.rest = rest;
    }
}

class Workout {
    name: string;
    movements: Movement[];

    constructor(name: string, movements: Movement[]) {
        this.name = name;
        this.movements = movements
    }
}

function EditWorkouts()
{
    const { userId } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [workoutId, setWorkoutId] = useState<string>("");
    const [movementIdx, setMovementIdx] = useState<number>(0);

    async function updateWorkout(updatedMovement : Movement) 
    {
        const new_workout_movements : Movement[] = getCurrWorkout()

        const updatedWorkoutMovements = [
            ...new_workout_movements.slice(0, movementIdx),
            updatedMovement,
            ...new_workout_movements.slice(movementIdx + 1),
        ];

        const filteredWorkouts = workouts.filter(workout => workout.name !== workoutId);
        const newWorkout = new Workout(workoutId, updatedWorkoutMovements)
        filteredWorkouts.push(newWorkout)  

        setWorkouts(filteredWorkouts)

        const json_body = {
            id: userId,
            [workoutId] : updatedWorkoutMovements
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

        return 0;
    }

    function getCurrWorkout(): Movement[] 
    {
        const found  = workouts.find((workout) => workout.name === workoutId);

        if (found == null)
            return [new Movement("", 0, 0, 0, 0)]

        if (found)
            return found.movements;

        return [new Movement("", 0, 0, 0, 0)]
    }

    async function getWorkouts() 
    {
        const params = new URLSearchParams({ id: userId ? String(userId) : '', });

        const response = await fetch(`https://metron-backend.onrender.com/?${params.toString()}`, {
            method: 'GET',
        });
        if (response.status === 404) { return { notFound: true }; }
        if (!response.ok) { throw new Error(`Error: ${response.status}`); }
        return response.json();
    }

    useEffect(() => {
        if (!userId) {
            alert('Please sign in first');
            return;
        }
        async function fetchWorkout() 
        {
            try 
            {
                const workoutsResponse = await getWorkouts();
                if (workoutsResponse.notFound) 
                {
                    return;
                }
                const responseWorkouts : Workout[] = []

                for(const [workoutKey, workoutValue] of Object.entries(workoutsResponse.movements))
                {
                    const currWorkout : Workout = new Workout(workoutKey, workoutValue as Movement[])
                    responseWorkouts.push(currWorkout)
                }

                setWorkouts(responseWorkouts);
            } 
            catch (err) 
            {
                console.error(err);
            }
        }
        fetchWorkout();
    }, [userId]);




    if (workouts.length == 0) return <p>Loading...</p>
    return (
        <div className='editWorkout'>
            <div className='workouts'>
                {workouts.map(workout => 
                    <button id={workout.name} onClick={() => {
                        setWorkoutId(workout.name)
                        setMovementIdx(0)
                    }}>{workout.name}</button>
                )}
            </div>

            <div className='cardContainer'>
                {workoutId === "" ? <></> : 
                    <>
                        <MovementCard key={`${workoutId}-${movementIdx}`} movement={getCurrWorkout()[movementIdx]} updateCallback={updateWorkout}>
                        </MovementCard>

                        <div className='nav'>
                            <button onClick={() => setMovementIdx(Math.max(movementIdx - 1, 0))}>{"←"}</button>
                            <button onClick={() => setMovementIdx(Math.min(movementIdx + 1, getCurrWorkout().length - 1))}>{"→"}</button>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default EditWorkouts;
