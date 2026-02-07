import { ItemData } from "../../../common/state";
import {
  InventoryList,
  OwnedHideCriteria,
  ItemOwned} from "../state/inventory";
import { initialListByStore } from "./inventory.byStore";
import {
  cloneSortListSelect,
  sortListSelect,
  SORT_NAME_ASCENDING,
  nextSortType,
} from "./inventory.sort";

const emptyCriteria: OwnedHideCriteria = {
  show: false,
  name: [],
  container: [],
  value: -0.01,
};

const initialList = <D>(expanded: boolean, sortType: number): InventoryList<D> => ({
  expanded,
  sortType,
  items: [],
  stats: {
    count: 0,
    ped: "0.00",
  },
});

const initialState = {
  auction: initialList(true, SORT_NAME_ASCENDING),
  owned: {
    items: [],
    options: {},
    hideCriteria: emptyCriteria,
  },
  byStore: initialListByStore(true, SORT_NAME_ASCENDING),
  available: initialList(true, SORT_NAME_ASCENDING),
  availableCriteria: { name: [] },
  tradeItemDataChain: undefined
};

const _ownedSelect = (x: ItemOwned): ItemData => x.data;

const _isHiddenByName = (c: OwnedHideCriteria, d: ItemData): boolean =>
  c.name.includes(d.n);
const _isHiddenByContainer = (c: OwnedHideCriteria, d: ItemData): boolean =>
  c.container.includes(d.c);
const _isHiddenByValue = (c: OwnedHideCriteria, d: ItemData): boolean =>
  Number(d.v) <= c.value;

const _getAuction = (list: Array<ItemData>): Array<ItemData> =>
  list.filter((d) => d.c === "AUCTION");

export const getOwned = (list: Array<ItemData>, c: OwnedHideCriteria): Array<ItemOwned> =>
  list.map(d => {
    const hidden = {
      name: _isHiddenByName(c, d),
      container: _isHiddenByContainer(c, d),
      value: _isHiddenByValue(c, d),
    };
    return {
      data: d,
      c: { hidden: { ...hidden, any: hidden.name || hidden.container || hidden.value } }
    }
  });

const _getOwned = getOwned;

const joinDuplicates = (
  list: Array<ItemData>,
  excludeContainers: string[] = [],
): Array<ItemData> => {
  var result = {};
  list.forEach((d) => {
    if (!excludeContainers.includes(d.c)) {
      if (!result[d.n]) {
        result[d.n] = {
          id: d.id,
          n: d.n,
          q: "0",
          v: "0.00",
        };
      }
      let x: ItemData = result[d.n];
      x.q = (Number(x.q) + Number(d.q)).toString();
      x.v = (Number(x.v) + Number(d.v)).toFixed(2).toString();
    }
  });
  return Object.values(result);
};

const getItemList = (ownedItems: ItemOwned[]): Array<ItemData> => ownedItems.map(_ownedSelect);
const getBlueprintList = (ownedItems: ItemOwned[]): Array<ItemData> => getItemList(ownedItems).filter(item => item.n.includes("Blueprint"));

function _nextSortByPart<D>(
  list: InventoryList<D>,
  part: number,
  select: (d: D) => ItemData,
) {
  const sortType = nextSortType(part, list.sortType);
  return {
    ...list,
    sortType,
    items: cloneSortListSelect(list.items, sortType, select),
  };
}

function _sortAndStats<D>(
  list: InventoryList<D>,
  select: (d: D) => ItemData,
): InventoryList<D> {
  sortListSelect(list.items, list.sortType, select);
  const sum = list.items.reduce(
    (partialSum, d) => partialSum + Number(select(d).v),
    0,
  );
  list.stats = {
    count: list.items.length,
    ped: sum.toFixed(2),
  };
  return list;
}

const cleanForSaveInventoryList = <D>(list: InventoryList<D>): InventoryList<D> => ({
  ...list,
  items: undefined,
  stats: undefined
});

export {
  initialState,
  initialList,
  getItemList,
  getBlueprintList,
  joinDuplicates,
  cleanForSaveInventoryList
};
