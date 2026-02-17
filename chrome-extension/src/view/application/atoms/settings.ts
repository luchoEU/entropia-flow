import { atom, Atom } from 'jotai'
import { Feature, SettingsState, SheetAccessInfo } from '../state/settings'
import { isFeatureEnabled } from '../state/settings'
import { createStorageHelpers } from './chromeStoragePersistence'

const sheetAccessStorage = createStorageHelpers<SheetAccessInfo>('settings-sheet')
const featuresStorage = createStorageHelpers<Feature[]>('settings-features')

// Initial states
const initialSheetAccess: SheetAccessInfo = {
  budgetDocumentId: undefined,
  ttServiceDocumentId: undefined,
  googleServiceAccountEmail: undefined,
  googlePrivateKey: undefined,
  itemsSheetPersistenceMode: undefined
}

const initialFeatures: Feature[] = [Feature.unfreezeTab]

/**
 * Base atom for sheet access credentials
 * Persisted to Chrome storage
 */
export const sheetAccessAtom = atom<SheetAccessInfo>(initialSheetAccess)

/**
 * Base atom for enabled features
 * Persisted to Chrome storage
 */
export const featuresAtom = atom<Feature[]>(initialFeatures)

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
 * Write atom: Initialize settings from Chrome storage
 */
export const initializeSettingsAtom = atom(
  null,
  async (get, set) => {
    const [sheet, features] = await Promise.all([
      sheetAccessStorage.load(),
      featuresStorage.load()
    ])

    if (sheet) {
      set(sheetAccessAtom, sheet)
    }
    if (features) {
      set(featuresAtom, features)
    }
  }
)

/**
 * Write atom: Set entire settings state
 * Used by SettingsBridge for Redux/Jotai sync during migration
 */
export const setSettingsStateAtom = atom(
  null,
  async (get, set, newState: SettingsState) => {
    set(sheetAccessAtom, newState.sheet)
    set(featuresAtom, newState.features)
    await Promise.all([
      sheetAccessStorage.save(newState.sheet),
      featuresStorage.save(newState.features)
    ])
  }
)

/**
 * Write atom: Update budget document ID
 */
export const setBudgetDocumentIdAtom = atom(
  null,
  async (get, set, documentId: string | undefined) => {
    const sheet = get(sheetAccessAtom)
    const newSheet = { ...sheet, budgetDocumentId: documentId }
    set(sheetAccessAtom, newSheet)
    await sheetAccessStorage.save(newSheet)
  }
)

/**
 * Write atom: Update TT service document ID
 */
export const setTTServiceDocumentIdAtom = atom(
  null,
  async (get, set, documentId: string | undefined) => {
    const sheet = get(sheetAccessAtom)
    const newSheet = { ...sheet, ttServiceDocumentId: documentId }
    set(sheetAccessAtom, newSheet)
    await sheetAccessStorage.save(newSheet)
  }
)

/**
 * Write atom: Update Google service account email
 */
export const setGoogleServiceAccountEmailAtom = atom(
  null,
  async (get, set, email: string | undefined) => {
    const sheet = get(sheetAccessAtom)
    const newSheet = { ...sheet, googleServiceAccountEmail: email }
    set(sheetAccessAtom, newSheet)
    await sheetAccessStorage.save(newSheet)
  }
)

/**
 * Write atom: Update Google private key
 * Handles conversion of escaped newlines to actual newlines (same as Redux reducer)
 */
export const setGooglePrivateKeyAtom = atom(
  null,
  async (get, set, privateKey: string | undefined) => {
    const sheet = get(sheetAccessAtom)
    const newSheet = {
      ...sheet,
      googlePrivateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : privateKey
    }
    set(sheetAccessAtom, newSheet)
    await sheetAccessStorage.save(newSheet)
  }
)

/**
 * Write atom: Enable or disable a feature
 */
export const setFeatureEnabledAtom = atom(
  null,
  async (get, set, featureId: Feature, enabled: boolean) => {
    const features = get(featuresAtom)
    const newFeatures = enabled
      ? features.includes(featureId)
        ? features
        : [...features, featureId]
      : features.filter((f) => f !== featureId)

    set(featuresAtom, newFeatures)
    await featuresStorage.save(newFeatures)
  }
)

/**
 * Write atom: Update items sheet persistence mode
 */
export const setItemsSheetPersistenceModeAtom = atom(
  null,
  async (get, set, mode: 'sheet' | 'browser' | undefined) => {
    const sheet = get(sheetAccessAtom)
    const newSheet = { ...sheet, itemsSheetPersistenceMode: mode }
    set(sheetAccessAtom, newSheet)
    await sheetAccessStorage.save(newSheet)
  }
)
