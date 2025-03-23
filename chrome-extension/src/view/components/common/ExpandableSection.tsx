import React from "react"
import ExpandableArrowButton from "./ExpandableArrowButton"
import { useDispatch } from "react-redux"

// deprecated, use ExpandableSection2
const ExpandableSection = (p: {
    id?: string,
    title: string,
    expanded: boolean,
    setExpanded: (expanded: boolean) => any,
    className?: string,
    children: any
}) => {
    const dispatch = useDispatch()
    return (
        <section id={p.id}>
            <h1 onClick={(e) => {
                    e.stopPropagation()
                    dispatch(p.setExpanded(!p.expanded))}
                }>
                {p.title}
                <ExpandableArrowButton expanded={p.expanded} setExpanded={p.setExpanded} />
            </h1>
            <div className={p.className}>
            {
                p.expanded && p.children
            }
            </div>
        </section>
    )
}

export default ExpandableSection