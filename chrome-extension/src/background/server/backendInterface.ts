import { ItemData } from "../../common/state";

interface IBackendServerManager {
    send(list: Array<ItemData>): Promise<void>
}

export default IBackendServerManager