import { useState } from 'react'
import './CreateWorkout.css'
import { getDatabase, ref, set, get } from 'firebase/database'
import app from "./firebaseConfig"
import WorkoutCard from './WorkoutCard'
import {useAuth} from './Auth'



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

  const { userId } = useAuth();
  const [workoutName, setWorkoutName] = useState("");
  const [inputValue, setInputValue] = useState("enter a unique workout name");
  const [mode, setMode] = useState(false);
  const [available, setAvailable] = useState(true);
  const [movements, setMovements] = useState<Array<Movement | Rest>>([]);
  const [movementName, setMovementName] = useState("movement name..");
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState("0.0");
  const [intersetCooldown, setIntersetCooldown] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const uploadWorkout = async () => {
    if (!userId) 
    {
      alert('Please sign in first')
      return;
    }

    const db = getDatabase(app);
    const workoutsRef = ref(db, `${userId}/workouts/` + workoutName);
    const snapshot = await get(workoutsRef);
    if (snapshot.exists())
    {
      setAvailable(false);
      return;
    }
    await set(workoutsRef, {
      movements: movements,
      createdAt: Date.now()
    });
    alert("Workout uploaded!");
  };


  function removeMovement(index: number) 
  {
    setMovements(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      {/* Workout Name */}
      {!mode && (
        <div className='workoutName'>
          <input 
            value={inputValue}
            className="workoutKeyInput"
            onChange={e => setInputValue(e.target.value)}
          />
          <br></br>
          <br></br>
          <button onClick={() =>{
            setWorkoutName(inputValue)
            setMode(true);
          }}>submit</button>

          {!available && <p>Key already exists try again</p>}
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
          <p>rest:</p><input value={cooldown} onChange={e => setCooldown(Number(e.target.value))}></input>
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


        {/* Movement Cards */}
        {movements.map((movement, index) => (
          <div className='movement-card'>
            {/* <button className='move-button'>☰</button>*/}
              <WorkoutCard key={index} data={movement} />
            <button className='remove-button' onClick={() => removeMovement(index)}>X</button>
          </div>
        ))}
      
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