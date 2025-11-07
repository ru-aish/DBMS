# Admin Frontend to Backend Integration Plan

## Overview
The admin frontend is a React-based single-page application (SPA) built with React hooks and using sample/mock data. It needs to be connected to the existing MySQL backend via REST API endpoints.

## Current State Analysis

### Frontend Structure (`/frontend/ADMIN/`)
- **Technology**: React 18 (via UMD), Babel Standalone, Chart.js
- **Components**: 
  - Sidebar Navigation (7 sections)
  - TopNav with search and notifications
  - Dashboard (stats, charts, recent activity)
  - Donors Management (list, filters, pagination)
  - Communities Management (recipients/institutions)
  - Requests Management (approval workflow)
  - Items Management (donations inventory)
  - Reports & Analytics (time-based reports, charts)
  - Settings (admin profile, system config)

### Backend Structure (`/backend/server.js`)
- **Technology**: Node.js, Express, MySQL2, bcrypt
- **Database**: MySQL (`donation_system`)
- **Existing APIs**: 
  - Donor login/register
  - Recipient login/register
  - Donor dashboard & items
  - Recipient dashboard, requests, distributions

## Integration Requirements

### 1. **Dashboard Page** (Lines 613-854)

#### Current State:
- Uses sample data: `sampleDonors`, `sampleItems`, `sampleRequests`, `completedRequests`, `pendingQueue`, `recentTimeReports`
- Displays 4 stat cards, recent completed requests, last 5 items donated, request queue, and recent donors table

#### Backend APIs Needed:

**GET `/api/admin/dashboard`**
- **Response**:
```json
{
  "stats": {
    "total_active_donors": 4,
    "total_communities": 5,
    "total_items_in_stock": 1,
    "pending_requests": 1
  },
  "completedRequests": [
    {
      "request_id": "REQ001",
      "community_name": "...",
      "items_count": 15,
      "completion_date": "2025-10-25",
      "status": "Finished"
    }
  ],
  "recentItems": [
    {
      "item_id": "...",
      "description": "...",
      "donor_name": "..."
    }
  ],
  "pendingQueue": [
    {
      "request_id": "...",
      "community_name": "...",
      "queue_position": 1,
      "items_requested": 12,
      "items_in_stock": 8,
      "items_pending": 4
    }
  ],
  "recentDonors": [
    {
      "donor_id": "...",
      "name": "...",
      "institution": "...",
      "total_items_donated": 12,
      "last_donation_date": "...",
      "status": "Active"
    }
  ]
}
```

**Database Queries**:
```sql
-- Total active donors
SELECT COUNT(*) FROM DONORS WHERE status = 'active';

-- Total communities
SELECT COUNT(*) FROM RECIPIENTS;

-- Total items in stock
SELECT COUNT(*) FROM ITEMS WHERE stock_status = 'in_stock';

-- Pending requests
SELECT COUNT(*) FROM REQUESTS WHERE status = 'pending';

-- Completed requests (recent 5)
SELECT r.request_id, rec.full_name as community_name, 
       COUNT(i.item_id) as items_count, r.completion_date, r.status
FROM REQUESTS r
JOIN RECIPIENTS rec ON r.recipient_id = rec.recipient_id
LEFT JOIN ITEMS i ON i.allocated_to_request = r.request_id
WHERE r.status = 'approved'
GROUP BY r.request_id
ORDER BY r.completion_date DESC
LIMIT 5;

-- Recent items (last 5 donated)
SELECT i.item_id, i.description, d.full_name as donor_name
FROM ITEMS i
JOIN DONORS d ON i.donor_id = d.donor_id
ORDER BY i.date_added DESC
LIMIT 5;

-- Pending queue
SELECT r.request_id, rec.full_name as community_name,
       r.queue_position, r.items_requested, 
       (SELECT COUNT(*) FROM ITEMS WHERE stock_status = 'in_stock') as items_in_stock,
       (r.items_requested - r.items_allocated) as items_pending
FROM REQUESTS r
JOIN RECIPIENTS rec ON r.recipient_id = rec.recipient_id
WHERE r.status IN ('pending', 'in_fulfillment')
ORDER BY r.queue_position;

-- Recent donors
SELECT d.donor_id, d.full_name as name, d.institution,
       COUNT(i.item_id) as total_items_donated,
       MAX(i.date_added) as last_donation_date,
       d.status
FROM DONORS d
LEFT JOIN ITEMS i ON d.donor_id = i.donor_id
GROUP BY d.donor_id
ORDER BY last_donation_date DESC
LIMIT 5;
```

### 2. **Donors Management Page** (Lines 857-1024)

#### Current State:
- Lists all donors with filtering (status, institution) and search
- Pagination: 5 items per page
- Displays: donor_id, name, institution, contact, items donated, donation date, status

#### Backend APIs Needed:

**GET `/api/admin/donors?page=1&limit=5&status=all&institution=all&search=`**
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 5)
  - `status` (all/Active/Inactive)
  - `institution` (all/specific institution)
  - `search` (search by name or donor_id)

- **Response**:
```json
{
  "donors": [
    {
      "donor_id": "D001",
      "name": "...",
      "institution": "...",
      "email": "...",
      "phone": "...",
      "total_items_donated": 12,
      "last_donation_date": "2025-10-28",
      "status": "Active"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 5,
  "totalPages": 10,
  "institutions": ["Delhi University", "Ramjas College", ...]
}
```

**Database Query**:
```sql
-- Donors with filters
SELECT d.donor_id, d.full_name as name, d.institution, d.email, d.phone,
       COUNT(i.item_id) as total_items_donated,
       MAX(i.date_added) as last_donation_date,
       d.status
FROM DONORS d
LEFT JOIN ITEMS i ON d.donor_id = i.donor_id
WHERE 
  (? = 'all' OR d.status = ?)
  AND (? = 'all' OR d.institution = ?)
  AND (? = '' OR d.full_name LIKE ? OR d.donor_id LIKE ?)
GROUP BY d.donor_id
ORDER BY last_donation_date DESC
LIMIT ? OFFSET ?;

-- Get all institutions for filter
SELECT DISTINCT institution FROM DONORS WHERE institution IS NOT NULL;
```

### 3. **Communities Management Page** (Lines 1026-1197)

#### Current State:
- Lists all communities/recipients with filtering (type, verification status) and search
- Pagination: 5 items per page
- Displays: community_id, name, type, contact person, contact info, total requests, items received, status

#### Backend APIs Needed:

**GET `/api/admin/communities?page=1&limit=5&type=all&status=all&search=`**
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 5)
  - `type` (all/School/Kindergarten/Community Center/Orphanage)
  - `status` (all/verified/pending)
  - `search` (search by name or community_id)

- **Response**:
```json
{
  "communities": [
    {
      "community_id": "C001",
      "name": "...",
      "type": "School",
      "contact_person": "...",
      "email": "...",
      "phone": "...",
      "address": "...",
      "verification_status": "verified",
      "total_requests": 3,
      "items_received": 12,
      "registration_date": "2025-09-10"
    }
  ],
  "total": 30,
  "page": 1,
  "limit": 5,
  "totalPages": 6,
  "types": ["School", "Kindergarten", ...]
}
```

**Database Query**:
```sql
-- Communities with filters
SELECT r.recipient_id as community_id, r.full_name as name, r.type,
       r.contact_person, r.email, r.phone, r.address,
       r.verification_status,
       COUNT(DISTINCT req.request_id) as total_requests,
       COUNT(d.distribution_id) as items_received,
       r.registration_date
FROM RECIPIENTS r
LEFT JOIN REQUESTS req ON r.recipient_id = req.recipient_id
LEFT JOIN DISTRIBUTIONS d ON r.recipient_id = d.recipient_id
WHERE 
  (? = 'all' OR r.type = ?)
  AND (? = 'all' OR r.verification_status = ?)
  AND (? = '' OR r.full_name LIKE ? OR r.recipient_id LIKE ?)
GROUP BY r.recipient_id
ORDER BY r.registration_date DESC
LIMIT ? OFFSET ?;

-- Get all types for filter
SELECT DISTINCT type FROM RECIPIENTS WHERE type IS NOT NULL;
```

### 4. **Requests Management Page** (Lines 1199-1362)

#### Current State:
- Lists all requests with filtering (status) and search
- Pagination: 5 items per page
- Displays: request_id, community, items requested (breakdown), date, status, allocated/total, progress %, queue position

#### Backend APIs Needed:

**GET `/api/admin/requests?page=1&limit=5&status=all&search=`**
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 5)
  - `status` (all/pending/in_fulfillment/approved)
  - `search` (search by request_id or community name)

- **Response**:
```json
{
  "requests": [
    {
      "request_id": "REQ001",
      "community_name": "...",
      "items_requested": [
        {"category": "Clothing", "quantity": 10},
        {"category": "Books", "quantity": 5}
      ],
      "date_requested": "2025-10-15",
      "status": "approved",
      "items_allocated": 15,
      "items_total": 15,
      "fulfillment_progress": 100,
      "queue_position": null
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 5,
  "totalPages": 4
}
```

**Database Query**:
```sql
-- Requests with filters
SELECT r.request_id, rec.full_name as community_name,
       r.items_requested, r.date_requested, r.status,
       r.items_allocated, r.items_total,
       ROUND((r.items_allocated / r.items_total) * 100) as fulfillment_progress,
       r.queue_position
FROM REQUESTS r
JOIN RECIPIENTS rec ON r.recipient_id = rec.recipient_id
WHERE 
  (? = 'all' OR r.status = ?)
  AND (? = '' OR r.request_id LIKE ? OR rec.full_name LIKE ?)
ORDER BY r.date_requested DESC
LIMIT ? OFFSET ?;
```

### 5. **Items Management Page** (Lines 1364-1560)

#### Current State:
- Lists all items with filtering (category, condition, stock status) and search
- Pagination: 8 items per page
- Displays: item_id, category, description, donor, condition, value, status, date added

#### Backend APIs Needed:

**GET `/api/admin/items?page=1&limit=8&category=all&condition=all&status=all&search=`**
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 8)
  - `category` (all/Clothing/Books/Electronics/Sports)
  - `condition` (all/New/Good/Fair)
  - `status` (all/in_stock/allocated/distributed)
  - `search` (search by item_id or description)

- **Response**:
```json
{
  "items": [
    {
      "item_id": "I001",
      "category": "Clothing",
      "description": "...",
      "donor_name": "...",
      "condition": "Good",
      "estimated_value": 800,
      "stock_status": "distributed",
      "date_added": "2025-09-20"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 8,
  "totalPages": 13,
  "categories": ["Clothing", "Books", ...],
  "conditions": ["New", "Good", "Fair"]
}
```

**Database Query**:
```sql
-- Items with filters
SELECT i.item_id, i.category, i.description,
       d.full_name as donor_name,
       i.condition, i.estimated_value,
       i.stock_status, i.date_added
FROM ITEMS i
JOIN DONORS d ON i.donor_id = d.donor_id
WHERE 
  (? = 'all' OR i.category = ?)
  AND (? = 'all' OR i.condition = ?)
  AND (? = 'all' OR i.stock_status = ?)
  AND (? = '' OR i.item_id LIKE ? OR i.description LIKE ?)
ORDER BY i.date_added DESC
LIMIT ? OFFSET ?;

-- Get all categories
SELECT DISTINCT category FROM ITEMS;

-- Get all conditions
SELECT DISTINCT condition FROM ITEMS;
```

### 6. **Reports & Analytics Page** (Lines 1712-1929)

#### Current State:
- Time period selector (7/30/90 days)
- Stats cards: items donated, distributed, requests fulfilled/pending
- Charts: items by category, items by condition, request status breakdown
- Top performers: most active donors, most requesting communities

#### Backend APIs Needed:

**GET `/api/admin/reports?period=last_30_days`**
- **Query Parameters**:
  - `period` (last_7_days/last_30_days/last_90_days)

- **Response**:
```json
{
  "stats": {
    "items_donated": 12,
    "items_distributed": 18,
    "requests_fulfilled": 2,
    "requests_pending": 2
  },
  "itemsByCategory": {
    "Clothing": 15,
    "Books": 10,
    "Electronics": 3,
    "Sports": 5
  },
  "itemsByCondition": {
    "New": 8,
    "Good": 20,
    "Fair": 5
  },
  "requestStatusBreakdown": {
    "pending": 1,
    "in_fulfillment": 1,
    "approved": 2
  },
  "topDonors": [
    {"name": "...", "total_items_donated": 15},
    {"name": "...", "total_items_donated": 12},
    {"name": "...", "total_items_donated": 8}
  ],
  "topCommunities": [
    {"name": "...", "total_requests": 5},
    {"name": "...", "total_requests": 4},
    {"name": "...", "total_requests": 3}
  ]
}
```

**Database Queries**:
```sql
-- Stats for time period
SELECT 
  (SELECT COUNT(*) FROM ITEMS WHERE date_added >= DATE_SUB(NOW(), INTERVAL ? DAY)) as items_donated,
  (SELECT COUNT(*) FROM DISTRIBUTIONS WHERE distribution_date >= DATE_SUB(NOW(), INTERVAL ? DAY)) as items_distributed,
  (SELECT COUNT(*) FROM REQUESTS WHERE status = 'approved' AND completion_date >= DATE_SUB(NOW(), INTERVAL ? DAY)) as requests_fulfilled,
  (SELECT COUNT(*) FROM REQUESTS WHERE status = 'pending') as requests_pending;

-- Items by category
SELECT category, COUNT(*) as count
FROM ITEMS
GROUP BY category;

-- Items by condition
SELECT condition, COUNT(*) as count
FROM ITEMS
GROUP BY condition;

-- Request status breakdown
SELECT status, COUNT(*) as count
FROM REQUESTS
GROUP BY status;

-- Top donors
SELECT d.full_name as name, COUNT(i.item_id) as total_items_donated
FROM DONORS d
LEFT JOIN ITEMS i ON d.donor_id = i.donor_id
GROUP BY d.donor_id
ORDER BY total_items_donated DESC
LIMIT 3;

-- Top communities
SELECT r.full_name as name, COUNT(req.request_id) as total_requests
FROM RECIPIENTS r
LEFT JOIN REQUESTS req ON r.recipient_id = req.recipient_id
GROUP BY r.recipient_id
ORDER BY total_requests DESC
LIMIT 3;
```

### 7. **Settings Page** (Lines 1933-1973)

#### Current State:
- Admin profile form (name, email, password)
- System configuration section (placeholder)

#### Backend APIs Needed:

**GET `/api/admin/profile`**
- **Response**:
```json
{
  "admin_id": 1,
  "full_name": "Admin User",
  "email": "admin@example.com"
}
```

**PUT `/api/admin/profile`**
- **Request Body**:
```json
{
  "full_name": "Admin User",
  "email": "admin@example.com",
  "password": "newpassword" // optional
}
```
- **Response**:
```json
{
  "message": "Profile updated successfully"
}
```

## Implementation Phases

### Phase 1: Database Schema Updates
1. Create `ADMINS` table if not exists
2. Add missing fields to existing tables (e.g., `queue_position`, `items_total`, `items_allocated` in `REQUESTS`)
3. Add indexes for better query performance

### Phase 2: Backend API Development
1. Create admin authentication endpoints (login)
2. Implement dashboard API
3. Implement donors management API
4. Implement communities management API
5. Implement requests management API
6. Implement items management API
7. Implement reports & analytics API
8. Implement settings/profile API

### Phase 3: Frontend Integration
1. Replace sample data with API calls
2. Add loading states
3. Add error handling
4. Implement authentication flow
5. Add toast notifications for success/error messages
6. Update pagination to work with backend data
7. Update filters to trigger API calls

### Phase 4: Testing & Refinement
1. Test all CRUD operations
2. Test filtering and search
3. Test pagination
4. Test error scenarios
5. Performance optimization

## API Authentication Strategy

### Option 1: Session-based (Current)
- Admin login creates session
- Session stored in database or memory
- Session ID sent as cookie

### Option 2: JWT-based (Recommended)
- Admin login returns JWT token
- Token stored in localStorage
- Token sent in Authorization header for all requests
- Token includes admin_id and expiration

## Frontend Changes Required

### 1. Create API Service Layer (`frontend/ADMIN/api.js`)
```javascript
const API_BASE_URL = 'http://localhost:5000/api/admin';

async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return response.json();
}

export const AdminAPI = {
  getDashboard: () => apiCall('/dashboard'),
  getDonors: (params) => apiCall(`/donors?${new URLSearchParams(params)}`),
  getCommunities: (params) => apiCall(`/communities?${new URLSearchParams(params)}`),
  getRequests: (params) => apiCall(`/requests?${new URLSearchParams(params)}`),
  getItems: (params) => apiCall(`/items?${new URLSearchParams(params)}`),
  getReports: (period) => apiCall(`/reports?period=${period}`),
  getProfile: () => apiCall('/profile'),
  updateProfile: (data) => apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};
```

### 2. Update Components with API Calls

Each component needs:
- Add `loading` state
- Add `error` state
- Replace sample data with `useEffect` + API call
- Handle loading/error UI states

Example for Dashboard:
```javascript
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await AdminAPI.getDashboard();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return null;

  // Rest of component using data instead of sampleData
}
```

### 3. Add Authentication Guard

Create login page and protect admin routes:
```javascript
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    // Existing admin layout
  );
}
```

## Database Schema Additions Needed

```sql
-- Add ADMINS table
CREATE TABLE IF NOT EXISTS ADMINS (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing fields to REQUESTS
ALTER TABLE REQUESTS 
  ADD COLUMN IF NOT EXISTS queue_position INT,
  ADD COLUMN IF NOT EXISTS items_total INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS items_allocated INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_date DATE;

-- Add missing fields to RECIPIENTS
ALTER TABLE RECIPIENTS
  ADD COLUMN IF NOT EXISTS type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100),
  ADD COLUMN IF NOT EXISTS verification_status ENUM('pending', 'verified') DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS registration_date DATE DEFAULT (CURRENT_DATE);

-- Add indexes for performance
CREATE INDEX idx_items_status ON ITEMS(stock_status);
CREATE INDEX idx_items_category ON ITEMS(category);
CREATE INDEX idx_requests_status ON REQUESTS(status);
CREATE INDEX idx_donors_status ON DONORS(status);
```

## Files to Create/Modify

### Backend Files:
1. `/backend/routes/admin.js` - All admin API routes
2. `/backend/middleware/adminAuth.js` - Admin authentication middleware
3. Update `/backend/server.js` - Add admin routes

### Frontend Files:
1. `/frontend/ADMIN/api.js` - API service layer (NEW)
2. `/frontend/ADMIN/app.js` - Update all components with API calls
3. `/frontend/ADMIN/login.html` - Admin login page (NEW)
4. `/frontend/ADMIN/login.js` - Admin login logic (NEW)

## Estimated Time per Phase

- **Phase 1 (Database)**: 1-2 hours
- **Phase 2 (Backend APIs)**: 8-12 hours
- **Phase 3 (Frontend Integration)**: 6-10 hours
- **Phase 4 (Testing)**: 4-6 hours

**Total**: 19-30 hours

## Priority Order

1. **High Priority**:
   - Dashboard API
   - Donors Management API
   - Items Management API
   - Basic authentication

2. **Medium Priority**:
   - Communities Management API
   - Requests Management API
   - Reports & Analytics API

3. **Low Priority**:
   - Settings/Profile API
   - Advanced filtering
   - Export functionality

## Next Steps

1. Review and approve this plan
2. Set up database schema changes
3. Start Phase 2: Backend API development
4. Test APIs using Postman/curl
5. Start Phase 3: Frontend integration
6. End-to-end testing
