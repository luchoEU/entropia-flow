import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Status } from '../../../common/state'
import { refresh, timerOff, timerOn } from '../../application/actions/messages';
import { getHistory } from '../../application/selectors/history';
import { getStatus } from '../../application/selectors/status';
import { HistoryState } from '../../application/state/history';
import { STRING_PLEASE_LOG_IN, URL_MY_ITEMS_PAGE } from '../../../common/const';
import ImgButton from '../common/ImgButton';
import ExpandableSection from '../common/ExpandableSection2';
import { setExpanded } from '../../application/actions/expandable';

const Status = () => {
    const dispatch = useDispatch()
    const history: HistoryState = useSelector(getHistory)
    const { class: className, message, showLoading, isMonitoring } = useSelector(getStatus);

    return (
        <ExpandableSection selector='MonitorStatus' title='Entropia Universe Items' subtitle='Status of connection' actionRequired={message === STRING_PLEASE_LOG_IN ? 'Disconnected' : undefined}>
            { showLoading ?
                <img src='img/loading.gif'
                    className='img-refresh-loading' /> :
                <ImgButton
                    title='Refresh'
                    src='img/reload.png'
                    className='img-btn-refresh'
                    dispatch={() => refresh} />
            }
            { history.hiddenError &&
                <ImgButton
                    title={history.hiddenError}
                    src='img/error.png'
                    className='img-btn-refresh'
                    dispatch={() => setExpanded('MonitorStatus')(true)} />
            }
            <span className={className}>
                {message === STRING_PLEASE_LOG_IN ?
                    <a href={URL_MY_ITEMS_PAGE} target="_blank">{message}</a>
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