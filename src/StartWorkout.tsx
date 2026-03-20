//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND

import { useEffect, useState } from 'react';
import {useAuth} from './Auth'
import './styles/StartWorkout.css'
import MovementCard from './MovementCard'
import Loading from './Loading'
import { Movement, Workout } from './Structs';


function StartWorkout()
{
    const { userId } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [workoutId, setWorkoutId] = useState<string>("");
    const [movementIdx, setMovementIdx] = useState<number>(0);

    async function updateWorkout(updatedMovement : Movement) 
    {
        // Capture current values to avoid stale closure issues
        const currentWorkoutId = workoutId;
        const currentMovementIdx = movementIdx;

        setWorkouts(prevWorkouts => {
            const currentWorkout = prevWorkouts.find(w => w.name === currentWorkoutId);
            if (!currentWorkout) return prevWorkouts;

            const updatedWorkoutMovements = [
                ...currentWorkout.movements.slice(0, currentMovementIdx),
                updatedMovement,
                ...currentWorkout.movements.slice(currentMovementIdx + 1),
            ];

            const filteredWorkouts = prevWorkouts.filter(workout => workout.name !== currentWorkoutId);
            const newWorkout = new Workout(currentWorkoutId, updatedWorkoutMovements);
            filteredWorkouts.push(newWorkout);

            // Send the update to the server
            const json_body = {
                id: userId,
                [currentWorkoutId]: updatedWorkoutMovements
            };

            fetch('https://metron-api.duckdns.org/workouts/edit', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(json_body),
            })
            .then(response => response.json())
            .then(_ => { console.log('Success: updated workout.'); })
            .catch(error => {
                console.error('Error:', error);
            });

            return filteredWorkouts;
        });

        return 0;
    }

    function getCurrWorkout(): Movement[] 
    {
        const found  = workouts.find((workout) => workout.name === workoutId);

        if (found == null)
            return [new Movement("", 0, 0, 0, 0, [])]

        if (found)
            return found.movements;

        return [new Movement("", 0, 0, 0, 0, [])]
    }

    async function getWorkouts() 
    {
        const params = new URLSearchParams({ id: userId ? String(userId) : '', });
        const response = await fetch(`https://metron-api.duckdns.org/?${params.toString()}`, {
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



    return (
        <div className='startWorkout'>

            {workouts.length === 0 ? <Loading /> : <></>}

            {workoutId === "" && (
                <div className='workouts'>
                    {workouts.map(workout => 
                        <button id={workout.name} onClick={() => {
                            setWorkoutId(workout.name)
                            setMovementIdx(0)
                        }}>{workout.name}</button>
                    )}
                </div>
            )}

            <div className='cardContainer'>
                {workoutId === "" ? <></> : 
                    <>
                        <div className='carousel'>
                            {/* Previous movement preview */}
                            <div 
                                className={`previewCard prev ${movementIdx > 0 ? '' : 'hidden'}`}
                                onClick={() => setMovementIdx(Math.max(movementIdx - 1, 0))}
                            >
                                {movementIdx > 0 && (
                                    <div className='previewContent'>
                                        <p className='previewName'>{getCurrWorkout()[movementIdx - 1].name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Current movement */}
                            <div className='currentCard'>
                                <MovementCard key={`${workoutId}-${movementIdx}`} movement={getCurrWorkout()[movementIdx]} updateCallback={updateWorkout}/>
                            </div>

                            {/* Next movement preview */}
                            <div 
                                className={`previewCard next ${movementIdx < getCurrWorkout().length - 1 ? '' : 'hidden'}`}
                                onClick={() => setMovementIdx(Math.min(movementIdx + 1, getCurrWorkout().length - 1))}
                            >
                                {movementIdx < getCurrWorkout().length - 1 && (
                                    <div className='previewContent'>
                                        <p className='previewName'>{getCurrWorkout()[movementIdx + 1].name}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='nav'>
                            <button onClick={() => setMovementIdx(Math.max(movementIdx - 1, 0))}>{"←"}</button>
                            <span className='navIndicator'>{movementIdx + 1} / {getCurrWorkout().length}</span>
                            <button onClick={() => setMovementIdx(Math.min(movementIdx + 1, getCurrWorkout().length - 1))}>{"→"}</button>
                        </div>
                    </>
                }
            </div>

        </div>
    )
}

export default StartWorkout;
