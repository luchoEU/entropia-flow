import React from "react"
import { useSelector } from "react-redux"
import { getStream } from "../../application/selectors/stream"
import StreamViewLayout from "./StreamViewLayout"

function StreamChooser() {
    const { in: { layouts }, out: { data: { data } } } = useSelector(getStream)

    return <section>
        <h1>Choose a layout</h1>
        <div className='flex'>
            { Object.entries(layouts).map(([name, layout]) =>
                <tr key={name}>
                    <td>{name}</td>
                    <td><StreamViewLayout id={`stream-chooser-${name}`} data={{ data, layout}} scale={0.4} /></td>
                </tr>) }
        </div>
    </section>
}

export default StreamChooser
