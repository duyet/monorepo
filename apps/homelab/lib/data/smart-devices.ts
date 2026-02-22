/**
 * Smart Devices Data
 * Real data from Bosch Home Connect app
 */

import type { SmartDevice, WashingMachineData } from "./types";

export const boschWashingMachine: WashingMachineData = {
  model: "Bosch Series 8",
  brand: "bosch",
  status: "idle",
  lifetimeCycles: 461,
  waterConsumption: {
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
  },
  energyConsumption: {
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
  },
};

export const smartDevices: SmartDevice[] = [
  {
    id: "bosch-washer",
    name: "Bosch Series 8",
    brand: "Bosch",
    type: "washing-machine",
    status: "idle",
    icon: "washing-machine",
  },
];
