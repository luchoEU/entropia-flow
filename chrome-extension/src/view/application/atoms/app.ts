import { atom } from 'jotai'
import { initializeCraftStateAtom } from './craft'
import { statusAtom } from './status'
import { inventoryListAtom } from './history'
import { lastTimestampAtom, initializeLastAtom } from './last'
import { rawInventoryItemsAtom } from './inventory'
import { initializeItemsAtom } from './items'
import messagesApi from '../../services/api/messages'
import { ViewState, ViewDispatch, ViewNotification, ItemData } from '../../../common/state'
import { ItemOwned } from '../state/inventory'
import { setConnectionStatusAtom } from './connection'
import { processGameLogAtom } from './gameLog'
import { setStreamVariablesAtom, setStreamDataAtom, initializeStreamAtom } from './stream'

export const appLoadingAtom = atom(false)
export const appInitializedAtom = atom(false)

/**
 * Initialize all application state atoms.
 * This replaces the Redux initialization that was previously in App.tsx
 */
export const initializeAppAtom = atom(
  null,
  async (get, set) => {
    set(appLoadingAtom, true)

    try {
      // Initialize message client to connect to background worker
      // This establishes the connection and starts receiving ViewState updates
      let resolveInit: () => void
      const initPromise = new Promise<void>(resolve => {
        resolveInit = resolve
      })

      messagesApi.initMessageClient(
        // Refresh view handler - receives ViewState from background worker
        async (m: ViewState) => {
          // Update status
          if (m.status) {
            set(statusAtom, m.status as any)
          }
          // Update inventory history list and extract current items
          if (m.list) {
            m.list.reverse() // newer first
            set(inventoryListAtom, m.list)

            // Extract current inventory items from the latest inventory
            // The first item in the list is the most recent (after reverse)
            const currentInventory = m.list?.[0]
            if (currentInventory?.itemlist && currentInventory.itemlist.length > 0) {
              // Convert ItemData[] to ItemOwned[] format for rawInventoryItemsAtom
              const itemsOwned: ItemOwned[] = currentInventory.itemlist.map((item: ItemData) => ({
                data: item,
                c: {
                  hidden: {
                    name: false,
                    container: false,
                    value: false,
                    any: false
                  }
                }
              }))
              set(rawInventoryItemsAtom, itemsOwned)
            }
          }
          // Update last inventory timestamp
          if (m.last !== undefined) {
            set(lastTimestampAtom, m.last)
          }
          // Update client connection status from background worker
          if (m.clientState) {
            set(setConnectionStatusAtom, m.clientState.message)
          }
          // Update game log data from background worker
          if (m.gameLog) {
            await set(processGameLogAtom, m.gameLog)
          }
          // Update stream variables from background worker
          if (m.streamVariables) {
            set(setStreamVariablesAtom, m.streamVariables)
          }
          // Update stream render data from background worker
          if (m.streamData) {
            set(setStreamDataAtom, m.streamData)
          }
          // Signal initialization complete
          resolveInit()
        },
        // Action view handler
        async (m: ViewDispatch) => {
          // Handle action view dispatch
        },
        // Notification handler
        async (m: ViewNotification) => {
          // Handle notifications
        },
        // Blueprint list handler
        async () => {
          // Handle blueprint list updates
        }
      )
      // Initialize craft state (blueprints, etc.)
      await set(initializeCraftStateAtom)

      // Initialize last state from storage
      await set(initializeLastAtom)

      // Initialize items from storage and sync atom value
      await set(initializeItemsAtom)

      // Initialize stream state from storage
      await set(initializeStreamAtom)

      set(appInitializedAtom, true)
    } catch (error) {
      console.error('Failed to initialize app atoms:', error)
      set(appInitializedAtom, true) // Mark as initialized even if there was an error
    } finally {
      set(appLoadingAtom, false)
    }
  }
)
