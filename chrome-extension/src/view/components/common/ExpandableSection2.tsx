import React from "react"
import ExpandableArrowButton from "./ExpandableArrowButton"
import { useDispatch, useSelector } from "react-redux"
import { getExpanded, getVisible } from "../../application/selectors/expandable"
import { setExpanded, setVisible } from "../../application/actions/expandable"
import ModeState from "../../application/state/mode"
import { getMode } from "../../application/selectors/mode"
import ImgButton from "./ImgButton"

const ExpandableSection = (p: {
    selector: string,
    title: string,
    subtitle: string,
    className?: string,
    actionRequired?: string,
    children: any
}) => {
    const { showSubtitles, showVisibleToggle }: ModeState = useSelector(getMode)
    const visible: boolean = useSelector(getVisible(p.selector)) || p.actionRequired !== undefined
    const expanded: boolean = useSelector(getExpanded(p.selector)) && visible || p.actionRequired !== undefined
    const dispatch = useDispatch()

    const showVisible = showSubtitles && showVisibleToggle && !p.actionRequired
    if (!visible && !showVisible)
        return <></>

    return (
        <section id={p.selector} className={p.className}>
            <div>
                <h1 onClick={(e) => {
                        e.stopPropagation()
                        dispatch(setExpanded(p.selector)(!expanded))}
                    }>
                    {p.title}
                    { showVisible &&
                        <ImgButton title={visible ? 'click to Hide Section' : 'click to Show Section'}
                            className='img-visible-section'
                            src={visible ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                            dispatch={() => setVisible(p.selector)(!visible)} />}
                    { visible && !p.actionRequired && <ExpandableArrowButton expanded={expanded} setExpanded={setExpanded(p.selector)} /> }
                    { p.actionRequired && <img className='img-warning' src='img/warning.png' title={p.actionRequired} /> }
                </h1>
                { expanded && showSubtitles && p.subtitle && <div className="subtitle">{p.subtitle}</div> }
            </div>
            { expanded && p.children }
        </section>
    )
}

export default ExpandableSection
