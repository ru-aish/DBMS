# Backend Documentation

## File: `backend/server.js` (1488 lines)

### Technologies Used

| Package | Purpose |
|---------|---------|
| `express` | Web framework for Node.js |
| `mysql2/promise` | MySQL database driver with Promise support |
| `cors` | Cross-Origin Resource Sharing middleware |
| `body-parser` | Parse JSON request bodies |
| `bcrypt` | Password hashing |
| `dotenv` | Environment variable configuration |

### Database Connection
- Connects to MySQL database `donation_system`
- Uses XAMPP MySQL socket at `/opt/lampp/var/mysql/mysql.sock`
- Connection pool with 10 max connections

---

## API Endpoints (33 total)

### Donor Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login` | Donor login |
| POST | `/api/register` | Donor registration |
| GET | `/api/donor/:donorId/donations` | Get donor's donation history |
| POST | `/api/donor/:donorId/donate` | Submit a new donation |
| GET | `/api/donor/:donorId/profile` | Get donor profile |
| PUT | `/api/donor/:donorId/profile` | Update donor profile |
| GET | `/api/donor/:donorId/dashboard` | Donor dashboard stats |

### Public APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/public/stats` | Public statistics (donors, items, distributions) |
| GET | `/api/public/testimonials` | Public testimonials |

### Recipient Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/recipient/login` | Recipient login (by code) |
| POST | `/api/recipient/register` | Recipient application |
| GET | `/api/items/available` | List available items |
| POST | `/api/recipient/request` | Submit item request |
| GET | `/api/recipient/:id/requests` | Get recipient's requests |
| DELETE | `/api/recipient/request/:id` | Cancel a request |
| GET | `/api/recipient/:id/distributions` | Get received distributions |
| POST | `/api/recipient/distribution/:id/rate` | Rate a distribution |
| GET | `/api/recipient/:id/dashboard` | Recipient dashboard |
| GET | `/api/recipient/:id/profile` | Get recipient profile |
| PUT | `/api/recipient/:id/profile` | Update recipient profile |

### Admin Portal APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Dashboard stats & charts |
| GET | `/api/admin/donors` | List all donors |
| GET | `/api/admin/communities` | List communities |
| GET | `/api/admin/requests` | List item requests |
| PUT | `/api/admin/requests/:id` | Approve/reject item request |
| GET | `/api/admin/items` | List all items |
| GET | `/api/admin/distributions` | List distributions |
| GET | `/api/admin/recipients` | List recipients |
| POST | `/api/admin/recipients/:id/approve` | Approve recipient application |
| POST | `/api/admin/recipients/:id/reject` | Reject recipient application |
| GET | `/api/admin/:id/profile` | Admin profile |
| PUT | `/api/admin/:id/profile` | Update admin profile |

---

## Database Schema

**Database:** `donation_system`  
**Engine:** InnoDB  
**Character Set:** utf8mb4_unicode_ci  
**Normalization:** 3NF compliant  
**Total Tables:** 6 | **Total Columns:** 44 | **Foreign Keys:** 4 | **Indexes:** 20

---

### Table 1: ADMINS

**Purpose:** Store admin users who manage the entire donation system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `admin_id` | INT | **PK**, AUTO_INCREMENT | Unique admin identifier |
| `full_name` | VARCHAR(100) | NOT NULL | Admin's full name |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Login email |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `status` | ENUM | DEFAULT 'active' | active/inactive |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| `last_login` | DATETIME | NULL | Last login timestamp |

**Foreign Keys:** None (independent table)

---

### Table 2: DONORS

**Purpose:** Store donor information (students who donate items)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `donor_id` | INT | **PK**, AUTO_INCREMENT | Unique donor identifier |
| `full_name` | VARCHAR(100) | NOT NULL | Donor's full name |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Login email |
| `phone` | VARCHAR(15) | NOT NULL | Contact number |
| `institution` | VARCHAR(200) | NOT NULL | College/University name |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `registration_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Registration date |
| `status` | ENUM | DEFAULT 'active' | active/inactive |

**Foreign Keys:** None (independent table)

---

### Table 3: RECIPIENTS

**Purpose:** Store recipient organizations/communities that receive donations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `recipient_id` | INT | **PK**, AUTO_INCREMENT | Unique recipient identifier |
| `org_name` | VARCHAR(200) | NOT NULL | Organization name |
| `org_type` | ENUM | DEFAULT 'Other' | School/Orphanage/NGO/Community Center/Other |
| `contact_person` | VARCHAR(100) | NOT NULL | Primary contact name |
| `phone` | VARCHAR(15) | NOT NULL | Contact number |
| `email` | VARCHAR(150) | NULL | Email address |
| `address` | TEXT | NOT NULL | Full address |
| `application_letter` | TEXT | NULL | Application/needs description |
| `verification_status` | ENUM | DEFAULT 'pending' | pending/verified/rejected |
| `recipient_code` | VARCHAR(20) | UNIQUE, NULL | Login code (e.g., RCP100001) |
| `registration_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Application date |

**Foreign Keys:** None (independent table)

---

### Table 4: ITEMS

**Purpose:** Store donated items inventory

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `item_id` | INT | **PK**, AUTO_INCREMENT | Unique item identifier |
| `item_name` | VARCHAR(200) | NOT NULL | Item name/title |
| `category` | ENUM | NOT NULL | Books/Electronics/Clothes/Stationery/Accessories/Others |
| `condition_status` | ENUM | NOT NULL | New/Excellent/Good/Fair |
| `description` | TEXT | NULL | Item description |
| `estimated_value` | DECIMAL(10,2) | DEFAULT 0.00 | Estimated value in INR |
| `quantity` | INT | DEFAULT 1 | Number of items |
| `donor_id` | INT | **FK** → DONORS | Who donated this item |
| `donation_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When donated |
| `availability_status` | ENUM | DEFAULT 'available' | available/reserved/distributed |

**Foreign Keys:**
| FK Column | References | On Delete |
|-----------|------------|-----------|
| `donor_id` | DONORS(donor_id) | CASCADE |

---

### Table 5: ITEM_REQUESTS

**Purpose:** Store item requests made by recipients

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `request_id` | INT | **PK**, AUTO_INCREMENT | Unique request identifier |
| `recipient_id` | INT | **FK** → RECIPIENTS | Who is requesting |
| `item_id` | INT | **FK** → ITEMS | Which item is requested |
| `quantity_requested` | INT | DEFAULT 1 | How many items needed |
| `request_reason` | TEXT | NULL | Reason for requesting |
| `request_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When requested |
| `request_status` | ENUM | DEFAULT 'pending' | pending/approved/rejected/fulfilled |

**Foreign Keys:**
| FK Column | References | On Delete |
|-----------|------------|-----------|
| `recipient_id` | RECIPIENTS(recipient_id) | CASCADE |
| `item_id` | ITEMS(item_id) | CASCADE |

---

### Table 6: DISTRIBUTIONS

**Purpose:** Track completed item deliveries to recipients

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `distribution_id` | INT | **PK**, AUTO_INCREMENT | Unique distribution identifier |
| `item_id` | INT | **FK** → ITEMS | Which item was distributed |
| `recipient_id` | INT | **FK** → RECIPIENTS | Who received it |
| `quantity` | INT | DEFAULT 1 | Quantity distributed |
| `distribution_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When distributed |
| `notes` | TEXT | NULL | Distribution notes |
| `satisfaction_rating` | INT | CHECK (1-5), NULL | Recipient's rating |
| `recipient_feedback` | TEXT | NULL | Feedback comment |

**Foreign Keys:**
| FK Column | References | On Delete |
|-----------|------------|-----------|
| `item_id` | ITEMS(item_id) | CASCADE |
| `recipient_id` | RECIPIENTS(recipient_id) | CASCADE |

---

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│   ADMINS    │       │   DONORS    │       │   RECIPIENTS    │
│─────────────│       │─────────────│       │─────────────────│
│ admin_id PK │       │ donor_id PK │──┐    │ recipient_id PK │──┐
│ full_name   │       │ full_name   │  │    │ org_name        │  │
│ email       │       │ email       │  │    │ contact_person  │  │
│ password    │       │ phone       │  │    │ phone           │  │
│ status      │       │ institution │  │    │ verification    │  │
└─────────────┘       │ password    │  │    │ recipient_code  │  │
                      └─────────────┘  │    └─────────────────┘  │
                                       │                          │
                                       ▼                          │
                      ┌────────────────────┐                      │
                      │       ITEMS        │                      │
                      │────────────────────│                      │
                      │ item_id PK         │──┐                   │
                      │ item_name          │  │                   │
                      │ category           │  │                   │
                      │ condition_status   │  │                   │
                      │ donor_id FK ───────│──┘                   │
                      │ availability       │                      │
                      └────────────────────┘                      │
                               │                                  │
                               ▼                                  ▼
              ┌─────────────────────────┐     ┌──────────────────────────┐
              │     ITEM_REQUESTS       │     │     DISTRIBUTIONS        │
              │─────────────────────────│     │──────────────────────────│
              │ request_id PK           │     │ distribution_id PK       │
              │ recipient_id FK ────────│─────│ recipient_id FK ─────────│
              │ item_id FK ─────────────│     │ item_id FK ──────────────│
              │ quantity_requested      │     │ quantity                 │
              │ request_status          │     │ satisfaction_rating      │
              └─────────────────────────┘     └──────────────────────────┘
```

---

### Database Summary

| Table | PK | FKs | Purpose |
|-------|-----|-----|---------|
| ADMINS | admin_id | 0 | System administrators |
| DONORS | donor_id | 0 | Students who donate items |
| RECIPIENTS | recipient_id | 0 | Organizations receiving donations |
| ITEMS | item_id | 1 (donor_id) | Donated items inventory |
| ITEM_REQUESTS | request_id | 2 (recipient_id, item_id) | Requests from recipients |
| DISTRIBUTIONS | distribution_id | 2 (recipient_id, item_id) | Completed deliveries |
