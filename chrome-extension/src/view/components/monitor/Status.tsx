import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai';
import { Status } from '../../../common/state'
import { historyAtom } from '../../application/atoms/history';
import { statusAtom, requestTimerOnAtom, requestTimerOffAtom, requestRefreshAtom } from '../../application/atoms/status';
import { STRING_PLEASE_LOG_IN, URL_MY_ITEMS_PAGE } from '../../../common/const';
import ImgButton from '../common/ImgButton';
import ExpandableSection from '../common/ExpandableSection';
import { setExpandedAtom } from '../../application/atoms/expandable';

const Status = () => {
    const history = useAtomValue(historyAtom)
    const { class: className, message, showLoading, isMonitoring } = useAtomValue(statusAtom);
    const setExpanded = useSetAtom(setExpandedAtom)
    const requestTimerOn = useSetAtom(requestTimerOnAtom)
    const requestTimerOff = useSetAtom(requestTimerOffAtom)
    const requestRefresh = useSetAtom(requestRefreshAtom)

    return (
        <ExpandableSection selector='MonitorStatus' title='Entropia Universe Items' subtitle='Status of connection' actionRequired={message === STRING_PLEASE_LOG_IN ? 'Disconnected' : undefined}>
            <div className='flex' style={{ gap: '10px', alignItems: 'center', marginLeft: '10px' }}>
                { showLoading ?
                    <img src='img/loading.gif'
                        className='img-refresh-loading' /> :
                    <ImgButton
                        title='Refresh'
                        src='img/reload.png'
                        show
                        dispatch={requestRefresh} />
                }
                { history.hiddenError &&
                    <ImgButton
                        title={history.hiddenError}
                        src='img/error.png'
                        show
                        dispatch={() => setExpanded('MonitorStatus', true)} />
                }
                <span className={className}>
                    {message === STRING_PLEASE_LOG_IN ?
                        <a href={URL_MY_ITEMS_PAGE} target="_blank">{message}</a>
                        : message
                    }
                </span>
                {isMonitoring ?
                    <button className="button-timer stop" onClick={requestTimerOff}>
                        ⏹️ Stop Automatic Refresh
                    </button> :
                    <button className="button-timer start" onClick={requestTimerOn}>
                        ▶️ Start Automatic Refresh
                    </button>
                }
            </div>
        </ExpandableSection>
    )
}

export default Status