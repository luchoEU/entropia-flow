export const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toTimeString().slice(0, 8)
}

export const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toDateString()
}

export const formatDateTime = (timestamp: number): string => {
    if (!timestamp) return 'Invalid'
    const date = new Date(timestamp)
    return `${date.toDateString()} ${date.toTimeString().slice(0, 8)}`
}
