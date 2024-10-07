import TabStorage from "../background/tabStorage"
import { traceOff } from "../common/trace"
import IPortManager, { IPort } from "./IPort"
import MockMessagesHub from "./mockMessages"
import { MockPort } from "./mockPort"
import MockStorageArea from "./mockStorageArea"
import MockTabManager, { MockTab } from "./mockTab"
import PortManager from "./portManager"

traceOff()

describe('port manager', () => {
    let tabStorageArea: MockStorageArea
    let messagesHub: MockMessagesHub
    let tabManager: MockTabManager
    let portManager: IPortManager

    beforeEach(async () => {
        tabStorageArea = new MockStorageArea()
        const tabStorage = new TabStorage(tabStorageArea, "TestStorageKey")
        messagesHub = new MockMessagesHub();
        tabManager = new MockTabManager();
        portManager = new PortManager(tabStorage, messagesHub, tabManager, "TestPortName")
    })

    test('empty', async () => {
        expect(await portManager.first()).toBeUndefined()
    })

    test('connect one', async () => {
        const port = new MockPort()
        tabManager.getMock.mockReturnValue(new MockTab())
        messagesHub.connectMock.mockReturnValue(port)
        portManager.handle(1, 'TestTabTitle')

        tabStorageArea.getMock.mockReturnValue([{ id: 1, title: 'TestTabTitle' }])
        expect(await portManager.first()).toBe(port)
    })

    test('failed reconnect', async () => {
        const port = new MockPort()
        tabManager.getMock.mockReturnValue(new MockTab())
        messagesHub.connectMock.mockReturnValue(port)
        portManager.handle(2, 'TestTabTitle2')

        tabStorageArea.getMock.mockReturnValue([{ id: 1, title: 'TestTitle1' }, { id: 2, title: 'TestTitle1' }])
        expect(await portManager.first()).toBe(port)
    })
})