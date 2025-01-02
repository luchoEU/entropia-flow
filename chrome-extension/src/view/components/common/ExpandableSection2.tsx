import React from "react"
import ExpandableArrowButton from "./ExpandableArrowButton"
import { useDispatch, useSelector } from "react-redux"
import { getExpanded } from "../../application/selectors/expandable"
import { setExpanded } from "../../application/actions/expandable"

const ExpandableSection = (p: {
    id: string,
    title: string,
    className?: string,
    children: any
}) => {
    const expanded: boolean = useSelector(getExpanded(p.id))
    const dispatch = useDispatch()
    return (
        <section>
            <h1 onClick={(e) => {
                    e.stopPropagation()
                    dispatch(setExpanded(p.id)(!expanded))}
                }>
                {p.title}
                <ExpandableArrowButton expanded={expanded} setExpanded={setExpanded(p.id)} />
            </h1>
            <div className={p.className}>
            {
                expanded && p.children
            }
            </div>
        </section>
    )
}

export default ExpandableSection
