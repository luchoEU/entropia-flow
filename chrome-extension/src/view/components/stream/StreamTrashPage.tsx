import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { SortableTabularSearch, SortableTabularTable } from '../common/SortableTabularSection';
import { STREAM_TABULAR_TRASH } from '../../application/state/stream';
import ImgButton from '../common/ImgButton';
import { NavigateFunction } from 'react-router-dom';
import { navigateToTab } from '../../application/actions/navigation';
import { TabId } from '../../application/state/navigation';
import LayoutRowValueRender from '../common/SortableTabularSection.layoutRender';
import { getStreamTrashLayouts } from '../../application/selectors/stream';
import { emptyTrashLayouts } from '../../application/actions/stream';

function StreamTrashPage() {
    const dispatch = useDispatch();
    const trashLayouts = useSelector(getStreamTrashLayouts);
    const isEmpty = Object.keys(trashLayouts).length === 0;
    return <section>
        <h1 className='img-container-hover'>
            <ImgButton title='Back to list' src='img/left.png' beforeText='Trashed layouts' dispatch={(n: NavigateFunction) => navigateToTab(n, TabId.STREAM)}/>
        </h1>
        {isEmpty ? <p>Trash is empty</p> : <>
            <SortableTabularSearch selector={STREAM_TABULAR_TRASH} afterSearch={(data) => [
                { button: 'Empty Trash', title: 'warning: you can not undo this operation', class: 'button-empty-trash', dispatch: () => emptyTrashLayouts },
            ]} />
            <SortableTabularTable selector={STREAM_TABULAR_TRASH} rowValueRender={LayoutRowValueRender} />
        </>}
    </section>
}

export default StreamTrashPage
