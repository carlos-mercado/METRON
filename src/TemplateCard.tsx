//import {useState} from 'react';
import './styles/TemplateCard.css'

interface Movement {
  label: string;
  sets: number;
}

interface TemplateCardProps {
  workout_name: string;
  movements: Movement[];
}

function TemplateCard({ workout_name, movements }: TemplateCardProps) {
    return (
        <div className="templateCard">
            <h1>{workout_name}</h1>
            <div>
                {movements.map((entry) => 
                    <p key={entry.label}> 
                        {entry.label} {entry.sets}x
                    </p>
                )}

            </div>
        </div>
    );
}

export default TemplateCard;
