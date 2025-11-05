import { useEffect, useState } from 'react';
import './StartWorkout.css'
import { getDatabase, ref, get, set } from 'firebase/database';
import app from './firebaseConfig';
import {useAuth} from './Auth'
import FakeCard from './FakeCard.tsx'
import { useParams } from 'react-router-dom';


async function fetchWorkout(workoutKey : string, userId : string) {
    const db = getDatabase(app);
    const workoutRef = ref(db, `${userId}/workouts/${workoutKey}`); const snapshot = await get(workoutRef);

    console.log(`${userId}/workouts/${workoutKey}`);
    if (snapshot.exists())
        return snapshot.val();
    else
        return null;
}

type Movement = {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rest: { time: number };
};

type Rest = {
    time: number;
};

type Workout = Array<Movement | Rest>;


function Workout()
{
    const { workoutKey = ''} = useParams();
    const { userId } = useAuth();
    const workoutName = workoutKey;
    const [movements, setMovements] = useState<(Movement | Rest)[]>([]); 
    const [movementIdx, setMovementIdx] = useState<number>(0);

    useEffect(() => { 
        if (!userId) 
        {
            alert('Please sign in first')
            return;
        }
        else
        {
            //console.log(userId);
            fetchWorkout(workoutKey, userId).then((data) => {
                if (data)
                {
                    //console.log(data.movements);
                    console.log(data)
                    setMovements(data.movements);
                }
                else
                    setMovements([]);
            });
        }
    }, [workoutName]);

    async function update(newCardData: Movement | Rest) {
        console.log(newCardData);

        if(!("name" in newCardData))
        {
            return;
        }

        const db = getDatabase(app);
        const workoutsRef = ref(db, `${userId}/workouts/${workoutName}/movements`);

        if(movements != null)
        {
            const newMovements = [...movements];
            newMovements[movementIdx] = newCardData;
            await set(workoutsRef, newMovements);
            setMovements(newMovements);
        }
    }

    if (movements === null) { return <p>loading...</p>; }
    if (movements.length === 0) { return <p>loading...</p>; }

    console.log(movements[movementIdx]);

    return (
        <div className='workout'>

            <FakeCard 
                data={movements[movementIdx]}
                callback={update}
            />

            <div className='nav'>
                <button
                    className='prev'
                    onClick={() => {
                        setMovementIdx((prev) => Math.max(prev - 1, 0))
                        console.log(movementIdx - 1);
                    }}
                    disabled={movementIdx === 0}
                ></button>
                <button
                    className='next'
                    onClick={() => {
                        setMovementIdx((prev) => Math.min(prev + 1, movements.length - 1))
                        console.log(movementIdx + 1);
                    }}
                    disabled={movementIdx === movements.length - 1}
                ></button>
            </div>
            <br></br>
        </div>
    );
}
export default Workout;
