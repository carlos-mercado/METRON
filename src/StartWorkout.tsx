import { useEffect, useState } from 'react';
import './StartWorkout.css'
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import app from './firebaseConfig';


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

function Workout() {
    const { workoutKey = '' } = useParams();
    const dbKey = workoutKey;
    const [movements, setMovements] = useState<(Movement | Rest)[]>([]);
    const [idx, setIDX] = useState<number>(0);
    const [_, setEncoded] = useState(false);
    const [displayData, setDisplayData] = useState<Movement | Rest | null>(null);
    const [pageTurned, setPageTurned] = useState(false); //flag used to make sure that the decode/encode opeations don't fire when editing workout
    const [isUpdated, setIsUpdated] = useState(false);

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
        if (!pageTurned) return;

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
    }, [idx, movements, pageTurned]);

    useEffect(() => {
        if (movements.length) setDisplayData(movements[idx]);
    }, [movements, idx]);

    if (!movements.length || !displayData) {
        return <div className='workout'>Loading workout...</div>;
    }

    const updateMovements = (userMovement: Movement | Rest) => {
        setMovements((prev) => {
            const newMovements = [...prev];
            newMovements[idx] = userMovement;
            return newMovements;
        });
    };

  const updateWorkout = async () => {
    const db = getDatabase(app);
    const workoutsRef = ref(db, 'workouts/' + dbKey);

    await set(workoutsRef, {
      name: dbKey,
      movements: movements,
      createdAt: Date.now()
    });
    alert("Workout uploaded!");
  };

    return (
        <div className='workout'>
            {'name' in displayData &&
                <div className='pseudoCard'>
                    <input className="mainIn" value={displayData.name} onChange={e => {
                        updateMovements({...displayData, name: e.target.value});
                        setPageTurned(false);
                        setIsUpdated(true);
                    }}></input>
                    <br></br>
                    <p>sets:</p><input value={displayData.sets} onChange={e => {
                        updateMovements({...displayData, sets: Number(e.target.value)})
                        setPageTurned(false)
                        setIsUpdated(true);
                    }}></input>
                    <br></br>
                    <p>reps:</p><input value={displayData.reps} onChange={e => {
                        updateMovements({...displayData, reps: Number(e.target.value)})
                        setPageTurned(false);
                        setIsUpdated(true);
                    }}></input>
                    <br></br>
                    <p>weight:</p><input value={displayData.weight} onChange={e => {
                        updateMovements({...displayData, weight: Number(e.target.value)})
                        setPageTurned(false);
                        setIsUpdated(true);
                    }}></input>
                    <br></br>
                    <p>rest:</p><input value={displayData.rest.time} onChange={e => {
                        updateMovements({...displayData, rest: { time: Number(e.target.value) }})
                        setPageTurned(false);
                        setIsUpdated(true);
                    }}></input>
                    <br></br>
                </div>
            }
            {!('name' in displayData) &&
                <div className='pseudoCard'>
                    <h2>Rest</h2>
                    <p>rest:</p><input value={displayData.time} onChange={e => setDisplayData({...displayData, time: Number(e.target.value) })}></input>
                </div>
            }

            <br />
            <br />
            <br />

            <div className='nav'>
                <button
                    className='prev'
                    onClick={() => {
                        setIDX((prev) => Math.max(prev - 1, 0))
                        setPageTurned(true);
                    }}
                    disabled={idx === 0}
                >←</button>
                <button
                    className='next'
                    onClick={() => {
                        setIDX((prev) => Math.min(prev + 1, movements.length - 1))
                        setPageTurned(true);
                    }}
                    disabled={idx === movements.length - 1}
                >→</button>
            </div>
            <br></br>
            
            {isUpdated && <button onClick={updateWorkout}>update workout...</button>}
        </div>
    );
}

export default Workout;