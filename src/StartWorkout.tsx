//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './Auth'

import MovementCard from './MovementCard'
import Burger from './Burger'
import Loading from './Loading'
import './styles/StartWorkout.css'

import { Movement, PriorMovement, Workout } from './Structs';


interface StartWorkoutProps {
    workout?: Workout;
}

function StartWorkout(props: StartWorkoutProps) {
    const { userId } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const workoutId = searchParams.get('workout') ?? "";
    const movementIdx = parseInt(searchParams.get('movement') ?? '0', 10);

    // prop first, then router state, otherwise null (the effect below fetches it)
    const [workout, setWorkout] = useState<Workout | null>(
        props.workout ?? (location.state as { workout?: Workout } | null)?.workout ?? null
    );
    const [burgerMode, setBurgerMode] = useState<boolean>(false);

    // fallback: no prop and no router state, so fetch from the API
    useEffect(() => {
        if (workout || !userId || !workoutId) return;

        async function load() {
            const params = new URLSearchParams({ id: String(userId), workout: workoutId });
            const response = await fetch(`https://metron-api.duckdns.org/workouts?${params}`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.movements) {
                setWorkout(new Workout(workoutId, data.movements as Movement[]));
            }
        }
        load();
    }, [workout, userId, workoutId]);

    function setMovementIdx(idxOrUpdater: number | ((prev: number) => number)) {
        const nextIdx = typeof idxOrUpdater === 'function' ? idxOrUpdater(movementIdx) : idxOrUpdater;
        setSearchParams({ workout: workoutId, movement: String(nextIdx) }, { replace: true });
    }

    // save to db, then update local state. Returns true on success.
    async function updateWorkoutMovements(updatedMovements: Movement[]): Promise<boolean> {
        if (!workout) return false;

        try {
            const response = await fetch('https://metron-api.duckdns.org/workouts/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userId,
                    workout: workout.name,
                    movements: updatedMovements,
                }),
            });

            if (!response.ok) {
                console.error('Failed to update workout:', response.status, await response.text());
                return false;
            }
        } catch (err) {
            console.error('Network error updating workout:', err);
            return false;
        }

        setWorkout(new Workout(workout.name, updatedMovements));
        return true;
    }

    async function updateWorkout(updatedMovement: Movement) {
        if (!workout) return;
        console.log(updatedMovement);

        const movements = workout.movements;
        const replaced: Movement[] = [
            ...movements.slice(0, movementIdx),
            updatedMovement,
            ...movements.slice(movementIdx + 1),
        ];

        await updateWorkoutMovements(replaced);
    }

    async function appendMovement() {
        if (!workout) return;

        const blankMovement = new Movement("New Movement", 0, 0, 0, 0, [
            new PriorMovement(Date.now().toString(), 0, 0),
        ]);

        const movements = workout.movements;
        const appended = [
            ...movements.slice(0, movementIdx + 1),
            blankMovement,
            ...movements.slice(movementIdx + 1),
        ];

        if (await updateWorkoutMovements(appended)) {
            setMovementIdx(movementIdx + 1);
        }
    }

    async function deleteMovement() {
        if (!workout) return;

        if (workout.movements.length === 1) {
            alert("Cannot delete from workout with only one movement.");
            return;
        }

        const movements = workout.movements;
        const updated: Movement[] = [
            ...movements.slice(0, movementIdx),
            ...movements.slice(movementIdx + 1),
        ];

        if (await updateWorkoutMovements(updated)) {
            setMovementIdx(prev => Math.max(0, Math.min(prev - 1, updated.length - 1)));
        }
    }

    async function handleReorder(reordered: Movement[]) {
        if (!workout || reordered === workout.movements) return;
        await updateWorkoutMovements(reordered);
    }

    // all hooks are above this point, so these early returns are safe
    if (!workoutId) return <Navigate to="/session-select" replace />;
    if (!workout) return <Loading />;

    return (
        <div className='startWorkout'>
            {workout.movements.length === 0 ? <p>No movements found.</p> : <></>}

            <div className='cardContainer'>
                <>
                    <div className='carousel'>
                        <div className='currentCard'>
                            <MovementCard
                                key={`${workout.name}-${movementIdx}`}
                                movement={workout.movements[movementIdx]}
                                updateCallback={updateWorkout}
                                appendCallback={appendMovement}
                                deleteCallback={deleteMovement}
                            />
                        </div>
                    </div>

                    <div className='nav'>
                        <button onClick={() => setMovementIdx(Math.max(movementIdx - 1, 0))}>{"←"}</button>
                        <button className="burgerButton" onClick={() => setBurgerMode(!burgerMode)}></button>
                        <button onClick={() => setMovementIdx(Math.min(movementIdx + 1, workout.movements.length - 1))}>{"→"}</button>
                    </div>
                    <span className='navIndicator'>{movementIdx + 1} / {workout.movements.length}</span>
                </>
            </div>

            {burgerMode ?
                <Burger
                    workout={workout}
                    updateCallback={handleReorder}
                ></Burger> : <></>
            }
            <button className="backButton" onClick={() => { navigate('/session-select') }}>back</button>
        </div>
    )
}

export default StartWorkout;
