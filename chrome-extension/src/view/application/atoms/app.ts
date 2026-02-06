import { atom } from 'jotai'
import { initializeCraftStateAtom } from './craft'
import { statusAtom } from './status'
import { inventoryListAtom } from './history'
import { lastTimestampAtom } from './last'
import messagesApi from '../../services/api/messages'
import { ViewState, ViewDispatch, ViewNotification } from '../../../common/state'

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
          // Update inventory history list
          if (m.list) {
            m.list.reverse() // newer first
            set(inventoryListAtom, m.list)
          }
          // Update last inventory timestamp
          if (m.last !== undefined) {
            set(lastTimestampAtom, m.last)
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

      // Other module atoms are lazily initialized from storage
      // They load their persisted state automatically on first access

      set(appInitializedAtom, true)
    } catch (error) {
      console.error('Failed to initialize app atoms:', error)
      set(appInitializedAtom, true) // Mark as initialized even if there was an error
    } finally {
      set(appLoadingAtom, false)
    }
  }
)
