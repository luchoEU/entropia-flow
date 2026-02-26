import { NavigateFunction, useNavigate } from "react-router-dom"

const TextButton = (p: {
    title: string,
    text: string,
    className?: string,
    action: (navigate: NavigateFunction) => any,
    show?: boolean
}) => {
    const navigate = useNavigate();
    return <button
        className={`button-text img-btn ${p.className ?? ''}`}
        title={p.title}
        {...p.show ? { 'data-show': true } : {}}
        onClick={(e) => {
            e.stopPropagation();
            const result = p.action(navigate)
            if (result instanceof Promise) {
                result.catch((error) => {
                    console.error('Action error:', error)
                })
            }
        }}
    >{p.text}</button>
}

export default TextButton
