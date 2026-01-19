enum TabId {
    MONITOR = '/monitor',
    INVENTORY = '/inventory',
    TRADE = '/trade',
    CRAFT = '/craft',
    CLIENT = '/client',
    STREAM = '/stream',
    REFINED = '/refined',
    BUDGET = '/budget',
    ACTIVITY = '/activity',
    SETTING = '/setting',
    ABOUT = '/about'
}

const tabOrder: TabId[] = [
    TabId.ACTIVITY,
    TabId.MONITOR,
    TabId.INVENTORY,
    TabId.TRADE,
    TabId.CRAFT,
    TabId.CLIENT,
    TabId.STREAM,
    TabId.REFINED,
    TabId.BUDGET,
    TabId.SETTING,
    TabId.ABOUT
]

export {
    TabId,
    tabOrder
}
