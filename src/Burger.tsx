import DraggablePreviewCard from './DraggablePreviewCard';
import { Workout, Movement } from './Structs'
import './styles/Burger.css'
import { useState } from 'react';
import type { DragEvent } from 'react';

interface BurgerProps {
    workout : Workout
    updateCallback : any
}

function Burger({workout, updateCallback} : BurgerProps) {
    const [movements, setMovements]  = useState<Movement[]>(workout.movements);

    const handleDragStart = (event: DragEvent<HTMLDivElement>, draggedIndex: number) => {
        event.dataTransfer.setData('text/plain', draggedIndex.toString());
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
        event.preventDefault();

        const draggedIndex = Number(event.dataTransfer.getData('text/plain'));

        if (Number.isNaN(draggedIndex) || draggedIndex === targetIndex) {
            return;
        }

        setMovements((currentMovements) => {
            if (draggedIndex < 0 || draggedIndex >= currentMovements.length) {
                return currentMovements;
            }

            const reordered = [...currentMovements];
            const [draggedMovement] = reordered.splice(draggedIndex, 1);
            reordered.splice(targetIndex, 0, draggedMovement);

            updateCallback(reordered);
            return reordered;
        });
    };

    const handleDragEnd = (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.clearData();
    };

    return (
        <>
            <p>Drag and Drop</p>
            { movements.map((movement, index) => (
                <DraggablePreviewCard
                    key={`${movement.name}-${index}`}
                    movement={movement}
                    onDragStart={(event : DragEvent<HTMLDivElement>) => handleDragStart(event, index)}
                    onDragOver={handleDragOver}
                    onDrop={(event : DragEvent<HTMLDivElement>) => handleDrop(event, index)}
                    onDragEnd={handleDragEnd}
                />
            ))}
        </>
    )

}

export default Burger;
