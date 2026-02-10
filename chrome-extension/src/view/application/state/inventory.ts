import { ItemData } from "../../../common/state";
import { SortSecuence } from "./sort";

const INVENTORY_TABULAR_OWNED = '[inventory] owned'

interface InventoryList<T> {
  expanded: boolean;
  sortType: number;
  items: Array<T>;
  stats: {
    count: number;
    ped: string;
  };
}

interface InventoryTree<T> {
  data: T
  canEditName: boolean
  editing?: { // undefined if not editing
    originalName: string
  }
  displayName: string
  stableName?: string // name used for sorting
  stared: boolean,
  list?: InventoryList<InventoryTree<T>>
  showItemValueRow?: boolean
}

interface InventoryByStore {
  containers: ContainerMapData
  staredExpanded: Array<string>
  materialExpanded: Array<string>
  items: Array<TreeLineData>
  staredItems: Array<TreeLineData>
}

type ContainerMapData = { [id: string] : ContainerMapDataItem };

interface ContainerMapDataItem {
  displayName: string;
  stableName?: string; // name used for sorting, not persistent
  expanded: boolean;
  expandedOnFilter?: boolean;
  stared?: boolean;
  data?: BasicItemData; // data and items can be used the get the id in a new load
  items?: Array<BasicItemData>;
}

interface BasicItemData { // subset of ItemData
  n: string // name, string
  q: string // quantity, number
  v: string // value, number (2 decimals)
}

interface TreeLineData extends ItemData {
  indent: number
  isContainer?: boolean
  expanded?: boolean // undefined if not a container
  stared?: boolean
  canEditName?: boolean
  isEditing?: boolean
}

interface OwnedOptions {
  reserve?: boolean; // reserve peds for item feature enabled
  auction?: boolean; // hide items on auction feature enabled

  // not implemented
  planet?: string; // filter by planet
  groupBy?: OwnedGroupBy; // group by same container or all containers
  groupRefined?: boolean; // group refined and unrefined ores
}

enum OwnedGroupBy {
  None,
  SameContainer,
  SameItem
}

interface OwnedHideCriteria {
  show: boolean;
  name: Array<string>;
  container: Array<string>;
  value: number;
}

interface AvailableCriteria {
  name: Array<string>;
}

interface ItemOwned {
  data: ItemData;
  c: { // calculated on data
    hidden: {
      any: boolean;
      name: boolean;
      container: boolean;
      value: boolean;
    };
  }
  t?: { // calculated when creating the tabular data
    showingTradeItem: boolean
    reserveAmount: number | undefined
    ttServiceValue: number | undefined
  }
}

interface TradeItemData {
  name: string;
  sortSecuence: {
    favoriteBlueprints: SortSecuence
    ownedBlueprints: SortSecuence
    otherBlueprints: SortSecuence
  }
  c?: {
    favoriteBlueprints: Array<TradeBlueprintLineData>;
    ownedBlueprints: Array<TradeBlueprintLineData>;
    otherBlueprints: Array<TradeBlueprintLineData>;
  }
}

interface TradeBlueprintLineData {
  bpName: string;
  quantity: number;
}

export {
  INVENTORY_TABULAR_OWNED,
  OwnedOptions,
  OwnedHideCriteria,
  AvailableCriteria,
  ItemOwned,
  ContainerMapData,
  ContainerMapDataItem,
  BasicItemData,
  TreeLineData,
  TradeItemData,
  TradeBlueprintLineData,
  InventoryList,
  InventoryTree,
  InventoryByStore,
};
