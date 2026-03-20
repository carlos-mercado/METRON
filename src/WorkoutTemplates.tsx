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
                <div className='flippableCard'>
                    <h3>Push Pull Legs</h3>
                </div>
                <div className='flippableCard'>
                    <h3>Upper Lower</h3>
                </div>
                <div className='flippableCard'>
                    <h3>Full Body</h3>
                </div>
                <div className='flippableCard'>
                    <h3>Arnold</h3>
                </div>

            </div>
        </div>
    );
}

export default Templates;
