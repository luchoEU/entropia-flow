import React from 'react';
import StreamRenderData from './data';
import { templateManager } from './htmlTemplate';

const StreamViewDiv = (p: {
    data: StreamRenderData
}) => {
    const { templateName, variables } = p.data
    const template = templateManager.get(templateName)
    const html = template.render(variables)

    return <div id='stream' style={template.getContainerStyle()}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
};

export default StreamViewDiv
