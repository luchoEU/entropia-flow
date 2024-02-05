import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getIcon } from '../../application/helpers/stream';
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status';
import { getStream } from '../../application/selectors/stream';
import { StreamState } from '../../application/state/stream';
import { sendWebSocketMessage } from '../../application/actions/messages';
import useBackground from '../hooks/UseBackground';
import renderStream from '../../../stream/render';

function StreamView() {
    const dispatch = useDispatch()
    const { enabled } = useSelector(getStream)
    const { delta, deltaClass, deltaWord } = useSelector(getLast)
    const { message } = useSelector(getStatus)
    const { background }: StreamState = useSelector(getStream)

    const data = {
        logoSrc: getIcon(background.selected),
        deltaClass,
        delta,
        deltaWord,
        message
    }

    useEffect(() => {
        dispatch(sendWebSocketMessage('stream', data))
    }, [ data ])

    const htmlContent = renderStream(data)
    useBackground(background.selected, 'stream', [ background.selected, enabled, htmlContent ])

    if (enabled)
        return <section dangerouslySetInnerHTML={{ __html: htmlContent }} />
    else
        return <></>
}

export default StreamView