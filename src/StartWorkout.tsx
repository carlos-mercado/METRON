//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './Auth'

import MovementCard from './MovementCard'
import Burger from './Burger'
import Loading from './Loading'
import './styles/StartWorkout.css'

import { Movement, PriorMovement, Workout } from './Structs';

type Mode = "choosing_mode" | "working_out" | "burger_mode";

function StartWorkout()
{
    const { userId } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [currMode, setCurrMode] = useState<Mode>("choosing_mode");
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const workoutId = searchParams.get('workout') ?? "";
    const movementIdx = parseInt(searchParams.get('movement') ?? '0', 10);

    // Restore mode from URL on mount/reload
    useEffect(() => {
        if (searchParams.get('workout')) {
            setCurrMode("working_out");
        }
    }, []);

    function setWorkoutId(id: string) {
        setSearchParams({ workout: id, movement: '0' }, { replace: true });
    }

    function setMovementIdx(idxOrUpdater: number | ((prev: number) => number)) {
        const nextIdx = typeof idxOrUpdater === 'function' ? idxOrUpdater(movementIdx) : idxOrUpdater;
        setSearchParams({ workout: workoutId, movement: String(nextIdx) }, { replace: true });
    }

    function handleBack() {
        if ( currMode === "choosing_mode" ) {
            navigate('/');
        }
        else if ( currMode === "working_out" ){
            setSearchParams({}, { replace: true });
            setCurrMode("choosing_mode");
        }
        else if ( currMode === "burger_mode" ){
            setCurrMode("working_out");
        }
    }

    async function updateWorkoutMovements(updatedMovements: Movement[]) {
        const currentWorkoutId = workoutId;

        setWorkouts(prev => {
            const currentWorkout = prev.find(w => w.name === currentWorkoutId);
            if (!currentWorkout) return prev;

            const filtered : Workout[] = prev.filter(w => w.name !== currentWorkoutId);
            filtered.push(new Workout(currentWorkoutId, updatedMovements));

            fetch('https://metron-api.duckdns.org/workouts/edit', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: userId,
                        [currentWorkoutId]: updatedMovements,
                }),
            });

            return filtered;
        });
    }

    async function updateWorkout(updatedMovement: Movement) {
        const currentWorkout = workouts.find(w => w.name === workoutId);
        if (!currentWorkout) return;

        const movements : Movement[] = currentWorkout.movements;
        const replaced : Movement[] = [
            ...movements.slice(0, movementIdx),
            updatedMovement,
            ...movements.slice(movementIdx + 1),
        ];

        await updateWorkoutMovements(replaced);
    }

    function getCurrWorkout(): Workout {
        const found = workouts.find((workout) => workout.name === workoutId);
        if (found == null) return new Workout("Workout", []);
        if (found) return found;

        return new Workout("Workout", []);
    }

    async function getWorkouts() {
        const params = new URLSearchParams({ id: userId ? String(userId) : '', });
        const response = await fetch(`https://metron-api.duckdns.org/?${params.toString()}`, {
            method: 'GET',
        });
        if (response.status === 404) { return { notFound: true }; }
        if (!response.ok) { throw new Error(`Error: ${response.status}`); }
        return response.json();
    }

    async function appendMovement() {
        const currentWorkout = workouts.find(w => w.name === workoutId);
        if (!currentWorkout) return;

        const blankMovement = new Movement("New Movement", 0, 0, 0, 0, [
            new PriorMovement(Date.now().toString(), 0, 0),
        ]);

        const movements = currentWorkout.movements;
        const appended = [
            ...movements.slice(0, movementIdx + 1),
            blankMovement,
            ...movements.slice(movementIdx + 1),
        ];

        await updateWorkoutMovements(appended);
        setMovementIdx(movementIdx + 1);
    }

    async function deleteMovement() {
        const currentWorkout = workouts.find(w => w.name === workoutId);
        if (!currentWorkout) return;

        if (currentWorkout.movements.length === 1) {
            alert("Cannot delete from workout with only one movement.");
            return;
        }

        const movements = currentWorkout.movements;
        const updated: Movement[] = [
            ...movements.slice(0, movementIdx),
            ...movements.slice(movementIdx + 1),
        ];

        await updateWorkoutMovements(updated);
        setMovementIdx(prev => Math.max(0, Math.min(prev - 1, updated.length - 1)));
    }

    async function handleReorder(reordered : Movement[]) {
        let old_movements = getCurrWorkout().movements;
        if (old_movements === reordered) { return; }
        else {
            getCurrWorkout().movements = reordered;
            updateWorkoutMovements(reordered);
        }
    }

    function handleBurger() {
        setCurrMode("burger_mode");
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

    return (
        <div className='startWorkout'>
            {workouts.length === 0 ? <Loading /> : <></>}

            { currMode === "choosing_mode" && workoutId === "" && workouts.length != 0 && (
                <>
                    <p className='sessionSelect-label'>Select a session:</p>
                    <div className='workouts'>
                        {workouts.map(workout => 
                            <button key={workout.name} className="sessionSelect-button" id={workout.name} onClick={() => {
                                setWorkoutId(workout.name)
                                setCurrMode("working_out")
                            }}>{workout.name}</button>
                        )}
                    </div>
                </>
            )}

            <div className='cardContainer'>
                { currMode === "working_out" && workouts.length > 0 ?  
                    <>
                        <div className='carousel'>
                            <div className='currentCard'>
                                <MovementCard 
                                    key={`${workoutId}-${movementIdx}`} 
                                    movement={( getCurrWorkout().movements )[movementIdx]} 
                                    updateCallback={updateWorkout}
                                    appendCallback={appendMovement}
                                    deleteCallback={deleteMovement}
                                />
                            </div>
                        </div>

                        <div className='nav'>
                            <button onClick={() => setMovementIdx(Math.max(movementIdx - 1, 0))}>{"←"}</button>
                            <button className="burgerButton" onClick={handleBurger}></button>
                            <button onClick={() => setMovementIdx(Math.min(movementIdx + 1, ( getCurrWorkout().movements ).length - 1))}>{"→"}</button>
                        </div>
                        <span className='navIndicator'>{movementIdx + 1} / {( getCurrWorkout().movements ).length}</span>
                    </>
                    : <></>
                }
            </div>

            { currMode === "burger_mode" ? 
                    <Burger workout={getCurrWorkout()} updateCallback={handleReorder}></Burger> 
                :
                    <></>
            }
            <button className="backButton" onClick={() => handleBack()}>back</button>
        </div>
    )
}

export default StartWorkout;
