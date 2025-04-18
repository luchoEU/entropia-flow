import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setStreamEnabled } from '../../application/actions/stream';
import { getStreamEnabled, getStreamIn } from '../../application/selectors/stream';
import { StreamStateIn } from '../../application/state/stream';
import StreamLayoutChooser from './StreamChooser';
import Back from '../common/Back';
import StreamBackgroundChooser from './StreamBackground';
import { SHOW_STREAM_EDITOR } from '../../../config';
import { TabId } from '../../application/state/navigation';
import { useParams } from 'react-router-dom';
import { DEFAULT_LAYOUT_ID } from '../../application/helpers/stream';
import { createSelector } from '@reduxjs/toolkit';
import StreamEditor from './StreamEditor';

function StreamPage() {
    const dispatch = useDispatch()
    const { layoutId } = useParams()
    const enabled = useSelector(getStreamEnabled)

    const [invisible, setInvisible] = useState(true);
    useEffect(() => {
        const timeout = setTimeout(() => { setInvisible(false); }, 100); // let it calculate stream layout sizes
        return () => clearTimeout(timeout);
    }, [enabled]);

    return (
        <div className={invisible ? 'app-invisible' : ''}>
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
            { SHOW_STREAM_EDITOR ?
                (layoutId ? <>
                    <Back text="Back to list" parentPage={TabId.STREAM} />
                    <StreamEditor />
                </> : <>
                    <StreamLayoutChooser />
                </>) : <StreamBackgroundChooser layoutId={DEFAULT_LAYOUT_ID} />
            }
        </div>
    )
}

export default StreamPage