import { atom } from 'jotai'
import { streamStateAtom } from './stream'
import { StreamComputedVariable, StreamRenderLayout } from '../../../stream/data'
import { computeFormulas } from '../../../stream/formulaCompute'

/**
 * Stream Table Data Types
 */
export interface StreamChooserLine {
  id: string
  name: string
  readonly: boolean
  stared: boolean
  layout: StreamRenderLayout
}

export interface StreamTrashLine {
  id: string
  name: string
  layout: StreamRenderLayout
}

/**
 * Stream Table Atoms
 * Derived atoms that extract specific data from streamStateAtom for each table type
 */

/**
 * Stream chooser items - available layouts
 */
export const streamChooserItemsAtom = atom<StreamChooserLine[]>((get) => {
  const stream = get(streamStateAtom)

  return Object.entries(stream.in.layouts).map(([id, layout]) => ({
    id,
    name: layout.name,
    readonly: !!layout.readonly,
    stared: !!layout.stared,
    layout
  }))
})

/**
 * Stream trash items - trashed layouts
 */
export const streamTrashItemsAtom = atom<StreamTrashLine[]>((get) => {
  const stream = get(streamStateAtom)

  return Object.entries(stream.in.trashLayouts).map(([id, layout]) => ({
    id,
    name: layout.name,
    layout
  }))
})

/**
 * Stream variables items - computed variables for the current layout
 */
export const streamVariablesItemsAtom = atom<StreamComputedVariable[]>((get) => {
  const stream = get(streamStateAtom)
  const variables = stream.variables

  // Get all variables from all sources, flatten
  const allVars = Object.entries(variables.single)
    .map(([source, data]) => data.map(v => ({ source, ...v })))
    .flat()

  // Filter to non-image, non-parameter variables
  const noImages = allVars.filter(v => !v.isImage && !v.isParameter)

  // Compute formulas
  const obj = Object.fromEntries(noImages.map(v => [v.name, v.value]))
  obj.img = Object.fromEntries(
    allVars.filter(v => v.isImage).map(v => [v.name, `img.${v.name}`])
  )
  const tObj = Object.fromEntries(
    Object.values(variables.temporal).flat().map(v => [v.name, v.value])
  )
  const computedObj = computeFormulas(obj, tObj)

  // Add computed values to each variable
  return noImages.map(v => ({ ...v, computed: computedObj[v.name] }))
})

/**
 * Stream images items
 */
export const streamImagesItemsAtom = atom<StreamComputedVariable[]>((get) => {
  const stream = get(streamStateAtom)
  const variables = stream.variables

  return Object.entries(variables.single)
    .map(([source, data]) => data.map(v => ({ source, ...v })))
    .flat()
    .filter(v => v.isImage)
})

/**
 * Stream parameters items
 */
export const streamParametersItemsAtom = atom<StreamComputedVariable[]>((get) => {
  const stream = get(streamStateAtom)
  const variables = stream.variables

  return Object.entries(variables.single)
    .map(([source, data]) => data.map(v => ({ source, ...v })))
    .flat()
    .filter(v => v.isParameter)
})
