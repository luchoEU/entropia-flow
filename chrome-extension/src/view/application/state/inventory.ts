import { ItemData } from "../../../common/state";

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
  editing?: { // undefined if not editing
    originalName: string
  }
  name: string
  list?: InventoryList<InventoryTree<T>>
}

interface InventoryListWithFilter<T> {
  filter: string
  showList: InventoryList<T>
  originalList: InventoryList<T>
}

interface HideCriteria {
  name: Array<string>;
  container: Array<string>;
  value: number;
}

interface AvailableCriteria {
  name: Array<string>;
}

interface ItemHidden {
  data: ItemData;
  criteria: {
    name: boolean;
    container: boolean;
    value: boolean;
  };
}

interface InventoryState {
  blueprints: InventoryList<ItemData>;
  auction: InventoryList<ItemData>;
  visible: InventoryListWithFilter<ItemData>;
  hidden: InventoryListWithFilter<ItemHidden>;
  hiddenCriteria: HideCriteria;
  byStore: InventoryListWithFilter<InventoryTree<ItemData>>;
  available: InventoryList<ItemData>;
  availableCriteria: AvailableCriteria;
  ttService: InventoryList<ItemData>;
}

export {
  HideCriteria,
  AvailableCriteria,
  ItemHidden,
  InventoryList,
  InventoryTree,
  InventoryListWithFilter,
  InventoryState,
};
