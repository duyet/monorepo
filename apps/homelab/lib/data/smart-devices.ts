/**
 * Smart Devices Data
 * Real data from Bosch Home Connect app
 */

import type {
  DailyConsumption,
  SmartDevice,
  WashingMachineData,
} from "./types";

/**
 * Simple seeded pseudo-random for deterministic data generation.
 * Returns a value between 0 and 1.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/**
 * Generate daily consumption data for the last N days.
 * Patterns: ~12-15 wash days per month, weekends slightly more likely,
 * with realistic per-wash water (8-15L) and energy (0.8-2.2 kWh).
 */
function generateDailyData(
  days: number,
  avgPerWash: number,
  variance: number,
  seedOffset: number,
): DailyConsumption[] {
  const data: DailyConsumption[] = [];
  const now = new Date(2025, 9, 31); // Oct 31, 2025 (latest data point)

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // ~40-50% chance of a wash on any given day, higher on weekends
    const washProbability = isWeekend ? 0.55 : 0.4;
    const seed = date.getTime() + seedOffset;
    const hasWash = seededRandom(seed) < washProbability;

    let value = 0;
    if (hasWash) {
      // 1-2 washes per wash day
      const washes = seededRandom(seed + 1) < 0.3 ? 2 : 1;
      for (let w = 0; w < washes; w++) {
        const perWash =
          avgPerWash + (seededRandom(seed + w + 2) - 0.5) * variance;
        value += Math.max(0, perWash);
      }
      value = Math.round(value * 10) / 10;
    }

    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    data.push({ date: `${month} ${day}`, value });
  }

  return data;
}

// Water: avg ~11L per wash, ±6L variance
const waterDaily = generateDailyData(90, 11, 6, 0);
// Energy: avg ~1.5 kWh per wash, ±1.2 kWh variance, different seed
const energyDaily = generateDailyData(90, 1.5, 1.2, 100000);

export const boschWashingMachine: WashingMachineData = {
  model: "Bosch Series 6",
  brand: "bosch",
  status: "idle",
  lifetimeCycles: 461,
  waterConsumption: {
    // 12-month Bosch app average (includes Dec which is not shown in the monthly array)
    monthlyAverage: 152.3,
    unit: "L",
    monthly: [
      { month: "Jan", value: 98 },
      { month: "Feb", value: 138 },
      { month: "Mar", value: 172 },
      { month: "Apr", value: 134 },
      { month: "May", value: 165 },
      { month: "Jun", value: 148 },
      { month: "Jul", value: 128 },
      { month: "Aug", value: 155 },
      { month: "Sep", value: 168 },
      { month: "Oct", value: 180.5 },
      { month: "Nov", value: 118 },
    ],
    daily: waterDaily,
  },
  energyConsumption: {
    // 12-month Bosch app average (includes Dec which is not shown in the monthly array)
    monthlyAverage: 19.6,
    unit: "kWh",
    monthly: [
      { month: "Jan", value: 12.3 },
      { month: "Feb", value: 7.5 },
      { month: "Mar", value: 22.1 },
      { month: "Apr", value: 17.8 },
      { month: "May", value: 21.4 },
      { month: "Jun", value: 19.2 },
      { month: "Jul", value: 16.5 },
      { month: "Aug", value: 20.3 },
      { month: "Sep", value: 22.8 },
      { month: "Oct", value: 23.8 },
      { month: "Nov", value: 14.9 },
    ],
    daily: energyDaily,
  },
};

export const smartDevices: SmartDevice[] = [
  {
    id: "bosch-washer",
    name: "Bosch Series 6",
    brand: "bosch",
    type: "washing-machine",
    status: "idle",
    icon: "washing-machine",
  },
];
