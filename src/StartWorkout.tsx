import { useEffect, useState } from 'react';
import './StartWorkout.css'
import { getDatabase, ref, get } from 'firebase/database';
import app from './firebaseConfig';
import WorkoutCard from './WorkoutCard';

type WorkoutProps = {
    dbKey: string;
};

async function fetchWorkout(workoutKey : string) {
  const db = getDatabase(app);
  const workoutRef = ref(db, `workouts/${workoutKey}`);
  const snapshot = await get(workoutRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return null;
  }
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


function Workout({ dbKey }: WorkoutProps) {
    const [movements, setMovements] = useState<(Movement | Rest)[]>([]);
    const [idx, setIDX] = useState<number>(0);

    useEffect(() => {
        fetchWorkout(dbKey).then((data) => {
            if (data && Array.isArray(data.movements)) {
                setMovements(data.movements);
            } else {
                setMovements([]);
            }
        });
    }, [dbKey]);

    if (!movements.length) {
        return <div className='workout'>Loading workout...</div>;
    }


    return (
        <div className='workout'>
            <WorkoutCard data={movements[idx]} />

            <br></br>
            <br></br>
            <br></br>

            <div className='nav'>
                <button className='prev' onClick={() => setIDX((prev) => Math.max(prev - 1, 0))}>←</button>
                <button className='next' onClick={() => setIDX((prev) => Math.min(prev + 1, movements.length - 1))}>→</button>
            </div>

        </div>
    );
}

export default Workout;