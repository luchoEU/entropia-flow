import React from "react"
import ExpandableArrowButton from "./ExpandableArrowButton"

const ExpandableSection = (p: {
    title: string,
    expanded: boolean,
    setExpanded: (expanded: boolean) => any,
    className?: string,
    children: any
}) => {
    return (
        <section>
            <h1>{p.title} <ExpandableArrowButton expanded={p.expanded} setExpanded={p.setExpanded} />
            </h1>
            <div className={p.className}>
            {
                p.expanded ? p.children : ''
            }
            </div>
        </section>
    )
}

export default ExpandableSection