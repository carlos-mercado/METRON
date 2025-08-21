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

function randomizeText(text: string) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return text.split('').map(c => (c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)])).join('');
}

function encodeMovement(data: Movement | Rest): Movement | Rest {
    if ('name' in data) {
        return {
            ...data,
            name: randomizeText(data.name),
            sets: Math.floor(Math.random() * 10),
            reps: Math.floor(Math.random() * 15),
            weight: Math.floor(Math.random() * 100),
            rest: { time: Math.floor(Math.random() * 200) }
        };
    } else {
        return {
            time: Math.floor(Math.random() * 200)
        };
    }
}

function Workout({ dbKey }: WorkoutProps) {
    const [movements, setMovements] = useState<(Movement | Rest)[]>([]);
    const [idx, setIDX] = useState<number>(0);
    const [_, setEncoded] = useState(false);
    const [displayData, setDisplayData] = useState<Movement | Rest | null>(null);

    useEffect(() => {
        fetchWorkout(dbKey).then((data) => {
            if (data && Array.isArray(data.movements)) {
                setMovements(data.movements);
            } else {
                setMovements([]);
            }
        });
    }, [dbKey]);

    useEffect(() => {
        if (!movements.length) return;
        setEncoded(true);
        // Show encoded for 400ms, then decode
        const interval = setInterval(() => {
            setDisplayData(encodeMovement(movements[idx]));
        }, 40);
        const timeout = setTimeout(() => {
            clearInterval(interval);
            setEncoded(false);
            setDisplayData(movements[idx]);
        }, 400);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [idx, movements]);

    useEffect(() => {
        if (movements.length) setDisplayData(movements[idx]);
    }, [movements, idx]);

    if (!movements.length || !displayData) {
        return <div className='workout'>Loading workout...</div>;
    }

    return (
        <div className='workout'>
            <WorkoutCard data={displayData} />

            <br />
            <br />
            <br />

            <div className='nav'>
                <button
                    className='prev'
                    onClick={() => setIDX((prev) => Math.max(prev - 1, 0))}
                    disabled={idx === 0}
                >←</button>
                <button
                    className='next'
                    onClick={() => setIDX((prev) => Math.min(prev + 1, movements.length - 1))}
                    disabled={idx === movements.length - 1}
                >→</button>
            </div>
        </div>
    );
}

export default Workout;