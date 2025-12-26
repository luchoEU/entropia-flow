import { IApiStorage } from "../background/client/streamDataBuilder";
import { ItemsState } from "../view/application/state/items";
import { LastRequiredState } from "../view/application/state/last";
import { StreamStateIn } from "../view/application/state/stream";

class MockApiStorage implements IApiStorage {
    loadLastMock = jest.fn()
    loadLast(): Promise<LastRequiredState> {
        return this.loadLastMock()
    }

    loadItemsMock = jest.fn()
    loadItems(): Promise<ItemsState> {
        return this.loadItemsMock()
    }
    loadStreamMock = jest.fn()
    loadStream(): Promise<StreamStateIn> {
        return this.loadStreamMock()
    }
}

export default MockApiStorage
