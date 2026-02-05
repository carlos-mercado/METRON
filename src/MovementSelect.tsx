import { Movement, Workout } from './Structs';
import { useEffect, useState } from 'react';
import {useAuth} from './Auth'
import './MovementSelect.css'

interface Props { loadCallback : any }

function WorkoutCard({loadCallback} : Props)
{
    const { userId } = useAuth();
    const [isWorkoutSelected, setIsWorkoutSelected] = useState(false);
    const [isMovementSelected, setIsMovementSelected] = useState(false);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [movs, setMovs] = useState<Movement[]>();

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
        if (!userId) 
        {
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

    function handle_workout_selection(workout_name : string)
    {
        setIsWorkoutSelected(true);
        const workout = workouts.find(workout => workout.name == workout_name);
        setMovs(workout?.movements);
    }

    function handle_movement_selection(movement_name: string) 
    {
        setIsMovementSelected(true);
        const my_movement = movs?.find(movement => movement.name === movement_name);
        loadCallback(my_movement?.history);

    }

    return (
        <>
            {!isWorkoutSelected && (
                <>
                    <p>Choose a Workout</p>
                    <div className='workouts'>
                        {workouts.map(workout => 
                            <div className='workoutCard' id={workout.name} onClick={() => handle_workout_selection(workout.name)}>{workout.name}</div>
                        )}
                    </div>
                </>

            )}

            {isWorkoutSelected && !isMovementSelected && movs &&
                <>
                    <p>Choose a Movement</p>
                    <div className='movements'>
                        {movs.map(movement => 
                            <div className='workoutCard' id={movement.name} onClick={() => handle_movement_selection(movement.name)}>{movement.name}</div>
                        )}
                    </div>
                </>
            }
        </>
    )
}

export default WorkoutCard;
