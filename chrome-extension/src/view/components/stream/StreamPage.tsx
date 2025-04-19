import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import StreamLayoutChooser from './StreamChooser';
import StreamBackgroundChooser from './StreamBackground';
import { useParams } from 'react-router-dom';
import { DEFAULT_LAYOUT_ID } from '../../application/helpers/stream';
import StreamEditor from './StreamEditor';
import { Feature } from '../../application/state/settings';
import { selectIsFeatureEnabled } from '../../application/selectors/settings';

function StreamPage() {
    const { layoutId } = useParams()
    const showEditor = useSelector(selectIsFeatureEnabled(Feature.streamEditor))

    const [invisible, setInvisible] = useState(true);
    useEffect(() => {
        const timeout = setTimeout(() => { setInvisible(false); }, 100); // let it calculate stream layout sizes
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className={invisible ? 'app-invisible' : ''}>
            { showEditor ?
                (layoutId ? <StreamEditor layoutId={layoutId} /> : <StreamLayoutChooser />) :
                <StreamBackgroundChooser layoutId={DEFAULT_LAYOUT_ID} />
            }
        </div>
    )
}

export default StreamPage
