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
import { CellElement } from '../../components/common/jotai/cellDSL'

function _separateCamelCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, char => char.toUpperCase())
}

/**
 * Game Log Table Configurations
 * DSL-based table configs for game log tables
 */

export const gameLogLootConfig: JotaiTableConfig<GameLogLoot> = {
  title: 'Loot',
  columns: [
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.name,
        title: item.name
      })
    },
    {
      id: 'quantity',
      header: 'Quantity',
      sortAccessor: (item) => item.quantity,
      filterAccessor: (item) => item.quantity.toString(),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.quantity.toString()
      }),
      justifyContent: 'end'
    },
    {
      id: 'value',
      header: 'Value',
      sortAccessor: (item) => item.value,
      filterAccessor: (item) => item.value.toFixed(2),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: `${item.value.toFixed(2)} PED`
      }),
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
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.name,
        title: item.name
      })
    },
    {
      id: 'tier',
      header: 'Tier',
      sortAccessor: (item) => item.tier,
      filterAccessor: (item) => item.tier.toFixed(2),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.tier.toFixed(2)
      }),
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
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.name,
        title: item.name
      })
    },
    {
      id: 'value',
      header: 'Value',
      sortAccessor: (item) => item.value,
      filterAccessor: (item) => item.value.toFixed(4),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.value.toFixed(4)
      }),
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
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: dateToString(item.time)
      })
    },
    {
      id: 'enhancer',
      header: 'Enhancer',
      sortAccessor: (item) => item.enhancer,
      filterAccessor: (item) => item.enhancer,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.enhancer,
        title: item.enhancer
      })
    },
    {
      id: 'item',
      header: 'Item',
      sortAccessor: (item) => item.item,
      filterAccessor: (item) => item.item,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.item,
        title: item.item
      })
    },
    {
      id: 'remaining',
      header: 'Remaining',
      sortAccessor: (item) => item.remaining,
      filterAccessor: (item) => item.remaining.toString(),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.remaining.toString()
      }),
      justifyContent: 'end'
    },
    {
      id: 'received',
      header: 'Received',
      sortAccessor: (item) => item.received,
      filterAccessor: (item) => item.received.toFixed(2),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.received.toFixed(2)
      }),
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
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: dateToString(item.time)
      })
    },
    {
      id: 'player',
      header: 'Player',
      sortAccessor: (item) => item.player,
      filterAccessor: (item) => item.player,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.player
      })
    },
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.name,
        title: item.name
      })
    },
    {
      id: 'type',
      header: 'Type',
      sortAccessor: (item) => item.type,
      filterAccessor: (item) => item.type,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.type
      })
    },
    {
      id: 'value',
      header: 'Value',
      sortAccessor: (item) => item.value ?? 0,
      filterAccessor: (item) => (item.value?.toFixed(0) ?? '0'),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.value?.toFixed(0) ?? '0'
      }),
      justifyContent: 'end'
    },
    {
      id: 'location',
      header: 'Location',
      sortAccessor: (item) => item.location ?? '',
      filterAccessor: (item) => item.location ?? '',
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.location ?? ''
      })
    },
    {
      id: 'hof',
      header: 'HOF',
      sortAccessor: (item) => item.isHoF ? 1 : 0,
      filterAccessor: (item) => item.isHoF ? '[HoF]' : '',
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.isHoF ? '[HoF]' : ''
      }),
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
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: dateToString(item.time)
      })
    },
    {
      id: 'action',
      header: 'Action',
      sortAccessor: (item) => _separateCamelCase(item.action),
      filterAccessor: (item) => _separateCamelCase(item.action),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: _separateCamelCase(item.action),
        title: item.message
      })
    },
    {
      id: 'data',
      header: 'Data',
      sortAccessor: (item) => item.data.toString(),
      filterAccessor: (item) => item.data.toString(),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.data.toString()
      })
    }
  ]
}

export const gameLogStatisticsConfig: JotaiTableConfig<[string, TemporalValue]> = {
  title: 'Statistics',
  columns: [
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item[0],
      filterAccessor: (item) => _separateCamelCase(item[0]),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: _separateCamelCase(item[0])
      })
    },
    {
      id: 'total',
      header: 'Total',
      sortAccessor: (item) => item[1].total,
      filterAccessor: (item) => item[1].total.toFixed((gameLogStatsDecimals as any)[item[0]] ?? 0),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item[1].total.toFixed((gameLogStatsDecimals as any)[item[0]] ?? 0)
      }),
      justifyContent: 'end'
    },
    {
      id: 'count',
      header: 'Count',
      sortAccessor: (item) => item[1].count,
      filterAccessor: (item) => item[1].count.toString(),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item[1].count.toString()
      }),
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
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: dateToString(item.time)
      })
    },
    {
      id: 'channel',
      header: 'Channel',
      sortAccessor: (item) => item.channel,
      filterAccessor: (item) => item.channel,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.channel
      })
    },
    {
      id: 'message',
      header: 'Message',
      sortAccessor: (item) => item.message,
      filterAccessor: (item) => item.message,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.message
      })
    }
  ]
}

export const gameLogRawConfig: JotaiTableConfig<GameLogLine> = {
  title: 'Full log',
  columns: [
    {
      id: 'serial',
      header: 'Serial',
      sortAccessor: (item) => item.serial,
      filterAccessor: (item) => item.serial.toString(),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.serial.toString()
      }),
      justifyContent: 'end'
    },
    {
      id: 'time',
      header: 'Time',
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time, true),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: dateToString(item.time, true)
      })
    },
    {
      id: 'channel',
      header: 'Channel',
      sortAccessor: (item) => item.channel,
      filterAccessor: (item) => item.channel,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.channel
      })
    },
    {
      id: 'player',
      header: 'Player',
      sortAccessor: (item) => item.player,
      filterAccessor: (item) => item.player,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.player
      })
    },
    {
      id: 'message',
      header: 'Message',
      sortAccessor: (item) => item.message,
      filterAccessor: (item) => item.message,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.message
      })
    },
    {
      id: 'data',
      header: 'Data',
      sortAccessor: (item) => JSON.stringify(item.data),
      filterAccessor: (item) => JSON.stringify(item.data),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: JSON.stringify(item.data)
      })
    }
  ]
}

export const gameLogTradeConfig: JotaiTableConfig<GameLogTrade> = {
  title: 'Trade',
  columns: [
    {
      id: 'time',
      header: 'Time',
      sortAccessor: (item) => item.time,
      filterAccessor: (item) => dateToString(item.time),
      renderRow: (item): CellElement => ({
        type: 'text',
        value: dateToString(item.time)
      })
    },
    {
      id: 'channel',
      header: 'Channel',
      sortAccessor: (item) => item.channel,
      filterAccessor: (item) => item.channel,
      renderRow: (item): CellElement => ({
        type: 'row',
        gap: 4,
        children: [
          { type: 'text', value: item.channel },
          { type: 'icon', src: 'img/find.png', width: 16, height: 16, title: 'Search by this channel' }
        ]
      })
    },
    {
      id: 'player',
      header: 'Player',
      sortAccessor: (item) => item.player,
      filterAccessor: (item) => item.player,
      renderRow: (item): CellElement => ({
        type: 'row',
        gap: 4,
        children: [
          { type: 'text', value: item.player },
          { type: 'icon', src: 'img/find.png', width: 16, height: 16, title: 'Search by this player' }
        ]
      })
    },
    {
      id: 'message',
      header: 'Message',
      sortAccessor: (item) => item.message,
      filterAccessor: (item) => item.message,
      renderRow: (item): CellElement => {
        const tokens = (item.message.match(/\[[^\]]+\]|\s+|[^\[\]\s]+/g) || [])
        return {
          type: 'row',
          gap: 4,
          flexWrap: true,
          children: tokens.map(t =>
            t.startsWith('[') && t.endsWith(']')
              ? {
                  type: 'row' as const,
                  gap: 2,
                  children: [
                    { type: 'text' as const, value: t },
                    { type: 'icon' as const, src: 'img/find.png', width: 12, height: 12, title: 'Search by this item' }
                  ]
                }
              : { type: 'text' as const, value: t }
          )
        }
      }
    }
  ]
}
