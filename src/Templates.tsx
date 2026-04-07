// componenets
import SplitExpand from './SplitExpand.tsx'

// styles
import './styles/WorkoutTemplates.css'

// types
import { Splits, Split  } from './Structs.tsx';
import { useEffect, useState } from 'react';

function Templates()
{
    const [templates, setTemplates] = useState<Split[]>([]);
    const [splitSelected, setSplitSelected] = useState<Split | null>(null);

    useEffect(() => { setTemplates(
        [ Splits.PushPullLegs, 
          Splits.FullBody, 
          Splits.UpperLower, 
          Splits.ArnoldSplit ]
    )}, [])

    return (
        <div className='templatesContainer'>
            {splitSelected === null && <p>Templates</p>}
            {splitSelected === null && 
                <div className='Templates'>
                    {templates.map((split, _) => 
                        <button className='flippableCard' onClick={() => { setSplitSelected(split)}}>{split.name}</button>
                    )}
                </div>
            }
            {splitSelected != null && <SplitExpand split={splitSelected} onBack={() => setSplitSelected(null)}/> }
        </div>
    );
}

export default Templates;
