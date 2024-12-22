import { ItemData } from "../../../common/state";
import { SortSecuence } from "./sort";

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

interface InventoryListWithFilter<T> {
  filter?: string
  showList: InventoryList<T>
  originalList: InventoryList<T>
}

interface InventoryByStore extends InventoryListWithFilter<InventoryTree<ItemData>> {
  containers: ContainerMapData
  stared: {
    filter?: string
    expanded: Array<string>
    list: InventoryList<InventoryTree<ItemData>>
  }
  craft: {
    filter?: string
    expanded: Array<string>
    list: InventoryList<InventoryTree<ItemData>>
  }
  flat: {
    original: Array<TreeLineData>
    show: Array<TreeLineData>
    stared: Array<TreeLineData>
    craft: Array<TreeLineData>
  }
  c: {
    validPlanets: Array<string>
  }
}

type ContainerMapData = { [id: string] : ContainerMapDataItem };

interface ContainerMapDataItem {
  displayName: string;
  stableName?: string; // name used for sorting, not persistent
  expanded: boolean;
  expandedOnFilter?: boolean;
  stared: boolean;
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

interface HideCriteria {
  name: Array<string>;
  container: Array<string>;
  value: number;
}

interface AvailableCriteria {
  name: Array<string>;
}

interface ItemVisible {
  data: ItemData;
  c?: {
    showingTradeItem: boolean
    ttServiceValue?: number
  }
}

interface ItemHidden {
  data: ItemData;
  criteria: {
    name: boolean;
    container: boolean;
    value: boolean;
  };
}

interface TradeItemData {
  name: string;
  sortInfo: {
    blueprints: SortSecuence
  }
  c?: {
    blueprints: Array<TradeBlueprintLineData>;
  }
}

interface TradeBlueprintLineData {
  bpName: string;
  quantity: number;
}

interface InventoryState {
  blueprints: InventoryListWithFilter<ItemData>;
  auction: InventoryList<ItemData>;
  visible: InventoryListWithFilter<ItemVisible>;
  hidden: InventoryListWithFilter<ItemHidden>;
  hiddenCriteria: HideCriteria;
  byStore: InventoryByStore;
  available: InventoryList<ItemData>;
  availableCriteria: AvailableCriteria;
  tradeItemData: TradeItemData;
}

export {
  HideCriteria,
  AvailableCriteria,
  ItemVisible,
  ItemHidden,
  ContainerMapData,
  ContainerMapDataItem,
  BasicItemData,
  TreeLineData,
  TradeItemData,
  TradeBlueprintLineData,
  InventoryList,
  InventoryTree,
  InventoryListWithFilter,
  InventoryByStore,
  InventoryState,
};
