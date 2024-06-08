import IWebSocketClient from "./webSocketInterface";

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

    public onMessage: (msg: any) => Promise<void>;
    public onStateChanged: (state: string, message: string) => Promise<void>;
}

export default MockWebSocketClient
