import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setStreamEditing, setStreamEnabled } from '../../application/actions/stream';
import { getStreamIn } from '../../application/selectors/stream';
import { StreamStateIn } from '../../application/state/stream';
import StreamEditor from './StreamEditor';
import StreamChooser from './StreamChooser';
import Back from '../common/Back';

function StreamPage() {
    const dispatch = useDispatch()
    const { enabled, editing }: StreamStateIn = useSelector(getStreamIn);

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
            { enabled && (editing ? <>
                    <Back text="Back to list" dispatch={() => setStreamEditing(undefined)} />
                    <StreamEditor />
                </> : <StreamChooser />) }
        </>
    )
}

export default StreamPage