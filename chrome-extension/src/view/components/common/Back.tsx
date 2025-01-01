import React from "react";
import { useDispatch } from "react-redux";

function Back(p: {
    text: string,
    dispatch: () => any,
}) {
    const dispatch = useDispatch()
    
    return <section className='pointer' onClick={(e) => {
        e.stopPropagation();
        dispatch(p.dispatch())
    }}>
        <h1>
            <span>{p.text}</span>
            <img src='img/left.png' />
        </h1>
    </section>
}

export default Back
