import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { STREAM_TABULAR_TRASH } from '../../application/state/stream'
import ImgButton from '../common/ImgButton'
import { useNavigate } from 'react-router-dom'
import { TabId } from '../../application/state/navigation'
import { streamStateAtom, emptyTrashLayoutsAtom } from '../../application/atoms/stream'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { streamTrashItemsAtom } from '../../application/atoms/streamTables'
import { streamTrashConfig } from '../../application/configs/streamTableConfigs'

function StreamTrashPage() {
    const navigate = useNavigate()
    const streamState = useAtomValue(streamStateAtom)
    const trashLayouts = useMemo(() => streamState.in.trashLayouts, [streamState.in.trashLayouts])
    const emptyTrash = useSetAtom(emptyTrashLayoutsAtom)
    const isEmpty = Object.keys(trashLayouts).length === 0

    const afterSearch = useMemo(() => (
        <button
            className="button-empty-trash"
            title="warning: you can not undo this operation"
            onClick={() => emptyTrash()}
        >
            Empty Trash
        </button>
    ), [emptyTrash])

    return <section>
        <h1 className='img-hover-container'>
            <ImgButton title='Back to list' src='img/left.png' beforeText='Trashed layouts' action={() => { navigate(TabId.STREAM); return true }}/>
        </h1>
        {isEmpty ? <p>Trash is empty</p> : (
            <JotaiSortableTableSection
                selector={STREAM_TABULAR_TRASH}
                title="Trash"
                subtitle="Trashed layouts"
                itemsAtom={streamTrashItemsAtom}
                config={streamTrashConfig}
                afterSearch={afterSearch}
                itemHeight={64}
            />
        )}
    </section>
}

export default StreamTrashPage
