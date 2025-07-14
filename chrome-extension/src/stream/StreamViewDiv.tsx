import React, { JSX } from 'react';
import { StreamRenderSingle } from './data';
import { renderHtmlTemplate, renderCssTemplate } from './template';

const MIN_SIZE = 30

const StreamViewDiv = ({ id, single: { data, layout }, size, scale }: {
    id: string,
    single: StreamRenderSingle,
    size?: { width: number, height: number },
    scale?: number
}): JSX.Element => {

    const variables = data
    const html = layout.htmlTemplate && renderHtmlTemplate(layout.htmlTemplate, variables);
    const css = layout.cssTemplate && renderCssTemplate(layout.cssTemplate, variables);

    const px = (n: number): string => `${Math.max(n, MIN_SIZE)}px`;
    const containerStyle: React.CSSProperties = size ? { width: px(size.width), height: px(size.height) } : { }
    const contentStyle: React.CSSProperties = { position: 'absolute', overflow: 'hidden', zIndex: 1, width: 'max-content', height: 'max-content' }
    if (scale) {
        containerStyle.transform = `scale(${scale})`
        containerStyle.transformOrigin = 'top left'
    }

    return <div id={id} style={containerStyle}>
        <div className={'layout-root'} style={contentStyle} {...html && { dangerouslySetInnerHTML: { __html: html } }}/>
        { css && <style dangerouslySetInnerHTML={{ __html: css }} /> }
    </div>
};

export default StreamViewDiv
