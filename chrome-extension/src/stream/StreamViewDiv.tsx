import React from 'react';
import StreamRenderData from './data';
import renderHtmlTemplate from './htmlTemplate';

const StreamViewDiv = (p: {
    data: StreamRenderData
}) => {
    const { obj, def } = p.data
    const html = renderHtmlTemplate(def.template, obj)

    return <div id='stream' style={def.size}>
        <div style={{ ...def.size, position: 'absolute', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
};

export default StreamViewDiv
