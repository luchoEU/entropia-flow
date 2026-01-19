# Actions System Specification

## Overview

The Actions system provides an independent, extensible way to track and display user activities in Entropia Universe. Actions are inferred from various data sources and displayed in a dedicated tab, providing a timeline view of what happened during a session.

## Architecture

```
┌─────────────────────┐
│    Data Sources     │
├─────────────────────┤
│ • Inventory Diff    │───┐
│ • Chat Log (future) │───┼──► Actions Middleware ──► Actions State ──► Actions Tab
│ • Game Screen (fut.)│───┘
└─────────────────────┘
```

### Key Principles

1. **Independence**: Actions have their own Redux state, separate from history
2. **Multi-Source**: The same action can be detected/enriched by multiple sources
3. **Extensibility**: New sources can be added without modifying existing code
4. **Dual Display**: Actions appear in both the history item expansion AND the Actions tab

## Data Model

### Types (`state/actions.ts`)

```typescript
type ActionType =
    | 'sold_auction'    // Item sold via auction
    | 'bought_auction'  // Item bought via auction
    | 'ped_deposited'   // PED deposited
    | 'ped_withdrawn'   // PED withdrawn
    | 'moved'           // Item moved between containers
    | 'chip_out'        // Skill chip extracted from implant
    | 'decay'           // Item value decreased (usage)
    | 'gained'          // Item gained
    | 'lost'            // Item lost
    | 'unknown'         // Unrecognized change

type ActionSource = 'inventory' | 'chat' | 'screen'

interface InferredAction {
    type: ActionType
    item: string             // Primary item name
    amount?: number          // Quantity involved
    value?: number           // PED value involved
    from?: string            // Source (container for moves, implant for chip_out)
    to?: string              // Destination container (for moves)
    relatedItems: ViewItemData[]  // All items involved
}

// Description is derived at display time, not stored
function formatActionDescription(action: InferredAction): string

interface StoredAction extends InferredAction {
    id: string               // Unique identifier
    timestamp: number        // When the action occurred (epoch ms)
    sources: ActionSource[]  // Sources that detected this action
}

interface ActivityState {
    list: StoredAction[]
    lastProcessedInventoryKey?: number  // Track processed inventory keys
}
```

### ID Generation

Action IDs are generated as: `{inventoryKey}-{actionType}-{itemName}`

This allows potential future merging when the same action is detected from multiple sources.

## Components

### 1. Action Inference (`helpers/actionInference.ts`)

The `inferActions(diff: ViewItemData[])` function analyzes inventory differences and returns inferred actions.

#### Detection Rules (in order of priority):

1. **Auction Sale** (`sold_auction`) - 💰
   - Item with negative quantity from AUCTION container
   - PED Card with positive value change
   - Links both items as related

2. **Chip Extraction** (`chip_out`) - 🧠
   - Item consumed in an Implant Inserter
   - Skill Implant gained in CARRIED
   - Optional: Inserter decay detected
   - `from` field stores the implant name

3. **Item Movement** (`moved`) - 📦
   - Container field contains `⟹` or `⭢` separator
   - Extracts source and destination containers
   - `from` and `to` fields store container names

4. **Unknown** (`unknown`) - ❓
   - Catch-all for remaining unmatched changes
   - Groups all unprocessed items together

### Description Formatting (`formatActionDescription`)

Descriptions are derived at display time from the action data:

| Type | Format |
|------|--------|
| `sold_auction` | 💰 Sold {amount} {item} for {value} PED |
| `bought_auction` | 🛒 Bought {amount} {item} for {value} PED |
| `chip_out` | 🧠 Extracted {item} from {from} |
| `moved` | 📦 Moved {item} from {from} to {to} |
| `ped_deposited` | 💵 Deposited {value} PED |
| `ped_withdrawn` | 💸 Withdrew {value} PED |
| `decay` | 🔧 Used {item} ({value} PED decay) |
| `gained` | 📥 Gained {amount} {item} |
| `lost` | 📤 Lost {amount} {item} |
| `unknown` | ❓ Changed {item} |

### 2. Actions Reducer (`reducers/actions.ts`)

Manages the actions state with three operations:

```typescript
ADD_ACTIONS      // Prepend new actions to list (newest first)
CLEAR_ACTIONS    // Clear all actions and reset key tracking
SET_LAST_PROCESSED_KEY  // Update the last processed inventory key
```

### 3. Actions Middleware (`middleware/activity.ts`)

Listens for `SET_HISTORY_LIST` and processes new inventory entries:

1. Gets previous `lastProcessedInventoryKey`
2. After history update, iterates through history items
3. Skips items with key ≤ lastProcessedKey
4. Converts `InferredAction` to `StoredAction` with:
   - Generated ID
   - Timestamp from inventory key
   - `sources: ['inventory']`
5. Dispatches `addActions` for new actions
6. Updates `lastProcessedInventoryKey` to latest

### 4. Actions Page (`components/actions/ActionsPage.tsx`)

Displays actions in a timeline view:

- Groups actions by date
- Each action shows:
  - Time (HH:MM:SS)
  - Description with ItemText highlighting
  - Sources that detected it
- Expandable rows show related items with:
  - Item name
  - Quantity
  - Value
  - Container

## Navigation Integration

### Tab Configuration

- **TabId**: `ACTIONS = '/actions'`
- **Title**: "Actions"
- **Subtitle**: "Timeline of actions inferred from your activity"
- **Visibility**: Requires `Feature.activity` to be enabled (toggleable in Settings)
- **Position**: After Budget, before Settings
- **Feature Flag**: `development: true` (only visible when `SHOW_FEATURES_IN_DEVELOPMENT` is enabled)

### Route

```typescript
{ id: TabId.ACTIVITY, routes: [{ path: TabId.ACTIVITY, component: ActivityPage }] }
```

## Future Extensions

### Adding New Sources

To add a new action source (e.g., chat log):

1. **Create inference function**:
   ```typescript
   // helpers/chatActionInference.ts
   function inferActionsFromChat(messages: ChatMessage[]): InferredAction[]
   ```

2. **Update middleware or create new one**:
   ```typescript
   // When chat messages arrive:
   const chatActions = inferActionsFromChat(messages)
   const storedActions = chatActions.map(a => ({
       ...a,
       id: `chat-${timestamp}-${a.type}-${a.item}`,
       timestamp,
       sources: ['chat']
   }))
   dispatch(addActions(storedActions))
   ```

3. **Optional: Implement action merging**:
   - Detect if action with matching ID exists
   - Merge `sources` arrays instead of creating duplicate

### Potential Action Types to Add

- `craft_success` - Successful crafting attempt
- `craft_failure` - Failed crafting attempt
- `loot_obtained` - Loot from hunting/mining
- `skill_gained` - Skill increase detected
- `repair` - Item repaired
- `trade_completed` - Player-to-player trade

## Files Reference

| File | Purpose |
|------|---------|
| `state/actions.ts` | Type definitions |
| `actions/activity.ts` | Redux action creators |
| `reducers/actions.ts` | Redux reducer |
| `middleware/activity.ts` | Inventory → Actions processing |
| `helpers/actionInference.ts` | Diff analysis logic |
| `components/actions/ActionsPage.tsx` | UI component |
| `state/navigation.ts` | Tab enum and order |
| `helpers/navigation.ts` | Tab metadata |
| `components/Content.tsx` | Route mapping |
| `reducers/index.ts` | Reducer registration |
| `middleware/index.ts` | Middleware registration |

## Testing

Unit tests exist for action inference:
- `helpers/actionInference.test.ts` - Tests for `inferActions` function

Test scenarios include:
- Auction sales detection
- Chip extraction with inserter decay
- Item movements
- Unknown changes handling
