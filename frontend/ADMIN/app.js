const { useState, useEffect } = React;

// Sample Data - Student Resource Donation Management System
const sampleDonors = [
  {
    donor_id: "D001",
    name: "Arjun Kumar",
    institution: "Delhi University",
    email: "arjun.kumar@du.ac.in",
    phone: "+91-98765-43210",
    last_donation_date: "2025-10-28",
    total_items_donated: 12,
    status: "Active"
  },
  {
    donor_id: "D002",
    name: "Priya Singh",
    institution: "Ramjas College",
    email: "priya.singh@ramjas.ac.in",
    phone: "+91-98765-43211",
    last_donation_date: "2025-10-25",
    total_items_donated: 8,
    status: "Active"
  },
  {
    donor_id: "D003",
    name: "Rahul Verma",
    institution: "Delhi University",
    email: "rahul.v@du.ac.in",
    phone: "+91-98765-43212",
    last_donation_date: "2025-10-30",
    total_items_donated: 15,
    status: "Active"
  },
  {
    donor_id: "D004",
    name: "Neha Patel",
    institution: "Miranda House",
    email: "neha.patel@mirandahouse.ac.in",
    phone: "+91-98765-43213",
    last_donation_date: "2025-11-02",
    total_items_donated: 5,
    status: "Active"
  },
  {
    donor_id: "D005",
    name: "Aditya Sharma",
    institution: "Delhi University",
    email: "aditya.sharma@du.ac.in",
    phone: "+91-98765-43214",
    last_donation_date: "2025-10-20",
    total_items_donated: 3,
    status: "Inactive"
  }
];

const sampleCommunities = [
  {
    community_id: "C001",
    name: "Sunlight Public School",
    type: "School",
    contact_person: "Mrs. Meera Gupta",
    email: "principal@sunlightschool.edu.in",
    phone: "+91-98765-11111",
    address: "123 Main Street, Delhi",
    verification_status: "verified",
    total_requests: 3,
    items_received: 12,
    registration_date: "2025-09-10"
  },
  {
    community_id: "C002",
    name: "Rainbow Kindergarten",
    type: "Kindergarten",
    contact_person: "Mr. Rajesh Kumar",
    email: "admin@rainbowkinder.in",
    phone: "+91-98765-22222",
    address: "456 Park Avenue, Delhi",
    verification_status: "verified",
    total_requests: 2,
    items_received: 8,
    registration_date: "2025-09-15"
  },
  {
    community_id: "C003",
    name: "Hope Community Center",
    type: "Community Center",
    contact_person: "Ms. Priya Sharma",
    email: "coordinator@hopecenter.org",
    phone: "+91-98765-33333",
    address: "789 Community Road, Delhi",
    verification_status: "verified",
    total_requests: 4,
    items_received: 18,
    registration_date: "2025-08-20"
  },
  {
    community_id: "C004",
    name: "St. Mary's Orphanage",
    type: "Orphanage",
    contact_person: "Sr. Jennifer",
    email: "admin@stmaryorphanage.in",
    phone: "+91-98765-44444",
    address: "321 Charity Lane, Delhi",
    verification_status: "verified",
    total_requests: 5,
    items_received: 25,
    registration_date: "2025-07-15"
  },
  {
    community_id: "C005",
    name: "Bright Learning Academy",
    type: "School",
    contact_person: "Dr. Suresh Nair",
    email: "admin@brightacademy.edu",
    phone: "+91-98765-55555",
    address: "555 Education Street, Delhi",
    verification_status: "pending",
    total_requests: 0,
    items_received: 0,
    registration_date: "2025-10-28"
  }
];

const sampleRequests = [
  {
    request_id: "REQ001",
    community_id: "C001",
    community_name: "Sunlight Public School",
    items_requested: [{category: "Clothing", quantity: 10}, {category: "Books", quantity: 5}],
    date_requested: "2025-10-15",
    status: "approved",
    items_allocated: 15,
    items_total: 15,
    fulfillment_progress: 100,
    queue_position: null,
    approval_date: "2025-10-25"
  },
  {
    request_id: "REQ002",
    community_id: "C002",
    community_name: "Rainbow Kindergarten",
    items_requested: [{category: "Clothing", quantity: 5}, {category: "Sports", quantity: 3}],
    date_requested: "2025-10-20",
    status: "approved",
    items_allocated: 8,
    items_total: 8,
    fulfillment_progress: 100,
    queue_position: null,
    approval_date: "2025-10-28"
  },
  {
    request_id: "REQ003",
    community_id: "C003",
    community_name: "Hope Community Center",
    items_requested: [{category: "Books", quantity: 10}, {category: "Electronics", quantity: 2}],
    date_requested: "2025-10-25",
    status: "in_fulfillment",
    items_allocated: 8,
    items_total: 12,
    fulfillment_progress: 67,
    queue_position: 1,
    approval_date: null
  },
  {
    request_id: "REQ004",
    community_id: "C004",
    community_name: "St. Mary's Orphanage",
    items_requested: [{category: "Clothing", quantity: 15}, {category: "Books", quantity: 8}, {category: "Sports", quantity: 5}],
    date_requested: "2025-10-28",
    status: "pending",
    items_allocated: 0,
    items_total: 28,
    fulfillment_progress: 0,
    queue_position: 2,
    approval_date: null
  }
];

const sampleItems = [
  {
    item_id: "I001",
    category: "Clothing",
    description: "School Uniform (Size M)",
    donor_id: "D001",
    donor_name: "Arjun Kumar",
    condition: "Good",
    estimated_value: 800,
    stock_status: "distributed",
    date_added: "2025-09-20",
    allocated_to_request: "REQ001",
    distributed_to_community: "C001"
  },
  {
    item_id: "I002",
    category: "Books",
    description: "Mathematics Textbook Class 5",
    donor_id: "D002",
    donor_name: "Priya Singh",
    condition: "Good",
    estimated_value: 350,
    stock_status: "distributed",
    date_added: "2025-09-22",
    allocated_to_request: "REQ001",
    distributed_to_community: "C001"
  },
  {
    item_id: "I003",
    category: "Clothing",
    description: "Winter Jacket (Size S)",
    donor_id: "D003",
    donor_name: "Rahul Verma",
    condition: "Fair",
    estimated_value: 1200,
    stock_status: "in_stock",
    date_added: "2025-10-08",
    allocated_to_request: null
  },
  {
    item_id: "I004",
    category: "Electronics",
    description: "Digital Watch",
    donor_id: "D001",
    donor_name: "Arjun Kumar",
    condition: "Good",
    estimated_value: 2000,
    stock_status: "allocated",
    date_added: "2025-10-10",
    allocated_to_request: "REQ003"
  },
  {
    item_id: "I005",
    category: "Sports",
    description: "Cricket Bat and Ball Set",
    donor_id: "D005",
    donor_name: "Aditya Sharma",
    condition: "New",
    estimated_value: 1500,
    stock_status: "allocated",
    date_added: "2025-10-18",
    allocated_to_request: "REQ002"
  },
  {
    item_id: "I006",
    category: "Books",
    description: "English Literature (Class 4)",
    donor_id: "D002",
    donor_name: "Priya Singh",
    condition: "Good",
    estimated_value: 400,
    stock_status: "distributed",
    date_added: "2025-09-28",
    allocated_to_request: "REQ001",
    distributed_to_community: "C001"
  },
  {
    item_id: "I007",
    category: "Clothing",
    description: "T-Shirt Pack (5 pieces)",
    donor_id: "D004",
    donor_name: "Neha Patel",
    condition: "New",
    estimated_value: 1500,
    stock_status: "allocated",
    date_added: "2025-11-02",
    allocated_to_request: "REQ002"
  }
];

const sampleDistributions = [
  {
    distribution_id: "DIST001",
    request_id: "REQ001",
    community_id: "C001",
    community_name: "Sunlight Public School",
    items_count: 5,
    distribution_date: "2025-10-26",
    delivery_method: "In-hand",
    status: "completed",
    items_delivered: ["I001", "I002", "I006"]
  },
  {
    distribution_id: "DIST002",
    request_id: "REQ002",
    community_id: "C002",
    community_name: "Rainbow Kindergarten",
    items_count: 8,
    distribution_date: "2025-10-29",
    delivery_method: "Delivery",
    status: "completed",
    items_delivered: ["I005", "I007"]
  },
  {
    distribution_id: "DIST003",
    request_id: "REQ003",
    community_id: "C003",
    community_name: "Hope Community Center",
    items_count: 4,
    distribution_date: "2025-11-03",
    delivery_method: "Pickup",
    status: "scheduled",
    items_to_deliver: ["I004"]
  }
];

const sampleBatches = [
  {
    batch_id: "B001",
    donor_id: "D001",
    donor_name: "Arjun Kumar",
    date_created: "2025-09-20",
    items_count: 3,
    total_estimated_value: 3150,
    approval_status: "approved",
    pickup_status: "picked-up",
    pickup_date: "2025-09-22"
  },
  {
    batch_id: "B002",
    donor_id: "D002",
    donor_name: "Priya Singh",
    date_created: "2025-09-22",
    items_count: 2,
    total_estimated_value: 750,
    approval_status: "approved",
    pickup_status: "picked-up",
    pickup_date: "2025-09-24"
  },
  {
    batch_id: "B003",
    donor_id: "D003",
    donor_name: "Rahul Verma",
    date_created: "2025-10-08",
    items_count: 4,
    total_estimated_value: 4200,
    approval_status: "approved",
    pickup_status: "picked-up",
    pickup_date: "2025-10-10"
  },
  {
    batch_id: "B004",
    donor_id: "D004",
    donor_name: "Neha Patel",
    date_created: "2025-10-15",
    items_count: 2,
    total_estimated_value: 1800,
    approval_status: "pending",
    pickup_status: "pending",
    pickup_date: null
  },
  {
    batch_id: "B005",
    donor_id: "D005",
    donor_name: "Aditya Sharma",
    date_created: "2025-10-18",
    items_count: 1,
    total_estimated_value: 1500,
    approval_status: "approved",
    pickup_status: "pending",
    pickup_date: null
  }
];



const dashboardStats = {
  total_active_donors: 4,
  total_communities: 5,
  total_items_in_stock: 1,
  pending_requests: 1
};

const completedRequests = [
  {
    request_id: "REQ001",
    community_name: "Sunlight Public School",
    items_count: 15,
    completion_date: "2025-10-25",
    status: "Finished"
  },
  {
    request_id: "REQ002",
    community_name: "Rainbow Kindergarten",
    items_count: 8,
    completion_date: "2025-10-28",
    status: "Finished"
  }
];

const pendingQueue = [
  {
    request_id: "REQ003",
    community_name: "Hope Community Center",
    queue_position: 1,
    items_requested: 12,
    items_in_stock: 8,
    items_pending: 4
  },
  {
    request_id: "REQ004",
    community_name: "St. Mary's Orphanage",
    queue_position: 2,
    items_requested: 28,
    items_in_stock: 0,
    items_pending: 28
  }
];

const recentTimeReports = {
  last_7_days: {
    items_donated: 3,
    items_distributed: 5,
    requests_fulfilled: 1,
    requests_pending: 1
  },
  last_30_days: {
    items_donated: 12,
    items_distributed: 18,
    requests_fulfilled: 2,
    requests_pending: 2
  },
  last_90_days: {
    items_donated: 43,
    items_distributed: 38,
    requests_fulfilled: 4,
    requests_pending: 1
  }
};

const oldSampleDonations = [
  {
    transaction_id: 'TXN-20251103-001',
    date: '2025-11-03',
    time: '14:35',
    donor_name: 'John Smith',
    donor_email: 'john.smith@email.com',
    campaign: 'Emergency Relief Fund',
    amount: 250,
    payment_method: 'Credit Card',
    status: 'completed'
  },
  {
    transaction_id: 'TXN-20251103-002',
    date: '2025-11-03',
    time: '11:20',
    donor_name: 'Emma Wilson',
    donor_email: 'emma.w@email.com',
    campaign: 'Education for All',
    amount: 500,
    payment_method: 'PayPal',
    status: 'completed'
  },
  {
    transaction_id: 'TXN-20251102-015',
    date: '2025-11-02',
    time: '16:45',
    donor_name: 'Robert Brown',
    donor_email: 'r.brown@email.com',
    campaign: 'Medical Aid Program',
    amount: 1000,
    payment_method: 'Bank Transfer',
    status: 'completed'
  },
  {
    transaction_id: 'TXN-20251102-014',
    date: '2025-11-02',
    time: '09:15',
    donor_name: 'Amanda Garcia',
    donor_email: 'amanda.g@email.com',
    campaign: 'Community Development',
    amount: 150,
    payment_method: 'JazzCash',
    status: 'completed'
  },
  {
    transaction_id: 'TXN-20251101-032',
    date: '2025-11-01',
    time: '13:50',
    donor_name: 'Chris Martinez',
    donor_email: 'chris.m@email.com',
    campaign: 'Disaster Relief',
    amount: 750,
    payment_method: 'Credit Card',
    status: 'pending'
  },
  {
    transaction_id: 'TXN-20251101-031',
    date: '2025-11-01',
    time: '10:30',
    donor_name: 'Jennifer Lee',
    donor_email: 'j.lee@email.com',
    campaign: 'Child Welfare',
    amount: 300,
    payment_method: 'PayPal',
    status: 'completed'
  },
  {
    transaction_id: 'TXN-20251031-048',
    date: '2025-10-31',
    time: '15:20',
    donor_name: 'Daniel Taylor',
    donor_email: 'dan.taylor@email.com',
    campaign: 'Food Security Initiative',
    amount: 200,
    payment_method: 'Credit Card',
    status: 'completed'
  },
  {
    transaction_id: 'TXN-20251031-047',
    date: '2025-10-31',
    time: '08:45',
    donor_name: 'Michelle Anderson',
    donor_email: 'm.anderson@email.com',
    campaign: 'Emergency Relief Fund',
    amount: 450,
    payment_method: 'Bank Transfer',
    status: 'failed',
    failure_reason: 'Insufficient funds'
  },
  {
    transaction_id: 'TXN-20251030-056',
    date: '2025-10-30',
    time: '17:10',
    donor_name: 'Kevin White',
    donor_email: 'kevin.w@email.com',
    campaign: 'Medical Aid Program',
    amount: 600,
    payment_method: 'PayPal',
    status: 'completed'
  },
  {
    transaction_id: 'TXN-20251030-055',
    date: '2025-10-30',
    time: '12:00',
    donor_name: 'Sarah Mitchell',
    donor_email: 'sarah.mit@email.com',
    campaign: 'Education for All',
    amount: 350,
    payment_method: 'Credit Card',
    status: 'completed'
  }
];



// Sidebar Component
function Sidebar({ activePage, setActivePage, isSidebarOpen, setIsSidebarOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '■' },
    { id: 'donors', label: 'Donors Management', icon: '👤' },
    { id: 'communities', label: 'Communities/Recipients', icon: '🏫' },
    { id: 'requests', label: 'Requests Management', icon: '📝' },
    { id: 'items', label: 'Items/Donations', icon: '📦' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙' }
  ];

  return (
    <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span>🎒</span>
          <span>Donation Admin</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
        <div className="nav-item" onClick={() => alert('Logout clicked')}>
          <span className="nav-icon">→</span>
          <span>Logout</span>
        </div>
      </nav>
    </div>
  );
}

// Top Navigation Component
function TopNav({ isSidebarOpen, setIsSidebarOpen }) {
  return (
    <div className="top-nav">
      <div className="nav-left">
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          ☰
        </button>
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="nav-right">
        <div className="notification-icon">
          🔔
          <span className="notification-badge">3</span>
        </div>
        <div className="admin-profile">
          <div className="admin-avatar">AD</div>
          <span>Admin</span>
        </div>
      </div>
    </div>
  );
}

// Dashboard Page
function Dashboard() {
  const [stats, setStats] = useState(dashboardStats);
  const [recentDonors, setRecentDonors] = useState([]);
  const [completedRequestsData, setCompletedRequestsData] = useState(completedRequests);
  const [pendingRequestsData, setPendingRequestsData] = useState(pendingQueue);
  const [recentItems, setRecentItems] = useState([]);
  const [timeReports, setTimeReports] = useState(recentTimeReports);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/dashboard')
      .then(response => response.json())
      .then(data => {
        setStats(data.stats);
        setRecentDonors(data.recentDonors);
        setCompletedRequestsData(data.completedRequests);
        setPendingRequestsData(data.pendingRequests);
        setRecentItems(data.recentItems);
        setTimeReports(data.timeReports);
      })
      .catch(error => console.error('Error fetching dashboard data:', error));
  }, []);

  useEffect(() => {
    // Create items by category chart
    const ctx = document.getElementById('itemsCategoryChart');
    if (ctx) {
      const categoryCounts = {};
      sampleItems.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      });

      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryCounts),
          datasets: [{
            data: Object.values(categoryCounts),
            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });

      return () => chart.destroy();
    }
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome to the Student Resource Donation Management System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">👤</div>
          </div>
          <div className="stat-value">{stats.total_active_donors}</div>
          <div className="stat-label">Total Active Donors</div>
          <div className="stat-growth">Student contributors</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">🏫</div>
          </div>
          <div className="stat-value">{stats.total_communities}</div>
          <div className="stat-label">Total Communities/Institutions</div>
          <div className="stat-growth">Organizations registered</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">📦</div>
          </div>
          <div className="stat-value">{stats.total_items_in_stock}</div>
          <div className="stat-label">Total Items in Stock</div>
          <div className="stat-growth">Available for allocation</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">📝</div>
          </div>
          <div className="stat-value">{stats.pending_requests}</div>
          <div className="stat-label">Pending Requests</div>
          <div className="stat-growth">Awaiting fulfillment</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Request Completion Queue</h2>
          </div>
          <div className="card-body">
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text)' }}>Recent Completed Requests</h3>
            <div style={{ marginBottom: '20px' }}>
              {completedRequestsData.map(req => (
                <div key={req.request_id} style={{ padding: '12px', backgroundColor: 'var(--color-bg-3)', borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{req.request_id}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{req.community_name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Items: {req.items_count} | Completed: {req.completion_date}</div>
                    </div>
                    <span className="status-badge completed" style={{ fontSize: '11px' }}>{req.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text)' }}>Last 5 Items Donated</h3>
            {recentItems.slice(0, 5).map(item => (
              <div key={item.item_id} style={{ fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                {item.item_name} - {item.donor_name}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Reports</h2>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--color-bg-1)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Last 7 Days</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>Items Donated: <strong>{timeReports.last_7_days.items_donated}</strong></div>
                <div>Items Distributed: <strong>{timeReports.last_7_days.items_distributed}</strong></div>
                <div>Requests Fulfilled: <strong>{timeReports.last_7_days.requests_fulfilled}</strong></div>
                <div>Requests Pending: <strong>{timeReports.last_7_days.requests_pending}</strong></div>
              </div>
            </div>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--color-bg-2)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Last 30 Days</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>Items Donated: <strong>{timeReports.last_30_days.items_donated}</strong></div>
                <div>Items Distributed: <strong>{timeReports.last_30_days.items_distributed}</strong></div>
                <div>Requests Fulfilled: <strong>{timeReports.last_30_days.requests_fulfilled}</strong></div>
                <div>Requests Pending: <strong>{timeReports.last_30_days.requests_pending}</strong></div>
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-3)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Last 90 Days</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>Items Donated: <strong>{timeReports.last_90_days.items_donated}</strong></div>
                <div>Items Distributed: <strong>{timeReports.last_90_days.items_distributed}</strong></div>
                <div>Requests Fulfilled: <strong>{timeReports.last_90_days.requests_fulfilled}</strong></div>
                <div>Requests Pending: <strong>{timeReports.last_90_days.requests_pending}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2 className="card-title">Request Queue Status</h2>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Pending requests waiting in queue for fulfillment (auto-allocated when items arrive)</p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Queue Position</th>
                  <th>Request ID</th>
                  <th>Community Name</th>
                  <th>Items Requested</th>
                  <th>Items in Stock</th>
                  <th>Items Pending</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequestsData.map(req => (
                  <tr key={req.request_id}>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: req.queue_position === 1 ? 'var(--color-bg-1)' : 'var(--color-bg-2)',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {req.queue_position}
                      </span>
                    </td>
                    <td>{req.request_id}</td>
                    <td>{req.community_name}</td>
                    <td>{req.items_requested}</td>
                    <td>
                      <span style={{ color: req.items_in_stock > 0 ? 'var(--admin-success)' : 'var(--admin-danger)', fontWeight: '600' }}>
                        {req.items_in_stock}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--admin-warning)', fontWeight: '600' }}>
                        {req.items_pending}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge pending">In Queue</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Donors</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Institution</th>
                <th>Items Donated</th>
                <th>Donation Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleDonors.slice(0, 5).map(donor => (
                <tr key={donor.donor_id}>
                  <td>{donor.name}</td>
                  <td>{donor.institution}</td>
                  <td>{donor.total_items_donated}</td>
                  <td>{donor.last_donation_date}</td>
                  <td>
                    <span className={`status-badge ${donor.status === 'Active' ? 'approved' : 'pending'}`}>
                      {donor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Donors Management Page
function DonorsManagement() {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/donors?page=1&limit=100')
      .then(response => response.json())
      .then(data => {
        setDonors(data.donors || []);
        setFilteredDonors(data.donors || []);
      })
      .catch(error => console.error('Error fetching donors:', error));
  }, []);

  useEffect(() => {
    let filtered = donors;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (institutionFilter !== 'all') {
      filtered = filtered.filter(d => d.institution === institutionFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.donor_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDonors(filtered);
    setCurrentPage(1);
  }, [statusFilter, institutionFilter, searchTerm, donors]);

  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDonors = filteredDonors.slice(startIndex, startIndex + itemsPerPage);
  const institutions = [...new Set(donors.map(d => d.institution))];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Donors Management</h1>
        <p className="page-subtitle">Manage student donor information and donation history</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Institution</label>
          <select 
            className="filter-select" 
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
          >
            <option value="all">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor ID</th>
                <th>Name</th>
                <th>Institution</th>
                <th>Contact</th>
                <th>Items Donated</th>
                <th>Donation Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDonors.length > 0 ? (
                paginatedDonors.map(donor => (
                  <tr key={donor.donor_id}>
                    <td>{donor.donor_id}</td>
                    <td>{donor.name}</td>
                    <td>{donor.institution}</td>
                    <td>
                      <div>{donor.email}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{donor.phone}</div>
                    </td>
                    <td>{donor.total_items_donated}</td>
                    <td>{donor.last_donation_date}</td>
                    <td>
                      <span className={`status-badge ${donor.status === 'Active' ? 'approved' : donor.status === 'Inactive' ? 'pending' : 'active'}`}>
                        {donor.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">👤</div>
                      <div className="empty-state-text">No donors found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredDonors.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDonors.length)} of {filteredDonors.length} donors
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

// Communities Management Page
function CommunitiesManagement() {
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/communities')
      .then(response => response.json())
      .then(data => {
        setCommunities(data.communities || []);
        setFilteredCommunities(data.communities || []);
      })
      .catch(error => console.error('Error fetching communities:', error));
  }, []);

  useEffect(() => {
    let filtered = communities;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.verification_status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.community_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCommunities(filtered);
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchTerm, communities]);



  const totalPages = Math.ceil(filteredCommunities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCommunities = filteredCommunities.slice(startIndex, startIndex + itemsPerPage);
  const types = [...new Set(communities.map(c => c.type))];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Communities &amp; Institutions</h1>
        <p className="page-subtitle">Manage schools, kindergartens, and community organizations requesting donations on behalf of their students</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Institution Type</label>
          <select 
            className="filter-select" 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Verification Status</label>
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Community name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Community ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Contact Person</th>
                <th>Contact Info</th>
                <th>Total Requests</th>
                <th>Items Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCommunities.length > 0 ? (
                paginatedCommunities.map(community => (
                  <tr key={community.community_id}>
                    <td>{community.community_id}</td>
                    <td>{community.name}</td>
                    <td>{community.type}</td>
                    <td>{community.contact_person}</td>
                    <td>
                      <div>{community.email}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{community.phone}</div>
                    </td>
                    <td>{community.total_requests}</td>
                    <td>{community.items_received}</td>
                    <td>
                      <span className={`status-badge ${community.verification_status === 'verified' ? 'approved' : 'pending'}`}>
                        {community.verification_status.charAt(0).toUpperCase() + community.verification_status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">🏫</div>
                      <div className="empty-state-text">No communities found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredCommunities.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCommunities.length)} of {filteredCommunities.length} communities
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

// Requests Management Page
function RequestsManagement() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/requests')
      .then(response => response.json())
      .then(data => {
        setRequests(data.requests || []);
        setFilteredRequests(data.requests || []);
      })
      .catch(error => console.error('Error fetching requests:', error));
  }, []);


  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.community_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [statusFilter, searchTerm, requests]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Community Requests</h1>
        <p className="page-subtitle">Auto-approval system: Items automatically allocated to earliest requester when in stock</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Request Status</label>
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_fulfillment">In Fulfillment</option>
            <option value="approved">Approved</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Request ID or community..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Community</th>
                <th>Items Requested</th>
                <th>Date</th>
                <th>Status</th>
                <th>Allocated</th>
                <th>Progress</th>
                <th>Queue Position</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map(request => (
                  <tr key={request.request_id}>
                    <td>{request.request_id}</td>
                    <td>{request.community_name}</td>
                    <td>
                      {request.items_requested.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '12px' }}>
                          {item.category} ({item.quantity})
                        </div>
                      ))}
                    </td>
                    <td>{request.date_requested}</td>
                    <td>
                      <span className={`status-badge ${
                        request.status === 'approved' ? 'approved' : 
                        request.status === 'in_fulfillment' ? 'active' : 'pending'
                      }`}>
                        {request.status === 'in_fulfillment' ? 'In Fulfillment' : 
                         request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td>{request.items_allocated} / {request.items_total}</td>
                    <td>
                      <div style={{ width: '100px', backgroundColor: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${request.fulfillment_progress}%`, backgroundColor: '#22c55e', height: '100%' }}></div>
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '2px' }}>{request.fulfillment_progress}%</div>
                    </td>
                    <td>{request.queue_position || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">📝</div>
                      <div className="empty-state-text">No requests found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredRequests.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

// Items Management Page
function ItemsManagement() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/items?page=1&limit=100')
      .then(response => response.json())
      .then(data => {
        setItems(data.items || []);
        setFilteredItems(data.items || []);
      })
      .catch(error => console.error('Error fetching items:', error));
  }, []);


  useEffect(() => {
    let filtered = items;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (conditionFilter !== 'all') {
      filtered = filtered.filter(item => item.condition === conditionFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.stock_status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [categoryFilter, conditionFilter, statusFilter, searchTerm, items]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const categories = [...new Set(items.map(i => i.category))];
  const conditions = [...new Set(items.map(i => i.condition))];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Items &amp; Donations Management</h1>
        <p className="page-subtitle">All items are approved by default and auto-allocated to requests</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Condition</label>
          <select 
            className="filter-select"
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
          >
            <option value="all">All Conditions</option>
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Stock Status</label>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="allocated">Allocated</option>
            <option value="distributed">Distributed</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Item ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Donor</th>
                <th>Condition</th>
                <th>Value</th>
                <th>Status</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map(item => (
                  <tr key={item.item_id}>
                    <td>{item.item_id}</td>
                    <td>{item.category}</td>
                    <td>{item.description}</td>
                    <td>{item.donor_name}</td>
                    <td>
                      <span className={`status-badge ${item.condition === 'New' ? 'approved' : item.condition === 'Good' ? 'active' : 'pending'}`}>
                        {item.condition}
                      </span>
                    </td>
                    <td>₹{item.estimated_value}</td>
                    <td>
                      <span className={`status-badge ${
                        item.stock_status === 'in_stock' ? 'approved' : 
                        item.stock_status === 'allocated' ? 'active' : 
                        item.stock_status === 'distributed' ? 'completed' : 'pending'
                      }`}>
                        {item.stock_status === 'in_stock' ? 'In Stock' : 
                         item.stock_status === 'allocated' ? 'Allocated' : 'Distributed'}
                      </span>
                    </td>
                    <td>{item.date_added}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <div className="empty-state-text">No items found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredItems.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

// Distributions Page
function DistributionsPage() {
  const [distributions, setDistributions] = useState([]);
  const [filteredDistributions, setFilteredDistributions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/distributions')
      .then(response => response.json())
      .then(data => {
        setDistributions(data.distributions || []);
        setFilteredDistributions(data.distributions || []);
      })
      .catch(error => console.error('Error fetching distributions:', error));
  }, []);


  useEffect(() => {
    let filtered = distributions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.distribution_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDistributions(filtered);
    setCurrentPage(1);
  }, [statusFilter, searchTerm, distributions]);



  const totalPages = Math.ceil(filteredDistributions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDistributions = filteredDistributions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Distributions &amp; Deliveries</h1>
        <p className="page-subtitle">Latest approved request states and delivery tracking</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Distribution ID or recipient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Distribution ID</th>
                <th>Request ID</th>
                <th>Community</th>
                <th>Items Count</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDistributions.length > 0 ? (
                paginatedDistributions.map(dist => (
                  <tr key={dist.distribution_id}>
                    <td>{dist.distribution_id}</td>
                    <td>{dist.request_id}</td>
                    <td>{dist.community_name}</td>
                    <td>{dist.items_count}</td>
                    <td>{dist.distribution_date}</td>
                    <td>{dist.delivery_method}</td>
                    <td>
                      <span className={`status-badge ${dist.status === 'completed' ? 'completed' : dist.status === 'scheduled' ? 'pending' : dist.status}`}>
                        {dist.status.charAt(0).toUpperCase() + dist.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">🚚</div>
                      <div className="empty-state-text">No distributions found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredDistributions.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDistributions.length)} of {filteredDistributions.length} distributions
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

// Reports & Analytics Page
function ReportsAnalytics() {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [timeReports, setTimeReports] = useState({ last_7_days: {}, last_30_days: {}, last_90_days: {} });

  useEffect(() => {
    // Fetch all necessary data
    Promise.all([
      fetch('http://localhost:5000/api/admin/items?page=1&limit=1000').then(r => r.json()),
      fetch('http://localhost:5000/api/admin/requests').then(r => r.json()),
      fetch('http://localhost:5000/api/admin/donors?page=1&limit=100').then(r => r.json()),
      fetch('http://localhost:5000/api/admin/communities').then(r => r.json()),
      fetch('http://localhost:5000/api/admin/dashboard').then(r => r.json())
    ])
    .then(([itemsData, requestsData, donorsData, communitiesData, dashboardData]) => {
      setItems(itemsData.items || []);
      setRequests(requestsData.requests || []);
      setDonors(donorsData.donors || []);
      setCommunities(communitiesData.communities || []);
      setTimeReports(dashboardData.timeReports || { last_7_days: {}, last_30_days: {}, last_90_days: {} });
    })
    .catch(error => console.error('Error fetching analytics data:', error));
  }, []);

  const [timePeriod, setTimePeriod] = useState('last_30_days');

  // Calculate statistics based on time period
  const getStatsForPeriod = () => {
    const periodData = timeReports[timePeriod] || timeReports.last_30_days;
    return periodData;
  };

  const stats = getStatsForPeriod();

  // Calculate counts by category and condition
  const categoryCounts = {};
  const conditionCounts = {};
  const statusCounts = {
    in_stock: 0,
    allocated: 0,
    distributed: 0
  };

  items.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    conditionCounts[item.condition] = (conditionCounts[item.condition] || 0) + 1;
    if (statusCounts.hasOwnProperty(item.stock_status)) {
      statusCounts[item.stock_status]++;
    }
  });

  const requestStatusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    in_fulfillment: requests.filter(r => r.status === 'in_fulfillment').length,
    approved: requests.filter(r => r.status === 'approved').length
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports &amp; Analytics</h1>
        <p className="page-subtitle">System statistics and insights</p>
      </div>

      {/* Time Period Selector */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontWeight: '600' }}>Time Period:</label>
            <button 
              className={`btn btn-sm ${timePeriod === 'last_7_days' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTimePeriod('last_7_days')}
            >
              Last 7 Days
            </button>
            <button 
              className={`btn btn-sm ${timePeriod === 'last_30_days' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTimePeriod('last_30_days')}
            >
              Last 30 Days
            </button>
            <button 
              className={`btn btn-sm ${timePeriod === 'last_90_days' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTimePeriod('last_90_days')}
            >
              Last 90 Days
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div className="stat-value">{stats.items_donated}</div>
          <div className="stat-label">Total Items Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🚚</div>
          <div className="stat-value">{stats.items_distributed}</div>
          <div className="stat-label">Total Items Distributed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">✓</div>
          <div className="stat-value">{stats.requests_fulfilled}</div>
          <div className="stat-label">Requests Fulfilled</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-value">{stats.requests_pending}</div>
          <div className="stat-label">Requests Pending</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Items by Category */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Items by Category</h2>
          </div>
          <div className="card-body">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{category}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{count}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / items.length) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items by Condition */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Items by Condition</h2>
          </div>
          <div className="card-body">
            {Object.entries(conditionCounts).map(([condition, count]) => (
              <div key={condition} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{condition}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{count}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / items.length) * 100}%`, height: '100%', backgroundColor: '#22c55e' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Request Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Request Status Breakdown</h2>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Pending</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{requestStatusCounts.pending}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(requestStatusCounts.pending / requests.length) * 100}%`, height: '100%', backgroundColor: '#f59e0b' }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>In Fulfillment</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{requestStatusCounts.in_fulfillment}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(requestStatusCounts.in_fulfillment / requests.length) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Approved</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{requestStatusCounts.approved}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(requestStatusCounts.approved / requests.length) * 100}%`, height: '100%', backgroundColor: '#22c55e' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Performers</h2>
          </div>
          <div className="card-body">
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Most Active Donors</h3>
            {donors.sort((a, b) => b.total_items_donated - a.total_items_donated).slice(0, 3).map((donor, idx) => (
              <div key={donor.donor_id} style={{ fontSize: '13px', padding: '8px', backgroundColor: idx === 0 ? 'var(--color-bg-1)' : '#f9fafb', borderRadius: '6px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{donor.name}</span>
                <span style={{ fontWeight: '600' }}>{donor.total_items_donated} items</span>
              </div>
            ))}
            
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>Most Requesting Communities</h3>
            {communities.sort((a, b) => b.total_requests - a.total_requests).slice(0, 3).map((comm, idx) => (
              <div key={comm.community_id} style={{ fontSize: '13px', padding: '8px', backgroundColor: idx === 0 ? 'var(--color-bg-2)' : '#f9fafb', borderRadius: '6px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{comm.name}</span>
                <span style={{ fontWeight: '600' }}>{comm.total_requests} requests</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Export Reports</h2>
        </div>
        <div className="card-body">
          <div className="quick-actions">
            <div className="quick-action-btn" onClick={() => alert('Exporting CSV Report...')}>
              <div className="quick-action-icon">📄</div>
              <div className="quick-action-label">Export as CSV</div>
            </div>
            <div className="quick-action-btn" onClick={() => alert('Exporting PDF Report...')}>
              <div className="quick-action-icon">📑</div>
              <div className="quick-action-label">Export as PDF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// Settings Page
function Settings() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure system settings and preferences</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Admin Profile</h2>
        </div>
        <div className="card-body">
          <div className="filter-group" style={{ marginBottom: '16px' }}>
            <label className="filter-label">Full Name</label>
            <input type="text" className="filter-input" placeholder="Admin Name" />
          </div>
          <div className="filter-group" style={{ marginBottom: '16px' }}>
            <label className="filter-label">Email</label>
            <input type="email" className="filter-input" placeholder="admin@example.com" />
          </div>
          <div className="filter-group" style={{ marginBottom: '16px' }}>
            <label className="filter-label">Password</label>
            <input type="password" className="filter-input" placeholder="••••••••" />
          </div>
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2 className="card-title">System Configuration</h2>
        </div>
        <div className="card-body">
          <p style={{ color: '#6b7280' }}>Configure notification preferences, payment gateways, and email templates.</p>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'donors':
        return <DonorsManagement />;
      case 'communities':
        return <CommunitiesManagement />;
      case 'requests':
        return <RequestsManagement />;
      case 'items':
        return <ItemsManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-container">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`}>
        <TopNav 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);