import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GameLogItemData, GameLogState } from '../../application/state/log'
import { getGameLog } from '../../application/selectors/log'
import ExpandableSection from '../common/ExpandableSection'
import { setGameFullLogExpanded, setGameLogGlobalExpanded, setGameLogLootExpanded, setGameLogStatsExpanded, sortLootBy } from '../../application/actions/log'
import { NAME, QUANTITY, VALUE } from '../../application/helpers/inventory.sort'
import { GameLogGlobal, GameLogLine, GameLogSkill } from '../../../background/client/gameLogData'

const LootRow = (p: {
    item: GameLogItemData
}) => {
    const { item } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortLootBy(part))

    return (
        <tr>
            <td onClick={sortBy(NAME)}>{item.n}</td>
            <td onClick={sortBy(QUANTITY)}>{item.q}</td>
            <td onClick={sortBy(VALUE)}>{item.v + ' PED'}</td>
        </tr>
    )
}

function GameLogPage() {
    const s: GameLogState = useSelector(getGameLog)
    
    return (
        <>
            <ExpandableSection title='Loot' expanded={s.loot.expanded} setExpanded={setGameLogLootExpanded}>
                <table className='table-diff'>
                    <tbody>
                        {
                            s.loot.items.map((item: GameLogItemData, index: number) =>
                                <LootRow key={index} item={item} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
            <ExpandableSection title='Skill' expanded={s.loot.expanded} setExpanded={setGameLogLootExpanded}>
                <table className='table-diff'>
                <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        { s.skill.list.map((g: GameLogSkill, index: number) =>
                            <tr key={index}>
                                <td>{g.name}</td>
                                <td>{g.value}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </ExpandableSection>
            <ExpandableSection title='Global' expanded={s.global.expanded} setExpanded={setGameLogGlobalExpanded}>
            <table className='table-diff'>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Player</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        { s.global.list.map((g: GameLogGlobal, index: number) =>
                            <tr key={index}>
                                <td>{g.time}</td>
                                <td>{g.player}</td>
                                <td style={{textAlign: 'left'}}>{g.name}</td>
                                <td style={{textAlign: 'left'}}>{g.type}</td>
                                <td>{g.value} {g.isHoF && ' [HoF]'}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </ExpandableSection>
            <ExpandableSection title='Statistics' expanded={s.stats.expanded} setExpanded={setGameLogStatsExpanded}>
                { s.stats.list.map((s: string, index: number) => <p key={index}>{s}</p>) }
            </ExpandableSection>
            <ExpandableSection title='Full log' expanded={s.log.expanded} setExpanded={setGameFullLogExpanded}>
                <table className='table-diff'>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Channel</th>
                            <th>Player</th>
                            <th>Message</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        { s.log.list.map((line: GameLogLine, index: number) =>
                            <tr key={index}>
                                <td>{line.time}</td>
                                <td>{line.channel}</td>
                                <td style={{textAlign: 'left'}}>{line.player}</td>
                                <td style={{textAlign: 'left'}}>{line.message}</td>
                                <td>{JSON.stringify(line.data)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default GameLogPage