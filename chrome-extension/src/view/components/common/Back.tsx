import React from "react";
import { useNavigate } from "react-router-dom";
import { TabId } from "../../application/state/navigation";
import { getLocationFromTabId } from "../../application/helpers/navigation";

function Back(p: {
    text: string,
    parentPage: TabId
}) {
    const navigate = useNavigate()
    
    return <section className='pointer' onClick={(e) => {
        e.stopPropagation();
        navigate(getLocationFromTabId(p.parentPage))
    }}>
        <h1>
            <span>{p.text}</span>
            <img src='img/left.png' />
        </h1>
    </section>
}

export default Back
