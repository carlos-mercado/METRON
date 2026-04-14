import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PriorMovement, Workout, Movement } from './Structs';
import Loading from './Loading';
import { useAuth } from './Auth'
import './styles/Stats.css'

import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

function Stats() 
{
    const navigate = useNavigate();
    const { userId } = useAuth();
    const [data, setData] = useState<PriorMovement[]>();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [workoutId, setWorkoutId] = useState<string>("");

    function handleBack() {
        // Three States
        // 1. Choosing Session
        // 2. Choosing Movement
        // 3. Viewing History

        // what state are we currently in? 
        if ( workoutId == "" ) {
            // 1
            navigate('/');
        }
        else if ( workoutId && !data ) {
            // 2
            setWorkoutId("");
        }
        else {
            // 3
            setData(undefined);
        }

        return;
    }

    function mergeDays(data : PriorMovement[]) {
        let merged : PriorMovement[] = [];

        let last : PriorMovement = data[0];
        let last_date = new Date(Number(last.date));
        let last_month = last_date.getMonth() + 1; // getMonth() returns 0-11
        let last_day = last_date.getDate();

        for (let i = 1; i < data.length; i++) {
            const date = new Date(Number(data[i].date));
            const month = date.getMonth() + 1; // getMonth() returns 0-11
            const day = date.getDate();

            if (month == last_month && last_day == day) {
                last.weight = data[i].weight;
                last.reps = data[i].reps;
            }
            else {
                merged.push(last);
                last = data[i];
                last_date = new Date(Number(last.date));
                last_month = last_date.getMonth() + 1;
                last_day = last_date.getDate();
            }
        }

        merged.push(last);
        console.log(merged);
        setData(merged);
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
        if (!userId) { alert('Please sign in first'); return; }

        async function fetchWorkout() {
            try {
                const workoutsResponse = await getWorkouts();

                if (workoutsResponse.notFound) { return; }

                const responseWorkouts : Workout[] = []
                for (const [workoutKey, workoutValue] of Object.entries(workoutsResponse.movements)) {
                    if (workoutKey == "activity") { continue; }
                    const currWorkout : Workout = new Workout(workoutKey, workoutValue as Movement[])
                    responseWorkouts.push(currWorkout)
                }

                setWorkouts(responseWorkouts);
            }
            catch (err) {
                console.error(err);
            }
        }
        fetchWorkout();
    }, [userId]);


    return (
        <div className='statsContainer'>
            { workouts.length === 0 ? <Loading /> : <></> }
            { workoutId === "" && workouts.length != 0 && (
                <>
                    <p className='sessionSelect-label'>Select a session:</p>
                    <div className='workouts'>
                        {workouts.map(workout => 
                            <button className="sessionSelect-button" id={workout.name} onClick={() => {
                                setWorkoutId(workout.name);
                                setMovements(workout.movements);
                            }}>{workout.name}</button>
                        )}
                    </div>
                </>
            )}

            { workoutId != "" && !data && (
                <>
                    <p>Select a movement:</p>
                    <div className='workouts'>
                        { movements.map(movement => <button className='movementSelect-button' id={movement.name} onClick={() => {
                            mergeDays(movement.history);
                        }}>{movement.name}</button>)}
                    </div>
                </>
            )}

            { data && (
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        data={data}
                        margin={{ top: 30, right: 30, bottom: 40, left: 30 }}
                    >
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={date => {
                                const d = new Date(Number(date));
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                            label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} 
                        />
                        <YAxis yAxisId="left" domain={[0, (max: number) => Math.ceil(max * 1.1)]} label={{ value: 'Reps', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, (max: number) => Math.ceil(max * 1.1)]} label={{ value: 'Weight', angle: 90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="right" dataKey="weight" barSize={20} fill="#413ea0" name="Weight" />
                        <Line yAxisId="left" type="monotone" dataKey="reps" stroke="#ff7300" name="reps" />
                    </ComposedChart>
                </ResponsiveContainer>
            )}

            <button onClick={() => handleBack()}>back</button>
        </div>
    );
}

export default Stats;
