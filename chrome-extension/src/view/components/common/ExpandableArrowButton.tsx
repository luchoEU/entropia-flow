import React from "react"
import ImgButton from "./ImgButton"

const ExpandableArrowButton = (p: {
    expanded: boolean,
    show?: boolean,
    setExpanded: (expanded: boolean) => any,
}) => {
    return p.expanded ?
        <ImgButton title='Collapse' className='hide' src='img/up.png' show={p.show} dispatch={() => p.setExpanded(false)} /> :
        <ImgButton title='Expand' src='img/down.png' show={p.show} dispatch={() => p.setExpanded(true)} />
}

export default ExpandableArrowButton