# Truck Ban Ordinance Implementation

## Overview

This document describes the implementation of the Baguio City Truck Ban Ordinance compliance system in NatengHub. The system ensures that delivery scheduling complies with local transport regulations to avoid fines and delays.

## Features Implemented

### 1. Database Schema Updates

**File**: `prisma/schema.prisma`

Added delivery scheduling fields to the `Order` model:
- `scheduledDate` - Scheduled delivery date
- `scheduledTime` - Scheduled delivery time (HH:mm format)
- `route` - Delivery route (Kennon Road, Quirino Highway, etc.)
- `isCBD` - Whether delivery is within Central Business District
- `truckWeightKg` - Gross weight capacity of truck in kg
- `deliveryAddress` - Delivery address
- `isExempt` - Whether vehicle is exempt from truck ban
- `exemptionType` - Type of exemption

### 2. Truck Ban Compliance Utility Library

**File**: `lib/truck-ban.ts`

Comprehensive utility library implementing all truck ban rules:

#### Truck Ban Windows:
- **Outside CBD**: 
  - Banned: 6:00 AM - 9:00 AM, 4:00 PM - 9:00 PM
  - Window: 9:01 AM - 3:59 PM
- **CBD**: 
  - Banned: 6:00 AM - 9:00 PM
  - Window: 9:01 PM - 5:59 AM (overnight)

#### Key Functions:
- `isInTruckBanWindow()` - Check if time is in banned hours
- `isInWindowTime()` - Check if time is in allowed window
- `requiresTruckBanCompliance()` - Check if truck weight (≥4500 kg) requires compliance
- `validateDeliverySchedule()` - Comprehensive validation with violations, warnings, and suggestions
- `getAvailableWindowTimes()` - Get allowed/banned time windows for a zone
- `getPenaltyAmount()` - Calculate penalty based on violation count
- `getExemptionTypes()` - Get list of valid exemption types

#### Allowed Routes:
- **Kennon Road**: Window time 9:00 AM - 3:59 PM
- **Quirino Highway**: Window time 9:00 AM - 3:59 PM
- Specific route mappings for different origins/destinations

### 3. Delivery Scheduling API

**File**: `app/api/orders/[id]/schedule/route.ts`

RESTful API endpoints for delivery scheduling:

#### PATCH `/api/orders/[id]/schedule`
- Schedules delivery for an order
- Validates against truck ban ordinance
- Returns violations, warnings, and suggestions if non-compliant
- Updates order with delivery schedule data

#### GET `/api/orders/[id]/schedule`
- Retrieves delivery schedule for an order

### 4. Delivery Scheduler Component

**File**: `components/delivery-scheduler.tsx`

Interactive React component for scheduling deliveries:

**Features**:
- Date and time picker
- Zone selection (CBD / Outside CBD)
- Truck weight input with compliance indicator
- Route selection (Kennon Road, Quirino Highway, Other)
- Exemption selection with type dropdown
- Real-time validation with visual feedback
- Shows available window times
- Displays violations, warnings, and suggestions
- Prevents submission if schedule violates truck ban

**Visual Indicators**:
- ✅ Green checkmark for compliant schedules
- ⚠️ Warning alerts for route suggestions
- ❌ Error alerts for violations
- 🕐 Clock icon for window time suggestions

### 5. Logistics Dashboard

**File**: `app/logistics/dashboard/page.tsx`

Comprehensive dashboard showing:

**Current Status**:
- Real-time truck ban status for CBD and Outside CBD
- Current time display
- Visual indicators (green for window time, red for banned)

**Truck Ban Windows**:
- Complete list of banned and allowed hours for both zones
- Formatted time display with AM/PM

**Violation Penalties**:
- First offense: ₱2,000
- Second offense: ₱3,000
- Third offense: ₱5,000
- Fourth offense: ₱5,000 + 1 month impound

**Upcoming Deliveries**:
- List of next 10 scheduled deliveries
- Compliance status for each delivery
- Violation warnings for non-compliant schedules
- Delivery details (zone, truck weight, route)

**Exemptions Information**:
- List of all exemption types

### 6. Integration with Order Management

**File**: `app/farmer/orders/page.tsx`

Added delivery scheduling to farmer orders page:

- "Schedule Delivery" button for confirmed orders
- Modal dialog with delivery scheduler component
- Integration with order status workflow

**File**: `components/farmer/sidebar.tsx`

Added "Logistics" navigation link to farmer sidebar for quick access to logistics dashboard.

## Usage

### For Farmers (Scheduling Deliveries)

1. Navigate to **Bulk Orders** page
2. Find a **CONFIRMED** order
3. Click **"Schedule Delivery"** button
4. Fill in delivery details:
   - Truck weight (kg)
   - Delivery zone (CBD or Outside CBD)
   - Scheduled date and time
   - Route (optional)
   - Delivery address
5. System validates against truck ban rules
6. If compliant, click **"Schedule Delivery"**
7. If non-compliant, system shows violations and suggests window times

### For Logistics Managers

1. Navigate to **Logistics Dashboard** (`/logistics/dashboard`)
2. View current truck ban status
3. Check upcoming deliveries for compliance
4. Review truck ban windows and penalties
5. Monitor delivery schedules

## Exemptions

The following vehicles are exempt from truck ban:

1. Water delivery trucks assisting fire-fighting
2. Fire trucks
3. Company vehicles of public utilities doing repairs/works
4. Government registered trucks
5. Heavy equipment already at worksite
6. Trucks used during emergencies or calamities

When scheduling, select "Vehicle is exempt from truck ban" and choose the exemption type.

## Penalties

Violations are tracked and penalties increase with repeat offenses:

- **First Offense**: ₱2,000.00
- **Second Offense**: ₱3,000.00
- **Third Offense**: ₱5,000.00
- **Fourth Offense**: ₱5,000.00 + Vehicle impounded for 1 month

The system prevents scheduling during banned hours to avoid violations.

## Technical Details

### Validation Logic

The system validates delivery schedules based on:
1. Truck weight (≥4500 kg triggers compliance)
2. Delivery zone (CBD vs Outside CBD)
3. Scheduled time (must be in window hours)
4. Route (if specified, validates against allowed routes)
5. Exemption status (exempt vehicles bypass validation)

### Time Handling

- Times are stored in HH:mm format (24-hour)
- Window times handle overnight periods (9:01 PM - 5:59 AM for CBD)
- Real-time validation updates as user changes inputs

### Database Migration

Run the migration to add delivery scheduling fields:
```bash
npx prisma migrate dev --name add_delivery_scheduling
```

## Future Enhancements

Potential improvements:
1. Route optimization algorithm
2. Delivery consolidation based on truck ban windows
3. Automated penalty tracking
4. Integration with GPS for route validation
5. SMS/Email notifications for delivery schedules
6. Historical violation tracking per driver/vehicle
7. Integration with traffic management office systems

## References

- Baguio City Truck Ban Ordinance
- Sangguniang Panlungsod ng Baguio
- Implementation based on official ordinance document

