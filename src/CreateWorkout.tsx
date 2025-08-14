import { useState } from 'react'
import './CreateWorkout.css'
import { getDatabase, ref, set } from 'firebase/database'
import app from "./firebaseConfig"
import WorkoutCard from './WorkoutCard'



function CreateWorkout() {
  type Movement = {
    name: string,
    sets: number,
    reps: number,
    weight: number,
    rest: Rest,
  }
  type Rest = {
    time : number
  }

  const [workoutName, setWorkoutName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState(false);


  const [movements, setMovements] = useState<Array<Movement | Rest>>([]);
  const [movementName, setMovementName] = useState("movement name..");
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState("0.0");
  const [intersetCooldown, setIntersetCooldown] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const uploadWorkout = async () => {
    const db = getDatabase(app);
    const workoutsRef = ref(db, 'workouts/' + workoutName);

    await set(workoutsRef, {
      name: workoutName,
      movements: movements,
      createdAt: Date.now()
    });
    alert("Workout uploaded!");
  };

  return (
    <>
      {/* Workout Name */}
      {!mode && (
        <div className='workoutName'>
          <h1>Workout Name:</h1>
          <input 
            placeholder='name'
            value={inputValue}
            id={"workout-name"}
            onChange={e => setInputValue(e.target.value)}
          />
          <br></br>
          <br></br>
          <button onClick={() =>{
            setWorkoutName(inputValue)
            setMode(true);
          }}>Submit</button>
        </div>
      )}

      {/* Form */}
      {mode && (
      <div className='form'>
          <div className='pseudoCard'>
            <input value={movementName} onChange={e => setMovementName(e.target.value)}></input>
            <br></br>
            <p>sets:</p><input value={sets} onChange={e => setSets(Number(e.target.value))}></input>
            <br></br>
            <p>reps:</p><input value={reps} onChange={e => setReps(Number(e.target.value))}></input>
            <br></br>
            <p>weight:</p><input value={weight} onChange={e => setWeight(e.target.value)}></input>
            <br></br>
            <p>rest (in seconds):</p><input value={cooldown} onChange={e => setCooldown(Number(e.target.value))}></input>
            <br></br>
          </div>
        


        {/* Add Movement Button */}
        <button onClick={() =>{
          const newRest : Rest = {time: cooldown};
          const newMovement: Movement = {
            name: movementName,
            sets: sets,
            reps: reps,
            weight: parseFloat(weight) || 0,
            rest: newRest
          };
          setMovements(prev => [...prev, newMovement]);
          //setMovementName("movement name...");
          //setSets(0);
          //setReps(0);
          //setWeight("");
        }}>Add Movement</button>

        {mode && (
          <div className='pseudoCard'>
            <p>rest (in seconds):</p><input value={intersetCooldown} onChange={e => setIntersetCooldown(Number(e.target.value))}></input>
            <br></br>
          </div>
        )}

<br></br>
<br></br>

        {/* Add Rest Button */}
          <button onClick={() => {
            const newRest: Rest = {
              time: intersetCooldown
            };
            setMovements(prev => [...prev, newRest]);
          }}>Add Cooldown</button>


      <div>
        {/* Movement Cards */}
        {movements.map((movement, index) => (
          <WorkoutCard key={index} data={movement} />
        ))}
      </div>
      
      <br>
      </br>
      {/* Upload Button */}
      <button onClick={uploadWorkout}>UPLOAD!</button>

    </div>
    )}
    </>
  )
}

export default CreateWorkout