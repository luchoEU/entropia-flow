import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setStreamEnabled } from '../../application/actions/stream';
import { getStreamEnabled } from '../../application/selectors/stream';
import StreamLayoutChooser from './StreamChooser';
import StreamBackgroundChooser from './StreamBackground';
import { useParams } from 'react-router-dom';
import { DEFAULT_LAYOUT_ID } from '../../application/helpers/stream';
import StreamEditor from './StreamEditor';
import { Feature } from '../../application/state/settings';
import { selectIsFeatureEnabled } from '../../application/selectors/settings';

function EnableIt() {
    const dispatch = useDispatch()
    const enabled = useSelector(getStreamEnabled)

    return (
        <section>
            <h1>Enable it</h1>
            <label className='checkbox'>
                <input type="checkbox"
                    defaultChecked={enabled}
                    onChange={() => dispatch(setStreamEnabled(!enabled))}
                />
                Show Stream View in every page
            </label>
        </section>
    )
}

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
                (layoutId ?
                    <StreamEditor /> :
                    <><EnableIt /><StreamLayoutChooser /></>) :
                <><EnableIt /><StreamBackgroundChooser layoutId={DEFAULT_LAYOUT_ID} /></>
            }
        </div>
    )
}

export default StreamPage
