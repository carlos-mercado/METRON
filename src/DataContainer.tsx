import { useEffect, useState, type CSSProperties} from 'react'

interface Props
{
    data: number;
    label: string;
    callback: Function;
}

const containerStyles : CSSProperties = {
    display: "inline",
    overflow: "hidden",
    borderRadius: "5px",
    backgroundColor: "#4b8348",
    border: "2px solid #4b8348",
    margin: "0",
    padding: "0",
}

const buttonUp : CSSProperties= {
    backgroundColor: "#4b8348",
    borderRadius: "0px",
    borderTopRightRadius: "5px",
    borderBottomRightRadius: "5px",
    border: "0",
    color: "white",
}

const buttonDown : CSSProperties = {
    backgroundColor: "#4b8348",
    boxShadow: "none",
    borderRadius: "0px",
    borderTopLeftRadius: "5px",
    borderBottomLeftRadius: "5px",
    border: "0",
    color: "white",
}

const pTag : CSSProperties = 
{
    paddingLeft: "8px",
    paddingRight: "8px",
    backgroundColor: "#4b8348",
}

function DataContainer({data, label, callback} : Props) {
    const [currData, setCurrData] = useState(data);
    const setsIncrementor = 1;
    const repsIncrementor = 0.5;
    const weightIncrementor = 2.5;
    const restIncrementor = 15;

    useEffect(() => {
        console.log("data change detected")
        setCurrData(data);
    }, [data]);

    function updateData(isUp : boolean)
    {
        var inc = 0;

        if(label === "sets")
            inc = setsIncrementor;
        else if(label === "reps")
            inc = repsIncrementor;
        else if(label === "weight")
            inc = weightIncrementor;
        else if(label === "rest")
            inc = restIncrementor;

        if(!isUp)
            inc = inc * -1;

        setCurrData(prev => {
            const newValue = prev + inc;
            callback(label, newValue);
            return newValue;
        });


    }

    function incUp() { return updateData(true) }
    function incDown() { return updateData(false) }


    return (
        <div style={containerStyles}>
            <button 
                style={buttonDown} 
                className="buttonDown"
                onClick={incDown}
            >
                -
            </button>

            <p style={pTag}>{currData}</p>

            <button
                style={buttonUp} 
                className="buttonUp"
                onClick={incUp}
            >
                +
            </button>
        </div>
    );
}

export default DataContainer;
