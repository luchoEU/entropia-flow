import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setStreamEditing, setStreamEnabled } from '../../application/actions/stream';
import { getStreamIn } from '../../application/selectors/stream';
import { StreamStateIn } from '../../application/state/stream';
import StreamLayoutChooser from './StreamChooser';
import Back from '../common/Back';
import StreamAdvancedEditor from './StreamAdvancedEditor';
import StreamBasicEditor from './StreamBasicEditor';
import StreamBackgroundChooser from './StreamBackground';
import { SHOW_STREAM_EDITOR } from '../../../config';

function StreamPage() {
    const dispatch = useDispatch()
    const { enabled, layouts, editing, advanced }: StreamStateIn = useSelector(getStreamIn);
    const c = layouts[editing?.layoutId];

    return (
        <>
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
                (advanced && editing?.layoutId ? <>
                    <Back text="Back to list" dispatch={() => setStreamEditing(undefined)} />
                    <StreamAdvancedEditor />
                </> : <>
                    <StreamLayoutChooser />
                    { editing?.layoutId && <StreamBasicEditor /> }
                </>) : <StreamBackgroundChooser />
            }
        </>
    )
}

export default StreamPage