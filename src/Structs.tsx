//MOVEMENTS COMPOSE WORKOUTS NOT THE OTHER WAY AROUND

export class Movement {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rest: number;
    history: PriorMovement[];

    constructor(name: string, sets: number, reps: number, weight: number, rest: number, history: PriorMovement[]) {
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.weight = weight;
        this.rest = rest;
        this.history = history;
    }

}

export class PriorMovement
{
    date: string;
    reps: number;
    weight: number;

    constructor(date: string, reps: number, weight: number) {
        this.date = date;
        this.reps = reps;
        this.weight = weight;
    }
}

export class Workout {
    name: string;
    movements: Movement[];

    constructor(name: string, movements: Movement[]) {
        this.name = name;
        this.movements = movements
    }
}
