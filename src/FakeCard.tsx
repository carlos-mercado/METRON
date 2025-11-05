import './FakeCard.css';
import DataContainer from './DataContainer.tsx'
import {useEffect, useState} from 'react';


type Movement = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest: Rest;
};

type Rest = {
  time: number;
};

type CardProps = {
    data: Movement | Rest;
    callback: Function;
};


function FakeCard({ data, callback }: CardProps) {

    const [movementData, setMovementData] = useState<Movement | Rest>(data);

    //console.log(movementData);

    useEffect(() => {
        setMovementData(data);
    }, [data])


    function updateMovementInfo(section : string, newData : number)
    {
        if(!("name" in movementData))
            return;

        if(section == "sets")
        {
            setMovementData({
                name: movementData.name,
                sets: newData,
                reps: movementData.reps,
                weight: movementData.weight,
                rest: movementData.rest
            })

            callback({
                name: movementData.name,
                reps: movementData.reps,
                rest: movementData.rest,
                sets: newData,
                weight: movementData.weight,
            });

        }
        else if (section == "reps")
        {
            setMovementData({
                name: movementData.name,
                sets: movementData.sets,
                reps: newData,
                weight: movementData.weight,
                rest: movementData.rest
            })
            callback({
                name: movementData.name,
                reps: newData,
                rest: movementData.rest,
                sets: movementData.sets,
                weight: movementData.weight,
            })
        }
        else if (section == "weight")
        {
            setMovementData({
                name: movementData.name,
                sets: movementData.sets,
                reps: movementData.reps,
                weight: newData,
                rest: movementData.rest
            })

            callback({
                name: movementData.name,
                reps: movementData.reps,
                rest: movementData.rest,
                sets: movementData.sets,
                weight: newData,
            })

        }
        else if (section == "rest")
        {
            setMovementData({
                name: movementData.name,
                sets: movementData.sets,
                reps: newData,
                weight: movementData.weight,
                rest: movementData.rest
            })

            callback({
                name: movementData.name,
                reps: movementData.reps,
                rest: { time : newData },
                sets: movementData.sets,
                weight: movementData.weight
            })
        }
        else
        {
            console.log("there is no hope")
            return;
        }
    }



    return (
        <div className="workoutCard">
            {"name" in movementData ? (
                <>
                    <h2>{movementData.name}</h2>
                    <p>Sets:</p> 
                    <DataContainer 
                        data={movementData.sets} 
                        label={"sets"}
                        callback={updateMovementInfo}
                    />
                    <br></br> <br></br>
                    <p>Reps:</p> 
                    <DataContainer 
                        data={movementData.reps} 
                        label={"reps"}
                        callback={updateMovementInfo}
                    />
                    <br></br> <br></br>
                    <p>Weight:</p> 
                    <DataContainer 
                        data={movementData.weight} 
                        label={"weight"} 
                        callback={updateMovementInfo}
                    />
                    <br></br> <br></br>
                    <p>Rest:</p> 
                    <DataContainer 
                        data={movementData.rest.time} 
                        label={"rest"} 
                        callback={updateMovementInfo}
                    />
                </>
            ) : (
                // Render Rest details
                <>
                    <h2>Rest</h2>
                    <p>Time: {movementData.time}s</p>
                </>
            )}
        </div>
    );
}

export default FakeCard;

