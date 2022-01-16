import React from 'react'
import { useSelector } from 'react-redux';
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status';

function StreamView() {
    const { delta, deltaClass, deltaWord } = useSelector(getLast)
    const { message } = useSelector(getStatus);    

    return (
        <section>
            <h1>Stream View</h1>
            <div className='stream-view'>
                <div className='stream-frame'>
                    <img className='stream-logo' src='img/flow128.png'></img>
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