import { useState, useEffect, useRef } from 'react'
import { getDatabase, ref, set, get } from 'firebase/database'
//import { getDatabase, ref, get } from 'firebase/database'
import app from "./firebaseConfig"
import './EditWorkout.css'
import {useAuth} from './Auth'
import ModifiableCard from './ModifiableCard'

type Movement = {
    name: string;
    sets: string;
    reps: string;
    weight: string;
    rest: { time: string };
};

type Rest = {
    time: string;
};

type Workout = Array<Movement | Rest>;

function EditWorkout() {

    const { userId } = useAuth();
    const [workoutNames, setWorkoutNames] = useState<Array<string>>([]);
    const [workouts, setWorkouts] = useState<Array<Workout> | null>(null);
    const [currWorkout, setCurrWorkout] = useState<number>(0);
    const [movementIdx, setMovementIdx] = useState<number>(0);
    const [fade, setFade] = useState(false);
    const touchStartX = useRef<number | null>(null);

    const clickedWorkoutStyle = {
        color: "#E6BF5A",
        backgroundColor: "#5a81e6",
        boxShadow: "2px 2px 0 grey",
        border: "2px solid white",
    };

    async function update(newCardData: Movement | Rest) {
        console.log(newCardData);

        const db = getDatabase(app);
        const workoutsRef = ref(db, `${userId}/workouts/${workoutNames[currWorkout]}`);

        if(workouts != null)
        {
            const newMovements = [...workouts[currWorkout]];
            newMovements[movementIdx] = newCardData;

            const newWorkouts = [...workouts];
            newWorkouts[currWorkout] = newMovements;
            setWorkouts(newWorkouts);

            await set(workoutsRef, 
                {
                    movements: newMovements,
                    createdAt: Date.now()
                }
            );
        }

    }

    async function fetchWorkouts(userId : string) 
    {
        const db = getDatabase(app);
        const workoutRef = ref(db, `${userId}/workouts/`);
        const snapshot = await get(workoutRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    }

    function handleTouchStart(e: React.TouchEvent)
    {
        touchStartX.current = e.touches[0].clientX;
    }

    function handleTouchEnd(e: React.TouchEvent)
    {
        if(touchStartX.current === null)
            return;

        const horizontalDistanceBetweenTouches = e.changedTouches[0].clientX - touchStartX.current;

        if(horizontalDistanceBetweenTouches > 150)
        {
            setMovementIdx((prev) => Math.max(prev - 1, 0))
        }
        else if(horizontalDistanceBetweenTouches < -150)
        {
            if(workouts != null)
                setMovementIdx((prev) => Math.min(prev + 1, workouts[currWorkout].length - 1))
        }

    }

    function appendMovement()
    {
        if(workouts != null)
        {
            const newMovements = [...workouts[currWorkout]];

            const newMov: Movement = {
                name: 'Enter movement name.',
                sets: 'Sets',
                reps: 'Reps',
                weight: 'Weight',
                rest: { time: 'Rest' }
            };

            newMovements.splice(movementIdx + 1, 0, newMov);

            const newWorkout = [...workouts];
            newWorkout[currWorkout] = newMovements;
            
            setWorkouts(newWorkout);
            setMovementIdx(movementIdx + 1);
        }
    }

    function removeCurrentMovement()
    {
        if(workouts != null)
        {
            const newMovements = [...workouts[currWorkout]];

            if(newMovements.length <= 1)
            {
                alert("cannot remove movement from workout with only one movement.")
            }
            else
            {
                newMovements.splice(movementIdx, 1);
                const newWorkouts = [...workouts];
                newWorkouts[currWorkout] = newMovements;

                setWorkouts(newWorkouts);
                setMovementIdx(0);
            }

        }
        
    }

    useEffect(() => {
        if (!userId) 
        {
            alert('Please sign in first')
            return;
        }
        setWorkouts(null); // set to loading state every time userId changes
        fetchWorkouts(userId).then(data => {
            if (data) 
            {
                const currWorkoutNames: string[] = [];
                const currWorkouts: Workout[] = [];
                Object.entries(data).forEach(([key, value]) => {
                    currWorkoutNames.push(key);
                    currWorkouts.push((value as any).movements as Workout);
                });
                setWorkoutNames(currWorkoutNames);
                setWorkouts(currWorkouts);

                console.log(currWorkouts);

            } 
            else
            {
                setWorkoutNames([]);
                setWorkouts([]);
            }
        });
    }, [userId]);

    useEffect(() => {
        setFade(true);
        const timeout = setTimeout(() => setFade(false), 300); // 300ms fade
        return () => clearTimeout(timeout);
    }, [movementIdx]);

    if (workouts === null) {
        return <p>loading...</p>;
    }
    if (workouts.length === 0) {
        return <p>No workouts found.</p>;
    }
    return (
        <>
            <div className='workoutButtons'>
                {workouts.map((_, i) => (
                    <button 
                        style={currWorkout === i ? clickedWorkoutStyle : undefined}
                        key={i}
                        onClick={() => {
                            setCurrWorkout(i);
                            setMovementIdx(0);
                            
                        }}>
                            {workoutNames[i]}
                    </button>
                ))}
            </div>

            <div className='selectedWorkout'>
                <div 
                    className={fade ? 'fade-anim' : ''}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    
                >
                    <ModifiableCard
                        data={workouts[currWorkout][movementIdx]}
                        callback={update}
                    />
                </div>
            </div>

            <br></br>
            <div className='nav'>
                <button
                    className='remove'
                    onClick={() => {
                        removeCurrentMovement();
                    }}
                ></button>
                <button
                    className='prev'
                    onClick={() => {
                        setMovementIdx((prev) => Math.max(prev - 1, 0))
                    }}
                ></button>
                <button
                    className='next'
                    onClick={() => {
                        setMovementIdx((prev) => Math.min(prev + 1, workouts[currWorkout].length - 1))
                    }}
                ></button>
                <button
                    className='add'
                    onClick={() => {
                        appendMovement();
                    }}

                ></button>
            </div>
        </>
    )
}

export default EditWorkout;
