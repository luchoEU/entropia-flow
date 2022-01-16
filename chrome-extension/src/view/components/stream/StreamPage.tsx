import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setStreamEnabled } from '../../application/actions/stream';
import { getStream } from '../../application/selectors/stream';

function StreamPage() {
    const dispatch = useDispatch()
    const { enabled } = useSelector(getStream);

    return (
        <section>
            <h1>Enable it</h1>
            <p><strong>Term of use: </strong>if you stream it you must include the logo and the tool name.</p>
            <label className='checkbox'>
                <input type="checkbox"
                    defaultChecked={enabled}
                    onChange={() => dispatch(setStreamEnabled(!enabled))}
                />
                Show Stream View in Inventory page
            </label>
        </section>
    )
}

export default StreamPage