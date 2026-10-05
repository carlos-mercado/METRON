import type { Workout } from './Structs';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Returns the weekday name for a Date in the user's local time zone. */
export function getDayOfWeek(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function parseMovementDate(value: string): Date | null {
    const date = /^\d+$/.test(value) ? new Date(Number(value)) : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Returns the most recent valid history date across every movement in a workout.
 * Returns null when the workout has no valid movement history.
 */
export function getLastWorkoutUpdate(workout: Workout): Date | null {
    let latestDate: Date | null = null;

    for (const movement of workout.movements) {
        for (const entry of movement.history) {
            const entryDate = parseMovementDate(entry.date);

            if (entryDate && (!latestDate || entryDate > latestDate)) {
                latestDate = entryDate;
            }
        }
    }

    return latestDate;
}

/**
 * Returns the weekday on which the largest number of movements were most
 * recently updated. Returns null when the workout has no valid movement history.
 */
export function getMostCommonWorkoutUpdateDay(workout: Workout): string | null {
    const dayCounts = new Map<string, number>();
    let mostCommonDay: string | null = null;
    let highestCount = 0;

    for (const movement of workout.movements) {
        const latestDate = movement.history.reduce<Date | null>((latest, entry) => {
            const entryDate = parseMovementDate(entry.date);

            if (!entryDate || (latest && entryDate <= latest)) {
                return latest;
            }

            return entryDate;
        }, null);

        if (!latestDate) continue;

        const day = getDayOfWeek(latestDate);
        const count = (dayCounts.get(day) ?? 0) + 1;
        dayCounts.set(day, count);

        if (count > highestCount) {
            mostCommonDay = day;
            highestCount = count;
        }
    }

    return mostCommonDay;
}



// A group is a list of workouts such that every workout
// in the group has been updated within one week
// of every other workout in the group.
//
// the delta between the most-recently updated workout
// and the least-recently updated workout in group[i] is < 1 week

export function groupWorkoutsByWeek(workouts: Workout[]): Workout[] {
    const dated: { workout: Workout; time: number }[] = [];
    const neverPerformed: Workout[] = [];

    for (const workout of workouts) {
        const date = getLastWorkoutUpdate(workout);
        if (date) {
            dated.push({ workout, time: date.getTime() });
        } else {
            neverPerformed.push(workout);
        }
    }

    dated.sort((a, b) => a.time - b.time);

    const groups: Workout[][] = [];
    let current: Workout[] = [];
    let groupStart = 0;

    for (const { workout, time } of dated) {
        if (current.length === 0 || time - groupStart > WEEK_MS) {
            current = [];
            groups.push(current);
            groupStart = time;
        }
        current.push(workout);
    }

    groups.reverse();

    if (neverPerformed.length > 0) {
        groups.push(neverPerformed);
    }

    return groups.flat().sort();
}
