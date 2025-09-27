import './ModifiableCard.css';
import { useState, useEffect } from 'react'

type Movement = {
    name: string;
    sets: string;
    reps: string;
    weight: string;
    rest: { time: string };
};

type Rest = {
    time: string;
};

interface Props {
    data : Movement | Rest;
    callback: Function;
}


function ModifiableCard({data, callback} : Props) 
{ 
    const [currMovement, setCurrMovement] = useState<Movement | Rest>();

    useEffect(() => {
        setCurrMovement(data);
    }, [data])

    useEffect(() => {
        if (!currMovement) return;
        const timeout = setTimeout(() => {
            callback(currMovement);
        }, 300); // 300ms debounce
        return () => clearTimeout(timeout);
    }, [currMovement]);

    if(!currMovement)
        return <p>Error</p>;

    return (
        <div className='modCard'>
            {"name" in currMovement ? (
            <>
                <input value={currMovement.name} onChange={e => {
                    setCurrMovement({ ...currMovement, name: e.target.value });
                }}/>
                <br/>
                <p>sets: </p><input value={currMovement.sets} onChange={e => {
                    setCurrMovement({ ...currMovement, sets: e.target.value });
                }} />
                <br/>
                <p>reps: </p><input value={currMovement.reps} onChange={e => {
                    setCurrMovement({ ...currMovement, reps: e.target.value });
                }} />
                <br/>
                <p>weight: </p><input value={currMovement.weight} onChange={e => {
                    setCurrMovement({ ...currMovement, weight: e.target.value });
                }} />
                <br/>
                <p>rest: </p><input value={currMovement.rest.time} onChange={e => {
                    setCurrMovement({
                        ...currMovement,
                        rest: { ...currMovement.rest, time: e.target.value }
                    });
                }} />
            </>
            ) : (
            <>
                <h1 style={{ color: "#e9bb43" }}>REST</h1>
                <input value={currMovement.time} onChange={e => setCurrMovement({...currMovement, time: e.target.value})} />
            </>
            )}
        </div>
    )

}


export default ModifiableCard;