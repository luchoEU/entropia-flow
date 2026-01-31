import React, { CSSProperties, MouseEventHandler } from "react"

const SimpleImgButton = ({
    title,
    beforeText,
    afterText,
    src,
    onClick,
    clickPopup,
    className,
    disabled,
    style,
    alt,
    show
}: {
    title: string,
    beforeText?: string,
    afterText?: string,
    src: string,
    onClick: () => void,
    clickPopup?: string
    className?: string
    disabled?: boolean
    style?: CSSProperties
    alt?: string
    show?: boolean
}) => {
    const handleClick: MouseEventHandler<HTMLSpanElement> = (e) => {
        e.stopPropagation()

        if (clickPopup) {
            const popup = e.currentTarget.querySelector('.popup') as HTMLElement
            popup.style.display = 'block'
            setTimeout(() => { popup.style.display = 'none' }, 1000)
        }

        onClick()
    }

    return <>
        <span
            title={title}
            className={'pointer popup-container img-btn ' + (className ?? '')}
            onClick={handleClick}
            {...style ? { style } : {}}
            {...show ? { 'data-show': true } : {}}>
            {beforeText}
            <img src={src}
                alt={alt}
                {...show ? { 'data-show': true } : {}}
                {...disabled ? { disabled: true } : {}}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            />
            {clickPopup && <span style={{ display: 'none' }} className='popup'>{clickPopup}</span>}
            {afterText}
        </span>
    </>;
}

export default SimpleImgButton
