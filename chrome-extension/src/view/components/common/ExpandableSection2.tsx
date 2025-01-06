import React from "react"
import ExpandableArrowButton from "./ExpandableArrowButton"
import { useDispatch, useSelector } from "react-redux"
import { getExpanded } from "../../application/selectors/expandable"
import { setExpanded } from "../../application/actions/expandable"

const ExpandableSection = (p: {
    selector: string,
    title: string,
    className?: string,
    children: any
}) => {
    const expanded: boolean = useSelector(getExpanded(p.selector))
    const dispatch = useDispatch()
    return (
        <section className={p.className}>
            <h1 onClick={(e) => {
                    e.stopPropagation()
                    dispatch(setExpanded(p.selector)(!expanded))}
                }>
                {p.title}
                <ExpandableArrowButton expanded={expanded} setExpanded={setExpanded(p.selector)} />
            </h1>
            {
                expanded && p.children
            }
        </section>
    )
}

export default ExpandableSection
