import IWebSocketClient, { WebSocketState } from "./webSocketInterface";

class MockWebSocketClient implements IWebSocketClient {
    startMock = jest.fn()
    public async start(url: string): Promise<void> {
        this.startMock(url)
    }

    sendMock = jest.fn()
    public async send(type: string, data: any): Promise<void> {
        this.sendMock(type, data)
    }

    closeMock = jest.fn()
    public async close(): Promise<void> {
        this.closeMock()
    }

    getStateMock = jest.fn()
    public getState(): WebSocketState {
        return this.getStateMock()
    }

    public onMessage: (msg: any) => Promise<void>;
    public onStateChanged: (state: WebSocketState) => Promise<void>;
}

export default MockWebSocketClient
