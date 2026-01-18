import React, { useState, DragEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection2'
import { getBudget } from '../../application/selectors/budget'
import { addBudgetGroup, disableBudgetItem, moveItemToGroup, refreshBudget, removeBudgetGroup, renameBudgetGroup, setBudgetSelection, toggleBudgetGroupExpanded, toggleBudgetUngroupedExpanded } from '../../application/actions/budget'
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
                valueWithMarkup: value * material.markup
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
    let itemNames = []
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

    return <div className='trade-item-data'>
        <h2 className='pointer img-container-hover' onClick={() => dispatch(setBudgetSelection(null))}>
            {title} <img src='img/left.png' />
        </h2>

        {url && <p><a href={url} target='_blank' rel='noopener noreferrer'>Open in Google Sheets</a></p>}

        {materials.length > 0 && <>
            <table>
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Value</th>
                        <th>+MU</th>
                    </tr>
                </thead>
                <tbody>
                    {materials.map(mat => (
                        <tr key={mat.name}>
                            <td>{mat.name}</td>
                            <td align='right'>{mat.quantity}</td>
                            <td align='right'>{mat.value.toFixed(2)}</td>
                            <td align='right'>{mat.valueWithMarkup.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>}
    </div>
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

    const renderItemRow = (item: BudgetItem) => (
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
        </tr>
    )

    const renderGroupHeader = (group: BudgetGroup) => {
        const totals = getGroupTotals(group, s.list.items)
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
                        <td colSpan={4} style={{ fontStyle: 'italic', color: '#888' }}>
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
                        </tr>
                    </thead>
                    {s.groups.list.map(renderGroup)}
                    {renderUngroupedSection()}
                </table>
                <BudgetDetailsPanel s={s} />
            </div>
        </ExpandableSection>
    )
}

export default BudgetItemList
