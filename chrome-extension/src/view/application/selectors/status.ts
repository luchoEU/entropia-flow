import StatusState from "../state/status";

export const getStatus = (state: any): StatusState => state.status;
export const getStatusMessage = (state: any): string => getStatus(state).message
