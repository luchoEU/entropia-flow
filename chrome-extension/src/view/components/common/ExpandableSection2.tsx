import React, { JSX, useEffect, useRef } from "react"
import ExpandableArrowButton from "./ExpandableArrowButton"
import { useDispatch, useSelector } from "react-redux"
import { getExpanded, getVisible } from "../../application/selectors/expandable"
import { setExpanded, setVisible } from "../../application/actions/expandable"
import ModeState from "../../application/state/mode"
import { getMode } from "../../application/selectors/mode"
import ImgButton from "./ImgButton"
import { useLocation } from "react-router-dom"
import { scrollValueForExpandable } from "../../application/helpers/expandable"

const ExpandableSection = ({
    selector,
    title,
    subtitle,
    className,
    actionRequired,
    afterTitle,
    hideExpandableArrow,
    children
}: {
    selector: string,
    title: string,
    subtitle: string,
    className?: string,
    actionRequired?: string,
    afterTitle?: JSX.Element,
    hideExpandableArrow?: boolean,
    children: any
}) => {
    const { showSubtitles, showVisibleToggle }: ModeState = useSelector(getMode)
    const visibleSelector = `section.${selector}`
    const visible: boolean = useSelector(getVisible(visibleSelector)) || actionRequired !== undefined
    const expanded: boolean = useSelector(getExpanded(selector)) && visible || actionRequired !== undefined
    const dispatch = useDispatch()

    const location = useLocation()
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const shouldScroll = params.get("scrollTo") === scrollValueForExpandable(selector);
    
        if (shouldScroll && ref.current) {
            // optional delay in case the component isn't fully mounted
            setTimeout(() => {
                ref.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location.search]);

    const showVisible = showSubtitles && showVisibleToggle && !actionRequired
    if (!visible && !showVisible)
        return <></>

    return (
        <section ref={ref} className={className}>
            <div>
                <h1>
                    <span title={expanded && showSubtitles ? subtitle : undefined} onClick={(e) => {
                        e.stopPropagation()
                        dispatch(setExpanded(selector)(!expanded))
                    }}>{title}</span>
                    { showVisible &&
                        <ImgButton title={visible ? 'click to Hide Section' : 'click to Show Section'}
                            className='img-visible-section'
                            src={visible ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                            dispatch={() => setVisible(visibleSelector)(!visible)} />}
                    { visible && !hideExpandableArrow && !actionRequired && <ExpandableArrowButton expanded={expanded} setExpanded={setExpanded(selector)} /> }
                    { actionRequired && <img className='img-warning' src='img/warning.png' title={actionRequired} /> }
                    { expanded && afterTitle }
                </h1>
                { showSubtitles && subtitle && (expanded || !title) && <div className="subtitle">{subtitle}</div> }
            </div>
            { expanded && children }
        </section>
    )
}

export default ExpandableSection
