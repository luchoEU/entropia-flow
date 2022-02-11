import React from 'react'
import { useSelector } from 'react-redux';
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status';
import useScript from '../hooks/useScript';
import CSS from 'csstype';

function StreamView() {
    const { delta, deltaClass, deltaWord } = useSelector(getLast)
    const { message } = useSelector(getStatus);    
    useScript('effect/ashfall/main.js')

    const streamStyles: CSS.Properties = {
        color: 'white',
    }

    return (
        <section>
            <div id="stream" className='stream-view' style={streamStyles}>
                <div className='stream-frame'>
                    <img className='stream-logo' src='img/flow128w.png'></img>
                    <div className='stream-title'>Entropia Flow</div>
                    <div className='stream-subtitle'>Chrome Extension</div>
                    <div className={`stream-difference difference ${deltaClass}`}>{delta} PED {deltaWord}</div>
                    <div className='stream-message'>{message}</div>
                </div>
            </div>
        </section>
    )
}

export default StreamView