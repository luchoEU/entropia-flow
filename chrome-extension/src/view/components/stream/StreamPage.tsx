import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import StreamEditor from './StreamEditor';
import StreamLayoutChooser from './StreamChooser';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { streamInAtom } from '../../application/atoms/stream';

function StreamPage() {
    const { layoutId } = useParams()
    const navigate = useNavigate()
    const streamIn = useAtomValue(streamInAtom)

    const [invisible, setInvisible] = useState(true);
    useEffect(() => {
        if (layoutId && !streamIn.layouts[layoutId]) {
            navigate('/stream', { replace: true })
        }
    }, [layoutId, navigate, streamIn.layouts])

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
