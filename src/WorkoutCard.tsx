import './WorkoutCard.css';

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
};

function WorkoutCard({ data }: CardProps) {
  return (
    <div className="workoutCard">
      {"name" in data ? (
        // Render Movement details
        <>
          <h2>{data.name}</h2>
          <p>Sets: {data.sets}</p>
          <p>Reps: {data.reps}</p>
          <p>Weight: {data.weight} lbs</p>
          <p>Rest: {data.rest.time}s</p>
        </>
      ) : (
        // Render Rest details
        <>
          <h2>Rest</h2>
          <p>Time: {data.time}s</p>
        </>
      )}
    </div>
  );
}

export default WorkoutCard;
