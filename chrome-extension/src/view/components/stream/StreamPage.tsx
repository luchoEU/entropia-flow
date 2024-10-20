import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setStreamBackgroundExpanded, setStreamBackgroundSelected, setStreamEnabled } from '../../application/actions/stream';
import { getStreamIn } from '../../application/selectors/stream';
import { StreamStateIn } from '../../application/state/stream';
import ExpandableSection from '../common/ExpandableSection';
import useBackground from '../hooks/UseBackground';
import { BackgroundSpec, backgroundList } from '../../../stream/background';

const StreamBackground = (p: {
    background: BackgroundSpec,
    isSelected: boolean,
}): JSX.Element => {
    const dispatch = useDispatch()
    const id = 'stream' + p.background.title

    useBackground(p.background.type, id)

    return (
        <div className={p.isSelected ? 'inline stream-selected' : 'inline'}
            onClick={() => dispatch(setStreamBackgroundSelected(p.background.type))}>
            <div id={id} className='stream-view demo'>
                <div className='stream-frame demo'>
                    <img className='stream-logo' src={p.background.icon}></img>
                    <div className='stream-title'>Entropia Flow</div>
                    <div className='stream-subtitle'>{p.background.title}</div>
                </div>
            </div>
        </div>
    )
}

function StreamPage() {
    const dispatch = useDispatch()
    const { enabled, background }: StreamStateIn = useSelector(getStreamIn);

    return (
        <>
            <section>
                <h1>Enable it</h1>
                <label className='checkbox'>
                    <input type="checkbox"
                        defaultChecked={enabled}
                        onChange={() => dispatch(setStreamEnabled(!enabled))}
                    />
                    Show Stream View in every page
                </label>
            </section>
            { enabled &&
                <>
                    <ExpandableSection title='Background' expanded={background.expanded} setExpanded={setStreamBackgroundExpanded}>
                        { backgroundList.map((b: BackgroundSpec) =>
                            <StreamBackground key={b.type} background={b} isSelected={b.type === background.selected} />) }
                    </ExpandableSection>
                    <section>
                        <h1>
                            Note
                        </h1>
                        <p>If you want another background, you can <a href='https://www.google.com/search?q=css+background+animated'>search one on the internet</a>, and contact me.</p>
                        <p>Also I can change the layout if you think on one better for you, contact me too.</p>
                    </section>
                </> }
        </>
    )
}

export default StreamPage