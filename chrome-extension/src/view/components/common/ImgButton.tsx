import { CSSProperties, MouseEventHandler } from "react"
import { NavigateFunction, useNavigate } from "react-router-dom"

const ImgButton = ({ title, beforeText, afterText, src, action, clickPopup, className, disabled, style, alt, show }: {
    title: string,
    beforeText?: string,
    afterText?: string,
    src: string,
    action: (navigate?: NavigateFunction) => any,
    clickPopup?: string
    className?: string
    disabled?: boolean
    style?: CSSProperties
    alt?: string
    show?: boolean
}) => {
    const navigate = useNavigate()
    const onClick: MouseEventHandler<HTMLSpanElement> = (e) => {
        e.stopPropagation()

        if (clickPopup) {
            const popup = e.currentTarget.querySelector('.popup') as HTMLElement
            popup.style.display = 'block'
            setTimeout(() => { popup.style.display = 'none' }, 1000)
        }

        const result = action(navigate)
        if (result instanceof Promise) {
            result.catch((error) => {
                console.error('Action error:', error)
            })
        }
    }

    return <>
        <span
            title={title}
            className={'pointer popup-container img-btn ' + (className ?? '')}
            onClick={onClick}
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

export default ImgButton
