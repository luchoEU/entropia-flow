import React from "react"
import { useDispatch } from "react-redux"

const ExpandableSection = (p: {
    title: string,
    expanded: boolean,
    setExpanded: (expanded: boolean) => any,
    block?: boolean,
    children: any
}) => {
    const dispatch = useDispatch()

    return (
        <section {...(p.block ? { className: 'block' } : {})}>
            <h1>{p.title}
                {p.expanded ?
                    <img className='hide' src='img/up.png' onClick={() => dispatch(p.setExpanded(false))} /> :
                    <img src='img/down.png' onClick={() => dispatch(p.setExpanded(true))} />}
            </h1>
            {
                p.expanded ? p.children : ''
            }
        </section>
    )
}

export default ExpandableSection