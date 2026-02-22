/**
 * Smart Devices Data
 * Real data from Bosch Home Connect app
 */

import type {
  AirQualityHistoryPoint,
  AirQualityLevel,
  DailyConsumption,
  DysonAirPurifierData,
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

/**
 * Dyson Air Purifier Data
 * Based on Dyson Link app real readings
 */

function getAqLevel(pm25: number): AirQualityLevel {
  if (pm25 <= 12) return "good";
  if (pm25 <= 35) return "fair";
  if (pm25 <= 55) return "moderate";
  if (pm25 <= 150) return "poor";
  return "very-poor";
}

function generateAirQualityHistory(hours: number): AirQualityHistoryPoint[] {
  const data: AirQualityHistoryPoint[] = [];
  const now = new Date(2026, 1, 22, 14, 0); // Feb 22, 2026 2:00 PM

  for (let i = hours - 1; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(time.getHours() - i);
    const seed = time.getTime();
    const hour = time.getHours();

    // Simulate realistic daily patterns
    // PM2.5 peaks during cooking hours (7-9, 12-13, 18-20)
    const isCookingHour =
      (hour >= 7 && hour <= 9) ||
      (hour >= 12 && hour <= 13) ||
      (hour >= 18 && hour <= 20);
    const isNight = hour >= 23 || hour <= 5;

    const basePm25 = isNight ? 3 : isCookingHour ? 12 : 6;
    const pm25 =
      Math.round(
        (basePm25 + (seededRandom(seed + 200) - 0.3) * 8) * 10,
      ) / 10;
    const pm10 =
      Math.round(
        (basePm25 * 1.1 + (seededRandom(seed + 300) - 0.3) * 6) * 10,
      ) / 10;

    // VOC tends to be low with occasional spikes
    const voc =
      Math.round(
        Math.max(0, (seededRandom(seed + 400) < 0.85 ? 0 : seededRandom(seed + 401) * 3)) * 10,
      ) / 10;

    // NO2 very low indoors
    const no2 =
      Math.round(
        Math.max(0, (seededRandom(seed + 500) < 0.9 ? 0 : seededRandom(seed + 501) * 2)) * 10,
      ) / 10;

    // HCHO very low with Formaldehyde sensor
    const hcho =
      Math.round(
        Math.max(0, 0.001 + (seededRandom(seed + 600) - 0.5) * 0.002) * 1000,
      ) / 1000;

    // Temperature: follows day/night cycle (26-32)
    const baseTemp = isNight ? 27 : hour >= 12 && hour <= 15 ? 32 : 29;
    const temperature =
      Math.round((baseTemp + (seededRandom(seed + 700) - 0.5) * 3) * 10) / 10;

    // Humidity: inverse to temperature somewhat (50-70%)
    const baseHumidity = isNight ? 65 : hour >= 12 && hour <= 15 ? 52 : 58;
    const humidity = Math.round(
      baseHumidity + (seededRandom(seed + 800) - 0.5) * 12,
    );

    const h = time.getHours().toString().padStart(2, "0");
    const m = time.getMinutes().toString().padStart(2, "0");

    data.push({
      time: `${h}:${m}`,
      pm25: Math.max(0, pm25),
      pm10: Math.max(0, pm10),
      voc: Math.max(0, voc),
      no2: Math.max(0, no2),
      hcho: Math.max(0, hcho),
      temperature: Math.max(20, temperature),
      humidity: Math.min(85, Math.max(35, humidity)),
    });
  }

  return data;
}

const airQualityHistory = generateAirQualityHistory(48);
const latestReading = airQualityHistory[airQualityHistory.length - 1];

export const dysonAirPurifier: DysonAirPurifierData = {
  model: "Dyson Purifier Cool\u2122 Formaldehyde",
  modelCode: "TP09",
  brand: "dyson",
  status: "online",
  currentTemperature: latestReading.temperature,
  currentHumidity: latestReading.humidity,
  airQuality: getAqLevel(latestReading.pm25),
  pollutants: [
    {
      label: "PM2.5",
      shortLabel: "PM2.5",
      value: latestReading.pm25,
      unit: "\u00b5g/m\u00b3",
      level: getAqLevel(latestReading.pm25),
    },
    {
      label: "PM10",
      shortLabel: "PM10",
      value: latestReading.pm10,
      unit: "\u00b5g/m\u00b3",
      level: getAqLevel(latestReading.pm10 * 0.5),
    },
    {
      label: "Formaldehyde",
      shortLabel: "HCHO",
      value: latestReading.hcho,
      unit: "mg/m\u00b3",
      level: latestReading.hcho < 0.08 ? "good" : "fair",
    },
    {
      label: "Volatile Organic Compounds",
      shortLabel: "VOC",
      value: latestReading.voc,
      unit: "\u00b5g/m\u00b3",
      level: latestReading.voc < 1 ? "good" : "fair",
    },
    {
      label: "Nitrogen Dioxide",
      shortLabel: "NO\u2082",
      value: latestReading.no2,
      unit: "\u00b5g/m\u00b3",
      level: latestReading.no2 < 1 ? "good" : "fair",
    },
  ],
  history: airQualityHistory,
  filters: [
    {
      name: "HEPA + Carbon",
      remainingPercent: 11,
      remainingMonths: 1,
    },
  ],
  report: {
    comparedToLastMonth: "deteriorated",
    highestPollutionDay: "Tuesday",
    highestPollutionDate: "11th January 2026",
    aqiRating: "fair",
    dominantPollutant: "PM2.5",
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
  {
    id: "dyson-purifier",
    name: "Dyson Purifier Cool\u2122 Formaldehyde",
    brand: "dyson",
    type: "air-purifier",
    status: "online",
    icon: "wind",
  },
];
