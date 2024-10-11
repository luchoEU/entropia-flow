import MockStorageArea from "../chrome/mockStorageArea"
import { traceOff } from "../common/trace"
import TabStorage from "./tabStorage"

traceOff()

describe('tabStorage', () => {
    let area: MockStorageArea
    let storage: TabStorage

    beforeEach(() => {
        area = new MockStorageArea()
        storage = new TabStorage(area, 'test')
    })

    test('add one', async () => {
        await storage.add(1, 'test')
        expect(await storage.get()).toEqual([{ id: 1, title: 'test' }])
    })

    test('add another', async () => {
        area.getMock.mockReturnValue([{ id: 1, title: 'A' }])
        await storage.add(2, 'B')
        expect(await storage.get()).toEqual([{ id: 1, title: 'A' }, { id: 2, title: 'B' }])
    })
})
