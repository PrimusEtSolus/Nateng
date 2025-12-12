/**
 * Truck Ban Ordinance Compliance Utility
 * Implements Baguio City Truck Ban Ordinance rules and validation
 */

export type TruckBanZone = 'CBD' | 'OUTSIDE_CBD';
export type RouteType = 'KENNON' | 'QUIRINO' | 'OTHER';
export type ExemptionType = 
  | 'water_delivery_fire'
  | 'fire_truck'
  | 'public_utility'
  | 'government'
  | 'worksite_equipment'
  | 'emergency'
  | null;

export interface DeliverySchedule {
  date: Date;
  time: string; // HH:mm format
  route: string;
  isCBD: boolean;
  truckWeightKg: number;
  isExempt?: boolean;
  exemptionType?: ExemptionType;
}

export interface TruckBanWindow {
  start: string; // HH:mm format
  end: string; // HH:mm format
  isBanned: boolean;
}

export interface RouteInfo {
  name: string;
  type: RouteType;
  allowedDestinations: string[];
  allowedOrigins: string[];
  windowHours: {
    start: string;
    end: string;
  };
}

/**
 * Truck Ban Windows Configuration
 */
export const TRUCK_BAN_WINDOWS = {
  OUTSIDE_CBD: {
    banned: [
      { start: '06:00', end: '09:00' },
      { start: '16:00', end: '21:00' },
    ],
    window: { start: '09:01', end: '15:59' },
  },
  CBD: {
    banned: [
      { start: '06:00', end: '21:00' },
    ],
    window: { start: '21:01', end: '05:59' },
  },
} as const;

/**
 * Allowed Routes Configuration
 */
export const ALLOWED_ROUTES: Record<string, RouteInfo> = {
  KENNON: {
    name: 'Kennon Road',
    type: 'KENNON',
    allowedDestinations: [
      'Halsema Highway',
      'Ambuclao Road',
      'Itogon, Benguet',
    ],
    allowedOrigins: [
      'Halsema Highway',
      'Ambuclao Road',
      'Itogon, Benguet',
    ],
    windowHours: {
      start: '09:00',
      end: '15:59',
    },
  },
  QUIRINO: {
    name: 'Quirino Highway (formerly Naguilian Road)',
    type: 'QUIRINO',
    allowedDestinations: [
      'Halsema Highway',
      'Ambuclao Road',
      'Itogon, Benguet',
      'Balatoc Mines',
      'Philiex Mines',
    ],
    allowedOrigins: [
      'Halsema Highway',
      'Ambuclao Road',
      'Itogon, Benguet',
      'Balatoc Mines',
      'Philiex Mines',
    ],
    windowHours: {
      start: '09:00',
      end: '15:59',
    },
  },
};

/**
 * Parse time string to minutes (validates format)
 */
function parseTimeToMinutes(time: string): number | null {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(time)) {
    return null;
  }
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Check if a time falls within truck ban hours
 */
export function isInTruckBanWindow(
  time: string, // HH:mm format
  zone: TruckBanZone
): boolean {
  const timeMinutes = parseTimeToMinutes(time);
  if (timeMinutes === null) {
    throw new Error(`Invalid time format: ${time}. Expected HH:mm format.`);
  }

  const windows = TRUCK_BAN_WINDOWS[zone];

  for (const bannedWindow of windows.banned) {
    const startMinutes = parseTimeToMinutes(bannedWindow.start);
    const endMinutes = parseTimeToMinutes(bannedWindow.end);
    
    if (startMinutes === null || endMinutes === null) {
      continue; // Skip invalid window
    }

    let adjustedEndMinutes = endMinutes;
    let adjustedTimeMinutes = timeMinutes;

    // Handle overnight windows (e.g., 21:01 - 05:59)
    if (endMinutes < startMinutes) {
      adjustedEndMinutes = endMinutes + 24 * 60; // Add 24 hours
      // If time is before start, it might be in the overnight window
      if (timeMinutes < startMinutes) {
        adjustedTimeMinutes = timeMinutes + 24 * 60;
      }
    }

    if (adjustedTimeMinutes >= startMinutes && adjustedTimeMinutes <= adjustedEndMinutes) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a time is in the allowed window
 */
export function isInWindowTime(
  time: string, // HH:mm format
  zone: TruckBanZone
): boolean {
  return !isInTruckBanWindow(time, zone);
}

/**
 * Check if truck weight requires compliance (4500 kg or more)
 */
export function requiresTruckBanCompliance(truckWeightKg: number): boolean {
  return truckWeightKg >= 4500;
}

/**
 * Validate delivery schedule against truck ban ordinance
 */
export function validateDeliverySchedule(schedule: DeliverySchedule): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
  suggestions: string[];
} {
  const violations: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if truck requires compliance
  if (!requiresTruckBanCompliance(schedule.truckWeightKg)) {
    return {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: [],
    };
  }

  // Check exemptions
  if (schedule.isExempt && schedule.exemptionType) {
    return {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: [`Vehicle is exempt: ${schedule.exemptionType}`],
    };
  }

  const zone: TruckBanZone = schedule.isCBD ? 'CBD' : 'OUTSIDE_CBD';
  const isBanned = isInTruckBanWindow(schedule.time, zone);

  if (isBanned) {
    violations.push(
      `Truck ban violation: ${schedule.time} is within banned hours for ${zone === 'CBD' ? 'CBD' : 'areas outside CBD'}`
    );

    // Suggest window times
    const windows = TRUCK_BAN_WINDOWS[zone];
    if (zone === 'OUTSIDE_CBD') {
      suggestions.push(
        `Use window time: ${windows.window.start} - ${windows.window.end}`
      );
    } else {
      suggestions.push(
        `Use window time: ${windows.window.start} - ${windows.window.end} (overnight)`
      );
    }
  }

  // Validate route if provided
  if (schedule.route) {
    const routeInfo = ALLOWED_ROUTES[schedule.route.toUpperCase()];
    if (routeInfo) {
      const timeMinutes = parseTimeToMinutes(schedule.time);
      const windowStartMinutes = parseTimeToMinutes(routeInfo.windowHours.start);
      const windowEndMinutes = parseTimeToMinutes(routeInfo.windowHours.end);
      
      if (timeMinutes !== null && windowStartMinutes !== null && windowEndMinutes !== null) {
        // Check if time is outside the recommended window hours for this route
        if (timeMinutes < windowStartMinutes || timeMinutes > windowEndMinutes) {
          warnings.push(
            `Route ${routeInfo.name} is best used during window hours: ${formatTime(routeInfo.windowHours.start)} - ${formatTime(routeInfo.windowHours.end)}`
          );
        }
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    suggestions,
  };
}

/**
 * Get available window times for a given zone
 */
export function getAvailableWindowTimes(zone: TruckBanZone): TruckBanWindow[] {
  if (zone === 'OUTSIDE_CBD') {
    return [
      { start: '09:01', end: '15:59', isBanned: false },
      { start: '06:00', end: '09:00', isBanned: true },
      { start: '16:00', end: '21:00', isBanned: true },
    ];
  } else {
    return [
      { start: '21:01', end: '05:59', isBanned: false },
      { start: '06:00', end: '21:00', isBanned: true },
    ];
  }
}

/**
 * Get penalty amount based on violation count
 */
export function getPenaltyAmount(violationCount: number): number {
  if (violationCount === 1) return 2000;
  if (violationCount === 2) return 3000;
  if (violationCount === 3) return 5000;
  if (violationCount >= 4) return 5000; // Plus impound
  return 0;
}

/**
 * Get exemption types
 */
export function getExemptionTypes(): Array<{ value: ExemptionType; label: string }> {
  return [
    { value: 'water_delivery_fire', label: 'Water delivery trucks assisting fire-fighting' },
    { value: 'fire_truck', label: 'Fire trucks' },
    { value: 'public_utility', label: 'Company vehicles of public utilities doing repairs/works' },
    { value: 'government', label: 'Government registered trucks' },
    { value: 'worksite_equipment', label: 'Heavy equipment already at worksite' },
    { value: 'emergency', label: 'Trucks used during emergencies or calamities' },
  ];
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  const timeMinutes = parseTimeToMinutes(time);
  if (timeMinutes === null) {
    return time; // Return original if invalid
  }
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHour}:${displayMinutes} ${ampm}`;
}

/**
 * Get the next available window time for a given zone
 * Returns the start time of the next window period
 */
export function getNextAvailableWindowTime(zone: TruckBanZone, currentTime?: Date): string {
  const now = currentTime || new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeMinutes = currentHours * 60 + currentMinutes;
  
  const windows = getAvailableWindowTimes(zone);
  const allowedWindows = windows.filter(w => !w.isBanned);
  
  if (allowedWindows.length === 0) {
    return '09:00'; // Default fallback
  }
  
  // Find the next window that hasn't passed today
  for (const window of allowedWindows) {
    const [startH, startM] = window.start.split(':').map(Number);
    const windowStartMinutes = startH * 60 + startM;
    
    // Handle overnight windows (e.g., 21:01 - 05:59)
    if (windowStartMinutes < currentTimeMinutes && windowStartMinutes > 12 * 60) {
      // This is an overnight window, check if we're before it
      if (currentTimeMinutes < windowStartMinutes) {
        return window.start;
      }
    } else if (windowStartMinutes > currentTimeMinutes) {
      // Window is later today
      return window.start;
    }
  }
  
  // If all windows have passed, return the first window (next day)
  return allowedWindows[0].start;
}

