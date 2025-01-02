import React from 'react';
import renderHtmlTemplate from './htmlTemplate';
import { StreamRenderSingle } from './data';

const StreamViewDiv = (p: {
    id: string,
    data: StreamRenderSingle,
    scale?: number
}) => {
    const { data, layout } = p.data
    if (!layout.template) {
        return <>Template undefined!</>
    }

    const html = renderHtmlTemplate(layout.template, data, !layout.disableSafeCheck)

    function parseStyle(styleString: string): React.CSSProperties {
        return styleString.split(";").reduce((styles, style) => {
          if (!style.trim()) return styles;
          const [key, value] = style.split(":");
          if (!key || !value) return styles;
          const formattedKey = key.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase());
          styles[formattedKey] = value.trim();
          return styles;
        }, {} as React.CSSProperties);
    }

    const containerStyle: React.CSSProperties = parseStyle(layout.containerStyle)
    const contentStyle: React.CSSProperties = { position: 'absolute', overflow: 'hidden' }
    if (p.scale) {
        if (containerStyle.width) {
            containerStyle.width = `calc(${containerStyle.width} * ${p.scale})`
        }
        if (containerStyle.height) {
            containerStyle.height = `calc(${containerStyle.height} * ${p.scale})`
        }
        contentStyle.transform = `scale(${p.scale})`
        contentStyle.transformOrigin = 'top left'
    }

    return <div id={p.id} style={containerStyle}>
        <div style={contentStyle} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
};

export default StreamViewDiv
