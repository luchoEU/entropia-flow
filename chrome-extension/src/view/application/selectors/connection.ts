import { ConnectionState } from "../state/connection";

export const getConnection = (state: any): ConnectionState => state.connection
export const getWebSocketUrl = (state: any): string => getConnection(state).client.webSocket
