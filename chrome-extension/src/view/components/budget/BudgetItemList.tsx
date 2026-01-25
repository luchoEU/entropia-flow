import React, { useState, DragEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection2'
import { getBudget } from '../../application/selectors/budget'
import { getInventory } from '../../application/selectors/inventory'
import { getItemList } from '../../application/helpers/inventory'
import { addBudgetGroup, clearBudgetItemPendingLines, deleteBudgetPendingLine, updateBudgetPendingLine, disableBudgetItem, enableBudgetItem, disableBudgetMaterial, enableBudgetMaterial, moveItemToGroup, refreshBudget, removeBudgetGroup, renameBudgetGroup, sendBudgetPendingLines, toggleBudgetGroupExpanded, toggleBudgetUngroupedExpanded, toggleBudgetShowDisabled, enableBudgetGroup, disableBudgetGroup } from '../../application/actions/budget'
import ImgButton from '../common/ImgButton'
import { STAGE_INITIALIZING, StageText } from '../../services/api/sheets/sheetsStages'
import ExpandableArrowButton from '../common/ExpandableArrowButton'
import { formatDateTime } from '../../../common/time'
import { budgetItemMaterialUrl, budgetItemUrl } from '../../application/actions/navigation'
import { useNavigate } from 'react-router-dom'
import { BudgetDetailsViewData, calculateBudgetViewData, calculateMaterialDetailsViewData, GroupViewData, ItemViewData, MaterialDetailsViewData, UrlSelection } from '../../application/helpers/budgetViewData'

interface EditingPendingLine {
    itemName: string
    lineIdx: number
    ped: string
    materials: { name: string, quantity: string }[]
}

const BudgetDetailsPanel = ({ viewData }: { viewData: BudgetDetailsViewData | null }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [editingLine, setEditingLine] = useState<EditingPendingLine | null>(null)

    if (!viewData) {
        return <></>
    }

    const startEditing = (itemName: string, lineIdx: number, ped: number | undefined, materials: { name: string, quantity: number }[], matNames: string[]) => {
        setEditingLine({
            itemName,
            lineIdx,
            ped: ped?.toString() ?? '0',
            materials: matNames.map(name => {
                const mat = materials.find(m => m.name === name)
                return { name, quantity: mat?.quantity?.toString() ?? '' }
            })
        })
    }

    const cancelEditing = () => {
        setEditingLine(null)
    }

    const confirmEditing = () => {
        if (!editingLine) return
        const ped = parseFloat(editingLine.ped) || 0
        const materials = editingLine.materials
            .filter(m => m.quantity !== '')
            .map(m => ({ name: m.name, quantity: parseFloat(m.quantity) || 0 }))
        dispatch(updateBudgetPendingLine(editingLine.itemName, editingLine.lineIdx, ped, materials))
        setEditingLine(null)
    }

    const updateEditingPed = (value: string) => {
        if (!editingLine) return
        setEditingLine({ ...editingLine, ped: value })
    }

    const updateEditingMaterial = (name: string, quantity: string) => {
        if (!editingLine) return
        setEditingLine({
            ...editingLine,
            materials: editingLine.materials.map(m => m.name === name ? { ...m, quantity } : m)
        })
    }

    const isEditing = (itemName: string, lineIdx: number) =>
        editingLine?.itemName === itemName && editingLine?.lineIdx === lineIdx

    return <div className='trade-item-data'>
        <h2 className='pointer img-container-hover' onClick={() => navigate('/budget')}>
            Budget: {viewData.title} <img src='img/left.png' />
        </h2>

        {viewData.items.map(item => <p key={item.name}><a href={item.url} target='_blank' rel='noopener noreferrer'>Open {item.name} in Google Sheets</a></p>)}

        <p>PED Reserve: {viewData.totals.peds.toFixed(2)}</p>
        <p>Total Balance including Markup: {viewData.totalBalanceWithMarkup.toFixed(2)} PED</p>

        {viewData.materials.length > 0 && <>
            <table>
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Budget Qty</th>
                        <th>Value</th>
                        <th>with MU</th>
                        <th>Balance Qty</th>
                        <th>with MU</th>
                    </tr>
                </thead>
                <tbody>
                    {viewData.materials.map(mat => (
                        <tr key={mat.name}>
                            <td className='pointer' onClick={() => navigate(budgetItemMaterialUrl(viewData.selectedItem!, mat.name))}>{mat.name}</td>
                            <td align='right'>{mat.budgetQuantity}</td>
                            <td align='right'>{mat.budgetValue.toFixed(2)} PED</td>
                            <td align='right'>{mat.budgetWithMarkup.toFixed(2)} PED</td>
                            <td align='right'>{mat.balanceQuantity}</td>
                            <td align='right'>{mat.balanceWithMarkup.toFixed(2)} PED</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>}

        {viewData.pendingLines.length > 0 && <>
            <hr />
            <h3>Pending Lines</h3>
            {viewData.pendingLines.map(({ itemName, lines, matNames }) => (
                <div key={itemName}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4>{itemName}</h4>
                        {lines.filter(l => l.reason != 'Balance').length > 0 && (
                            <button
                                onClick={() => dispatch(clearBudgetItemPendingLines(itemName))}
                                style={{ fontSize: '12px', padding: '2px 6px' }}
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <table style={{ marginLeft: '20px' }} className="table-diff">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Date</th>
                                <th></th>
                                <th>Reason</th>
                                <th>PED</th>
                                {matNames.map((n, idx) => <th key={idx}>{n}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line, idx) => {
                                const editing = isEditing(itemName, idx)
                                return (
                                    <tr key={idx}>
                                        <td>
                                            {line.reason !== 'Balance' && !editing && (
                                                <ImgButton
                                                    title='Delete pending line'
                                                    src='img/cross.png'
                                                    dispatch={() => dispatch(deleteBudgetPendingLine(itemName, line.index))}
                                                />
                                            )}
                                        </td>
                                        <td>{formatDateTime(line.date)}</td>
                                        <td>
                                            {line.reason !== 'Balance' && !editing && (
                                                <ImgButton
                                                    title='Edit pending line'
                                                    src='img/edit.png'
                                                    dispatch={() => startEditing(itemName, line.index, line.ped, line.materials, matNames)}
                                                />
                                            )}
                                            {editing && (
                                                <>
                                                    <ImgButton
                                                        title='Confirm edit'
                                                        src='img/tick.png'
                                                        show
                                                        dispatch={confirmEditing}
                                                    />
                                                    <ImgButton
                                                        title='Cancel edit'
                                                        src='img/cross.png'
                                                        show
                                                        dispatch={cancelEditing}
                                                    />
                                                </>
                                            )}
                                        </td>
                                        <td>{line.reason}</td>
                                        <td align='right'>
                                            {editing ? (
                                                <input
                                                    type='text'
                                                    value={editingLine?.ped ?? ''}
                                                    onChange={(e) => updateEditingPed(e.target.value)}
                                                    style={{ width: '60px', textAlign: 'right' }}
                                                />
                                            ) : (
                                                line.ped?.toFixed(2) || '0.00'
                                            )}
                                        </td>
                                        {matNames.map((n, matIdx) => {
                                            const m = line.materials.find(m => m.name === n)
                                            return (
                                                <td key={matIdx} align='right'>
                                                    {editing ? (
                                                        <input
                                                            type='text'
                                                            value={editingLine?.materials.find(em => em.name === n)?.quantity ?? ''}
                                                            onChange={(e) => updateEditingMaterial(n, e.target.value)}
                                                            style={{ width: '60px', textAlign: 'right' }}
                                                        />
                                                    ) : (
                                                        m?.quantity ?? ''
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ))}
            <br />
            <button onClick={() => dispatch(sendBudgetPendingLines(viewData.pendingLinesForAction))} disabled={viewData.stage !== STAGE_INITIALIZING}>Apply Pending Lines</button>
        </>}
    </div>
}

const MaterialDetailsPanel = ({ viewData, selectedItem }: { viewData: MaterialDetailsViewData | null, selectedItem: string | null }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    if (!viewData) {
        return null
    }

    return (
        <div className='trade-item-data'>
            <h2 className='pointer img-container-hover' onClick={() => navigate(budgetItemUrl(selectedItem!))}>
                Material: {viewData.materialName} <img src='img/left.png' />
            </h2>
            <p>Markup: {(viewData.markup * 100).toFixed(2)}%</p>
            <p>Balance with markup: {viewData.balanceWithMarkup.toFixed(2)} PED</p>
            <table className='table-diff' style={{ backgroundColor: 'transparent' }}>
                <thead>
                    <tr>
                        <th>Container</th>
                        <th>Sheet Qty</th>
                        <th>Sheet Value</th>
                        <th>Pending Qty</th>
                        <th>Pending Value</th>
                        <th>Holding Qty</th>
                        <th>Holding Value</th>
                    </tr>
                </thead>
                <tbody>
                    {viewData.items.map(item => (
                        <tr key={item.itemName}>
                            <td>
                                {item.real ? (
                                    <>
                                        {item.real.disabled ? (
                                            <ImgButton title='Enable this material' src='img/tick.png'
                                                dispatch={() => dispatch(enableBudgetMaterial(viewData.sheetName, item.itemName))} />
                                        ) : (
                                            <ImgButton title='Disable this material' src='img/cross.png'
                                                dispatch={() => dispatch(disableBudgetMaterial(viewData.sheetName, item.itemName))} />
                                        )}
                                        {item.itemName}
                                    </>
                                ) : item.budget ? (
                                    `${item.itemName} sheet`
                                ) : (
                                    `${item.itemName} pending`
                                )}
                            </td>
                            <td align='right'>{item.budget ? item.budget.quantity : ''}</td>
                            <td align='right'>{item.budget ? (item.budget.quantity * viewData.materialUnitValue).toFixed(2) + ' PED' : ''}</td>
                            <td align='right'>{item.pending ? item.pending.quantity : ''}</td>
                            <td align='right'>{item.pending ? (item.pending.quantity * viewData.materialUnitValue).toFixed(2) + ' PED' : ''}</td>
                            <td align='right'>{item.real ? (item.real.disabled ? `(${item.real.quantity})` : item.real.quantity) : ''}</td>
                            <td align='right'>{item.real && !item.real.disabled ? (item.real.quantity * viewData.materialUnitValue).toFixed(2) + ' PED' : ''}</td>
                        </tr>
                    ))}
                    <tr key='total'>
                        <td><strong>TOTAL</strong></td>
                        <td align='right'><strong>{viewData.totals.budgetQuantity}</strong></td>
                        <td align='right'><strong>{(viewData.totals.budgetQuantity * viewData.materialUnitValue).toFixed(2)} PED</strong></td>
                        <td align='right'><strong>{viewData.totals.pendingQuantity}</strong></td>
                        <td align='right'><strong>{(viewData.totals.pendingQuantity * viewData.materialUnitValue).toFixed(2)} PED</strong></td>
                        <td align='right'><strong>{viewData.totals.realQuantity}</strong></td>
                        <td align='right'><strong>{(viewData.totals.realQuantity * viewData.materialUnitValue).toFixed(2)} PED</strong></td>
                    </tr>
                    <tr key='balance'>
                        <td>Balance</td>
                        <td align='right'>{viewData.balanceQuantity}</td>
                        <td align='right'>{(viewData.balanceQuantity * viewData.materialUnitValue).toFixed(2)} PED</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

function BudgetItemList({ selected: selectedItem, selectedMaterial }: { selected: string | null, selectedMaterial: string | null }) {
    const budgetState = useSelector(getBudget)
    const inventoryState = useSelector(getInventory)
    const inventory = getItemList(inventoryState)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [draggedItem, setDraggedItem] = useState<string | null>(null)
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')
    const showDisabled = budgetState.list.showDisabled ?? false

    const viewData = calculateBudgetViewData(budgetState, inventory)

    // Get selected item and group from URL parameter
    const getSelectedFromUrl = (): UrlSelection | null => {
        if (!selectedItem) return null

        // Check if it's an item
        const allItemNames = [
            ...viewData.ungrouped.items.map(i => i.name),
            ...viewData.groups.flatMap(g => g.items.map(i => i.name))
        ]

        if (allItemNames.includes(selectedItem)) {
            return {
                type: 'item',
                itemName: selectedItem,
                selectedItem,
                selectedMaterial
            }
        }

        // Check if it's a group
        const group = viewData.groups.find(g => g.id === selectedItem)
        if (group) {
            return {
                type: 'group',
                groupId: selectedItem,
                selectedItem,
                selectedMaterial
            }
        }

        // Check if it's totals
        if (selectedItem === 'totals') {
            return {
                type: 'totals',
                selectedItem,
                selectedMaterial
            }
        }

        return null
    }

    const urlSelection = getSelectedFromUrl()

    // Get pre-calculated details panel view data from the appropriate row
    const getBudgetDetailsPanelViewData = (): BudgetDetailsViewData | null => {
        if (!urlSelection) return null

        if (urlSelection.type === 'item') {
            // Find the item in groups or ungrouped
            for (const group of viewData.groups) {
                const item = group.items.find(i => i.name === urlSelection.itemName)
                if (item) return item.detailsViewData
            }
            const ungroupedItem = viewData.ungrouped.items.find(i => i.name === urlSelection.itemName)
            if (ungroupedItem) return ungroupedItem.detailsViewData
        } else if (urlSelection.type === 'group') {
            const group = viewData.groups.find(g => g.id === urlSelection.groupId)
            if (group) return group.detailsViewData
        } else if (urlSelection.type === 'totals') {
            return viewData.totals.detailsViewData
        }

        return null
    }

    const budgetDetailsPanelViewData = getBudgetDetailsPanelViewData()
    const materialDetailsPanelViewData = urlSelection?.selectedMaterial ? calculateMaterialDetailsViewData(budgetState, urlSelection.selectedMaterial, inventory) : null

    const handleDragStart = (e: DragEvent<HTMLTableRowElement>, itemName: string) => {
        setDraggedItem(itemName)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragEnd = () => {
        setDraggedItem(null)
    }

    const handleDragOver = (e: DragEvent<HTMLTableSectionElement>) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDropOnGroup = (e: DragEvent<HTMLTableSectionElement>, groupId: string | null) => {
        e.preventDefault()
        if (draggedItem) {
            dispatch(moveItemToGroup(draggedItem, groupId))
            setDraggedItem(null)
        }
    }

    const handleAddGroup = () => {
        const name = prompt('Enter group name:')
        if (name && name.trim()) {
            dispatch(addBudgetGroup(name.trim()))
        }
    }

    const handleStartRename = (group: GroupViewData) => {
        setEditingGroupId(group.id)
        setEditingName(group.name)
    }

    const handleFinishRename = () => {
        if (editingGroupId && editingName.trim()) {
            dispatch(renameBudgetGroup(editingGroupId, editingName.trim()))
        }
        setEditingGroupId(null)
        setEditingName('')
    }

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFinishRename()
        } else if (e.key === 'Escape') {
            setEditingGroupId(null)
            setEditingName('')
        }
    }

    const isItemSelected = (itemName: string) =>
        urlSelection?.type === 'item' && urlSelection.itemName === itemName

    const isGroupSelected = (groupId: string) =>
        urlSelection?.type === 'group' && urlSelection.groupId === groupId

    const isTotalsSelected = urlSelection?.type === 'totals'

    const isGroupExpanded = (groupId: string) => {
        const group = viewData.groups.find(g => g.id === groupId)
        return group?.expanded ||
               (selectedItem && group?.itemNames.includes(selectedItem)) ||
               false
    }

    const isUngroupedExpanded = () =>
        viewData.ungrouped.expanded ||
        (selectedItem && viewData.ungrouped.items.some(item => item.name === selectedItem)) ||
        false

    const renderItemRow = (itemData: ItemViewData) => {
        const { name, peds, stored, markup, total, balance, isLoading, isLoaded, pendingAmount, disabled } = itemData

        return (
            <tr
                key={name}
                draggable
                onDragStart={(e) => handleDragStart(e, name)}
                onDragEnd={handleDragEnd}
                className={`pointer ${draggedItem === name ? 'dragging' : ''} ${isItemSelected(name) ? 'selected' : ''} ${isLoading ? 'budget-item-loading' : ''} ${isLoaded ? 'budget-item-loaded' : ''} ${disabled ? 'budget-item-disabled' : ''}`}
                style={{
                    cursor: 'grab',
                    opacity: isLoading || disabled ? 0.6 : 1
                }}
                onClick={() => navigate(budgetItemUrl(name))}
            >
                <td align='center'>
                    {isLoading && (
                        <div className="budget-spinner" title="Loading...">
                            <div className="spinner-small"></div>
                        </div>
                    )}
                    {isLoaded && (
                        <div className="budget-checkmark" title="Loaded successfully">
                            ✓
                        </div>
                    )}
                    {!isLoading && !isLoaded && pendingAmount > 0 && (
                        <div className="budget-pending-indicator" title={`${pendingAmount} pending`}>
                            <span className="pending-badge">{pendingAmount}</span>
                        </div>
                    )}
                </td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {disabled ? (
                            <ImgButton title='Enable' src='img/tick.png' dispatch={() => dispatch(enableBudgetItem(name))} />
                        ) : (
                            <ImgButton title='Disable' src='img/cross.png' dispatch={() => dispatch(disableBudgetItem(name))} />
                        )}
                        <span style={{
                            fontStyle: isLoading ? 'italic' : 'normal',
                            color: isLoading || disabled ? '#666' : 'inherit',
                            textDecoration: disabled ? 'line-through' : 'none'
                        }}>
                            {name}
                        </span>
                    </div>
                </td>
                <td align='right'>{disabled ? '' : peds.toFixed(2)}</td>
                <td align='right'>{disabled ? '' : stored.toFixed(2)}</td>
                <td align='right'>{disabled ? '' : markup.toFixed(2)}</td>
                <td align='right'>{disabled ? '' : total.toFixed(2)}</td>
                <td align='right'>{disabled ? '' : balance.toFixed(2)}</td>
            </tr>
        )
    }

    const renderGroupHeader = (groupData: GroupViewData) => {
        const isEditing = editingGroupId === groupData.id

        return (
            <tr
                className={`budget-group-header pointer ${isGroupSelected(groupData.id) ? 'selected' : ''} ${groupData.disabled ? 'budget-item-disabled' : ''}`}
                onClick={() => navigate(budgetItemUrl(groupData.id))}
                style={{ opacity: groupData.disabled ? 0.6 : 1 }}
            >
                <td></td>
                <td>
                    <ExpandableArrowButton
                        expanded={isGroupExpanded(groupData.id)}
                        setExpanded={() => toggleBudgetGroupExpanded(groupData.id)}
                    />
                    {groupData.disabled ? (
                        <ImgButton title='Enable group' src='img/tick.png' dispatch={() => dispatch(enableBudgetGroup(groupData.id))} />
                    ) : (
                        <ImgButton title='Disable group' src='img/cross.png' dispatch={() => dispatch(disableBudgetGroup(groupData.id))} />
                    )}
                    {isEditing ? (
                        <input
                            type='text'
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={handleFinishRename}
                            onKeyDown={handleRenameKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            style={{ width: '150px' }}
                        />
                    ) : (
                        <span style={{
                            color: groupData.disabled ? '#666' : 'inherit',
                            textDecoration: groupData.disabled ? 'line-through' : 'none'
                        }}>
                            {groupData.name}
                        </span>
                    )}
                    {!isEditing && <ImgButton
                        title='Rename group'
                        src='img/edit.png'
                        dispatch={() => handleStartRename(groupData)}
                        style={{ marginLeft: '8px' }}
                    />}
                    <ImgButton
                        title='Delete group'
                        src='img/cross.png'
                        dispatch={() => removeBudgetGroup(groupData.id)}
                        style={{ marginLeft: '8px' }}
                    />
                </td>
                <td align='right'>{groupData.disabled ? '' : groupData.peds.toFixed(2)}</td>
                <td align='right'>{groupData.disabled ? '' : groupData.stored.toFixed(2)}</td>
                <td align='right'>{groupData.disabled ? '' : groupData.markup.toFixed(2)}</td>
                <td align='right'>{groupData.disabled ? '' : groupData.total.toFixed(2)}</td>
                <td align='right'>{groupData.disabled ? '' : groupData.balance.toFixed(2)}</td>
            </tr>
        )
    }

    const renderGroup = (groupData: GroupViewData) => {
        const visibleItems = showDisabled ? groupData.items : groupData.items.filter(i => !i.disabled)
        return (
            <tbody
                key={groupData.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnGroup(e, groupData.id)}
                className={draggedItem ? 'drop-target' : ''}
            >
                {renderGroupHeader(groupData)}
                {isGroupExpanded(groupData.id) && visibleItems.map(renderItemRow)}
                {isGroupExpanded(groupData.id) && visibleItems.length === 0 && (
                    <tr className='budget-empty-group'>
                        <td colSpan={6} style={{ fontStyle: 'italic', color: '#888' }}>
                            Drag items here
                        </td>
                    </tr>
                )}
            </tbody>
        )
    }

    const renderUngroupedSection = () => {
        const { peds, stored, markup, total, balance, items } = viewData.ungrouped
        const visibleItems = showDisabled ? items : items.filter(i => !i.disabled)

        return (
            <tbody
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnGroup(e, null)}
                className={draggedItem ? 'drop-target' : ''}
            >
                <tr className='budget-group-header'>
                    <td></td>
                    <td>
                        <ExpandableArrowButton
                            expanded={isUngroupedExpanded()}
                            setExpanded={() => toggleBudgetUngroupedExpanded()}
                        />
                        <strong>Ungrouped</strong>
                    </td>
                    <td align='right'>{peds.toFixed(2)}</td>
                    <td align='right'>{stored.toFixed(2)}</td>
                    <td align='right'>{markup.toFixed(2)}</td>
                    <td align='right'>{total.toFixed(2)}</td>
                    <td align='right'>{balance.toFixed(2)}</td>
                </tr>
                {isUngroupedExpanded() && visibleItems.map(renderItemRow)}
            </tbody>
        )
    }

    return (
        <ExpandableSection selector='BudgetItemList' title='List' subtitle='Budget material items'>
            <p>
                <ImgButton title='Refresh' src='img/reload.png' className='img-btn-refresh' dispatch={() => refreshBudget} disabled={viewData.stage !== STAGE_INITIALIZING}></ImgButton>
                <ImgButton title='Add Group' src='img/add.png' className='img-btn-add' dispatch={handleAddGroup} />
                <ImgButton title={showDisabled ? 'Hide Disabled' : 'Show Disabled'} className='img-btn-disabled' src={showDisabled ? 'img/eyeOpen.png' : 'img/eyeClose.png'} dispatch={() => dispatch(toggleBudgetShowDisabled())} />
                { viewData.stage === STAGE_INITIALIZING ? '' : <span className="budget-loading">{StageText[viewData.stage]}... {viewData.loadPercentage.toFixed(0)}%</span> }
            </p>
            <div className='flex'>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className='table-diff budget-items-table'>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>PEDs</th>
                            <th>Stored</th>
                            <th>Markup</th>
                            <th>Total</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                     {viewData.groups.map(renderGroup)}
                     {viewData.ungrouped.items.length > 0 && renderUngroupedSection()}
                     <tr className={`budget-group-header pointer ${isTotalsSelected ? 'selected' : ''}`} onClick={() => navigate(budgetItemUrl('totals'))}>
                         <td></td>
                         <td><strong>TOTAL</strong></td>
                         <td align='right'><strong>{viewData.totals.peds.toFixed(2)}</strong></td>
                         <td align='right'><strong>{viewData.totals.stored.toFixed(2)}</strong></td>
                         <td align='right'><strong>{viewData.totals.markup.toFixed(2)}</strong></td>
                         <td align='right'><strong>{viewData.totals.total.toFixed(2)}</strong></td>
                         <td align='right'><strong>{viewData.totals.balance.toFixed(2)}</strong></td>
                     </tr>
                     </table>
                 </div>
                 <div className='inline'>
                     <BudgetDetailsPanel viewData={budgetDetailsPanelViewData} />
                     <MaterialDetailsPanel viewData={materialDetailsPanelViewData} selectedItem={urlSelection?.selectedItem ?? null} />
                 </div>
             </div>
         </ExpandableSection>
    )
}

export default BudgetItemList
