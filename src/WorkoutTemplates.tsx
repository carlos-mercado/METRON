// componenets
//import TemplateCard from './TemplateCard.tsx'

// styles
import './styles/WorkoutTemplates.css'

//assets


/*
type WorkoutTemplates = {
    [split: string]: {
        [day: string]: Array<{
            label: string;
            sets: number;
        }>;
    };
}; */

function Templates()
{
    //var workoutIDX = 0;
    //const templates_data: WorkoutTemplates = data;

    /*
    function getWorkout(split: string) {
        let workout_split = templates_data[split];
        const days = Object.values(workout_split);
        return days[workoutIDX];
    }

    function getWorkoutLabel(split: string) {
        const splitData = templates_data[split];
        const days = Object.keys(splitData);
        return days[workoutIDX];
    }*/

    return (
        <div className='templatesContainer'>
            <p>Templates</p>
            <div className='Templates'>
                <button className='flippableCard'>
                    Push Pull Legs
                </button>
                <button className='flippableCard'>
                    Upper Lower
                </button>
                <button className='flippableCard'>
                    Full Body
                </button>
                <button className='flippableCard'>
                    Arnold
                </button>

            </div>
        </div>
    );
}

export default Templates;
