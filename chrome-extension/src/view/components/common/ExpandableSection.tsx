import React, { JSX, useEffect, useRef } from "react"
import ExpandableArrowButton from "./ExpandableArrowButton"
import { useAtomValue, useSetAtom } from "jotai"
import { expandableAtom, setExpandedAtom, setVisibleAtom } from "../../application/atoms/expandable"
import ModeState from "../../application/state/mode"
import { modeAtom } from "../../application/atoms/mode"
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
    const mode: ModeState = useAtomValue(modeAtom)
    const { showSubtitles, showVisibleToggle } = mode
    const expandable = useAtomValue(expandableAtom)
    const visibleSelector = `section.${selector}`
    const visible: boolean = !expandable.hidden.includes(visibleSelector) || actionRequired !== undefined || true
    const expanded: boolean = !expandable.collapsed.includes(selector) && visible || actionRequired !== undefined
    const setExpanded = useSetAtom(setExpandedAtom)
    const setVisible = useSetAtom(setVisibleAtom)

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
        <section ref={ref} className={expanded ? className : undefined}>
            <div>
                <h1>
                    <span title={expanded && showSubtitles ? subtitle : undefined} onClick={(e) => {
                        e.stopPropagation()
                        setExpanded(selector, !expanded)
                    }}>{title}</span>
                    { showVisible &&
                        <ImgButton title={visible ? 'click to Hide Section' : 'click to Show Section'}
                            className='img-btn-visible-section'
                            src={visible ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                            show
                            action={() => setVisible(visibleSelector, !visible)} />}
                    { visible && !hideExpandableArrow && !actionRequired && <ExpandableArrowButton expanded={expanded} setExpanded={() => setExpanded(selector, !expanded)} /> }
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
