import React from "react"
import { useDispatch } from "react-redux"

const ExpandableButton = (p: {
    expanded: boolean,
    setExpanded: (expanded: boolean) => any,
}) => {
    const dispatch = useDispatch()

    return p.expanded ?
        <img className='hide' src='img/up.png' onClick={() => dispatch(p.setExpanded(false))} /> :
        <img src='img/down.png' onClick={() => dispatch(p.setExpanded(true))} />
}

export default ExpandableButton