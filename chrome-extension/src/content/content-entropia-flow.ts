import { LeaderBridge } from "./leaderBridge"
import { ContentCore } from "./contentCore"

const bridge = new LeaderBridge(true)
const core = new ContentCore(bridge)

core.init()
