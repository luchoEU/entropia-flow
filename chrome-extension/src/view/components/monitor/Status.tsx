import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Status } from '../../../common/state'
import { setHistoryExpanded } from '../../application/actions/history';
import { refresh, timerOff, timerOn } from '../../application/actions/messages';
import { getHistory } from '../../application/selectors/history';
import { getStatus } from '../../application/selectors/status';
import { HistoryState } from '../../application/state/history';
import { STRING_PLEASE_LOG_IN } from '../../../common/const';

const Status = () => {
    const dispatch = useDispatch()
    const history: HistoryState = useSelector(getHistory)
    const { className, message, showTimer, showLoading, isMonitoring } = useSelector(getStatus);

    return (
        <section>
            { showTimer &&
                <img src='img/reload.png'
                    className='img-refresh'
                    onClick={() => dispatch(refresh)} />
            }
            { showLoading &&
                <img src='img/loading.gif'
                    className='img-refresh' />
            }
            { history.hiddenError &&
                <img src='img/error.png'
                    className='img-refresh'
                    onClick={() => dispatch(setHistoryExpanded(true))}
                    title={history.hiddenError} />
            }
            <span className={className}>
                {message === STRING_PLEASE_LOG_IN ?
                    <a href="https://account.entropiauniverse.com/account/my-account/my-items/" target="_blank">{message}</a>
                    : message
                }
            </span>
            {isMonitoring ?
                <button className="button-timer stop" onClick={() => dispatch(timerOff)}>
                    Stop Automatic Refresh
                </button> :
                <button className="button-timer start" onClick={() => dispatch(timerOn)}>
                    Start Automatic Refresh
                </button>
            }
        </section>
    )
}

export default Status