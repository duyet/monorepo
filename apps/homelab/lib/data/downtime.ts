/**
 * Service downtime mock data generation
 */

import { DOWNTIME_INCIDENTS } from "../constants";
import type { ServiceDowntime } from "./types";

/**
 * Generate recent downtime incidents with dynamic dates
 */
const generateDowntimeHistory = (): ServiceDowntime[] => {
  const now = new Date();
  const incidents: ServiceDowntime[] = [];

  // Incident 1: 7 days ago
  const incident1Start = new Date(
    now.getTime() - DOWNTIME_INCIDENTS.HISTORY_DAYS[0] * 24 * 60 * 60 * 1000
  );
  incident1Start.setHours(14, 23, 0);
  const incident1End = new Date(incident1Start.getTime() + 8 * 60 * 1000);
  incidents.push({
    service: "postgres",
    start: incident1Start.toLocaleString(),
    end: incident1End.toLocaleString(),
    duration: "8m",
    reason: "Planned maintenance",
  });

  // Incident 2: 10 days ago
  const incident2Start = new Date(
    now.getTime() - DOWNTIME_INCIDENTS.HISTORY_DAYS[1] * 24 * 60 * 60 * 1000
  );
  incident2Start.setHours(9, 15, 0);
  const incident2End = new Date(incident2Start.getTime() + 3 * 60 * 1000);
  incidents.push({
    service: "clickhouse",
    start: incident2Start.toLocaleString(),
    end: incident2End.toLocaleString(),
    duration: "3m",
    reason: "Configuration update",
  });

  // Incident 3: 15 days ago
  const incident3Start = new Date(
    now.getTime() - DOWNTIME_INCIDENTS.HISTORY_DAYS[2] * 24 * 60 * 60 * 1000
  );
  incident3Start.setHours(22, 45, 0);
  const incident3End = new Date(incident3Start.getTime() + 17 * 60 * 1000);
  incidents.push({
    service: "home-assistant",
    start: incident3Start.toLocaleString(),
    end: incident3End.toLocaleString(),
    duration: "17m",
    reason: "Unexpected restart",
  });

  return incidents;
};

export const downtimeHistory = generateDowntimeHistory();
