import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import WorkoutCard from './MovementSelect'
import { PriorMovement } from './Structs';

import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

function Stats() 
{
    const navigate = useNavigate();
    const [data, setData] = useState<PriorMovement[]>();

    function loadCallback(given_data: any)
    {
        setData(given_data)

    }

    return (
        <>
            {!data && (
                <div className="mainContent" style={{ flexDirection: 'column' }}>
                    <WorkoutCard loadCallback={loadCallback}/>
                </div>)
            }

            {data && (
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis 
                        dataKey="date" 
                        tickFormatter={date => {
                        const d = new Date(Number(date));
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} 
                        />
                        <YAxis yAxisId="left" label={{ value: 'Reps', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Weight', angle: 90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="right" dataKey="weight" barSize={20} fill="#413ea0" name="Weight" />
                        <Line yAxisId="left" type="monotone" dataKey="reps" stroke="#ff7300" name="reps" />
                    </ComposedChart>
                </ResponsiveContainer>
            )}
            <button onClick={() => navigate('/')}>Back</button>
        </>
    );
}

export default Stats;
