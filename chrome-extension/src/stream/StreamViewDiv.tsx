import React, { JSX } from 'react';
import { StreamRenderSingle } from './data';
import { getBackgroundSpec } from './background';
import { computeFormulas, renderHtmlTemplate, renderCssTemplate } from './template';

const MIN_SIZE = 30

const StreamViewDiv = (p: {
    id: string,
    single: StreamRenderSingle,
    size?: { width: number, height: number },
    scale?: number
}): JSX.Element => {
    const { data, layout } = p.single
    const scale = p.scale ?? 1
    if (layout.htmlTemplate === undefined) {
        return <p>Template undefined!</p>
    }

    const backDark = getBackgroundSpec(layout.backgroundType)?.dark ?? false;
    const variables = computeFormulas({ ...data, backDark });
    const html = renderHtmlTemplate(layout.htmlTemplate, variables);
    const css = layout.cssTemplate && renderCssTemplate(layout.cssTemplate, variables);

    const px = (n: number): string => `${Math.max(n, MIN_SIZE)}px`;
    const containerStyle: React.CSSProperties = p.size ? { width: px(p.size.width), height: px(p.size.height) } : { }
    const contentStyle: React.CSSProperties = { position: 'absolute', overflow: 'hidden', zIndex: 1, width: 'max-content', height: 'max-content' }
    if (p.scale) {
        containerStyle.transform = `scale(${p.scale})`
        containerStyle.transformOrigin = 'top left'
    }

    return <div id={p.id} className='stream-root' style={containerStyle}>
        <div className={`stream-content`} style={contentStyle} dangerouslySetInnerHTML={{ __html: html }} />
        { css && <style dangerouslySetInnerHTML={{ __html: css }} /> }
    </div>
};

export default StreamViewDiv
