import React from "react"
import ExpandableButton from "./ExpandableButton"

const ExpandableSection = (p: {
    title: string,
    expanded: boolean,
    setExpanded: (expanded: boolean) => any,
    block?: boolean,
    children: any
}) => {
    return (
        <section {...(p.block ? { className: 'block' } : {})}>
            <h1>{p.title} <ExpandableButton expanded={p.expanded} setExpanded={p.setExpanded} />
            </h1>
            {
                p.expanded ? p.children : ''
            }
        </section>
    )
}

export default ExpandableSection