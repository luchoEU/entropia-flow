import React, { useState, DragEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection2'
import { getBudget } from '../../application/selectors/budget'
import { addBudgetGroup, disableBudgetItem, disableBudgetMaterial, enableBudgetMaterial, moveItemToGroup, refreshBudget, removeBudgetGroup, renameBudgetGroup, setBudgetSelection, toggleBudgetGroupExpanded, toggleBudgetUngroupedExpanded } from '../../application/actions/budget'
import { BudgetGroup, BudgetItem, BudgetMaterialsMap, BudgetState } from '../../application/state/budget'
import ImgButton from '../common/ImgButton'
import { STAGE_INITIALIZING, StageText } from '../../services/api/sheets/sheetsStages'
import { getGroupTotals, getUngroupedItems } from '../../application/helpers/budget'
import ExpandableArrowButton from '../common/ExpandableArrowButton'

interface MaterialSummary {
    name: string
    quantity: number
    value: number
    valueWithMarkup: number
    balanceWithMarkup: number
}

function getMaterials(itemNames: string[], materialsMap: BudgetMaterialsMap): MaterialSummary[] {
    const result: MaterialSummary[] = []

    for (const [materialName, material] of Object.entries(materialsMap)) {
        let quantity: number | undefined = undefined

        for (const budget of material.budgetList) {
            if (itemNames.includes(budget.itemName)) {
                quantity = (quantity ?? 0) + budget.quantity
            }
        }

        if (quantity !== undefined) {
            const value = quantity * material.unitValue
            result.push({
                name: materialName,
                quantity,
                value,
                valueWithMarkup: value * material.markup,
                balanceWithMarkup: material.c.balanceWithMarkup
            })
        }
    }

    return result.sort((a, b) => a.name.localeCompare(b.name))
}



const BudgetDetailsPanel = ({ s }: { s: BudgetState }) => {
    const dispatch = useDispatch()
    const selection = s.selection

    if (!selection) {
        return <></>
    }

    let title = ''
    let url = undefined
    let itemNames: string[] = []
    if (selection.type === 'group') {
        const group = s.groups.list.find(g => g.id === selection.groupId)
        if (!group) return null
        title = group.name
        itemNames = group.itemNames
    } else if (selection.type === 'item') {
        const item = s.list.items.find(i => i.name === selection.itemName)
        if (!item) return null
        title = item.name
        url = item.url
        itemNames = [selection.itemName]
    } else {
        return null
    }

    const materials = getMaterials(itemNames, s.materials.map)

    // Calculate totals for the selected items
    const totals = itemNames.reduce((acc, itemName) => {
        const item = s.list.items.find(i => i.name === itemName)
        if (item) {
            acc.peds += item.peds
            acc.totalMU += item.totalMU
            acc.total += item.total
        }
        return acc
    }, { peds: 0, totalMU: 0, total: 0 })

    return <div className='trade-item-data'>
        <h2 className='pointer img-container-hover' onClick={() => dispatch(setBudgetSelection(null))}>
            Session: {title} <img src='img/left.png' />
        </h2>

        {url && <p><a href={url} target='_blank' rel='noopener noreferrer'>Open in Google Sheets</a></p>}

        <p>PED Reserve: {totals.peds.toFixed(2)}</p>

        {materials.length > 0 && <>
            <table>
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Value</th>
                        <th>with MU</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {materials.map(mat => (
                        <tr key={mat.name}>
                            <td className='pointer' onClick={() => dispatch(setBudgetSelection({ ...selection, materialName: mat.name }))}>{mat.name}</td>
                            <td align='right'>{mat.quantity}</td>
                            <td align='right'>{mat.value.toFixed(2)} PED</td>
                            <td align='right'>{mat.valueWithMarkup.toFixed(2)} PED</td>
                            <td align='right'>{mat.balanceWithMarkup.toFixed(2)} PED</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>}
    </div>
}

const MaterialDetailsPanel = ({ s }: { s: BudgetState }) => {
    const dispatch = useDispatch()
    const selection = s.selection

    if (!selection || !selection.materialName) {
        return null
    }

    const material = s.materials.map[selection.materialName]
    if (!material) return null

    // Create a map of itemName to budget and real data
    const itemMap: { [itemName: string]: { budget?: { quantity: number, value: number }, real?: { quantity: number, value: number, disabled: boolean } } } = {}

    material.budgetList.forEach(b => {
        if (!itemMap[b.itemName]) itemMap[b.itemName] = {}
        itemMap[b.itemName].budget = { quantity: b.quantity, value: b.quantity * material.unitValue }
    })

    material.realList.forEach(r => {
        if (!itemMap[r.itemName]) itemMap[r.itemName] = {}
        itemMap[r.itemName].real = { quantity: r.quantity, value: r.quantity * material.unitValue, disabled: r.disabled }
    })

    const sortedItemNames = Object.keys(itemMap).sort()

    return (
        <div className='trade-item-data'>
            <h2 className='pointer img-container-hover' onClick={() => dispatch(setBudgetSelection({ ...selection, materialName: undefined }))}>
                Material: {selection.materialName} <img src='img/left.png' />
            </h2>
            <p>Markup: {(material.markup * 100).toFixed(2)}%</p>
            <p>Balance with markup: {(material.c.balanceWithMarkup).toFixed(2)} PED</p>
            <table className='table-diff' style={{ backgroundColor: 'transparent' }}>
                <thead>
                    <tr>
                        <th>Container</th>
                        <th>Sheet Qty</th>
                        <th>Sheet Value</th>
                        <th>Holding Qty</th>
                        <th>Holding Value</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedItemNames.map(itemName => {
                        const data = itemMap[itemName]
                        return (
                            <tr key={itemName}>
                                <td>
                                    {data.real ? (
                                        <>
                                            {data.real.disabled ? (
                                                <ImgButton title='Enable this material' src='img/tick.png'
                                                    dispatch={() => dispatch(enableBudgetMaterial(material.sheetName, itemName))} />
                                            ) : (
                                                <ImgButton title='Disable this material' src='img/cross.png'
                                                    dispatch={() => dispatch(disableBudgetMaterial(material.sheetName, itemName))} />
                                            )}
                                            {itemName}
                                        </>
                                    ) : (
                                        `${itemName} sheet`
                                    )}
                                </td>
                                <td align='right'>{data.budget ? data.budget.quantity : ''}</td>
                                <td align='right'>{data.budget ? data.budget.value.toFixed(2) + ' PED' : ''}</td>
                                <td align='right'>{data.real ? (data.real.disabled ? `(${data.real.quantity})` : data.real.quantity) : ''}</td>
                                <td align='right'>{data.real && !data.real.disabled ? data.real.value.toFixed(2) + ' PED' : ''}</td>
                            </tr>
                        )
                    })}
                    <tr key='total'>
                        <td><strong>TOTAL</strong></td>
                        <td align='right'><strong>{material.c.totalBudgetQuantity}</strong></td>
                        <td align='right'><strong>{material.c.totalBudget.toFixed(2)} PED</strong></td>
                        <td align='right'><strong>{material.c.totalRealQuantity}</strong></td>
                        <td align='right'><strong>{material.c.totalReal.toFixed(2)} PED</strong></td>
                    </tr>
                    <tr key='balance'>
                        <td>Balance</td>
                        <td align='right'>{material.c.balanceQuantity}</td>
                        <td align='right'>{material.c.balance.toFixed(2)} PED</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

function BudgetItemList() {
    const s: BudgetState = useSelector(getBudget)
    const dispatch = useDispatch()
    const [draggedItem, setDraggedItem] = useState<string | null>(null)
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')

    const ungroupedItems = getUngroupedItems(s)

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

    const handleStartRename = (group: BudgetGroup) => {
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
        s.selection?.type === 'item' && s.selection.itemName === itemName

    const isGroupSelected = (groupId: string) =>
        s.selection?.type === 'group' && s.selection.groupId === groupId

    const handleItemClick = (itemName: string) => {
        if (isItemSelected(itemName)) {
            dispatch(setBudgetSelection(null))
        } else {
            dispatch(setBudgetSelection({ type: 'item', itemName }))
        }
    }

    const handleGroupClick = (groupId: string) => {
        if (isGroupSelected(groupId)) {
            dispatch(setBudgetSelection(null))
        } else {
            dispatch(setBudgetSelection({ type: 'group', groupId }))
        }
    }

    const renderItemRow = (item: BudgetItem) => {
        const itemMaterials = getMaterials([item.name], s.materials.map)
        const materialsBalance = itemMaterials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0)
        return (
            <tr
                key={item.name}
                draggable
                onDragStart={(e) => handleDragStart(e, item.name)}
                onDragEnd={handleDragEnd}
                className={`pointer ${draggedItem === item.name ? 'dragging' : ''} ${isItemSelected(item.name) ? 'selected' : ''}`}
                style={{ cursor: 'grab' }}
                onClick={() => handleItemClick(item.name)}
            >
                <td>
                    <ImgButton title='Disable' src='img/cross.png' dispatch={() => disableBudgetItem(item.name)} />
                    {item.name}
                </td>
                <td align='right'>{item.peds.toFixed(2)}</td>
                <td align='right'>{item.totalMU.toFixed(2)}</td>
                <td align='right'>{item.total.toFixed(2)}</td>
                <td align='right'>{materialsBalance.toFixed(2)}</td>
            </tr>
        )
    }

    const renderGroupHeader = (group: BudgetGroup) => {
        const totals = getGroupTotals(group, s.list.items)
        const groupMaterials = getMaterials(group.itemNames, s.materials.map)
        const materialsBalance = groupMaterials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0)
        const isEditing = editingGroupId === group.id

        return (
            <tr
                className={`budget-group-header pointer ${isGroupSelected(group.id) ? 'selected' : ''}`}
                onClick={() => handleGroupClick(group.id)}
            >
                <td>
                    <ExpandableArrowButton
                        expanded={group.expanded}
                        setExpanded={() => toggleBudgetGroupExpanded(group.id)}
                    />
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
                        <strong
                            onDoubleClick={(e) => { e.stopPropagation(); handleStartRename(group) }}
                            title='Double-click to rename'
                            style={{ cursor: 'text' }}
                        >
                            {group.name}
                        </strong>
                    )}
                    <ImgButton
                        title='Delete group'
                        src='img/cross.png'
                        dispatch={() => removeBudgetGroup(group.id)}
                        style={{ marginLeft: '8px' }}
                    />
                </td>
                <td align='right'><strong>{totals.peds.toFixed(2)}</strong></td>
                <td align='right'><strong>{totals.totalMU.toFixed(2)}</strong></td>
                <td align='right'><strong>{totals.total.toFixed(2)}</strong></td>
                <td align='right'><strong>{materialsBalance.toFixed(2)}</strong></td>
            </tr>
        )
    }

    const renderGroup = (group: BudgetGroup) => {
        const groupItems = s.list.items.filter(i => group.itemNames.includes(i.name))

        return (
            <tbody
                key={group.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnGroup(e, group.id)}
                className={draggedItem ? 'drop-target' : ''}
            >
                {renderGroupHeader(group)}
                {group.expanded && groupItems.map(renderItemRow)}
                {group.expanded && groupItems.length === 0 && (
                    <tr className='budget-empty-group'>
                        <td colSpan={5} style={{ fontStyle: 'italic', color: '#888' }}>
                            Drag items here
                        </td>
                    </tr>
                )}
            </tbody>
        )
    }

    const renderUngroupedSection = () => {
        const totals = {
            peds: ungroupedItems.reduce((sum, i) => sum + i.peds, 0),
            totalMU: ungroupedItems.reduce((sum, i) => sum + i.totalMU, 0),
            total: ungroupedItems.reduce((sum, i) => sum + i.total, 0)
        }
        const ungroupedItemNames = ungroupedItems.map(i => i.name)
        const ungroupedMaterials = getMaterials(ungroupedItemNames, s.materials.map)
        const materialsBalance = ungroupedMaterials.reduce((sum, mat) => sum + mat.valueWithMarkup, 0)

        return (
            <tbody
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnGroup(e, null)}
                className={draggedItem ? 'drop-target' : ''}
            >
                <tr className='budget-group-header'>
                    <td>
                        <ExpandableArrowButton
                            expanded={s.groups.ungroupedExpanded}
                            setExpanded={() => toggleBudgetUngroupedExpanded()}
                        />
                        <strong>Ungrouped</strong>
                    </td>
                    <td align='right'><strong>{totals.peds.toFixed(2)}</strong></td>
                    <td align='right'><strong>{totals.totalMU.toFixed(2)}</strong></td>
                    <td align='right'><strong>{totals.total.toFixed(2)}</strong></td>
                    <td align='right'><strong>{materialsBalance.toFixed(2)}</strong></td>
                </tr>
                {s.groups.ungroupedExpanded && ungroupedItems.map(renderItemRow)}
            </tbody>
        )
    }

    return (
        <ExpandableSection selector='BudgetItemList' title='List' subtitle='Budget material items'>
            <p>
                <button onClick={() => dispatch(refreshBudget)}>Refresh</button>
                <button onClick={handleAddGroup} style={{ marginLeft: '8px' }}>Add Group</button>
                { s.stage === STAGE_INITIALIZING ? '' : <span className="budget-loading">{StageText[s.stage]}... {s.loadPercentage.toFixed(0)}%</span> }
            </p>
            <div className='flex'>
                <table className='table-diff budget-items-table'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>PEDs</th>
                            <th>Total MU</th>
                            <th>Total</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    {s.groups.list.map(renderGroup)}
                    {renderUngroupedSection()}
                </table>
                <div className='inline'>
                    <BudgetDetailsPanel s={s} />
                    {s.selection?.materialName && <MaterialDetailsPanel s={s} />}
                </div>
            </div>
        </ExpandableSection>
    )
}

export default BudgetItemList
