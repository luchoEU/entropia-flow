import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStreamAdvanced, setStreamEditing } from '../../application/actions/stream';
import { getStreamIn } from '../../application/selectors/stream';
import StreamBackgroundChooser from './StreamBackground';

function StreamBasicEditor() {
    const dispatch = useDispatch();
    const { layouts, editing } = useSelector(getStreamIn);
    const c = layouts[editing?.layoutId];

    return (
        <>
            <section>
                {editing?.layoutId && (
                    <h1>Editing Layout - {c.name}
                        <img title='Click to collapse editor' src='img/left.png' onClick={() => dispatch(setStreamEditing(undefined))}/>
                        <button title="Click to switch to Advanced Editor where you can edit the layout's templates" className='stream-editor-button' onClick={() => dispatch(setStreamAdvanced(true))}>Basic</button>
                    </h1>
                )}
                <StreamBackgroundChooser />
            </section>           
        </>
    );
}

export default StreamBasicEditor;