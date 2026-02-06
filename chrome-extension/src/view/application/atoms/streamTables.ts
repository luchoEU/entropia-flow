import { atom } from 'jotai'
import { streamStateAtom } from './stream'
import { streamTabularDataFromLayouts, streamTabularDataFromVariables } from '../tabular/stream'
import {
  STREAM_TABULAR_CHOOSER,
  STREAM_TABULAR_TRASH,
  STREAM_TABULAR_VARIABLES,
  STREAM_TABULAR_IMAGES,
  STREAM_TABULAR_PARAMETERS
} from '../state/stream'
import { StreamChooserLine, StreamTrashLine } from '../tabular/stream'
import { StreamComputedVariable } from '../../../stream/data'

/**
 * Stream Table Atoms
 * Derived atoms that extract specific data from streamStateAtom for each table type
 */

export const streamChooserItemsAtom = atom((get) => {
  const stream = get(streamStateAtom)
  const data = streamTabularDataFromLayouts(stream.in.layouts, stream.in.trashLayouts)
  return data[STREAM_TABULAR_CHOOSER].items as StreamChooserLine[]
})

export const streamTrashItemsAtom = atom((get) => {
  const stream = get(streamStateAtom)
  const data = streamTabularDataFromLayouts(stream.in.layouts, stream.in.trashLayouts)
  return data[STREAM_TABULAR_TRASH].items as StreamTrashLine[]
})

export const streamVariablesItemsAtom = atom((get) => {
  const stream = get(streamStateAtom)
  const layoutId = stream.ui.showingLayoutId
  const tabularData = streamTabularDataFromVariables(stream.variables, {
    layoutId: layoutId ?? '',
    readonly: false
  })
  return tabularData[STREAM_TABULAR_VARIABLES].items as StreamComputedVariable[]
})

export const streamImagesItemsAtom = atom((get) => {
  const stream = get(streamStateAtom)
  const layoutId = stream.ui.showingLayoutId
  const tabularData = streamTabularDataFromVariables(stream.variables, {
    layoutId: layoutId ?? '',
    readonly: false
  })
  return tabularData[STREAM_TABULAR_IMAGES].items as StreamComputedVariable[]
})

export const streamParametersItemsAtom = atom((get) => {
  const stream = get(streamStateAtom)
  const layoutId = stream.ui.showingLayoutId
  const tabularData = streamTabularDataFromVariables(stream.variables, {
    layoutId: layoutId ?? '',
    readonly: false
  })
  return tabularData[STREAM_TABULAR_PARAMETERS].items as StreamComputedVariable[]
})
