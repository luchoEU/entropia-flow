import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setStreamEnabled } from '../../application/actions/stream';
import { getStreamIn } from '../../application/selectors/stream';
import { StreamStateIn } from '../../application/state/stream';
import StreamLayoutChooser from './StreamChooser';
import Back from '../common/Back';
import StreamAdvancedEditor from './StreamAdvancedEditor';
import StreamBasicEditor from './StreamBasicEditor';
import StreamBackgroundChooser from './StreamBackground';
import { SHOW_STREAM_EDITOR } from '../../../config';
import { TabId } from '../../application/state/navigation';
import { useParams } from 'react-router-dom';
import { DEFAULT_LAYOUT_ID } from '../../application/helpers/stream';

function StreamPage() {
    const dispatch = useDispatch()
    const { layoutId } = useParams()
    const { enabled, advanced }: StreamStateIn = useSelector(getStreamIn);

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
                (advanced && layoutId ? <>
                    <Back text="Back to list" parentPage={TabId.STREAM} />
                    <StreamAdvancedEditor />
                </> : <>
                    <StreamLayoutChooser />
                    { layoutId && <StreamBasicEditor /> }
                </>) : <StreamBackgroundChooser layoutId={DEFAULT_LAYOUT_ID} />
            }
        </>
    )
}

export default StreamPage