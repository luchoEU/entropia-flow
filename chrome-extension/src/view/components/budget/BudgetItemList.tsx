import React, { useState, DragEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection2'
import { getBudget } from '../../application/selectors/budget'
import { addBudgetGroup, clearBudgetItemPendingLines, deleteBudgetPendingLine, disableBudgetItem, disableBudgetMaterial, enableBudgetMaterial, moveItemToGroup, refreshBudget, removeBudgetGroup, renameBudgetGroup, sendBudgetPendingLines, toggleBudgetGroupExpanded, toggleBudgetUngroupedExpanded } from '../../application/actions/budget'
import { BudgetGroup, BudgetItem, BudgetMaterialsMap, BudgetMaterialState, BudgetState } from '../../application/state/budget'
import ImgButton from '../common/ImgButton'
import { STAGE_INITIALIZING, StageText } from '../../services/api/sheets/sheetsStages'
import { getGroupTotals, getUngroupedItems } from '../../application/helpers/budget'
import ExpandableArrowButton from '../common/ExpandableArrowButton'
import { formatDateTime } from '../../../common/time'
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget'
import { budgetItemMaterialUrl, budgetItemUrl } from '../../application/actions/navigation'
import { useNavigate } from 'react-router-dom'
import { getBalanceLines } from '../../application/helpers/budgetGetBalanceLines'

interface MaterialSummary {
    name: string
    budgetQuantity: number
    budgetValue: number
    budgetWithMarkup: number
    balanceQuantity: number
    balanceWithMarkup: number
}

function getUsedMaterialsMap(itemNames: string[], materialsMap: BudgetMaterialsMap): Record<string, BudgetMaterialState> {
    return Object.fromEntries(Object.entries(materialsMap).filter(([_, m]) => m.budgetList.some(b => itemNames.includes(b.itemName))))
}

function getMaterials(usedMaterialsMap: BudgetMaterialsMap): MaterialSummary[] {
    const result: MaterialSummary[] = []

    for (const [materialName, material] of Object.entries(usedMaterialsMap)) {
        const quantity = material.budgetList.reduce((acc, b) => acc + b.quantity, 0)
        const value = quantity * material.unitValue
        result.push({
            name: materialName,
            budgetQuantity: quantity,
            budgetValue: value,
            budgetWithMarkup: value * material.markup,
            balanceQuantity: material.c.balanceQuantity,
            balanceWithMarkup: material.c.balanceWithMarkup
        })
    }

    return result.sort((a, b) => a.name.localeCompare(b.name))
}

const BudgetDetailsPanel = ({ s, selection }: { s: BudgetState, selection: UrlSelection | null }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    if (!selection) {
        return <></>
    }

     let title = ''
     let itemNames: string[] = []
     if (selection.type === 'group') {
         const group = s.groups.list.find(g => g.id === selection.groupId)
         if (!group) return null
         title = group.name
         itemNames = group.itemNames
     } else if (selection.type === 'item') {
         title = selection.itemName
         itemNames = [selection.itemName]
     } else if (selection.type === 'totals') {
         title = 'Totals'
         itemNames = s.list.items.map(i => i.name)
     } else {
         return null
     }
    const items = itemNames.map(n => s.list.items.find(i => i.name === n))
    if (items.some(i => !i)) return null

    // Combine balanceLines with pendingLines from items
    const pendingLines: Record<string, BudgetLineData[]> = { }
    items.forEach(item => {
        if (item?.pendingLines) {
            if (!pendingLines[item.name]) {
                pendingLines[item.name] = []
            }
            pendingLines[item.name].push(...item.pendingLines)
        }
    })
    Object.values(pendingLines).forEach(lines => {
        lines.sort((a, b) => a.date - b.date)
    })

    var pendingLinesQuantity: Record<string, number> = {}
    Object.values(pendingLines).forEach(lines => {
        lines.forEach(line => {
            line.materials.forEach(material => {
                if (!pendingLinesQuantity[material.name]) {
                    pendingLinesQuantity[material.name] = 0
                }
                pendingLinesQuantity[material.name] += material.quantity
            })
        })
    })

    const usedMaterialsMap = getUsedMaterialsMap(itemNames, s.materials.map)
    const validBudgetItems = itemNames.filter(name => !s.disabledItems.names.includes(name))
    const balanceLines = getBalanceLines(Date.now(), usedMaterialsMap, validBudgetItems)
    const materials = getMaterials(usedMaterialsMap)
    Object.entries(balanceLines).forEach(([itemName, lines]) => {
        if (!pendingLines[itemName]) {
            pendingLines[itemName] = []
        }
        pendingLines[itemName].push(...lines)
    })

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
        <h2 className='pointer img-container-hover' onClick={() => navigate('/budget')}>
            Budget: {title} <img src='img/left.png' />
        </h2>

        {items.map(item => item && <p><a href={item.url} target='_blank' rel='noopener noreferrer'>Open {item.name} in Google Sheets</a></p>)}

        <p>PED Reserve: {totals.peds.toFixed(2)}</p>
        <p>Total Balance including Markup: {(materials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0)).toFixed(2)} PED</p>

        {materials.length > 0 && <>
            <table>
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Budget Quantity</th>
                        <th>Value</th>
                        <th>with MU</th>
                        <th>Balance Quantity</th>
                        <th>with MU</th>
                    </tr>
                </thead>
                <tbody>
                    {materials.map(mat => (
                        <tr key={mat.name}>
                            <td className='pointer' onClick={() => navigate(budgetItemMaterialUrl(selection!.selectedItem!, mat.name))}>{mat.name}</td>
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

        {Object.keys(pendingLines).length > 0 && <>
            <hr />
            <h3>Pending Lines</h3>
            {Object.entries(pendingLines).map(([itemName, lines]) => {
                const matNames: string[] = [...new Set(lines.flatMap(line => 
                    line.materials.map(mat => mat.name)
                ))].sort()
                
                return (
                    <div key={itemName}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h4>{itemName}</h4>
                            {lines.length > 1 && (
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
                                    <th>Date</th>
                                    <th>Reason</th>
                                    <th>PED</th>
                                    {matNames.map((n, idx) => <th key={idx}>{n}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((line, idx) => (
                                    <tr>
                                        <td>
                                            {formatDateTime(line.date)}
                                            {line.reason !== 'Balance' && (
                                                <ImgButton 
                                                    title='Delete pending line' 
                                                    src='img/cross.png'
                                                    dispatch={() => dispatch(deleteBudgetPendingLine(itemName, idx))} 
                                                />
                                            )}
                                        </td>
                                        <td>{line.reason}</td>
                                        <td align='right'>{line.ped?.toFixed(2) || '0.00'}</td>
                                        {matNames.map((n, idx) => {
                                            const m = line.materials.find(m => m.name === n);
                                            return <td key={idx} align='right'>{m?.quantity ?? ''}</td>;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            })}
            <br />
            <button onClick={() => dispatch(sendBudgetPendingLines(pendingLines))} disabled={s.stage !== STAGE_INITIALIZING}>Apply Pending Lines</button>
        </>}
    </div>
}

const MaterialDetailsPanel = ({ s, selection }: { s: BudgetState, selection: UrlSelection | null }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    if (!selection || !selection.selectedMaterial) {
        return null
    }

    const material = s.materials.map[selection.selectedMaterial]
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
            <h2 className='pointer img-container-hover' onClick={() => navigate(budgetItemUrl(selection.selectedItem!))}>
                Material: {selection.selectedMaterial} <img src='img/left.png' />
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

type UrlSelection = {
    selectedItem: string | null,
    selectedMaterial: string | null,
} & ({
    type: 'item',
    itemName: string,
} | {
    type: 'group',
    groupId: string,
} | {
    type: 'totals',
})

function BudgetItemList({ selected: selectedItem, selectedMaterial }: { selected: string | null, selectedMaterial: string | null }) {
    const s: BudgetState = useSelector(getBudget)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [draggedItem, setDraggedItem] = useState<string | null>(null)
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')

    const ungroupedItems = getUngroupedItems(s)

    // Get selected item and group from URL parameter
    const getSelectedFromUrl = (): UrlSelection | null => {
        if (!selectedItem) return null

        // Check if it's an item
        const allItems = [...ungroupedItems, ...s.groups.list.flatMap(g => g.itemNames.map(name => ({ name, groupId: g.id })))]

        if (allItems.some(item => item.name === selectedItem)) {
            return {
                type: 'item',
                itemName: selectedItem,
                selectedItem,
                selectedMaterial
            }
        }

        // Check if it's a group
        const group = s.groups.list.find(g => g.id === selectedItem)
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
        urlSelection?.type === 'item' && urlSelection.itemName === itemName

    const isGroupSelected = (groupId: string) =>
        urlSelection?.type === 'group' && urlSelection.groupId === groupId

    const isTotalsSelected = urlSelection?.type === 'totals'

    const isGroupExpanded = (groupId: string) => {
        const group = s.groups.list.find(g => g.id === groupId)
        return group?.expanded ||
               (selectedItem && group?.itemNames.includes(selectedItem)) ||
               false
    }

    const isUngroupedExpanded = () =>
        s.groups.ungroupedExpanded ||
        (selectedItem && ungroupedItems.some(item => item.name === selectedItem)) ||
        false

    const renderItemRow = (item: BudgetItem) => {
        const itemMaterials = getMaterials(getUsedMaterialsMap([item.name], s.materials.map))
        const materialsBalance = itemMaterials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0)
        const isLoading = item.refreshStatus === 'loading'
        const isLoaded = item.refreshStatus === 'loaded'
        const pendingAmount = item.pendingLines?.length || 0
        
        return (
            <tr
                key={item.name}
                draggable
                onDragStart={(e) => handleDragStart(e, item.name)}
                onDragEnd={handleDragEnd}
                className={`pointer ${draggedItem === item.name ? 'dragging' : ''} ${isItemSelected(item.name) ? 'selected' : ''} ${isLoading ? 'budget-item-loading' : ''} ${isLoaded ? 'budget-item-loaded' : ''}`}
                style={{ 
                    cursor: 'grab',
                    opacity: isLoading ? 0.6 : 1
                }}
                onClick={() => navigate(budgetItemUrl(item.name))}
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
                        <ImgButton title='Disable' src='img/cross.png' dispatch={() => disableBudgetItem(item.name)} />
                        <span style={{ 
                            fontStyle: isLoading ? 'italic' : 'normal',
                            color: isLoading ? '#666' : 'inherit'
                        }}>
                            {item.name}
                        </span>
                    </div>
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
        const groupMaterials = getMaterials(getUsedMaterialsMap(group.itemNames, s.materials.map))
        const materialsBalance = groupMaterials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0)
        const isEditing = editingGroupId === group.id

        return (
            <tr
                className={`budget-group-header pointer ${isGroupSelected(group.id) ? 'selected' : ''}`}
                onClick={() => navigate(budgetItemUrl(group.id))}
            >
                <td></td>
                <td>
                    <ExpandableArrowButton
                        expanded={isGroupExpanded(group.id)}
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
                        group.name
                    )}
                    {!isEditing && <ImgButton
                        title='Rename group'
                        src='img/edit.png'
                        dispatch={() => handleStartRename(group)}
                        style={{ marginLeft: '8px' }}
                    />}
                    <ImgButton
                        title='Delete group'
                        src='img/cross.png'
                        dispatch={() => removeBudgetGroup(group.id)}
                        style={{ marginLeft: '8px' }}
                    />
                </td>
                <td align='right'>{totals.peds.toFixed(2)}</td>
                <td align='right'>{totals.totalMU.toFixed(2)}</td>
                <td align='right'>{totals.total.toFixed(2)}</td>
                <td align='right'>{materialsBalance.toFixed(2)}</td>
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
                {isGroupExpanded(group.id) && groupItems.map(renderItemRow)}
                {isGroupExpanded(group.id) && groupItems.length === 0 && (
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
        const totals = {
            peds: ungroupedItems.reduce((sum, i) => sum + i.peds, 0),
            totalMU: ungroupedItems.reduce((sum, i) => sum + i.totalMU, 0),
            total: ungroupedItems.reduce((sum, i) => sum + i.total, 0)
        }
        const ungroupedItemNames = ungroupedItems.map(i => i.name)
        const ungroupedMaterials = getMaterials(getUsedMaterialsMap(ungroupedItemNames, s.materials.map))
        const materialsBalance = ungroupedMaterials.reduce((sum, mat) => sum + mat.budgetWithMarkup, 0)

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
                    <td align='right'><strong>{totals.peds.toFixed(2)}</strong></td>
                    <td align='right'><strong>{totals.totalMU.toFixed(2)}</strong></td>
                    <td align='right'><strong>{totals.total.toFixed(2)}</strong></td>
                    <td align='right'><strong>{materialsBalance.toFixed(2)}</strong></td>
                </tr>
                {isUngroupedExpanded() && ungroupedItems.map(renderItemRow)}
            </tbody>
        )
    }

    return (
        <ExpandableSection selector='BudgetItemList' title='List' subtitle='Budget material items'>
            <p>
                <button onClick={() => dispatch(refreshBudget)} disabled={s.stage !== STAGE_INITIALIZING}>Refresh</button>
                <button onClick={handleAddGroup} style={{ marginLeft: '8px' }}>Add Group</button>
                { s.stage === STAGE_INITIALIZING ? '' : <span className="budget-loading">{StageText[s.stage]}... {s.loadPercentage.toFixed(0)}%</span> }
            </p>
            <div className='flex'>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className='table-diff budget-items-table'>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>PEDs</th>
                            <th>Total MU</th>
                            <th>Total</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                     {s.groups.list.map(renderGroup)}
                     {ungroupedItems.length > 0 && renderUngroupedSection()}
                     <tr className={`budget-group-header pointer ${isTotalsSelected ? 'selected' : ''}`} onClick={() => navigate(budgetItemUrl('totals'))}>
                         <td></td>
                         <td><strong>TOTAL</strong></td>
                         <td align='right'><strong>{s.list.items.reduce((sum, i) => sum + i.peds, 0).toFixed(2)}</strong></td>
                         <td align='right'><strong>{s.list.items.reduce((sum, i) => sum + i.totalMU, 0).toFixed(2)}</strong></td>
                         <td align='right'><strong>{s.list.items.reduce((sum, i) => sum + i.total, 0).toFixed(2)}</strong></td>
                         <td align='right'><strong>{getMaterials(getUsedMaterialsMap(s.list.items.map(i => i.name), s.materials.map)).reduce((sum, mat) => sum + mat.balanceWithMarkup, 0).toFixed(2)}</strong></td>
                     </tr>
                     </table>
                 </div>
                 <div className='inline'>
                     <BudgetDetailsPanel s={s} selection={urlSelection} />
                     <MaterialDetailsPanel s={s} selection={urlSelection} />
                 </div>
             </div>
         </ExpandableSection>
    )
}

export default BudgetItemList
