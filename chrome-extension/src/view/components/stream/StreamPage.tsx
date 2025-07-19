import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import StreamEditor from './StreamEditor';
import StreamLayoutChooser from './StreamChooser';

function StreamPage() {
    const { layoutId } = useParams()

    const [invisible, setInvisible] = useState(true);
    useEffect(() => {
        const timeout = setTimeout(() => { setInvisible(false); }, 100); // let it calculate stream layout sizes
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className={invisible ? 'app-invisible' : ''}>
            {layoutId ? <StreamEditor layoutId={layoutId} /> : <StreamLayoutChooser />}
        </div>
    )
}

export default StreamPage
