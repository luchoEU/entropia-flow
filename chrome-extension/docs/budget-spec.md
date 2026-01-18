# Budget Feature Specification

## Overview

The Budget feature tracks materials needed across multiple crafting blueprints in Entropia Universe. It integrates with Google Sheets for data storage and the game inventory for reconciliation.

## Core Concepts

### Budget Items
A budget item represents a craftable item/blueprint being tracked. Each item has:
- **Name**: The item/blueprint name
- **PEDs**: Total TT (trade terminal) value
- **Total MU**: Total markup value earned
- **Total**: Combined value (PEDs + MU)
- **URL**: Link to the item's Google Sheet

### Materials
Materials are the components needed to craft budget items. Each material tracks:
- **Unit Value**: Cost per unit (TT value)
- **Markup**: Market price multiplier
- **Budget List**: Quantities budgeted per item
- **Real List**: Quantities held in inventory (offsets budget)
- **Balance**: Net quantity needed (budget + inventory, where inventory is negative)

### Groups
Users can organize budget items into custom groups for better management.

## Data Flow

```
Google Sheets ──► Middleware ──► Redux State ──► UI Components
                     ▲
                     │
               Game Inventory
```

1. **Refresh**: Middleware fetches data from Google Sheets
2. **Merge**: Inventory data merged with sheet data
3. **Calculate**: Derived values computed (totals, balances, markup)
4. **Display**: Components render current state
5. **Persist**: Changes auto-saved to storage

## State Structure

```typescript
interface BudgetState {
    stage: number                    // Loading stage indicator
    loadPercentage: number           // Progress (0-100)
    disabledItems: {
        names: string[]              // Disabled item names
    }
    disabledMaterials: {
        [itemName: string]: string[] // Item -> disabled material names
    }
    materials: {
        selectedCount: number        // Count of selected materials
        map: BudgetMaterialsMap      // Material name -> state
    }
    list: {
        items: BudgetItem[]          // Active budget items
    }
    groups: {
        list: BudgetGroup[]          // Custom groups
        ungroupedExpanded: boolean   // UI state
    }
    selection: BudgetSelection       // Currently selected group/item
}
```

## Features

### Item Management
- **View Items**: Display all tracked items with PEDs, MU, and totals
- **Disable Items**: Temporarily exclude items from calculations
- **Enable Items**: Re-include disabled items
- **Select Items**: Click to view material breakdown in details panel

### Group Management
- **Create Groups**: Add new groups with custom names
- **Rename Groups**: Double-click group name to edit
- **Delete Groups**: Remove groups (items become ungrouped)
- **Drag-and-Drop**: Move items between groups
- **Expand/Collapse**: Toggle group visibility
- **Select Groups**: Click to view aggregated material breakdown

### Material Tracking
- **Balance Calculation**: Shows quantity needed (budget - held)
- **Value Calculation**: Balance × unit value
- **Markup Calculation**: Value × markup multiplier
- **Warning Threshold**: Highlights materials with |balance × markup| ≥ 50 PED

### Material Selection & Adjustment
- **Auto-Select**: Materials exceeding threshold are pre-selected
- **Manual Selection**: Add/remove materials from selection
- **Adjust Action**: Write selected material balances back to Google Sheets

### Inventory Integration
- **Real Quantities**: Inventory items mapped to material quantities
- **Disable Inventory**: Exclude specific inventory entries
- **Negative Offset**: Inventory quantities reduce required balance

## UI Components

### BudgetPage
Container component rendering all budget sections.

### BudgetItemList
Main item management interface:
- Table with Name, PEDs, Total MU, Total columns
- Groups as expandable sections with totals
- Ungrouped section at bottom
- Drag-and-drop support
- Details panel on right when item/group selected

### BudgetMaterialList
Material tracking interface:
- Expandable sections per material
- Budget quantities per item
- Inventory quantities with enable/disable
- Calculated totals and balances
- Selection controls
- Adjust button for selected materials

### BudgetDisabledList
List of disabled items with enable buttons.

### BudgetDetailsPanel
Shows when item/group is selected:
- Title with back button
- Google Sheets link (for items)
- Materials table: Name, Quantity, Value, +MU

## Google Sheets Integration

### Sheet Structure
Each budget item has a dedicated sheet with naming convention: `{itemName} Budget`

**Columns**:
| Col | Name | Description |
|-----|------|-------------|
| 0 | Date | Entry date |
| 1 | Budget | Aggregate value |
| 2 | Change | Formula: current - previous |
| 3 | Reason | Entry description |
| 4 | PED | Unit value = 1 |
| 5+ | Materials | One column per material |

**Rows**:
| Row | Content |
|-----|---------|
| 0 | Title/Header |
| 1 | Unit Value per material |
| 2 | Markup multiplier per material |
| 3 | Current totals (sum formula) |
| 4 | Total MU formula |
| 5 | Total formula |
| 6+ | Data entries |

### Sheet Operations
- **Load**: Fetch existing sheet data
- **Create**: Initialize new budget sheet
- **Add Line**: Append entry with material quantities
- **Get Info**: Extract totals and material data

## Actions Reference

### State Actions
| Action | Description |
|--------|-------------|
| `SET_BUDGET_STATE` | Replace entire state |
| `SET_BUDGET_FROM_SHEET` | Update from sheets |
| `SET_BUDGET_SELECTION` | Select group/item |
| `SET_BUDGET_STAGE` | Update loading stage |

### Item Actions
| Action | Description |
|--------|-------------|
| `ENABLE_BUDGET_ITEM` | Activate disabled item |
| `DISABLE_BUDGET_ITEM` | Deactivate item |

### Material Actions
| Action | Description |
|--------|-------------|
| `ENABLE_BUDGET_MATERIAL` | Include inventory entry |
| `DISABLE_BUDGET_MATERIAL` | Exclude inventory entry |
| `ADD_BUDGET_MATERIAL_SELECTION` | Select for adjustment |
| `REMOVE_BUDGET_MATERIAL_SELECTION` | Deselect |
| `PROCESS_BUDGET_MATERIAL_SELECTION` | Write to sheets |

### Group Actions
| Action | Description |
|--------|-------------|
| `ADD_BUDGET_GROUP` | Create group |
| `REMOVE_BUDGET_GROUP` | Delete group |
| `RENAME_BUDGET_GROUP` | Update group name |
| `MOVE_ITEM_TO_GROUP` | Move item to group |
| `TOGGLE_BUDGET_GROUP_EXPANDED` | Toggle visibility |
| `TOGGLE_BUDGET_UNGROUPED_EXPANDED` | Toggle ungrouped |

### Other Actions
| Action | Description |
|--------|-------------|
| `REFRESH_BUDGET` | Reload from sheets |
| `SET_BUDGET_MATERIAL_EXPANDED` | Toggle material section |

## File Structure

```
chrome-extension/src/view/
├── application/
│   ├── state/budget.ts          # State interfaces
│   ├── actions/budget.ts        # Action creators
│   ├── reducers/budget.ts       # Reducer
│   ├── helpers/budget.ts        # Helper functions
│   ├── selectors/budget.ts      # State selectors
│   └── middleware/budget.ts     # Async operations
├── components/budget/
│   ├── BudgetPage.tsx           # Main container
│   ├── BudgetItemList.tsx       # Item management
│   ├── BudgetMaterialList.tsx   # Material tracking
│   └── BudgetDisabledList.tsx   # Disabled items
└── services/api/sheets/
    ├── sheetsBudget.ts          # Budget sheet class
    └── sheetsUtils.ts           # Sheet utilities
```

## Calculations

### Material Balance
```
balanceQuantity = totalBudgetQuantity + totalRealQuantity
```
Where `totalRealQuantity` is negative (inventory offsets budget).

### Value Calculations
```
balance = balanceQuantity × unitValue
balanceWithMarkup = balance × markup
```

### Group Totals
```
groupPeds = sum(item.peds for item in group)
groupTotalMU = sum(item.totalMU for item in group)
groupTotal = sum(item.total for item in group)
```

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `SHOW_WARNING_THRESHOLD_PED_WITH_MARKUP` | 50 | PED threshold for material warnings |

## Persistence

- State auto-saved on UI changes
- Calculated fields (`c`) stripped before save
- Restored on app initialization
- Merged with `initialState` to handle schema changes
