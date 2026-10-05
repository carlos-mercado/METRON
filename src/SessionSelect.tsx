//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './Auth'

import Loading from './Loading'
import './styles/StartWorkout.css'
import { Movement, Workout } from './Structs';
import { groupWorkoutsByWeek } from './Utils';


function SessionSelect()
{
    const navigate = useNavigate();
    const { userId } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const prioritizedWorkouts = groupWorkoutsByWeek(workouts);

    async function getWorkouts() {
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
                    if (workoutKey == "activity") { continue; }
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

    function handleSelect(w: Workout) {
        navigate(
            { pathname: '/start', search: `?workout=${encodeURIComponent(w.name)}&movement=0` },
            { state: { workout: w } }
        );
    }

    return (
        <div className='sessionSelect'>
            { workouts.length === 0 ? <Loading /> : <></> }

            <div className='workouts'>
                {prioritizedWorkouts.map(workout => 
                    <button key={workout.name} className="sessionSelect-button" id={workout.name}
                        onClick={() => handleSelect(workout)}
                    >{workout.name}</button>
                )}
            </div>

            <button className="backButton" onClick={() => {navigate('/')}}>back</button>
        </div>
    )
}

export default SessionSelect;
