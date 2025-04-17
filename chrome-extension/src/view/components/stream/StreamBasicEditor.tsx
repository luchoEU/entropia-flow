import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStreamAdvanced } from '../../application/actions/stream';
import { getStreamIn } from '../../application/selectors/stream';
import StreamBackgroundChooser from './StreamBackground';
import { useNavigate, useParams } from 'react-router-dom';
import { TabId } from '../../application/state/navigation';

function StreamBasicEditor() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { layoutId } = useParams();
    const { layouts } = useSelector(getStreamIn);
    const c = layouts[layoutId];
    if (!c) return <></>

    return (
        <>
            <section>
                {layoutId && (
                    <h1>Editing Layout - {c.name}
                        <img title='Click to collapse editor' src='img/left.png' onClick={() => navigate(TabId.STREAM)}/>
                        <button title="Click to switch to Advanced Editor where you can edit the layout's templates" className='stream-editor-button' onClick={() => dispatch(setStreamAdvanced(true))}>Basic</button>
                    </h1>
                )}
                <StreamBackgroundChooser layoutId={layoutId} />
            </section>           
        </>
    );
}

export default StreamBasicEditor;
