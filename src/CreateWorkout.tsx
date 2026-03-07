import { useState } from 'react'
import './CreateWorkout.css'
import {useAuth} from './Auth'
import { PriorMovement, Movement } from './Structs';


function CreateWorkout() {

    const [workoutName, setWorkoutName] = useState<string>("");
    const [movementName, setMovementName] = useState<string>("");
    const [movementSets, setMovementSets] = useState<number>(0);
    const [movementWeight, setMovementWeight] = useState<number>(0);
    const [movementRest, setMovementRest] = useState<number>(0);
    const [movementReps, setMovementReps] = useState<number>(0);
    const { userId } = useAuth();
    const [movements, setMovements] = useState<Movement[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    function appendToWorkout()
    {
        const dummy_prior_movement = new PriorMovement(Date.now().toString(), 0, 0);

        const newMov = new Movement(movementName, movementSets, movementReps, movementWeight, movementRest, [ dummy_prior_movement ])

        setMovements(prevMovements => [...prevMovements, newMov]);
    }

    function build_json_data()
    {
        const retJSON = {
            id: userId,
            [workoutName] : movements
        };



        console.log(JSON.stringify(retJSON, null, 2));
        return JSON.stringify(retJSON);
    }

    function postWorkout() 
    {
        setMessage(null);

        fetch('https://metron-api.duckdns.org/workouts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: build_json_data(), // replace retJSON with your data object
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload workout');
            }
            return response.json();
        })
        .then(data => { 
            console.log('Success:', data);
            setMessage({ type: 'success', text: 'Workout uploaded successfully!' });
        })
        .catch(error => {
            console.error('Error:', error);
            setMessage({ type: 'error', text: 'Failed to upload workout. Please try again.' });
        });
    }

    return (
        <>
            <p className='tag'>Workout name: </p>
            <input className='workoutNameInput' onChange={e => setWorkoutName(e.target.value)} />

            <div>
                <p className='tag'>Movement Name:</p>
                <input className='nameInput' onChange={e => setMovementName(e.target.value)} />

                <p className='tag'>Movement Sets:</p>
                <input className='setsInput' type='number' onChange={e => setMovementSets(Number(e.target.value))} />

                <p className='tag'>Movement Reps:</p>
                <input className='repsInput' type='number' onChange={e => setMovementReps(Number(e.target.value))} />
                <p className='tag'>Movement Weight:</p>
                <input className='weightInput' type='number' onChange={e => setMovementWeight(Number(e.target.value))} />

                <p className='tag'>Movement Rest:</p>
                <input className='restInput' type='number' onChange={e => setMovementRest(Number(e.target.value))} />
            </div>

            <button onClick={appendToWorkout}>Add Movement</button>

            {movements.map(movement => (
                <>
                    <p>
                        {movement.name}
                    </p>
                    <p>
                        {movement.sets}
                    </p>
                    <p>
                        {movement.weight}
                    </p>
                    <p>
                        {movement.reps}
                    </p>
                    <p>
                        {movement.rest}
                    </p>
                </>
            ))}

            {message && (
                <p style={{ 
                    color: message.type === 'success' ? 'green' : 'red',
                    fontWeight: 'bold'
                }}>
                    {message.text}
                </p>
            )}

            <button onClick={postWorkout}>Upload Workout</button>

        </>
    )

}

export default CreateWorkout
