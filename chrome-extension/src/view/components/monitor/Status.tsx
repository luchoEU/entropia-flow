import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Status } from '../../../common/state'
import { setHistoryExpanded } from '../../application/actions/history';
import { refresh, timerOff, timerOn } from '../../application/actions/messages';
import { getHistory } from '../../application/selectors/history';
import { getStatus } from '../../application/selectors/status';
import { HistoryState } from '../../application/state/history';

const Status = ({ minutes = 0, seconds = 0 }) => {
    const dispatch = useDispatch()
    const history: HistoryState = useSelector(getHistory)
    const { className, message, showTimer, showLoading, isMonitoring } = useSelector(getStatus);

    if (isMonitoring) {
        return (
            <section>
                {showTimer ?
                    <img src='img/reload.png'
                        className='img-refresh'
                        onClick={() => dispatch(refresh)} />
                    : ''
                }
                {showLoading ?
                    <img src='img/loading.gif'
                        className='img-refresh' />
                    : ''
                }
                {history.hiddenError ?
                    <img src='img/error.png'
                        className='img-refresh'
                        onClick={() => dispatch(setHistoryExpanded(true))}
                        title={history.hiddenError} />
                    : ''
                }
                <span className={className}>{message}</span>
                <button className="button-timer stop" onClick={() => dispatch(timerOff)}>
                    Stop Monitoring
                </button>
            </section>
        )
    } else {
        return (
            <section>
                <button className="button-timer start" onClick={() => dispatch(timerOn)}>
                    Start Monitoring
                </button>
            </section>
        )
    }
}

export default Status