# Resort Property Management System
# Consolidated Database Design Document

**Prepared from plan1.md, plan2.md and current-plan.md — August 2026**

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [Technology Stack](#2-technology-stack)
3. [Database Design Objectives](#3-database-design-objectives)
4. [Database Naming & Design Standards](#4-database-naming--design-standards)
5. [Database Architecture — Domain Map](#5-database-architecture--domain-map)
6. [Master vs. Transaction vs. History Tables](#6-master-vs-transaction-vs-history-tables)
7. [Access Management Module](#7-access-management-module)
8. [Property Management Module](#8-property-management-module)
9. [Front Office Module](#9-front-office-module)
10. [Reservation Deep-Dive: Advanced Booking Scenarios](#10-reservation-deep-dive-advanced-booking-scenarios)
11. [Pricing Module](#11-pricing-module)
12. [Offers, Coupons & Loyalty Module](#12-offers-coupons--loyalty-module)
13. [Settlement Module (OTA / Agent / Corporate)](#13-settlement-module-ota--agent--corporate)
14. [Billing / Finance & Accounting Module](#14-billing--finance--accounting-module)
15. [Operations: Housekeeping](#15-operations-housekeeping)
16. [Operations: Maintenance](#16-operations-maintenance)
17. [Security Module](#17-security-module)
18. [Assets Module](#18-assets-module)
19. [Reports Module](#19-reports-module)
20. [Human Resource Management (HRM)](#20-human-resource-management-hrm)
21. [Attendance Module](#21-attendance-module)
22. [Staff Management Module](#22-staff-management-module)
23. [Settings Module](#23-settings-module)
24. [Mini CRM / Lead Management](#24-mini-crm--lead-management)
25. [System Module](#25-system-module)
26. [Core Cross-Module Relationships](#26-core-cross-module-relationships)
27. [Data Integrity & Business Rules](#27-data-integrity--business-rules)
28. [Index & Constraint Strategy](#28-index--constraint-strategy)
29. [Audit & Soft-Delete Strategy](#29-audit--soft-delete-strategy)
30. [Security Requirements (System-Wide)](#30-security-requirements-system-wide)
31. [Recommended API Structure (/api/v1)](#31-recommended-api-structure-apiv1)
32. [Recommended Database Documentation Files](#32-recommended-database-documentation-files)
33. [Recommended Development / Implementation Phases](#33-recommended-development--implementation-phases)
34. [Open Decisions](#34-open-decisions)
35. [Final Database Design Deliverable](#35-final-database-design-deliverable)

---

## 1. Document Purpose

This document merges three source files into a single Database Design Document (DDD) for the Resort Property Management System (PMS):

- **plan1.md** — Functional / module requirements (the full business scope of the PMS)
- **plan2.md** — Database design plan (technology stack, domains, standards, documentation rules)
- **current-plan.md** — Module-by-module functional detail (Front Office, Housekeeping, Maintenance, Security, Accounting, Assets, Reports, HRM, Attendance, Staff Management, Settings) plus advanced booking and CRM design

The intent is not to write SQL yet. This document defines what the system must do and how the data should be structured, so that schema implementation can follow without repeated redesign.

**Source hierarchy:**

```text
Functional Requirements (plan1 + current-plan)
    ↓
Database Design Document (this file)
    ↓
Entity / Relationship Review
    ↓
Final Table List
    ↓
ER Diagram
    ↓
SQL Schema / Migrations
    ↓
Node.js Models / Services / Controllers
    ↓
Express REST APIs
    ↓
Angular Services / Components
    ↓
Integration Testing
```

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | SQL (MySQL-compatible design) |
| Frontend | Angular |
| Architecture | Modular PMS with clear separation of master, transaction, operational, financial, HR, asset, configuration, and historical/audit data |

---

## 3. Database Design Objectives

The database must:

1. Maintain accurate relationships between entities.
2. Avoid unnecessary duplicate data.
3. Preserve historical information (status changes, tax rates at time of transaction, etc.).
4. Support multiple bookings per guest and multiple rooms per booking.
5. Support room availability/occupancy derived from data, not manually flagged.
6. Support check-in/check-out history, housekeeping, and maintenance workflows.
7. Support accounting, HR/payroll, and asset tracking.
8. Support auditability and reporting without corrupting transactional data.
9. Be scalable to multiple properties without forcing `property_id` onto every table blindly.
10. Enforce referential integrity via foreign keys and support efficient search via indexes.

---

## 4. Database Naming & Design Standards

| Area | Standard |
|------|----------|
| Primary keys | `BIGINT UNSIGNED AUTO_INCREMENT`, named `<entity>_id` (e.g. `guest_id`, `booking_id`) — never mix `id`, `guestId`, `guestID` |
| Foreign keys | Same name as the parent's primary key (e.g. `bookings.guest_id` → `guests.guest_id`), with documented parent table/column, child table/column, relationship type, ON DELETE / ON UPDATE behavior |
| Money | `DECIMAL(15,2)` or `DECIMAL(18,2)` — never floating point |
| Timestamps | `created_at`, `updated_at` on all tables; operational tables also get event-specific timestamps (`check_in_at`, `assigned_at`, `completed_at`, etc.) |
| Soft delete | `deleted_at`, used selectively — not on every table. Financial/transactional records use status values (VOID, CANCELLED, REVERSED, ARCHIVED) instead of deletion |
| Status values | Stable, machine-readable, lower_snake_case (`pending`, `checked_in`, `cancelled`) — never mixed casing/hyphenation |
| Naming | Database names snake_case; Application models PascalCase |
| Audit fields | `created_by`, `updated_by`, `deleted_by` on sensitive/important tables |

**Reports principle:** reports are generated from transactional data via queries/views, not stored as duplicate report tables, unless there is a proven performance/archival need (e.g. `monthly_profit_report` should NOT normally exist as a table).

**Multi-property principle:** determine which entities are property-scoped vs. global before adding `property_id`. Do not add it to every table blindly.

---

## 5. Database Architecture — Domain Map

```text
Core / Property
├── Property, Property Types, Property Policies
├── Departments, Staff, Users, Roles, Permissions
├── Guests, Companies
├── Buildings, Floors, Rooms, Room Types, Amenities, Services, Media
├── Facility Master, Facility Categories, Property Facilities
├── Room Facility Master, Room Facility Categories, Room Facilities
├── Tax Configuration, Payment Modes, Booking Sources
└── Other Masters

Front Office / Reservation
├── Bookings, Booking Rooms, Booking Guests
├── Guest Stays, Check-ins, Check-outs
├── Invoices, Invoice Items, Payments, Additional Charges
└── Booking Status History, Room Status History

Pricing / Settlement
├── Rate Plans, Room Rates, Seasons, Discounts, Taxes
└── Settlement Parties, Rules, Settlements, Entries, Adjustments, Payments

Offers / Coupons / Loyalty
├── Offer Types, Offers, Offer Conditions, Offer Rewards
├── Offer Room Types, Offer Sources
├── Coupons, Coupon Redemptions, Offer Redemptions
└── Loyalty Rules, Customer Loyalty Accounts, Loyalty Transactions, Loyalty Rewards

Housekeeping
├── Task Types, Tasks, Assignments, Cleaning, Verification
└── Damage & Missing, Damage Evidence, Laundry, Laundry Items

Maintenance
├── Areas, Categories, Priorities
└── Requests, Assignments, Work Logs, Approvals, Costs, Attachments, Status History

Security
├── Visitors, Visitor Logs, Vehicles, Vehicle Entry/Exit
└── Gate Pass Types, Gate Passes, Gate Pass Items, Petty Cash, Security Activity Logs

HR / Attendance
├── Employees, Leave Types, Leave Requests, Leave Balances
├── Staff Advances, Salary Structures/Components, Payroll, Payroll Items
└── Attendance, Attendance Logs, Overtime, Holidays, Exit Clearance

Accounting
├── Chart of Accounts, Ledger, Journal, Journal Entries
├── Cash Accounts, Bank Accounts, Bank Transactions, Bank Reconciliation
└── Expenses, Expense Categories, Accounts Receivable, Accounting Periods

Assets
├── Asset Categories, Assets, Depreciation, Movements, History

CRM (Mini CRM)
├── Leads, Lead Sources, Follow-ups, Activities
└── Quotations, Quotation Items

Reports
└── Generated from transactional/master data — no duplicate report-storage tables

Settings
├── Property Settings, Booking Defaults, Tax/GST Settings
└── Communication Settings, Operational Settings, Check-in/out Times, Cancellation Terms

System
├── Users, Roles, Permissions, User Roles, Role Permissions
├── Notifications, Attachments
└── Audit Logs, Activity Logs
```

**Note:** This is a starting classification — not every listed item automatically becomes a table. Duplicate concepts (e.g. staff vs employees, payment vs booking_payment) must be resolved (see §34 Open Decisions).

---

## 6. Master vs. Transaction vs. History Tables

| Type | Definition | Examples |
|------|-----------|----------|
| **Master** | Stable data reused across transactions | `properties`, `guests`, `rooms`, `room_types`, `companies`, `tax_categories`, `payment_modes`, `booking_sources`, `leave_types`, `asset_categories` |
| **Transaction** | Records of actual business events | `bookings`, `booking_rooms`, `check_ins`, `invoices`, `payments`, `housekeeping_tasks`, `maintenance_requests`, `visitor_logs`, `journal_entries`, `attendance`, `payroll` |
| **History** | Traceable state changes over time | `booking_status_history`, `room_status_history`, `maintenance_status_history`, `housekeeping_status_history`, `payment_history`, `asset_history`, `staff_status_history` |

History records generally contain: id, related entity id, previous value, new value, changed by, changed at, optional reason/notes.

A room's permanent attributes belong in `rooms`; the fact that it was occupied on a given date belongs in transactional/history tables — this pattern applies system-wide.

---

## 7. Access Management Module

Controls authentication, authorization, and property-level access.

### 7.1 Users

Login accounts for anyone accessing the system.

| Field | Type | Description |
|-------|------|-------------|
| user_id | BIGINT | PK, Unique ID |
| username | VARCHAR | Unique login |
| email | VARCHAR | Unique email |
| password_hash | VARCHAR | Hashed password |
| first_name / last_name | VARCHAR | Name |
| phone | VARCHAR | Contact |
| status | ENUM | active / inactive / suspended |
| last_login_at | DATETIME | Last login |
| created_at / updated_at | DATETIME | Audit |

### 7.2 Roles

Functional responsibility groupings (Super Admin, Property Admin, General Manager, Front Office Manager, Receptionist, Accountant, Housekeeping Manager, Maintenance Manager, HR Manager, CRM Manager, Inventory Manager, etc.).

Fields: `role_id`, `name`, `description`, `is_system`, `timestamps`.

### 7.3 Permissions

Granular action strings in `<module>.<action>` format: `property.view`, `reservation.create`, `checkin.create`, `invoice.delete`, `payment.refund`, `employee.update`, etc.

### 7.4 Role Permissions

Many-to-many junction: `Role ── RolePermissions ── Permission`.

### 7.5 User Property Roles

Enables one user to hold different roles across different properties:

```text
User: John
Property A → Manager
Property B → Receptionist
Property C → Accountant
```

This is the backbone of property-level authorization and multi-property readiness.

**Relationships:** `Users ─< UserPropertyRoles >─ Properties`; `Roles ─< RolePermissions >─ Permissions`.

---

## 8. Property Management Module

Defines the physical/operational structure. `Properties` is the root entity of the hierarchy.

```text
Property → Building → Floor → Room → Room Type
```

In addition to this physical hierarchy, properties and rooms support configurable facilities through dedicated master tables (§8.3–§8.9) — this replaces earlier flat/checkbox-style facility fields.

### 8.1 Property Types

Master data for the type/category of property — must not be hard-coded in the application.

Examples: Resort, Hotel, Villa, Apartment, Guest House, Boutique Resort, Holiday Home.

**Table: `property_types`**

| Field | Description |
|-------|-------------|
| property_type_id | Primary key |
| name | Property type name |
| code | Unique code |
| description | Description |
| status | Active / Inactive |
| created_at / updated_at | Timestamps |

### 8.2 Properties

The root entity of the PMS.

**Table: `properties`**

| Field | Description |
|-------|-------------|
| property_id | Primary key |
| property_type_id | Property type reference |
| code | Unique property code |
| name | Property name |
| legal_name | Legal/business name |
| phone, email | Contact details |
| address, city, state, country, postal_code | Location |
| currency, timezone | Locale |
| default_check_in_time / default_check_out_time | Defaults |
| status | Active / Inactive / Suspended |
| created_at / updated_at | Timestamps |

### 8.3 Property Facilities Master

Facilities available at the overall property/resort level — e.g. Private Pool, Garden Area, Play Area, Parking, Gym, Spa, Restaurant, Conference Hall, Banquet Hall, Kids Area, Beach Access, BBQ Area, Outdoor Seating, Wi-Fi, EV Charging, Swimming Pool.

These must not be hard-coded as individual columns or checkboxes. The Super Admin manages a reusable facility master instead.

**Table: `facility_master`**

| Field | Description |
|-------|-------------|
| facility_id | Primary key |
| name | Facility name |
| code | Unique facility code |
| category_id | Optional facility category |
| description | Facility description |
| icon | Optional icon reference |
| media_id | Optional image/media reference |
| sort_order | Display order |
| status | Active / Inactive |
| created_at / updated_at | Timestamps |
| created_by / updated_by | Audit |

### 8.4 Property Facilities Mapping

`facility_master` defines what facilities exist as options; `property_facilities` defines which facilities a particular property actually has.

**Table: `property_facilities`**

| Field | Description |
|-------|-------------|
| property_facility_id | Primary key |
| property_id | Property reference |
| facility_id | Facility master reference |
| status | Available / Unavailable |
| notes | Optional notes |
| created_at / updated_at | Timestamps |
| created_by | User who assigned facility |

```text
Facility Master
├── Private Pool, Garden Area, Play Area, Gym, Parking ...
    ↓
Property Facilities
├── Property A → Private Pool, Garden, Play Area, Parking
└── Property B → (its own subset)
```

**Unique constraint:** `(property_id, facility_id)` — prevents assigning the same facility to the same property twice.

### 8.5 Property Creation / Onboarding Flow

```text
Super Admin
→ Create Property (details, type, contact, address, currency/timezone, check-in/out)
→ Select Property Facilities (checked against facility_master)
→ Create Property
→ Create Property Admin / Login Credentials
→ Configure Buildings / Floors / Rooms
```

The Super Admin selects multiple facilities during property creation; options displayed must come from `facility_master`.

### 8.6 Room Facilities Master

Room facilities belong to an individual room, not the property — a property-level and room-level facility are not the same thing (e.g. "Resort has a Swimming Pool" vs. "Villa 101 has a Private Pool, Villa 102 does not"). Room facilities require their own master and mapping.

**Table: `room_facility_master`**

| Field | Description |
|-------|-------------|
| room_facility_id | Primary key |
| name | Facility name |
| code | Unique code |
| category_id | Optional category |
| description | Description |
| icon | Optional icon |
| sort_order | Display order |
| status | Active / Inactive |
| created_at / updated_at | Timestamps |
| created_by / updated_by | Audit |

Examples: King Bed, Twin Beds, Balcony, Private Pool, Garden View, Sea View, Bathtub, Shower, Smart TV, Mini Fridge, Safe, Hair Dryer, Work Desk, Sofa, Kitchenette, Air Conditioning, Wi-Fi, Extra Bed, Wardrobe, Dining Area.

### 8.7 Room Facilities Mapping

**Table: `room_facilities`**

| Field | Description |
|-------|-------------|
| room_facility_mapping_id | Primary key |
| room_id | Room reference |
| room_facility_id | Room facility master reference |
| value | Optional value, e.g. quantity/specification |
| notes | Optional notes |
| created_at / updated_at | Timestamps |
| created_by | User who assigned it |

**Unique constraint:** `(room_id, room_facility_id)`

```text
Room Facility Master
├── King Bed, Balcony, Private Pool, Sea View, Bathtub ...
    ↓
Room Facilities
├── Room 101 → Balcony, Pool, Bathtub
└── Room 102 → Balcony, Sea View, King Bed
```

### 8.8 Room Creation Flow

```text
Create Room (Property → Building → Floor → Room Type → Room Number → Capacity → Base Configuration)
→ Select Room Facilities (checked against room_facility_master:
   King Bed ✓, Balcony ✓, Private Pool ✓, Sea View ✗, Bathtub ✓, Smart TV ✓)
→ Save Room
```

### 8.9 Property Facilities vs. Room Facilities

| Property Facilities | Room Facilities |
|---------------------|-----------------|
| Belong to the property/resort | Belong to an individual room |
| Managed through `facility_master` | Managed through `room_facility_master` |
| Assigned using `property_facilities` | Assigned using `room_facilities` |
| e.g. Resort Gym, Garden, Restaurant, Parking | e.g. Balcony, Private Pool, Bathtub, Sea View |

A property facility must not automatically be considered a room facility.

### 8.10 Other Property Entities

- **Property Policies** — check-in, check-out, cancellation, payment, pet, children policies; can be toggled without code changes
- **Buildings** — physical buildings within a property
- **Floors** — floors within a building
- **Room Types** — Standard, Deluxe, Premium, Suite, Pool Villa, Family Room; key fields: `base_capacity`, `max_capacity`, `default_rate`
- **Rooms** — individual bookable units; hierarchy `Property → Building → Floor → Room → Room Type`; statuses: AVAILABLE, OCCUPIED, HOUSEKEEPING, OUT_OF_SERVICE, MAINTENANCE
- **Amenities** — guest-facing features (kept as a lighter-weight list distinct from the full facility master, if retained)
- **Services** — additional paid services (Airport Pickup, Laundry, Spa Session, Room Service, Extra Bed)
- **Media** — polymorphic `entity_type` + `entity_id` structure so images/videos/documents can attach to properties, rooms, facilities, etc.

**Relationships:** `Properties ─< Buildings ─< Floors ─< Rooms >─ Room Types`; `Properties ─< Property Facilities >─ Facility Master`; `Rooms ─< Room Facilities >─ Room Facility Master`; `Properties ─< Services, Policies, Media`.

**Architectural rule:** do not build `properties.has_pool`, `properties.has_garden`, `rooms.has_balcony`, `rooms.has_pool`, etc. as flat boolean columns. Always use the master → mapping → entity pattern (`facility_master → property_facilities → properties`, `room_facility_master → room_facilities → rooms`). This is what makes facility lists configurable per property/room without schema changes.

---

## 9. Front Office Module

The day-to-day guest and room operations hub: Desk, Bookings, Guests, Rooms.

### 9.1 Desk (Dashboard)

Calculated (not manually entered) statistics: check-ins today, check-outs today, in-house guests, available rooms, occupancy %, room board by floor with filters (All / Available / Occupied / Dirty / Maintenance).

### 9.2 Bookings

Reservation statuses: `PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT`, with alternates `CANCELLED`, `NO_SHOW`.

Fields: `booking_id`, `booking_number`, `guest_id`, room/room_type reference, check-in/out dates, adults/children, rate, tax, discount, `total_amount`, `payment_status`, `booking_source_id`, `special_requests`, `timestamps`.

Basic relationship: `Guest → Booking → Room` (expanded below with a proper `booking_rooms` junction).

### 9.3 Guests

Master guest profile: `guest_id`, name, mobile, email, DOB, gender, nationality, address, ID type/number, ID document, `company_id`, notes, timestamps. One guest → many bookings/stays.

### 9.4 Companies

Corporate clients, travel agencies, tour operators, organizations: `company_id`, name, contact person, mobile, email, address, GST/tax details, type, status, notes.

### 9.5 Rooms & Room Types

Same as Property Management (§8) — reused, not duplicated. Room dashboard: total / available / occupied / housekeeping / maintenance counts.

### 9.6 Room Status

`AVAILABLE → RESERVED → OCCUPIED → HOUSEKEEPING_PENDING → HOUSEKEEPING_IN_PROGRESS → MAINTENANCE → OUT_OF_ORDER`. Every change is recorded in `room_status_history`.

### 9.7 Check-In / Check-Out

**Check-In:** Booking → Guest Verification → Room Assignment → Payment/Deposit → Check-In (Booking = CHECKED_IN, Room = OCCUPIED)

**Check-Out:** Verify Stay → Calculate Charges → Payment → Invoice → Check-Out (Booking = CHECKED_OUT, Room = HOUSEKEEPING_PENDING → AVAILABLE after HK)

### 9.8 Front Office Entity Summary

| Master Tables | Transaction Tables | Operational Tables |
|---------------|--------------------|--------------------|
| Guest, Company, Room, Room Type, Floor, Rate Plan, Amenities | Booking, Booking Room, Check-In, Check-Out, Guest Stay, Payment, Invoice, Additional Charges | Room Status History, Housekeeping Status, Maintenance Status, Guest Documents, Booking Status History |

**Core relationships:**

```text
Company → Guest → Booking → Booking Room → Room → Room Type
Booking → Check-In → Guest Stay → Check-Out
Booking → Invoice → Payment
Room → Room Status History
```

---
## 10. Reservation Deep-Dive: Advanced Booking Scenarios

The booking system must go beyond one-room bookings.

### 10.1 Individual Room Booking

`Guest → Booking → Booking Rooms → Rooms` (one or more rooms per guest).

### 10.2 Multiple Room Booking

A single booking references many rooms via a junction table — never a single `room_id` column on `bookings`:

```text
Booking 1 ──< Booking Rooms >── Room
```

This enables different room types/rates/guests per room, room changes, partial cancellation, and room-level charges.

### 10.3 Full Property / Entire Resort Booking

For weddings, corporate events, tour operators booking the whole property:

```text
Booking
├── booking_type = FULL_PROPERTY
└── Booking Rooms
    ├── Room 101 ... Room 135
```

No need to manually create 35 separate bookings. Requirements: reserve all eligible rooms for the date range, block conflicting bookings, support a single owning guest/company, deposits, partial payments, additional charges, cancellation, invoices, check-in/out, and group-level guest management — using the same core tables (`bookings`, `booking_rooms`, `guests`, `rooms`, `payments`, `invoices`, `stay`) plus booking-level fields: `booking_type`, `group_name`, `company_id`.

### 10.4 Group Booking

Wedding/corporate groups: multiple guests, multiple rooms/room types, a group contact person, company, group-level payment with individual guest allocation. Consider `booking_groups` and `booking_guests` if complexity grows.

### 10.5 Booking Types (master, configurable)

`INDIVIDUAL`, `MULTI_ROOM`, `GROUP`, `FULL_PROPERTY`, `CORPORATE`.

### 10.6 Booking Sources / Channels

Stored via a `booking_sources` master — never hard-coded strings in the booking table:

| Source | Type |
|--------|------|
| Direct Website | DIRECT |
| Walk-in | DIRECT |
| Phone | DIRECT |
| WhatsApp | DIRECT |
| Justdial | THIRD_PARTY |
| Booking.com / Agoda | OTA |
| Travel Agent | AGENT |
| Corporate | CORPORATE |
| Other | OTHER |

Booking source is independent of booking status (e.g. source = Justdial, status = Confirmed).

### 10.7 Architectural Rules

- Booking must never depend on a single room column — always route through `booking_rooms`.
- Preserve all historical data (leads, follow-ups, quotations, bookings, payments, status changes) via statuses/history tables rather than deletion.
- Reference `booking.source_id → booking_sources.source_id`, never hard-code channel names.

---

## 11. Pricing Module

- **Rate Plans** — BAR, Non-Refundable, Corporate, Weekend Package; meal plans: Room Only, B&B, Half Board, Full Board, All Inclusive
- **Room Rates** — connects Rate Plan + Room Type + Season → Room Rate, with effective date ranges
- **Seasons** — Peak / Off / Festival / Shoulder, with a rate multiplier (e.g. Base ₹5,000 × 1.5 = ₹7,500 Peak Rate)
- **Discounts** — percentage/fixed, minimum-stay rules, validity period
- **Taxes** — name, tax_type, rate, is_compound, is_active; attach to invoice items

Reservation Stays provide a night-by-night rate breakdown per room per booking, supporting seasonal/daily rate changes:

```text
Reservation Room
├── 10-Aug → ₹5,000
├── 11-Aug → ₹5,500
└── 12-Aug → ₹6,000
```

---

## 12. Offers, Coupons & Loyalty Module

Manages promotional campaigns and customer rewards: percentage/fixed discounts, free nights, free bookings, "book X → reward", "stay X nights → reward", coupon codes, customer/room/property/booking-source-specific offers, date-based and minimum-night/value offers, usage limits, expiry, redemption tracking, and loyalty history.

**Offers are separate from pricing discounts** — pricing discounts (§11) are part of the rate engine; offers/coupons/loyalty are marketing and customer-incentive mechanisms with their own eligibility, redemption, and audit trail.

### 12.1 Offer Types Master

**Table: `offer_types`** — `offer_type_id`, `name`, `code`, `description`, `status`, `timestamps`.

Examples: `PERCENTAGE_DISCOUNT`, `FIXED_DISCOUNT`, `FREE_NIGHT`, `FREE_BOOKING`, `BOOK_X_GET_REWARD`, `STAY_X_NIGHTS_GET_REWARD`, `UPGRADE`, `COUPON`, `LOYALTY_REWARD`, `SPECIAL_RATE`.

### 12.2 Offers

**Table: `offers`**

| Field | Description |
|-------|-------------|
| offer_id | Primary key |
| property_id | Property reference; nullable if global |
| offer_type_id | Offer type reference |
| name, code, description | Identification |
| start_at / end_at | Validity window |
| priority | Priority when multiple offers apply |
| stackable | Whether it can combine with another offer |
| usage_limit | Maximum total usage |
| per_customer_limit | Maximum usage per customer |
| status | Draft / Active / Inactive / Expired |
| created_at / updated_at, created_by / updated_by | Audit |

### 12.3 Offer Conditions

Eligibility must be configurable, not hard-coded.

**Table: `offer_conditions`** — `condition_id`, `offer_id`, `condition_type`, `operator`, `value`, `metadata`, `created_at`.

Example condition types: `MINIMUM_NIGHTS`, `MINIMUM_BOOKING_VALUE`, `ROOM_TYPE`, `PROPERTY`, `BOOKING_SOURCE`, `CHECK_IN_DATE`, `CHECK_OUT_DATE`, `CUSTOMER_TYPE`, `CUSTOMER_ID`, `NUMBER_OF_PREVIOUS_STAYS`, `NUMBER_OF_PREVIOUS_BOOKINGS`.

Example — "Weekend Special": `minimum_nights >= 2 AND check_in_date = Friday/Saturday`.

### 12.4 Offer Rewards

**Table: `offer_rewards`** — `reward_id`, `offer_id`, `reward_type` (Discount / Free Night / Free Booking / Upgrade), `percentage_value`, `fixed_amount`, `free_nights`, `metadata`, `created_at`.

### 12.5 Loyalty: "Book 5 Times, Next Time Free"

A customer completing 5 qualifying bookings/stays earns a reward usable on a future eligible booking. This must **not** be implemented as a counter column on the guest table — use dedicated loyalty tables.

### 12.6 Loyalty Rules

**Table: `loyalty_rules`**

| Field | Description |
|-------|-------------|
| loyalty_rule_id | Primary key |
| property_id | Property reference |
| name | Rule name |
| qualification_event | Completed stay / booking / spend |
| qualification_count | Required count |
| reward_type | Free night / discount / free booking |
| reward_value | Reward value |
| validity_days | Reward validity |
| status | Active / Inactive |
| created_at / updated_at | Timestamps |

Example: "Book 5 Times – Get 1 Free" — `qualification_event = COMPLETED_STAY`, `qualification_count = 5`, `reward = FREE_NIGHT`, `validity = 180 days`.

### 12.7 Customer Loyalty Accounts

**Table: `customer_loyalty_accounts`** — `loyalty_account_id`, `guest_id`, `loyalty_rule_id`, `qualifying_count`, `available_rewards`, `status`, `timestamps`. The guest's loyalty progress lives here, not inside `guests`.

### 12.8 Loyalty Transactions

Every qualifying event is recorded.

**Table: `loyalty_transactions`** — `loyalty_transaction_id`, `loyalty_account_id`, `booking_id`, `stay_id`, `transaction_type` (QUALIFIED / REWARD_EARNED / REWARD_REDEEMED / REVERSED), `qualifying_value`, `count_before`, `count_after`, `notes`, `created_at`, `created_by`.

```text
Booking 1 → count = 1
...
Booking 5 → count = 5 → Reward Earned → Available Reward
```

### 12.9 Loyalty Rewards

**Table: `loyalty_rewards`** — `reward_id`, `loyalty_account_id`, `reward_type`, `reward_value`, `earned_at`, `expires_at`, `status` (EARNED / AVAILABLE / REDEEMED / EXPIRED / CANCELLED), `redeemed_booking_id`, `redeemed_at`, `created_at`. Provides a complete reward history.

### 12.10 Coupon Master

Customer-entered promotional codes.

**Table: `coupons`** — `coupon_id`, `offer_id`, `code`, `description`, `valid_from`, `valid_to`, `usage_limit`, `per_customer_limit`, `status`, `timestamps`.

Example: `WELCOME500` → ₹500 fixed discount, valid 01-Sep-2026 → 30-Sep-2026, total usage 500, per-customer 1.

### 12.11 Coupon Redemptions

**Table: `coupon_redemptions`** — `redemption_id`, `coupon_id`, `booking_id`, `guest_id`, `discount_value`, `redeemed_at`, `status` (APPLIED / REVERSED / CANCELLED), `created_at`. Prevents relying on a bare usage counter.

### 12.12 Offer Redemptions

General redemption log tracking when any offer is actually applied.

**Table: `offer_redemptions`** — `redemption_id`, `offer_id`, `booking_id`, `guest_id`, `reward_id` (optional loyalty reward), `benefit_type`, `benefit_value`, `redeemed_at`, `status`, `created_at`.

### 12.13 Offer Management Flow (Admin UI)

```text
Offers & Discounts
├── Offers → Create Offer → Type → Conditions → Reward → Applicable Property/Room Types → Validity → Usage Limits
├── Coupon Codes → Create Code → Assign Offer → Usage Limit → Validity
├── Loyalty → Loyalty Rules → Customer Progress → Rewards → Redemption History
└── Redemption History
```

### 12.14 Customer Booking + Offer Validation Flow

```text
Customer → Select Property → Select Room → Select Dates → Calculate Base Rate
→ Check Eligible Offers (Normal Offer / Coupon / Loyalty Reward)
→ Validate Conditions → Calculate Benefit → Create Redemption Record
→ Apply Benefit to Booking → Calculate Tax / Final Amount → Invoice → Payment
```

### 12.15 Offer Business Rules

- An expired or inactive offer cannot be redeemed; coupon codes must be unique.
- Coupon usage cannot exceed `usage_limit`; a customer cannot exceed `per_customer_limit`.
- Offer conditions must be validated before applying the benefit.
- A loyalty reward can only be redeemed while AVAILABLE, not expired, and only once.
- Cancelled/reversed bookings must not incorrectly increase loyalty progress — a cancelled qualifying booking requires a REVERSED loyalty transaction.
- Historical redemption records are never deleted; the actual discount/reward value applied is stored at redemption time — changing an offer later must not alter past bookings.
- Duplicate redemption requests must be prevented via unique constraints/idempotency controls.
- Offer stacking is explicitly controlled via the `stackable` flag; property/room/booking-source restrictions are validated before redemption.
- Loyalty qualification should normally be based on a completed/eligible stay, not merely a reservation being created.

### 12.16 Offers vs. Discounts vs. Coupons vs. Loyalty

| Feature | Discounts | Offers | Coupons | Loyalty |
|---------|-----------|--------|---------|---------|
| Purpose | Pricing adjustment | Marketing promotion | Promotional code | Customer reward |
| Example | 10% room discount | Weekend Special | SAVE500 | Book 5, get reward |
| Trigger | Pricing rules | Eligibility rules | Customer enters code | Customer history |
| Code required | No | Optional | Yes | No |
| History | Booking pricing | Offer redemption | Coupon redemption | Loyalty transactions |
| Customer-specific | Optional | Yes | Yes | Yes |

### 12.17 Core Relationships — Offers & Loyalty

```text
Offer Types → Offers ─┬─ Offer Conditions
                      ├─ Offer Rewards
                      ├─ Offer Room Types
                      ├─ Offer Sources
                      ├─ Coupons → Coupon Redemptions
                      └─ Offer Redemptions

Loyalty Rules → Customer Loyalty Accounts ─┬─ Loyalty Transactions
                                           └─ Loyalty Rewards → Booking Redemption
```

### 12.18 Recommended Implementation Position

Implement after the core reservation and pricing modules — an offer needs to understand the booking, room, dates, pricing, and guest before it can correctly calculate eligibility and benefits:

```text
Property → Rooms/Room Types → Reservation → Pricing → Offers/Coupons/Loyalty
→ Booking → Invoice → Payment → Redemption/Loyalty History
```

---

## 13. Settlement Module (OTA / Agent / Corporate)

```text
Reservation → Settlement Entry → Gross Amount → Commission → Net Amount → Settlement → Payment
```

- **Settlement Parties** — booking platforms, travel agencies, corporate accounts, suppliers; store contact, commission %, payment terms
- **Settlement Rules** — basis: `PER_RESERVATION`, `PER_STAY`, `PER_MONTH`
- **Settlements** — header: number, party, property, period, total amount, status (`DRAFT → PENDING → SETTLED → CLOSED`), settled date
- **Settlement Entries** — per-reservation/stay line: `Gross − Commission = Net`
- **Settlement Adjustments** — corrections with reason, amount, `adjusted_by`, `created_at` (must be audited)
- **Settlement Payments** — actual payment against a settlement (Cash, Bank Transfer, Cheque, Card)

---

## 14. Billing / Finance & Accounting Module

### 14.1 Billing Flow

```text
Booking → Invoice → Invoice Items → Payments
```

Additional charges (extra bed, extra person, damage, late checkout) are recorded independently. Posted invoices/payments must remain historically accurate even if tax/settings later change.

### 14.2 Chart of Accounts

Hierarchical, classified as `ASSET / LIABILITY / EQUITY / REVENUE / EXPENSE` with parent-child support.

### 14.3 Invoices & Invoice Items

Lifecycle: `DRAFT → SENT → PARTIALLY_PAID → PAID` (alt: `DRAFT → VOID`).

Linked to Property, Guest, Reservation. Invoice total must equal item totals plus applicable taxes; paid invoices require controlled adjustment/void logic, not direct edits.

### 14.4 Payments

Methods: Cash, Card, Bank Transfer, Wallet, UPI. Statuses: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`. Refunded payments retain the original payment record.

### 14.5 Journals / Double-Entry Accounting

```text
Journal
└── Journal Entries
    ├── Debit Account
    └── Credit Account
```

Every posted journal entry: **Total Debit = Total Credit**.

### 14.6 Accounting Screens (from current-plan)

| Screen | Purpose |
|--------|---------|
| Overview | Financial summary and revenue by source/payment mode, Total In / Total Out / Net |
| Cash & Bank | Cash and bank receipts, payments, deposits, withdrawals, balances |
| Expenses | Record and review business expenses |
| Approvals | Review/approve transactions requiring authorization |
| Masters | Accounts, categories, payment modes, accounting configuration |
| Journals | Debit/credit journal entries and adjustments |
| Trial Balance | Debit/credit balances of all ledger accounts for a period |
| P&L | Income, expenses, and resulting profit/loss |
| Balance Sheet | Assets, Liabilities, Equity |
| Cash Flow | Cash inflows/outflows over a period |
| AR Aging | Outstanding receivables bucketed by age |
| Bank Reconciliation | Match books against bank statement |
| Ledger | Account-wise transaction history |
| Setup | Accounting configuration/preferences |

All statements (Trial Balance, P&L, Balance Sheet, Cash Flow, AR Aging) are generated from transactions, not stored as separate report tables.

---

## 15. Operations: Housekeeping

### 15.1 Dashboard

Rooms Pending, Active Tasks, Awaiting Verify, Laundry Pending — all calculated from task/room-status data.

### 15.2 Tasks

Statuses: `Pending → In Progress → Done → Verified`.

Fields: `task_id`, `room_id`, assigned staff, `task_type`, `priority`, `status`, instructions/notes, assigned/started/completed timestamps, `verified_by`, `verified_at`.

### 15.3 Damage & Missing

Records item, description, quantity, estimated cost, `reported_by`/date, status, photos/evidence, and optional guest charge — linked to room and guest/booking.

### 15.4 Workflow

```text
Check-Out → Room Dirty → Assign Cleaning Task → In Progress → Done → Verify → Room Available
(if damage found: Report Damage → Record → Review → Charge Guest if required)
```

A room must not become available until housekeeping is completed and verified.

### 15.5 Laundry

Tracks room linen, towels, bedsheets, guest laundry: item type, quantity, collection date, status, staff, completion date.

### 15.6 Entity Summary

| Master | Transaction | Supporting |
|--------|-------------|------------|
| Staff, Room, Room Type, HK Task Type, Laundry Item, Inventory Item | Housekeeping Task, Task Assignment, Room Cleaning, Damage & Missing, Laundry, Laundry Items | Room Status History, Damage Evidence, HK Verification, Staff Activity History |

**Relationships:** `Room → HK Task → Staff`; `Room → Cleaning → Verification`; `Room → Damage/Missing → Guest/Booking`; `Guest/Room → Laundry`.

---

## 16. Operations: Maintenance

### 16.1 Dashboard

Open, In Progress, Pending Approval, Resolved — filterable by All / My Tasks / status / priority / date.

### 16.2 New Request

Fields: `location_type` (Room/Area), room/location, title, category, priority, description, notes.

### 16.3 Areas & Categories (masters)

- **Areas:** Rooms, Restaurant, Kitchen, Lobby, Pool, Garden, Office, Other.
- **Categories:** Plumbing, Electrical, Appliance, HVAC/AC, Furniture, Building, Internet/Network, Other.

### 16.4 Workflow

```text
Create Request → Open → Assign Staff → In Progress → Pending Approval → Resolved
```

Every status change is recorded in `maintenance_status_history`.

### 16.5 Request Fields

`request_id`, `location_type`, room/area_id, title, category, priority, description, notes, `reported_by`, `assigned_staff`, status, created/started/completed timestamps, `approved_by`, `resolved_at`, `resolution_notes`, cost, attachments.

### 16.6 Entity Summary

| Master | Transaction |
|--------|-------------|
| Maintenance Category, Maintenance Area, Priority, Staff, Room, Maintenance Status | Maintenance Request, Assignment, Work Log, Approval, Cost/Expense, Attachments, Status History |

**Relationships:** `Room/Area → Maintenance Request → Staff`; `Request → Assignment → Work Log`; `Request → Approval → Resolution`; `Request → Cost/Expense`.

---

## 17. Security Module

### 17.1 Dashboard

Visitors Today, Inside Now, Vehicles Inside, Gate Passes Pending, Petty Cash Today.

### 17.2 Visitors

`visitor_id`, name, mobile, ID type/number, purpose, person/guest/department to visit, entry/exit datetime, duration, vehicle, security staff, notes.

Workflow: `Arrives → Log → Entry Recorded → Inside → Exit Recorded`.

### 17.3 Vehicles

`vehicle_id`, `vehicle_number`, type, driver name/mobile, linked visitor/guest/staff, entry/exit datetime, purpose, parking location, status (currently inside or not).

### 17.4 Gate Passes

`pass_id`, `pass_number`, type, person/department, item/material, quantity, vehicle, purpose, issue datetime, expected/actual return, `issued_by`, `approved_by`, status (`Pending → Issued → Returned → Closed`, or Cancelled), notes.

### 17.5 Petty Cash

`transaction_id`, date, amount, type, `expense_category`, description, `paid_to`, receipt/attachment, `created_by`, `approved_by`, status.

### 17.6 Entity Summary

| Master | Transaction | Supporting |
|--------|-------------|------------|
| Visitor, Vehicle, Vehicle Type, Gate Pass Type, Expense Category, Staff/User | Visitor Log, Vehicle Entry/Exit, Gate Pass, Petty Cash Transaction | Visitor Documents, Gate Pass Items, Security Activity Log, Approval History |

---

## 18. Assets Module

### 18.1 Asset Register

Search by name/vendor/invoice; filter by category/status/location. Dashboard: Total Assets, Original Cost, Current Book Value, Total Depreciation.

### 18.2 Add Asset

`asset_id`, name, category, qty, `unit_value`, `total_value` (calculated), `purchase_date`, vendor, `invoice_no`, location, department.

### 18.3 Depreciation

method (e.g. Straight Line), `useful_life_years`, `residual_value`, notes — linked 1:1 (or 1:many for revaluation history) to the asset.

### 18.4 Movements

Tracks transfers between locations/departments, preserving previous and new location for accurate ownership history.

### 18.5 Entity Summary

```text
Asset ── Depreciation
Asset ── Movements
Asset ── History
Asset Category ─< Assets
```

---
## 19. Reports Module

Reports are generated from live transactional data (queries/views/services) — no duplicate report-storage tables unless a proven performance/archival need exists. **Restaurant, Banquet, and Spa reports are explicitly excluded.**

### 19.1 Financial

- **P&L Summary (Operational)** — revenue breakdown (Room, Other, GST Collected) vs. expense breakdown (Laundry, Purchases, Payroll, Manual Expenses, Cash/Bank Outflows, Capital-excl.) → Net Profit.
- Also: Sales & Payment, Sales Report, Customer Orders, Expense Report.

### 19.2 GST

- GSTR-1 (Outward), GSTR-2 (Inward), GSTR-3B (Monthly), Sales GST Report, Purchase GST Report.

### 19.3 Operations

- Stock/Inventory, Stock Position, Delivery/HK Sheet, Requisitions Report.

### 19.4 Common Controls

From Date, To Date, Run, Export PDF, CSV — reused across nearly all report screens.

---

## 20. Human Resource Management (HRM)

### 20.1 Leave Management

Dashboard: Casual/Sick/Earned leave balances and usage, Pending Approvals, Approved This Month. Functions: search by staff, filter by status, Apply for Leave.

Table: `leave_requests` (`employee_id`, `leave_type_id`, from/to date, days, reason, status, `approved_by`).

### 20.2 Staff Advances

Records money advanced to employees, outstanding balance, repayment/recovery tracking.

### 20.3 Payroll

Calculates payable salary from salary structure + attendance + approved overtime + leave + advances + adjustments. Statuses: `DRAFT`, `PROCESSED`, `PAID`.

### 20.4 Salary Settings

Configures salary components (Basic, Allowances, Deductions) used by payroll calculations.

### 20.5 Overtime Approval

Reviews and approves overtime before it feeds into payroll.

### 20.6 Clearance (Exit)

Employee exit workflow: checks outstanding advances/dues, departmental clearance, final settlement.

### 20.7 Entity Summary

```text
Employees ─< Leave Requests
Employees ─< Staff Advances
Employees ─< Payroll ─< Payroll Items
Employees ─< Overtime
```

---

## 21. Attendance Module

- **Today's Attendance** — clock-in/out recording, who's currently working, absentees
- **Monthly Summary** — employee-wise attendance for a selected month, feeds payroll
- **Overtime Approvals** — verify and approve hours before payroll processing
- **Holidays** — annual holiday calendar (year navigation, Add Holiday), used in working-day calculations

**Relationships:** `Employee → Attendance → (feeds) Payroll`; Holidays inform expected working days.

---

## 22. Staff Management Module

### 22.1 Dashboard

Total Staff, Active, On Leave, Inactive.

### 22.2 Search & Filter

By name/email/mobile/ID, department, status, role.

### 22.3 Staff List Columns

Employee (name + code), Contact (email/mobile), Department, Role & Access (e.g. Super Admin, Front Office — with permission count), Category (Permanent, etc.), Status (Active/Inactive), Actions.

### 22.4 Add Staff / Manage Roles

Add Staff captures personal/contact info, employment details, department, role, permissions, status. Manage Roles configures which modules/functions each role can access.

**Note (Open Decision):** clarify the relationship between staff/employees (HR master) and users (login account) — recommended: `Employee 1 ── 0..1 User`.

---

## 23. Settings Module

### 23.1 Property Details

Logo, property name, phone, restaurant name, legal name, email, address, city, GSTIN, CIN, business type.

### 23.2 Property Links & Communication

Google Review URL, Google Maps URL, frontend URL (for WhatsApp links), Wi-Fi SSID, Wi-Fi username prefix, reception/restaurant intercom numbers.

### 23.3 Booking Defaults

Default extra-bed rate/night, default extra-person charge/night.

### 23.4 GST — Room Accommodation

Slab threshold (₹/night), GST % at/below threshold, GST % above threshold, Spa default GST %, Banquet default GST %.

Example: threshold ₹7,500 → tariff ≤ ₹7,500 uses the "at/below" rate, above uses the higher rate. New charges use current config; already-posted transactions retain the rate applied at creation time.

### 23.5 Check-in / Check-out Times

Standard check-in (e.g. 12:00 PM) and check-out (e.g. 11:00 AM) times used in confirmations and operations.

### 23.6 Cancellation Terms

Free-text policy communicated to guests in booking confirmations (charges by days-before-arrival, no-show conditions, amendment requirements).

All settings live in dedicated settings tables (`property_settings`, `booking_settings`, `tax_settings`, `communication_settings`, `operational_settings`) — separated from transactional data so historical transactions are never retroactively altered by a settings change.

---

## 24. Mini CRM / Lead Management

A lightweight CRM to convert enquiries into bookings and retain communication history — not a full enterprise CRM.

```text
Lead / Enquiry → Follow-up → Quotation / Offer → Negotiation → Booking → Confirmed Guest
```

### 24.1 Leads (`crm_leads`)

| Field | Purpose |
|-------|---------|
| lead_id / lead_number | Identifiers |
| guest_id | Linked existing guest, if any |
| company_id | Linked company, if any |
| name, mobile, email | Contact info |
| source_id | Lead source |
| enquiry_type | Room / Group / Full Property |
| check_in, check_out, adults, children, rooms_required | Requirement details |
| estimated_value | Expected booking value |
| status, priority, assigned_to, notes | Sales tracking |
| booking_id | Set once converted (lead is preserved, not deleted) |

### 24.2 Lead Sources (`crm_lead_sources`)

Website, Justdial, Google, Instagram, Facebook, WhatsApp, Phone, Walk-in, Referral, Travel Agent, Other — enables source/conversion analytics.

### 24.3 Lead Status

`NEW → CONTACTED → FOLLOW_UP → QUOTED → NEGOTIATION → CONVERTED`, alt: `LOST`, `CLOSED` (configurable).

### 24.4 Follow-ups (`crm_followups`)

`lead_id`, date, time, type (Call/WhatsApp/Email/SMS/Meeting/Other), `assigned_to`, note, status (Pending/Completed/Missed/Cancelled).

### 24.5 CRM Activities (`crm_activities`)

Lightweight communication log: Call, WhatsApp, Email, Note, Meeting, Follow-up, Status Change, Quotation Sent, Booking Created — timestamped per lead.

### 24.6 Quotations (`quotations`, `quotation_items`)

Guest/Company, rooms, room type, nights, rate, discount, tax, additional charges, total, validity date, terms, status (`DRAFT → SENT → VIEWED → ACCEPTED/REJECTED/EXPIRED → CONVERTED`). On acceptance, a Booking is created; the quotation is retained for history.

### 24.7 Booking Source → CRM → Booking Architecture

```text
Website / Justdial / WhatsApp / Phone / Walk-in / OTA / Travel Agent / Other
                              │
                              ▼
                          CRM Lead
                              │
                         Follow-ups
                              │
                         Quotation
                              │
                      Guest Confirms
                              │
                              ▼
                          Booking
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
           Rooms          Guests         Company
                              │
                              ▼
                           Stay
                    ┌────────┴────────┐
                    ▼                 ▼
                 Invoice           Payment
```

### 24.8 Analytics (future)

Bookings by Source, Revenue by Source, Leads by Source, Conversion Rate by Source (Leads → Bookings %).

### 24.9 Architectural Rules

- A **Lead is not a Guest** — a lead may later be linked to a guest record upon conversion.
- Booking source must remain a master-driven `source_id`, never hard-coded text.
- Preserve all CRM history: leads, follow-ups, quotations, and status changes are never deleted.

The PMS remains the primary system; CRM is a lightweight layer feeding into it, not a separate application:

```text
PROPERTY
│
├──────────────┬──────────────┐
▼              ▼
PMS            CRM
Booking/Guest/Room   Lead/Follow-up
Stay/Invoice/Payment Quotation/Activity
│              │
└──────────────┬──────────────┘
               ▼
          CONVERSION
               ▼
            BOOKING
```

---

## 25. System Module

### 25.1 Notifications

`user_id`, `notification_type` (INFO, WARNING, ERROR, SUCCESS), title, message, `read_state`, timestamps. Kept simple and event-driven — no separate notification-template table required.

Examples: new reservation received, room requires housekeeping, invoice overdue, urgent maintenance request, leave request pending, settlement payment pending.

### 25.2 Audit Logs

Immutable record of system activity: user, action, `entity_type`, `entity_id`, `old_value`, `new_value`, `ip_address`, `user_agent`, timestamp.

Especially critical for financial changes, reservation modifications, payment changes, permission changes, user changes, and property configuration changes.

---

## 26. Core Cross-Module Relationships

```text
Users ─< UserPropertyRoles >─ Properties
Roles ─< RolePermissions >─ Permissions
Properties ─< Buildings ─< Floors ─< Rooms >─ Room Types
Company ─< Guest ─< Booking ─< Booking Rooms >─ Room
Booking ─< Check-In ─< Guest Stay >─ Check-Out
Booking ─< Invoice ─< Invoice Items
Invoice ─< Payments
Booking ─< Settlement Entries >─ Settlement >─ Settlement Party
Room ─< Room Status History
Room ─< Housekeeping Task >─ Staff
Room/Area ─< Maintenance Request >─ Staff
Employee ─< Attendance
Employee ─< Leave Requests
Employee ─< Payroll
Employee 1 ── 0..1 User
Asset ─< Depreciation
Asset ─< Movements
CRM Lead ─< Follow-ups
CRM Lead ─< Activities
CRM Lead ── (on convert) → Booking
Journal ─< Journal Entries (Debit / Credit Accounts)
Chart of Accounts ─< Journal Entries
```

**Overarching business flow:**

```text
Property Onboarding → Property Configuration → Room Configuration → Pricing Configuration
→ Booking → Reservation → Room Assignment → Check-In → Stay → Services/Charges
→ Invoice → Payment → Check-Out → Housekeeping → Room Available
→ Accounting → Reporting
```

---

## 27. Data Integrity & Business Rules

### 27.1 Database-enforced constraints

`NOT NULL`, `UNIQUE`, `FOREIGN KEY`, `CHECK` — used wherever technically appropriate.

### 27.2 Application-layer business rules

- A room cannot be double-booked (no overlapping confirmed stays).
- Check-out date must be after check-in date.
- Cancelled reservations must not block room inventory.
- A checked-in reservation must have an assigned room; check-out must calculate outstanding charges.
- A checked-out room cannot become available until housekeeping verification.
- Payment amount cannot be negative; refunded payments retain the original record.
- Invoice total must equal item totals plus taxes; paid invoices are modified only via controlled adjustment/void logic.
- **Total Debit = Total Credit** for every posted journal entry — a journal cannot finalize otherwise.
- A room's operational status is mutually exclusive: not simultaneously OCCUPIED, MAINTENANCE, and AVAILABLE.
- A cancelled booking cannot be checked in.
- A payment cannot exceed the allowed invoice balance unless explicitly configured (e.g. advance/deposit).

---

## 28. Index & Constraint Strategy

Index every table's primary keys, foreign keys, frequently searched fields, unique identifiers, common filters, and date ranges used in reports — but avoid unnecessary indexes since they hurt write performance.

Examples: `guests.mobile`, `guests.email`, `bookings.booking_number`, `bookings.check_in_date`, `bookings.check_out_date`, `rooms.room_number`, composite `attendance(employee_id, attendance_date)`.

Unique constraints on business identifiers: `room_number`, `booking_number`, `invoice_number`, `employee_code`, `gate_pass_number`, `asset_code` — exact uniqueness scope depends on single- vs multi-property support.

---

## 29. Audit & Soft-Delete Strategy

- Soft delete (`deleted_at`) is applied **selectively** to master entities that may need historical preservation — not automatically to every table.
- Transactional financial records generally are not deleted; they use VOID / CANCELLED / REVERSED / ARCHIVED statuses.
- Sensitive/important records carry `created_by`, `updated_by`, `deleted_by`.
- Financial and security-sensitive transactions get stronger audit trails, captured centrally in `audit_logs` (who, what, old value, new value, when, related entity, IP/device).

---

## 30. Security Requirements (System-Wide)

Password hashing, JWT/session authentication, role-based access control, property-level authorization, permission-level authorization, secure file uploads, API validation, rate limiting, audit logging, secure database credentials, HTTPS in production, sensitive-data masking, session/token expiration.

---

## 31. Recommended API Structure (/api/v1)

```text
/auth            /users             /roles             /permissions
/property-types  /properties        /property-policies
/buildings       /floors            /room-types        /rooms
/amenities       /services          /media
/facility-master /property-facilities
/room-facility-master /room-facilities
/guests          /guest-documents   /booking-sources
/reservations    /reservation-rooms /reservation-stays
/rate-plans      /room-rates        /seasons           /discounts   /taxes
/offer-types     /offers            /offer-conditions  /offer-rewards
/offer-room-types /offer-sources
/coupons         /coupon-redemptions
/loyalty-rules   /loyalty-accounts  /loyalty-transactions /loyalty-rewards
/offer-redemptions
/settlement-parties /settlement-rules /settlements
/settlement-entries /settlement-adjustments /settlement-payments
/accounts        /invoices          /invoice-items     /payments
/journal-entries /journal-entry-lines
/housekeeping    /maintenance
/products        /suppliers         /stock
/departments     /designations      /employees
/attendance      /leave-requests    /payroll
/leads           /contacts          /customers         /opportunities   /quotations
/notifications   /audit-logs
```

---

## 32. Recommended Database Documentation Files

```text
/docs/database/

00-database-overview.md
01-database-standards.md
02-core-property.md
03-front-office.md
04-housekeeping.md
05-maintenance.md
06-security.md
07-accounting.md
08-assets.md
09-reports.md
10-hrm.md
11-attendance.md
12-staff-management.md
13-settings.md
14-system.md
15-cross-module-relationships.md
16-business-rules.md
17-index-strategy.md
18-audit-and-history.md
19-er-diagrams.md
20-database-implementation-order.md
```

Each table should be documented per this standard:

```text
Table Name / Module / Table Type / Purpose / Primary Key
Columns (Column | Data Type | Nullable | Default | Key | Description)
Relationships / Foreign Keys / Indexes / Unique Constraints
Status Values / Business Rules / Audit Fields / Soft Delete
Used By / Dependencies
```

---

## 33. Recommended Development / Implementation Phases

| Phase | Scope |
|-------|-------|
| 1 — Foundation | Users, Roles, Permissions, Properties, Property Types, Buildings, Floors, Room Types, Rooms |
| 1b — Facilities | Facility Master, Property Facilities, Room Facility Master, Room Facilities |
| 2 — Reservation | Guests, Guest Documents, Booking Sources, Bookings, Booking Rooms, Reservation Stays, Check-In/Out |
| 3 — Pricing | Rate Plans, Room Rates, Seasons, Discounts, Taxes |
| 3b — Offers/Loyalty | Offer Types, Offers, Offer Conditions, Offer Rewards, Coupons, Coupon Redemptions, Loyalty Rules, Customer Loyalty Accounts, Loyalty Transactions, Loyalty Rewards, Offer Redemptions |
| 4 — Finance | Invoices, Invoice Items, Payments, Accounts, Journal Entries, Journal Entry Lines |
| 5 — Settlement | Settlement Parties, Rules, Settlements, Entries, Adjustments, Payments |
| 6 — Operations | Housekeeping, Maintenance |
| 7 — Security | Visitors, Vehicles, Gate Passes, Petty Cash |
| 8 — HRM / Attendance | Departments, Designations, Employees, Attendance, Leave, Payroll |
| 9 — Assets | Asset Categories, Assets, Depreciation, Movements |
| 10 — CRM | Leads, Lead Sources, Follow-ups, Activities, Quotations |
| 11 — System | Notifications, Audit Logs, Reports, Dashboard, Settings |

**Dependency-oriented sequence:**

Foundation → Property → Facilities → Departments → Users → Roles → Permissions → Staff → Core Masters → Guests/Companies → Rooms/Room Types/Floors → Front Office → Pricing → Offers/Loyalty → Housekeeping → Maintenance → Security → HR/Attendance → Accounting → Assets → CRM → Reports → Audit/Notifications.

**Note:** Offers/Coupons/Loyalty (§12) is implemented after core reservation and pricing are in place — an offer needs the booking, room, dates, pricing, and guest before eligibility/benefits can be correctly calculated:

```text
Property → Rooms/Room Types → Reservation → Pricing → Offers/Coupons/Loyalty
→ Booking → Invoice → Payment → Redemption/Loyalty History
```

---

## 34. Open Decisions

To be resolved before finalizing the schema — document using the table below rather than silently deciding:

| Decision | Problem | Options | Recommended |
|----------|---------|---------|-------------|
| Single vs multi-property | Determines scope of `property_id` | Single-property now / multi-property from day one | Design multi-property-ready, launch single-property |
| Guest vs Customer terminology | Two documents use both terms | Guest (PMS) vs Customer (CRM record type) | Standardize on one term |
| Employee vs Staff | staff and employees both appear | Merge into one entity | employees as HR master; staff deprecated |
| Employee vs User relationship | Login vs HR record | Combine or separate | Employee 1 ── 0..1 User |
| Invoice vs Folio | Hospitality systems often use "Folio" | Invoice (as used throughout both plans) or Folio | Use one term |
| Payment table proliferation | payment, booking_payment, settlement_payment risk duplication | Single polymorphic payments table with `reference_type`/`reference_id`, or separate per-context tables | One payments table where feasible |
| Inventory/Stock scope | Housekeeping vs Inventory module both touch stock | Keep Inventory as the single source, Housekeeping references it | Single inventory/stock module, referenced by Housekeeping/Laundry |
| Vendor/Supplier scope | Appears in Inventory (Suppliers) and Assets (Vendor) | Shared master vs separate | Single vendors/suppliers master reused everywhere |
| Accounting integration depth | Assets/Expenses post into the journal | Manual vs automatic posting | Automatic posting for standard transactions, manual override available |
| Amenities vs Facility Master | Original amenities list (§8.10) now overlaps with the new `facility_master` (§8.3) | Merge amenities into facility_master with a category flag, or keep amenities as a lightweight guest-facing subset | Fold amenities into facility_master (category = "amenity") to avoid two parallel facility systems |
| Discount vs Offer | Pricing discounts (§11) and marketing offers (§12) can both produce a percentage/fixed reduction | Keep fully separate vs unify under one discount-calculation service | Keep tables separate (different lifecycle/audit needs) but route both through one shared price-calculation service at booking time |

---

## 35. Final Database Design Deliverable

The final documentation set should let a developer understand, for every table:

```text
What tables exist
    ↓
Why each exists
    ↓
What each column stores
    ↓
How tables connect
    ↓
What constraints exist
    ↓
What indexes exist
    ↓
What business rules apply
    ↓
What module uses it
    ↓
What depends on it
    ↓
How it should be implemented
```

**Sequence to completion:**

```text
plan1.md + current-plan.md (functional requirements)
    ↓
Database Design Document (this file)
    ↓
Entity / Relationship Review
    ↓
Final Table List
    ↓
ER Diagram
    ↓
Database Implementation Steps (SQL / migrations)
    ↓
Backend API Implementation (Node.js / Express)
    ↓
Frontend Implementation (Angular)
```

**Do not generate SQL migrations, Node.js code, or Angular code until this design is reviewed and the Open Decisions (§34) are resolved.**

---

*End of Consolidated Database Design Document.*
