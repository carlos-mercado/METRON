import { apiFetch } from './api';
//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
    const movementIdx = parseInt(searchParams.get('movement') ?? '0', 10) || 0;

    // prop first, then router state, otherwise null (the effect below fetches it)
    const [workout, setWorkout] = useState<Workout | null>(
        props.workout ?? (location.state as { workout?: Workout } | null)?.workout ?? null
    );
    const [burgerMode, setBurgerMode] = useState<boolean>(false);
    // Bumped when movements are inserted, removed or reordered so cards remount with fresh state.
    const [revision, setRevision] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    // Card to bring into view after the next render: the URL's card on mount, or a newly added one.
    const pendingScroll = useRef<{ index: number; smooth: boolean } | null>({ index: movementIdx, smooth: false });

    // fallback: no prop and no router state, so fetch from the API
    useEffect(() => {
        if (workout || !userId || !workoutId) return;

        async function load() {
            const params = new URLSearchParams({ id: String(userId), workout: workoutId });
            const response = await apiFetch(`/workouts?${params}`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.movements) {
                setWorkout(new Workout(workoutId, data.movements as Movement[]));
            }
        }
        load();
    }, [workout, userId, workoutId]);

    function setMovementIdx(nextIdx: number) {
        if (nextIdx === movementIdx) return;
        setSearchParams({ workout: workoutId, movement: String(nextIdx) }, { replace: true });
    }

    function scrollToMovement(index: number, smooth = true) {
        const carousel = carouselRef.current;
        const card = carousel?.children[index] as HTMLElement | undefined;
        if (!carousel || !card) return;
        carousel.scrollTo({
            left: card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2,
            behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',
        });
    }

    // Fade and blur neighbouring cards, and track the centred card in the URL.
    function updateCarousel(carousel: HTMLDivElement) {
        const center = carousel.scrollLeft + carousel.clientWidth / 2;
        const cards = Array.from(carousel.children) as HTMLElement[];
        let closest = 0;
        let closestDistance = Infinity;
        cards.forEach((card, index) => {
            const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
            const steps = distance / (card.offsetWidth + 20);
            card.style.setProperty('--movement-opacity', String(Math.max(0.15, Math.exp(-steps * 0.8))));
            card.style.setProperty('--movement-blur', `${Math.min(6, steps * 2)}px`);
            if (distance < closestDistance) {
                closest = index;
                closestDistance = distance;
            }
        });
        if (!pendingScroll.current) setMovementIdx(closest);
    }

    useLayoutEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        const pending = pendingScroll.current;
        pendingScroll.current = null;
        if (pending) scrollToMovement(pending.index, pending.smooth);
        updateCarousel(carousel);
        const observer = new ResizeObserver(() => updateCarousel(carousel));
        observer.observe(carousel);
        return () => observer.disconnect();
        // Re-run when the cards change or the carousel remounts after leaving reorder mode.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workout, revision, burgerMode]);

    // save to db, then update local state. Returns true on success.
    async function updateWorkoutMovements(updatedMovements: Movement[]): Promise<boolean> {
        if (!workout) return false;

        try {
            const response = await apiFetch('/workouts/edit', {
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

    async function updateWorkout(index: number, updatedMovement: Movement) {
        if (!workout) return;

        const movements = workout.movements;
        const replaced: Movement[] = [
            ...movements.slice(0, index),
            updatedMovement,
            ...movements.slice(index + 1),
        ];

        await updateWorkoutMovements(replaced);
    }

    async function appendMovement(index: number) {
        if (!workout) return;

        const blankMovement = new Movement("New Movement", 0, 0, 0, 0, [
            new PriorMovement(Date.now().toString(), 0, 0),
        ]);

        const movements = workout.movements;
        const appended = [
            ...movements.slice(0, index + 1),
            blankMovement,
            ...movements.slice(index + 1),
        ];

        if (await updateWorkoutMovements(appended)) {
            pendingScroll.current = { index: index + 1, smooth: true };
            setRevision(r => r + 1);
            setMovementIdx(index + 1);
        }
    }

    async function deleteMovement(index: number) {
        if (!workout) return;

        if (workout.movements.length === 1) {
            alert("Cannot delete from workout with only one movement.");
            return;
        }

        const movements = workout.movements;
        const updated: Movement[] = [
            ...movements.slice(0, index),
            ...movements.slice(index + 1),
        ];

        if (await updateWorkoutMovements(updated)) {
            const next = Math.max(0, Math.min(index - 1, updated.length - 1));
            pendingScroll.current = { index: next, smooth: false };
            setRevision(r => r + 1);
            setMovementIdx(next);
        }
    }

    async function handleReorder(reordered: Movement[]) {
        if (!workout || reordered === workout.movements) return;
        if (await updateWorkoutMovements(reordered)) {
            pendingScroll.current = { index: movementIdx, smooth: false };
            setRevision(r => r + 1);
        }
    }

    // all hooks are above this point, so these early returns are safe
    if (!workoutId) return <Navigate to="/session-select" replace />;
    if (!workout) return <Loading />;
    const count = workout.movements.length;
    const activeIdx = Math.max(0, Math.min(movementIdx, count - 1));

    return (
        <div className='startWorkout'>
            {workout.movements.length === 0 ? <p>No movements found.</p> : <></>}

            <div className='cardContainer'>
                <>
                    {!burgerMode && <div className='movementCarousel' role="region" aria-roledescription="carousel" aria-label="Movements"
                        ref={carouselRef}
                        onScroll={event => updateCarousel(event.currentTarget)}
                        onKeyDown={event => {
                            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                            if (event.target instanceof HTMLInputElement) return;
                            event.preventDefault();
                            scrollToMovement(Math.max(0, Math.min(count - 1, activeIdx + (event.key === 'ArrowRight' ? 1 : -1))));
                        }}
                    >
                        {workout.movements.map((movement, index) =>
                            // Off-centre cards are inert so a tap on a faded neighbour can't change it.
                            <div key={`${revision}-${index}`} className='movementSlide' inert={index !== activeIdx}
                                aria-label={`${movement.name}, movement ${index + 1} of ${count}`}>
                                <MovementCard
                                    key={`${revision}-${index}`}
                                    movement={movement}
                                    updateCallback={(updated: Movement) => updateWorkout(index, updated)}
                                    appendCallback={() => appendMovement(index)}
                                    deleteCallback={() => deleteMovement(index)}
                                />
                            </div>
                        )}
                    </div>}

                    {burgerMode && (
                        <Burger
                            workout={workout}
                            updateCallback={handleReorder}
                        />
                    )}

                    <div className='nav'>
                        <button aria-label="Previous movement" disabled={burgerMode || activeIdx === 0} onClick={() => scrollToMovement(activeIdx - 1)}>{"←"}</button>
                        <button className="burgerButton" aria-label="Reorder movements" onClick={() => {
                            if (burgerMode) pendingScroll.current = { index: activeIdx, smooth: false };
                            setBurgerMode(!burgerMode);
                        }}></button>
                        <button aria-label="Next movement" disabled={burgerMode || activeIdx === count - 1} onClick={() => scrollToMovement(activeIdx + 1)}>{"→"}</button>
                    </div>
                    <span className='navIndicator' aria-live="polite" aria-atomic="true">{activeIdx + 1} / {count}</span>
                </>
            </div>

            <button className="backButton" onClick={() => { navigate('/session-select') }}>back</button>
        </div>
    )
}

export default StartWorkout;
