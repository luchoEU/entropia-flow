import React from 'react'
import { useSelector } from 'react-redux';
import { getIcon } from '../../application/helpers/stream';
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status';
import { getStream } from '../../application/selectors/stream';
import { StreamState } from '../../application/state/stream';
import useBackground from '../hooks/UseBackground';

function StreamView() {
    const { enabled } = useSelector(getStream);
    const { delta, deltaClass, deltaWord } = useSelector(getLast)
    const { message } = useSelector(getStatus);
    const { background }: StreamState = useSelector(getStream);
    useBackground(background.selected, 'stream', [ background.selected, enabled ])

    if (enabled)
        return (
            <section>
                <div id="stream" className='stream-view'>
                    <div className='stream-frame'>
                        <img className='stream-logo' src={getIcon(background.selected)}></img>
                        <div className='stream-title'>Entropia Flow</div>
                        <div className='stream-subtitle'>Chrome Extension</div>
                        <div className={`stream-difference difference ${deltaClass}`}>{delta} PED {deltaWord}</div>
                        <div className='stream-message'>{message}</div>
                    </div>
                </div>
            </section>
        )
    else
        return <></>
}

export default StreamView