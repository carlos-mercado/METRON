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

export class Split {
    name: string;
    sessions: Workout[];

    constructor(name: string, sessions: Workout[]) {
        this.name = name;
        this.sessions = sessions
    }
}

const dummy_prior_movement = new PriorMovement(Date.now().toString(), 0, 0);
// PUSH PULL LEGS
const PushDay = new Workout("Push", [
    new Movement("Bench Press", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Shoulder Press", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Chest Fly", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Lateral Riase", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Triceps Extension", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Triceps Pushdown", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Cable Crunch", 0, 0, 0, 0, [dummy_prior_movement])]
);
const PullDay = new Workout("Pull", [
    new Movement("Pull Up", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Barbell Row", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Face Pull", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Bicep Curl", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Hammer Curl", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Rear Delt Fly", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Back Extension", 0, 0, 0, 0, [dummy_prior_movement])]
);
const LegDay = new Workout("Legs", [
    new Movement("Squat", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Leg Press", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Leg Extension", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Leg Curl", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Calf Raise", 0, 0, 0, 0, [dummy_prior_movement])]
);

// FULL BODY
const FullBodySession = new Workout("FB", [
    new Movement("Triceps Pushdown", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Bicep Curl", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Calf Raise", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Seated Leg Curl", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Cest Fly", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Shoulder Press", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Kelso Shrug", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Leg Extension", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Hip Thrust", 0, 0, 0, 0, [dummy_prior_movement])]
);

// UPPER LOWER
const Lower = new Workout("Lower", [
    new Movement("Calf Raise", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Hip Adductors", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Hack Squat", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("RDL", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Seated Leg Curl", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Leg Extension", 0, 0, 0, 0, [dummy_prior_movement])]
);
const Upper = new Workout("Upper", [
    new Movement("Low Row", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Lat Pulldown", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Chest Fly", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Chest Press", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Shoulder Press", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Tricep Extension", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Lateral Raise", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Bicep Curl", 0, 0, 0, 0, [dummy_prior_movement])]
);

//ARNOLD
const ChestBack = new Workout("Chest and Back", [
    new Movement("Incline DB Press", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Chest Fly", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Machine Row", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Lat Pulldown", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Cable Row", 0, 0, 0, 0, [dummy_prior_movement])
]);
const ShouldersArms = new Workout("Shoulder and Arms", [
    new Movement("Cable Lat Raise", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Shoulder Press", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Tricep Extension", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Preacher Curl", 0, 0, 0, 0, [dummy_prior_movement])
]);
const ArnoldLegs = new Workout("Legs", [
    new Movement("Leg Extension", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Hack Squat", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Leg Curl", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("RDL", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Adductor", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Hip Thrust", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Calf Raise", 0, 0, 0, 0, [dummy_prior_movement]),
    new Movement("Cable Crunch", 0, 0, 0, 0, [dummy_prior_movement])
]);

export const Splits: { [name: string]: Split } = {
    PushPullLegs: new Split("Push Pull Legs", [PushDay, PullDay, LegDay]),
    FullBody: new Split("Full Body", [FullBodySession]),
    UpperLower: new Split("Upper Lower", [Upper, Lower]),
    ArnoldSplit: new Split("Arnold", [ChestBack, ShouldersArms, ArnoldLegs])
};
