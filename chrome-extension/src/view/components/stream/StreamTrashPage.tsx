import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai';
import { SortableTabularSearch, SortableTabularTable } from '../common/SortableTabularSection';
import { STREAM_TABULAR_TRASH } from '../../application/state/stream';
import ImgButton from '../common/ImgButton';
import { useNavigate } from 'react-router-dom';
import { TabId } from '../../application/state/navigation';
import LayoutRowValueRender from '../common/SortableTabularSection.layoutRender';
import { streamStateAtom, emptyTrashLayoutsAtom } from '../../application/atoms/stream';

function StreamTrashPage() {
    const navigate = useNavigate();
    const streamState = useAtomValue(streamStateAtom)
    const trashLayouts = useMemo(() => streamState.in.trashLayouts, [streamState.in.trashLayouts])
    const emptyTrash = useSetAtom(emptyTrashLayoutsAtom)
    const isEmpty = Object.keys(trashLayouts).length === 0;
    return <section>
        <h1 className='img-hover-container'>
            <ImgButton title='Back to list' src='img/left.png' beforeText='Trashed layouts' dispatch={() => { navigate(TabId.STREAM); return true }}/>
        </h1>
        {isEmpty ? <p>Trash is empty</p> : <>
            <SortableTabularSearch selector={STREAM_TABULAR_TRASH} afterSearch={(data) => [
                { button: 'Empty Trash', title: 'warning: you can not undo this operation', class: 'button-empty-trash', dispatch: () => { emptyTrash(); return true } },
            ]} />
            <SortableTabularTable selector={STREAM_TABULAR_TRASH} rowValueRender={LayoutRowValueRender} />
        </>}
    </section>
}

export default StreamTrashPage
