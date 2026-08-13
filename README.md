# Resort PMS Backend

Module-based REST API for the **Resort Property Management System** built with **Node.js + Express + Sequelize (MySQL)**.

```
backend/
├── package.json
├── .env.example
├── src/
│   ├── server.js                  # entry point (starts DB + HTTP server)
│   ├── app.js                     # express app (middleware, routes, errors)
│   ├── config/
│   │   ├── env.js                 # environment variables
│   │   └── config.js              # sequelize-cli compatible config
│   ├── database/
│   │   ├── sequelize.js           # Sequelize instance
│   │   ├── associations.js        # ALL model relations in one place
│   │   ├── index.js               # connect / sync helpers + model registry
│   │   ├── sync.js                # npm run db:sync
│   │   └── seed.js                # npm run db:seed (demo data + admin user)
│   ├── middlewares/
│   │   ├── authenticate.js        # JWT Bearer auth -> req.user
│   │   ├── authorize.js           # role-based access (super_admin bypass)
│   │   ├── errorHandler.js        # ApiError + Sequelize error mapping
│   │   └── notFound.js            # 404 for unknown routes
│   ├── utils/
│   │   ├── ApiError.js            # error class with status codes
│   │   ├── ApiResponse.js         # success envelope
│   │   ├── catchAsync.js          # async route wrapper
│   │   ├── pagination.js          # page/limit helpers
│   │   ├── genericCrud.js         # CRUD service factory (used by all modules)
│   │   ├── genericController.js   # CRUD controller factory
│   │   └── helpers.js             # sequence numbers, decimals
│   ├── routes/
│   │   └── index.js               # mounts every module under /api/v1
│   └── modules/                   # 24 modules, one per business domain
│       ├── auth/                  # login, me, change-password (no model)
│       ├── user/                  # system login accounts
│       ├── role/                  # roles + permissions (RBAC)
│       ├── employee/              # staff master
│       ├── property/              # ★ reference module (handwritten service)
│       ├── department/
│       ├── floor/
│       ├── roomType/
│       ├── amenity/
│       ├── room/                  # room status history + availability engine
│       ├── guest/
│       ├── company/
│       ├── booking/               # multi-room bookings, check-in/out workflow
│       ├── billing/               # invoices, payments, additional charges
│       ├── housekeeping/          # tasks, damage/missing, laundry
│       ├── maintenance/           # requests, categories, status history
│       ├── security/              # visitors, vehicles, gate passes, petty cash
│       ├── accounting/            # chart of accounts, journals, ledger, expenses
│       ├── asset/                 # asset register, movements, depreciation
│       ├── attendance/            # clock-in/out, holidays, overtime
│       ├── payroll/               # leave, advances, salary structure, payroll
│       ├── settings/              # key-value property configuration
│       ├── dashboard/             # desk / housekeeping / security stats (no model)
│       └── report/                # sales, occupancy, booking reports (no model)
└── (56 Sequelize models registered in src/database/associations.js)
```

## Module Convention

Every business module follows the same 4-file pattern:

```
src/modules/<module>/
├── <module>.model.js       # Sequelize model(s) + enums + table names
├── <module>.service.js     # business logic, validations, DB queries
├── <module>.controller.js  # HTTP layer: req/res, status codes, envelopes
└── <module>.route.js       # Express router + auth/role middleware
```

- Models are **plain and thin**; all relations live in `src/database/associations.js`.
- Services contain all business rules (e.g. a booking cannot be checked in before confirmation; a room only becomes `available` after housekeeping verification).
- Controllers delegate to services and never touch the DB.
- `auth`, `dashboard` and `report` are aggregate modules with only `service/controller/route`.
- Standard CRUD modules are built from `utils/genericCrud.js` + `utils/genericController.js` so behaviour stays consistent; complex modules (`property`, `booking`, `billing`, `housekeeping`, `maintenance`, `security`, `accounting`) are handwritten.

## Setup

```bash
# 1. create the database (MySQL)
CREATE DATABASE resort_pms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. configure env
cp .env.example .env

# 3. install & run
npm install
npm run db:sync     # creates all tables (add --alter to alter existing)
npm run db:seed     # demo data + admin user
npm run dev         # nodemon on :5000
```

Default login after seeding: `admin@resort.com` / `Admin@123`

## API Map (all under /api/v1)

| Prefix | Module |
|---|---|
| `/auth` | login, me, change-password |
| `/users` `/roles` `/employees` | users & RBAC, staff |
| `/properties` `/departments` `/floors` `/room-types` `/amenities` | masters |
| `/rooms` | rooms + `/available` + `/status` + `/history` |
| `/guests` `/companies` | guest master & history |
| `/bookings` | bookings + check-in / check-out / status |
| `/billing` | invoices, payments, additional charges |
| `/housekeeping` | tasks (assign→start→complete→verify), damage, laundry |
| `/maintenance` | requests, categories, areas, status workflow |
| `/security` | visitors, logs, vehicles, gate passes, petty cash |
| `/accounting` | accounts, journals (balanced), ledger, trial balance, expenses |
| `/assets` | register, move, depreciate |
| `/attendance` | mark, clock-out, monthly summary, holidays, overtime |
| `/payroll` | leave, advances, salary structures, payroll |
| `/settings` | sectioned key-value configuration |
| `/dashboard` | desk / room-board / housekeeping / maintenance / security / billing |
| `/reports` | sales-summary, occupancy, bookings-by-status |

## Conventions

- **IDs**: `BIGINT` auto-increment, snake_case columns (`booking_id`, `room_id`).
- **Money**: `DECIMAL(18,2)`; amounts are always calculated server-side.
- **Statuses**: stable lowercase machine values (`pending`, `confirmed`, `checked_in`, ...); display labels belong to the Angular frontend.
- **Audit**: `created_by` / `updated_by` + timestamps on every table; status changes are logged to `*_status_history` tables.
- **Soft delete**: used on master tables only (property, room, guest, etc.). Financial/transactional tables use workflow states (`void`, `cancelled`, `reversed`) instead.
- **Multi-property ready**: `properties` is a top-level master; entity scoping via `property_id` where it makes business sense.

## Scripts

```bash
npm run start        # production start
npm run dev          # nodemon
npm run db:sync      # create/alter tables
npm run db:seed      # demo data
```

## Roadmap

- Email/SMS notifications, attachments (generic `attachments` table)
- Refresh-token rotation, permission-level guards (`authorize('booking.create')`)
- Migrations via `sequelize-cli` (currently uses `sync()` for simplicity)
- GST report endpoints (GSTR-1/2/3B) on top of `invoices`/`expenses`
