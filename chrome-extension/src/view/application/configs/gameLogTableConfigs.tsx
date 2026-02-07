import React from 'react'
import {
  GameLogEnhancerBroken,
  GameLogEvent,
  GameLogGlobal,
  GameLogLine,
  GameLogLoot,
  GameLogSkill,
  GameLogStats,
  gameLogStatsDecimals,
  GameLogTier,
  GameLogTrade
} from '../../../background/client/gameLogData'
import { TemporalValue } from '../../../common/state'
import { JotaiTableConfig } from '../../components/common/jotai/JotaiTableTypes'
import { dateToString } from '../../../common/date'
import { filterExact } from '../../../common/filter'
import { GAME_LOG_TABULAR_TRADE } from '../state/log'
import ItemText from '../../components/common/ItemText'

function _separateCamelCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, char => char.toUpperCase())
}

/**
 * Game Log Table Configurations
 * Jotai-based table configs for game log tables, converted from TabularDefinitions
 */

export const gameLogLootConfig: JotaiTableConfig<GameLogLoot> = {
  title: 'Loot',
  columns: [
    {
      id: 'name',
      header: 'Name',
      width: 150,
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRowCell: (item) => <ItemText text={item.name} />
    },
    {
      id: 'quantity',
      header: 'Quantity',
      width: 100,
      sortAccessor: (item) => item.quantity,
      filterAccessor: (item) => item.quantity.toString(),
      renderRowCell: (item) => <span>{item.quantity.toString()}</span>,
      justifyContent: 'end'
    },
    {
      id: 'value',
      header: 'Value',
      width: 100,
      sortAccessor: (item) => item.value,
      filterAccessor: (item) => item.value.toFixed(2),
      renderRowCell: (item) => <span>{item.value.toFixed(2)} PED</span>,
      justifyContent: 'end'
    }
  ],
  getPedValue: (item) => item.value
}

export const gameLogTierConfig: JotaiTableConfig<GameLogTier> = {
  title: 'Tier',
  columns: [
    {
      id: 'name',
      header: 'Name',
      width: 150,
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRowCell: (item) => <ItemText text={item.name} />
    },
    {
      id: 'tier',
      header: 'Tier',
      width: 100,
      sortAccessor: (item) => item.tier,
      filterAccessor: (item) => item.tier.toFixed(2),
      renderRowCell: (item) => <span>{item.tier.toFixed(2)}</span>,
      justifyContent: 'end'
    }
  ]
}

export const gameLogSkillConfig: JotaiTableConfig<GameLogSkill> = {
  title: 'Skill',
  columns: [
    {
      id: 'name',
      header: 'Name',
      width: 150,
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRowCell: (item) => <ItemText text={item.name} />
    },
    {
      id: 'value',
      header: 'Value',
      width: 100,
      sortAccessor: (item) => item.value,
      filterAccessor: (item) => item.value.toFixed(4),
      renderRowCell: (item) => <span>{item.value.toFixed(4)}</span>,
      justifyContent: 'end'
    }
  ]
}

export const gameLogEnhancerBrokenConfig: JotaiTableConfig<GameLogEnhancerBroken> = {
  title: 'Enhancer Broken',
  columns: [
    {
      id: 'time',
      header: 'Time',
      width: 120,
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRowCell: (item) => <span>{dateToString(item.time)}</span>
    },
    {
      id: 'enhancer',
      header: 'Enhancer',
      width: 150,
      sortAccessor: (item) => item.enhancer,
      filterAccessor: (item) => item.enhancer,
      renderRowCell: (item) => <ItemText text={item.enhancer} />
    },
    {
      id: 'item',
      header: 'Item',
      width: 150,
      sortAccessor: (item) => item.item,
      filterAccessor: (item) => item.item,
      renderRowCell: (item) => <ItemText text={item.item} />
    },
    {
      id: 'remaining',
      header: 'Remaining',
      width: 100,
      sortAccessor: (item) => item.remaining,
      filterAccessor: (item) => item.remaining.toString(),
      renderRowCell: (item) => <span>{item.remaining.toString()}</span>,
      justifyContent: 'end'
    },
    {
      id: 'received',
      header: 'Received',
      width: 100,
      sortAccessor: (item) => item.received,
      filterAccessor: (item) => item.received.toFixed(2),
      renderRowCell: (item) => <span>{item.received.toFixed(2)}</span>,
      justifyContent: 'end'
    }
  ]
}

export const gameLogGlobalConfig: JotaiTableConfig<GameLogGlobal> = {
  title: 'Global',
  columns: [
    {
      id: 'time',
      header: 'Time',
      width: 120,
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRowCell: (item) => <span>{dateToString(item.time)}</span>
    },
    {
      id: 'player',
      header: 'Player',
      width: 120,
      sortAccessor: (item) => item.player,
      filterAccessor: (item) => item.player,
      renderRowCell: (item) => <span>{item.player}</span>
    },
    {
      id: 'name',
      header: 'Name',
      width: 150,
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRowCell: (item) => <ItemText text={item.name} />
    },
    {
      id: 'type',
      header: 'Type',
      width: 100,
      sortAccessor: (item) => item.type,
      filterAccessor: (item) => item.type,
      renderRowCell: (item) => <span>{item.type}</span>
    },
    {
      id: 'value',
      header: 'Value',
      width: 80,
      sortAccessor: (item) => item.value ?? 0,
      filterAccessor: (item) => (item.value?.toFixed(0) ?? '0'),
      renderRowCell: (item) => <span>{item.value?.toFixed(0) ?? '0'}</span>,
      justifyContent: 'end'
    },
    {
      id: 'location',
      header: 'Location',
      width: 120,
      sortAccessor: (item) => item.location ?? '',
      filterAccessor: (item) => item.location ?? '',
      renderRowCell: (item) => <span>{item.location ?? ''}</span>
    },
    {
      id: 'hof',
      header: 'HOF',
      width: 50,
      sortAccessor: (item) => item.isHoF ? 1 : 0,
      filterAccessor: (item) => item.isHoF ? '[HoF]' : '',
      renderRowCell: (item) => <span>{item.isHoF ? '[HoF]' : ''}</span>,
      justifyContent: 'center'
    }
  ],
  getPedValue: (item) => item.value ?? 0
}

export const gameLogEventConfig: JotaiTableConfig<GameLogEvent> = {
  title: 'Events',
  columns: [
    {
      id: 'time',
      header: 'Time',
      width: 120,
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRowCell: (item) => <span>{dateToString(item.time)}</span>
    },
    {
      id: 'action',
      header: 'Action',
      width: 150,
      sortAccessor: (item) => _separateCamelCase(item.action),
      filterAccessor: (item) => _separateCamelCase(item.action),
      renderRowCell: (item) => <span title={item.message}>{_separateCamelCase(item.action)}</span>
    },
    {
      id: 'data',
      header: 'Data',
      width: 150,
      sortAccessor: (item) => item.data.toString(),
      filterAccessor: (item) => item.data.toString(),
      renderRowCell: (item) => <span>{item.data.toString()}</span>
    }
  ]
}

export const gameLogStatisticsConfig: JotaiTableConfig<[string, TemporalValue]> = {
  title: 'Statistics',
  columns: [
    {
      id: 'name',
      header: 'Name',
      width: 150,
      sortAccessor: (item) => item[0],
      filterAccessor: (item) => _separateCamelCase(item[0]),
      renderRowCell: (item) => <span>{_separateCamelCase(item[0])}</span>
    },
    {
      id: 'total',
      header: 'Total',
      width: 100,
      sortAccessor: (item) => item[1].total,
      filterAccessor: (item) => item[1].total.toFixed((gameLogStatsDecimals as any)[item[0]] ?? 0),
      renderRowCell: (item) => <span>{item[1].total.toFixed((gameLogStatsDecimals as any)[item[0]] ?? 0)}</span>,
      justifyContent: 'end'
    },
    {
      id: 'count',
      header: 'Count',
      width: 80,
      sortAccessor: (item) => item[1].count,
      filterAccessor: (item) => item[1].count.toString(),
      renderRowCell: (item) => <span>{item[1].count.toString()}</span>,
      justifyContent: 'end'
    }
  ]
}

export const gameLogMissingConfig: JotaiTableConfig<GameLogLine> = {
  title: 'Missing',
  columns: [
    {
      id: 'time',
      header: 'Time',
      width: 120,
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRowCell: (item) => <span>{dateToString(item.time)}</span>
    },
    {
      id: 'channel',
      header: 'Channel',
      width: 120,
      sortAccessor: (item) => item.channel,
      filterAccessor: (item) => item.channel,
      renderRowCell: (item) => <span>{item.channel}</span>
    },
    {
      id: 'message',
      header: 'Message',
      width: 300,
      sortAccessor: (item) => item.message,
      filterAccessor: (item) => item.message,
      renderRowCell: (item) => <span>{item.message}</span>
    }
  ]
}

export const gameLogRawConfig: JotaiTableConfig<GameLogLine> = {
  title: 'Full log',
  columns: [
    {
      id: 'serial',
      header: 'Serial',
      width: 80,
      sortAccessor: (item) => item.serial,
      filterAccessor: (item) => item.serial.toString(),
      renderRowCell: (item) => <span>{item.serial.toString()}</span>,
      justifyContent: 'end'
    },
    {
      id: 'time',
      header: 'Time',
      width: 150,
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time, true),
      renderRowCell: (item) => <span>{dateToString(item.time, true)}</span>
    },
    {
      id: 'channel',
      header: 'Channel',
      width: 100,
      sortAccessor: (item) => item.channel,
      filterAccessor: (item) => item.channel,
      renderRowCell: (item) => <span>{item.channel}</span>
    },
    {
      id: 'player',
      header: 'Player',
      width: 100,
      sortAccessor: (item) => item.player,
      filterAccessor: (item) => item.player,
      renderRowCell: (item) => <span>{item.player}</span>
    },
    {
      id: 'message',
      header: 'Message',
      width: 300,
      sortAccessor: (item) => item.message,
      filterAccessor: (item) => item.message,
      renderRowCell: (item) => <span>{item.message}</span>
    },
    {
      id: 'data',
      header: 'Data',
      width: 200,
      sortAccessor: (item) => JSON.stringify(item.data),
      filterAccessor: (item) => JSON.stringify(item.data),
      renderRowCell: (item) => <span>{JSON.stringify(item.data)}</span>
    }
  ]
}

export const gameLogTradeConfig: JotaiTableConfig<GameLogTrade> = {
  title: 'Trade',
  columns: [
    {
      id: 'time',
      header: 'Time',
      width: 120,
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRowCell: (item) => <span>{dateToString(item.time)}</span>
    },
    {
      id: 'channel',
      header: 'Channel',
      width: 120,
      sortAccessor: (item) => item.channel,
      filterAccessor: (item) => item.channel,
      renderRowCell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{item.channel}</span>
          <img
            src="img/find.png"
            title="Search by this channel"
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
        </div>
      )
    },
    {
      id: 'player',
      header: 'Player',
      width: 120,
      sortAccessor: (item) => item.player,
      filterAccessor: (item) => item.player,
      renderRowCell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{item.player}</span>
          <img
            src="img/find.png"
            title="Search by this player"
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
        </div>
      )
    },
    {
      id: 'message',
      header: 'Message',
      width: 400,
      sortAccessor: (item) => item.message,
      filterAccessor: (item) => item.message,
      renderRowCell: (item) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(item.message.match(/\[[^\]]+\]|\s+|[^\[\]\s]+/g) || []).map((t, idx) =>
            t.startsWith('[') && t.endsWith(']') ? (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span>[{t.slice(1, -1)}]</span>
                <img
                  src="img/find.png"
                  title="Search by this item"
                  style={{ cursor: 'pointer', width: '12px', height: '12px' }}
                />
              </div>
            ) : (
              <span key={idx}>{t}</span>
            )
          )}
        </div>
      )
    }
  ]
}
