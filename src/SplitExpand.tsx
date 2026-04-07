import { Split, Movement } from './Structs';
import { useAuth } from './Auth'
import './styles/SplitExpand.css';

interface SplitExpandProps {
    split: Split;
    onBack: () => void;
}

function SplitExpand({ split, onBack }: SplitExpandProps) {

    const { userId } = useAuth();

    function add_session(sesh : Movement[], sesh_name : string) {
        const request_body = {
            id: userId,
            [sesh_name] : sesh
        }

        const body_ready = JSON.stringify(request_body);
        console.log(body_ready)

        fetch('https://metron-api.duckdns.org/workouts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body_ready,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload workout');
            }
            return response.json();
        })
        .then(data => { 
            alert(sesh_name + " added to library")
            console.log('Success:', data);
        })
        .catch(error => { console.error('Error:', error); });
    }


    return (
        <div className="splitExpand">
            <h2 className="splitExpand-title">{split.name}</h2>
            <div className="splitExpand-sessions">
                {split.sessions.map((session, i) => (
                    <div className="splitExpand-card" key={i}>
                        <h3 className="splitExpand-card-header">{session.name}</h3>
                        <ul className="splitExpand-movements">
                            {session.movements.map((movement, j) => (
                                <li className="splitExpand-movement" key={j}>
                                    <span className="splitExpand-movementIndex">{j + 1}.</span>
                                    <span className="splitExpand-movementName">{movement.name}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => add_session(session.movements, session.name)}>+</button>
                    </div>
                ))}
            </div>
            <button className="splitExpand-back" onClick={onBack}>Back</button>
        </div>
    );
}

export default SplitExpand;
