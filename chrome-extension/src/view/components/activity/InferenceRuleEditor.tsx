import React from 'react'
import { ActivityItem } from '../../application/state/activity'
import { itemMatchesRule, getInferenceRuleMatchReasons } from '../../application/helpers/activityInference'

interface InferenceRuleEditorProps {
    ruleData: any
    items: number[]
    getInventoryItem: (id: number) => ActivityItem | undefined
    onRuleChange: (updatedRule: any) => void
}

const interpolateDescription = (description: string, sampleData: { [key: string]: any }): string => {
    return description.replace(/\{([\w.]+)\}/g, (match, path) => {
        const keys = path.split('.')
        let value: any = sampleData
        for (const key of keys) {
            value = value?.[key]
            if (value === undefined) {
                break
            }
        }
        return value?.toString() ?? match
    })
}

const InferenceRuleEditor: React.FC<InferenceRuleEditorProps> = ({
    ruleData,
    items,
    getInventoryItem,
    onRuleChange,
}) => {
    // Use ruleData prop directly as the source of truth - controlled by parent
    const matchedItems: number[] = []
    const unmatchedItemsWithReasons: Array<{ id: number; item: ActivityItem; ruleIndex: number; reasons: string[] }> = []

    if (ruleData?.items && ruleData.items.length > 0) {
        // Match each rule line with the corresponding item line (1-to-1)
        for (let idx = 0; idx < Math.min(items.length, ruleData.items.length); idx++) {
            const rule = ruleData.items[idx]
            const itemId = items[idx]
            const item = getInventoryItem(itemId)
            if (item && itemMatchesRule(item, rule)) {
                matchedItems.push(itemId)
            } else if (item) {
                const reasons = getInferenceRuleMatchReasons(item, rule)
                unmatchedItemsWithReasons.push({ id: itemId, item, ruleIndex: idx, reasons })
            }
        }
    }

    return (
        <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '10px' }}>
            <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}>Edit Inference Rule</div>
            <table className='table-diff' style={{ marginBottom: '10px' }}>
                <thead>
                    <tr>
                        <th>Name Match</th>
                        <th>Quantity Match</th>
                        <th>Value Match</th>
                        <th>Container Match</th>
                        <th>Field</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {ruleData?.items.map((itemRule: any, idx: number) => (
                        <tr key={idx}>
                            <td>
                                <select value={itemRule.name.type} onChange={(e) => {
                                    const newData = { ...ruleData }
                                    newData.items[idx].name.type = e.target.value
                                    onRuleChange(newData)
                                }} style={{ width: '80px', padding: '4px' }}>
                                    <option value="any">any</option>
                                    <option value="exact">exact</option>
                                    <option value="contains">contains</option>
                                    <option value="regex">regex</option>
                                </select>
                                {itemRule.name.type !== 'any' && (
                                    <input type="text" value={itemRule.name.value} onChange={(e) => {
                                        const newData = { ...ruleData }
                                        newData.items[idx].name.value = e.target.value
                                        onRuleChange(newData)
                                    }} style={{ width: '100px', padding: '4px', marginLeft: '4px' }} />
                                )}
                            </td>
                            <td>
                                <select value={itemRule.quantity.type} onChange={(e) => {
                                    const newData = { ...ruleData }
                                    newData.items[idx].quantity.type = e.target.value
                                    onRuleChange(newData)
                                }} style={{ width: '80px', padding: '4px' }}>
                                    <option value="any">any</option>
                                    <option value="exact">exact</option>
                                    <option value="contains">contains</option>
                                    <option value="regex">regex</option>
                                </select>
                                {itemRule.quantity.type !== 'any' && (
                                    <input type="text" value={itemRule.quantity.value} onChange={(e) => {
                                        const newData = { ...ruleData }
                                        newData.items[idx].quantity.value = e.target.value
                                        onRuleChange(newData)
                                    }} style={{ width: '100px', padding: '4px', marginLeft: '4px' }} />
                                )}
                            </td>
                            <td>
                                <select value={itemRule.value.type} onChange={(e) => {
                                    const newData = { ...ruleData }
                                    newData.items[idx].value.type = e.target.value
                                    onRuleChange(newData)
                                }} style={{ width: '80px', padding: '4px' }}>
                                    <option value="any">any</option>
                                    <option value="exact">exact</option>
                                    <option value="contains">contains</option>
                                    <option value="regex">regex</option>
                                </select>
                                {itemRule.value.type !== 'any' && (
                                    <input type="text" value={itemRule.value.value} onChange={(e) => {
                                        const newData = { ...ruleData }
                                        newData.items[idx].value.value = e.target.value
                                        onRuleChange(newData)
                                    }} style={{ width: '100px', padding: '4px', marginLeft: '4px' }} />
                                )}
                            </td>
                            <td>
                                <select value={itemRule.container.type} onChange={(e) => {
                                    const newData = { ...ruleData }
                                    newData.items[idx].container.type = e.target.value
                                    onRuleChange(newData)
                                }} style={{ width: '80px', padding: '4px' }}>
                                    <option value="any">any</option>
                                    <option value="exact">exact</option>
                                    <option value="contains">contains</option>
                                    <option value="regex">regex</option>
                                </select>
                                {itemRule.container.type !== 'any' && (
                                    <input type="text" value={itemRule.container.value} onChange={(e) => {
                                        const newData = { ...ruleData }
                                        newData.items[idx].container.value = e.target.value
                                        onRuleChange(newData)
                                    }} style={{ width: '100px', padding: '4px', marginLeft: '4px' }} />
                                )}
                            </td>
                            <td>
                                <input type="text" value={itemRule.fieldName} onChange={(e) => {
                                    const newData = { ...ruleData }
                                    newData.items[idx].fieldName = e.target.value
                                    onRuleChange(newData)
                                }} style={{ width: '80px', padding: '4px' }} />
                            </td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Description field */}
            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f0f8ff', borderRadius: '4px', border: '1px solid #e0e7ff' }}>
                <div style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 'bold' }}>Description Template</div>
                <textarea
                    value={ruleData.description || ''}
                    onChange={(e) => {
                        const newData = { ...ruleData }
                        newData.description = e.target.value.replace(/\n/g, '')
                        onRuleChange(newData)
                    }}
                    placeholder="Enter description template. Use {fieldName.property} syntax, e.g. 'You sold {sold.name} for {sold.value}' or 'Received {item.quantity}x {item.name}'"
                    style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '6px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        marginBottom: '8px'
                    }}
                />
                {ruleData.description && ruleData.description.includes('\n') && (
                    <div style={{ padding: '8px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '3px', marginBottom: '8px', fontSize: '12px' }}>
                        ❌ Description must be a single line only
                    </div>
                )}
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    <strong>Available fields:</strong> Use field names to reference row data, e.g. <code style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '2px' }}>{`{sold.name}`}</code>, <code style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '2px' }}>{`{weapon.quantity}`}</code>, or <code style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '2px' }}>{`{armor.value}`}</code>
                </div>
                {ruleData.description && ruleData.items?.length > 0 && (
                    <div style={{ padding: '6px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '3px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>Preview:</div>
                        {ruleData.items.slice(0, 2).map((itemRule: any, idx: number) => {
                            const fieldName = itemRule.fieldName
                            const itemData = {
                                name: itemRule.name.value || itemRule.name.type,
                                quantity: itemRule.quantity.value || itemRule.quantity.type,
                                value: itemRule.value.value || itemRule.value.type,
                                container: itemRule.container.value || itemRule.container.type
                            }
                            const sampleData = fieldName ? { [fieldName]: itemData } : itemData
                            const preview = interpolateDescription(ruleData.description, sampleData)
                            return (
                                <div key={idx} style={{ fontSize: '10px', marginTop: idx > 0 ? '4px' : '0', color: '#333', fontFamily: 'monospace' }}>
                                    Row {idx + 1}: {preview}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Match preview */}
            <div style={{ marginBottom: '10px', padding: '8px', borderRadius: '3px', fontSize: '12px', backgroundColor: unmatchedItemsWithReasons.length > 0 ? '#fff3cd' : '#d4edda', border: `1px solid ${unmatchedItemsWithReasons.length > 0 ? '#ffc107' : '#28a745'}`, color: unmatchedItemsWithReasons.length > 0 ? '#856404' : '#155724' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Rule Matching:</div>
                <div>{matchedItems.length} item(s) match the rule</div>
                {unmatchedItemsWithReasons.length > 0 && (
                    <div style={{ marginTop: '4px', color: '#721c24', backgroundColor: '#f8d7da', padding: '8px', borderRadius: '2px', border: '1px solid #f5c6cb' }}>
                        <strong>⚠️ {unmatchedItemsWithReasons.length} item(s) do NOT match:</strong>
                        {unmatchedItemsWithReasons.map((entry, idx) => (
                            <div key={idx} style={{ marginTop: '6px', paddingLeft: '16px', borderLeft: '2px solid #f5c6cb', paddingBottom: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{entry.item.name} <span style={{ fontSize: '11px', color: '#666' }}>(Rule row {entry.ruleIndex + 1})</span></div>
                                {entry.reasons.map((reason, rIdx) => (
                                    <div key={rIdx} style={{ fontSize: '11px', margin: '2px 0', color: '#721c24' }}>
                                        • {reason}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}

export default InferenceRuleEditor
