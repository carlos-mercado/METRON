import { apiFetch } from './api';
//MOVEMENTS COMPOSE WORKOUTS. NOT THE OTHER WAY AROUND
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './Auth'

import Loading from './Loading'
import './styles/StartWorkout.css'
import { Movement, Workout } from './Structs';
import { groupWorkoutsByWeek } from './Utils';

interface SessionSelectProps {
    onSelectWorkout?: (workout: Workout) => void;
}

function SessionSelect({ onSelectWorkout }: SessionSelectProps)
{
    const navigate = useNavigate();
    const { userId } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const prioritizedWorkouts = groupWorkoutsByWeek(workouts);

    function updateCarouselAppearance(carousel: HTMLDivElement) {
        const center = carousel.scrollLeft + carousel.clientWidth / 2;
        const cards = Array.from(carousel.children) as HTMLElement[];
        let closest = 0;
        let closestDistance = Infinity;

        cards.forEach((card, index) => {
            const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
            // Measure distance in cards so the effect stays consistent on mobile.
            const steps = distance / (card.offsetWidth + 20);
            card.style.setProperty('--session-opacity', String(Math.max(0.15, Math.exp(-steps * 0.8))));
            card.style.setProperty('--session-blur', `${Math.min(6, steps * 2)}px`);
            if (distance < closestDistance) {
                closest = index;
                closestDistance = distance;
            }
        });
        setActiveIndex(closest);
    }

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        updateCarouselAppearance(carousel);
        const observer = new ResizeObserver(() => updateCarouselAppearance(carousel));
        observer.observe(carousel);
        return () => observer.disconnect();
    }, [workouts]);

    function scrollToSession(index: number) {
        const carousel = carouselRef.current;
        const card = carousel?.children[index] as HTMLElement | undefined;
        if (!carousel || !card) return;
        carousel.scrollTo({
            left: card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
    }

    async function getWorkouts() {
        const params = new URLSearchParams({ id: userId ? String(userId) : '', });
        const response = await apiFetch(`/?${params.toString()}`, {
            method: 'GET',
        });
        if (response.status === 404) { return { notFound: true }; }
        if (!response.ok) { throw new Error(`Error: ${response.status}`); }
        return response.json();
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

    function handleSelect(w: Workout) {
        if (onSelectWorkout) {
            onSelectWorkout(w);
            return;
        }

        navigate(
            { pathname: '/start', search: `?workout=${encodeURIComponent(w.name)}&movement=0` },
            { state: { workout: w } }
        );
    }

    return (
        <div className={`sessionSelect${workouts.length === 0 ? ' is-loading' : ''}`}>
            { workouts.length === 0 ? <div className="sessionSelect-loading"><Loading /></div> : <></> }

            <div className="sessionSelect-carousel" role="region" aria-roledescription="carousel" aria-label="Sessions"
                ref={carouselRef}
                onScroll={event => updateCarouselAppearance(event.currentTarget)}
                onKeyDown={event => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                    event.preventDefault();
                    const index = Math.max(0, Math.min(prioritizedWorkouts.length - 1,
                        activeIndex + (event.key === 'ArrowRight' ? 1 : -1)));
                    (carouselRef.current?.children[index] as HTMLElement | undefined)?.focus({ preventScroll: true });
                    scrollToSession(index);
                }}
            >
                {prioritizedWorkouts.map((workout, index) =>
                    <button key={workout.name} className="sessionSelect-button" id={workout.name}
                        aria-label={`${workout.name}, session ${index + 1} of ${prioritizedWorkouts.length}`}
                        onFocus={() => scrollToSession(index)}
                        onClick={() => handleSelect(workout)}
                    >{workout.name}</button>
                )}
            </div>

            {prioritizedWorkouts.length > 0 && <div className="sessionSelect-controls">
                <button type="button" aria-label="Previous session" disabled={activeIndex === 0}
                    onClick={() => scrollToSession(activeIndex - 1)}>‹</button>
                <span aria-live="polite" aria-atomic="true">{activeIndex + 1} / {prioritizedWorkouts.length}</span>
                <button type="button" aria-label="Next session" disabled={activeIndex === prioritizedWorkouts.length - 1}
                    onClick={() => scrollToSession(activeIndex + 1)}>›</button>
            </div>}

            <button className="backButton" onClick={() => {navigate('/')}}>back</button>
        </div>
    )
}

export default SessionSelect;
