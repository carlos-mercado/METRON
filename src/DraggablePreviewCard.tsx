import type { HTMLAttributes } from "react";
import { Movement } from "./Structs";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
    movement: Movement;
}

function DraggablePreviewCard({ movement, ...dragProps } : CardProps) {
    return (
        <>
            <div
                className='horiz-card'
                id={movement.name}
                draggable
                {...dragProps}
            >
                <p>{movement.name}</p>
                <p>{movement.sets}</p>
                <p>{movement.reps}</p>
                <p>{movement.weight}</p>
            </div>
        </>

    )
}

export default DraggablePreviewCard;
