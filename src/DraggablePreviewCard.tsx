import type { HTMLAttributes } from "react";
import { Movement } from "./Structs";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
    movement: Movement;
}

function DraggablePreviewCard({ movement, ...dragProps } : CardProps) {
    return (
        <div
            className='horiz-card'
            id={movement.name}
            draggable
            {...dragProps}
        >
            <p>{movement.name}</p>
            <p>{movement.sets} Sets</p>
            <p>{movement.reps} Reps</p>
            <p>{movement.weight} lbs</p>
        </div>
    )
}

export default DraggablePreviewCard;
