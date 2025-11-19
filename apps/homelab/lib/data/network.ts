/**
 * Network mock data generation
 */

import { HISTORICAL_DATA } from '../constants'
import type { NetworkSpeedTest } from './types'
import { random, getHistoricalTime } from './utils'

/**
 * Generate network traffic with realistic day/night patterns
 */
const generateNetworkTraffic = () => {
  return [
    {
      time: getHistoricalTime(24),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.OUT.max
      ),
    },
    {
      time: getHistoricalTime(22),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.OUT.max
      ),
    },
    {
      time: getHistoricalTime(20),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.NIGHT.OUT.max
      ),
    },
    {
      time: getHistoricalTime(18),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: getHistoricalTime(16),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: getHistoricalTime(14),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: getHistoricalTime(12),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: getHistoricalTime(10),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: getHistoricalTime(8),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: getHistoricalTime(6),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: getHistoricalTime(4),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: getHistoricalTime(2),
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
    {
      time: 'Now',
      in: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.IN.max
      ),
      out: random(
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.min,
        HISTORICAL_DATA.NETWORK_TRAFFIC.DAY.OUT.max
      ),
    },
  ].map((item) => ({
    ...item,
    in: Number(item.in.toFixed(1)),
    out: Number(item.out.toFixed(1)),
  }))
}

export const networkTraffic = generateNetworkTraffic()

/**
 * Generate speed test data
 */
export const speedTest: NetworkSpeedTest = {
  download: Number(
    random(
      HISTORICAL_DATA.SPEED_TEST.DOWNLOAD.min,
      HISTORICAL_DATA.SPEED_TEST.DOWNLOAD.max
    ).toFixed(1)
  ),
  upload: Number(
    random(
      HISTORICAL_DATA.SPEED_TEST.UPLOAD.min,
      HISTORICAL_DATA.SPEED_TEST.UPLOAD.max
    ).toFixed(1)
  ),
  ping: Number(
    random(
      HISTORICAL_DATA.SPEED_TEST.PING.min,
      HISTORICAL_DATA.SPEED_TEST.PING.max
    ).toFixed(1)
  ),
  timestamp: new Date().toLocaleString(),
}
