import React from "react"
import { useSelector } from "react-redux"
import { getStream } from "../../application/selectors/stream"
import StreamViewLayout from "./StreamViewLayout"
import ImgButton from "../common/ImgButton"
import { setStreamEditing } from "../../application/actions/stream"

function StreamChooser() {
    const { in: { layouts }, out: { data: { data } } } = useSelector(getStream)

    return <section>
        <h1>Choose a layout</h1>
        <div className='flex'>
            { Object.entries(layouts).map(([name, layout]) =>
                <tr key={name}>
                    <td>{name}</td>
                    <td><StreamViewLayout id={`stream-chooser-${name}`} data={{ data, layout}} scale={0.4} /></td>
                    <td><ImgButton title='Edit'src='img/edit.png' dispatch={() => setStreamEditing(name)} /></td>
                </tr>) }
        </div>
    </section>
}

export default StreamChooser
