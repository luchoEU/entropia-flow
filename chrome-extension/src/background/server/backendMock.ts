import { ItemData } from "../../common/state";
import IBackendServerManager from "./backendInterface";

class MockBackendServerManager implements IBackendServerManager {
    sendMock = jest.fn()
    async send(list: Array<ItemData>) {
        this.sendMock(list)
    }
}

export default MockBackendServerManager