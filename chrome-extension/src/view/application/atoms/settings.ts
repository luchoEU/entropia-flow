import { atom, Atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Feature, SettingsState, SheetAccessInfo } from '../state/settings'
import { isFeatureEnabled } from '../state/settings'

/**
 * Base atom for sheet access credentials
 * Persisted to storage via atomWithStorage
 */
export const sheetAccessAtom = atomWithStorage<SheetAccessInfo>(
  'settings-sheet',
  {
    budgetDocumentId: undefined,
    ttServiceDocumentId: undefined,
    googleServiceAccountEmail: undefined,
    googlePrivateKey: undefined
  }
)

/**
 * Base atom for enabled features
 * Persisted to storage via atomWithStorage
 */
export const featuresAtom = atomWithStorage<Feature[]>(
  'settings-features',
  [Feature.unfreezeTab]
)

/**
 * Computed atom: Full settings state for backward compatibility
 * Used by components and middleware that need complete SettingsState
 */
export const settingsAtom = atom<SettingsState>((get) => ({
  sheet: get(sheetAccessAtom),
  features: get(featuresAtom)
}))

/**
 * Computed atom: Get sheet settings only
 * Helper for components that only need sheet credentials
 */
export const sheetSettingsAtom = atom((get) => get(sheetAccessAtom))

/**
 * Atom factory: Check if a specific feature is enabled
 * Returns a read-only computed atom that checks feature status
 * Memoized to prevent creating new atom instances on every call
 * Usage: useAtomValue(isFeatureEnabledAtom(Feature.budget))
 */
const featureAtomCache = new Map<Feature, Atom<boolean>>()
export const isFeatureEnabledAtom = (feature: Feature): Atom<boolean> => {
  if (!featureAtomCache.has(feature)) {
    featureAtomCache.set(
      feature,
      atom((get) => {
        const settings = get(settingsAtom)
        return isFeatureEnabled(settings, feature)
      })
    )
  }
  return featureAtomCache.get(feature)!
}

/**
 * Write atom: Set entire settings state
 * Used by SettingsBridge for Redux/Jotai sync during migration
 */
export const setSettingsStateAtom = atom(
  null,
  (get, set, newState: SettingsState) => {
    set(sheetAccessAtom, newState.sheet)
    set(featuresAtom, newState.features)
  }
)

/**
 * Write atom: Update budget document ID
 */
export const setBudgetDocumentIdAtom = atom(
  null,
  (get, set, documentId: string | undefined) => {
    const sheet = get(sheetAccessAtom)
    set(sheetAccessAtom, { ...sheet, budgetDocumentId: documentId })
  }
)

/**
 * Write atom: Update TT service document ID
 */
export const setTTServiceDocumentIdAtom = atom(
  null,
  (get, set, documentId: string | undefined) => {
    const sheet = get(sheetAccessAtom)
    set(sheetAccessAtom, { ...sheet, ttServiceDocumentId: documentId })
  }
)

/**
 * Write atom: Update Google service account email
 */
export const setGoogleServiceAccountEmailAtom = atom(
  null,
  (get, set, email: string | undefined) => {
    const sheet = get(sheetAccessAtom)
    set(sheetAccessAtom, { ...sheet, googleServiceAccountEmail: email })
  }
)

/**
 * Write atom: Update Google private key
 * Handles conversion of escaped newlines to actual newlines (same as Redux reducer)
 */
export const setGooglePrivateKeyAtom = atom(
  null,
  (get, set, privateKey: string | undefined) => {
    const sheet = get(sheetAccessAtom)
    set(sheetAccessAtom, {
      ...sheet,
      googlePrivateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : privateKey
    })
  }
)

/**
 * Write atom: Enable or disable a feature
 */
export const setFeatureEnabledAtom = atom(
  null,
  (get, set, featureId: Feature, enabled: boolean) => {
    const features = get(featuresAtom)
    const newFeatures = enabled
      ? features.includes(featureId)
        ? features
        : [...features, featureId]
      : features.filter((f) => f !== featureId)

    set(featuresAtom, newFeatures)
  }
)

/**
 * Write atom: Initialize settings from storage
 * Called by SettingsBridge on mount (atomWithStorage handles auto-loading)
 * This atom is included for future custom initialization logic if needed
 */
export const initializeSettingsAtom = atom(
  null,
  async (get, set) => {
    // Note: atomWithStorage handles loading automatically
    // This atom is for compatibility and future custom loading logic
  }
)
