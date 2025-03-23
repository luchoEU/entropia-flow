import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Status } from '../../../common/state'
import { setHistoryExpanded } from '../../application/actions/history';
import { refresh, timerOff, timerOn } from '../../application/actions/messages';
import { getHistory } from '../../application/selectors/history';
import { getStatus } from '../../application/selectors/status';
import { HistoryState } from '../../application/state/history';
import { STRING_PLEASE_LOG_IN } from '../../../common/const';
import ImgButton from '../common/ImgButton';
import ExpandableSection from '../common/ExpandableSection2';

const MY_ITEMS_URL = 'https://account.entropiauniverse.com/account/my-account/my-items/'

const Status = () => {
    const dispatch = useDispatch()
    const history: HistoryState = useSelector(getHistory)
    const { class: className, message, showTimer, showLoading, isMonitoring } = useSelector(getStatus);

    return (
        <ExpandableSection selector='MonitorStatus' title='Entropia Universe Items'>
            { showTimer &&
                <ImgButton
                    title='Refresh'
                    src='img/reload.png'
                    className='img-refresh'
                    dispatch={() => refresh} />
            }
            { showLoading &&
                <img src='img/loading.gif'
                    className='img-refresh' />
            }
            { history.hiddenError &&
                <ImgButton
                    title={history.hiddenError}
                    src='img/error.png'
                    className='img-refresh'
                    dispatch={() => setHistoryExpanded(true)} />
            }
            <span className={className}>
                {message === STRING_PLEASE_LOG_IN ?
                    <a href={MY_ITEMS_URL} target="_blank">{message}</a>
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
        </ExpandableSection>
    )
}

export default Status