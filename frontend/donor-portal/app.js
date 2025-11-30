// React Context for Global State Management
const { useState, useContext, createContext, useEffect } = React;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userData = window.sessionUser;
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    window.sessionUser = userData;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    window.sessionUser = null;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Login Page Component
const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { login } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🎓 Student Resource Donation</h1>
            <p>Make a difference by sharing resources</p>
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>
          
          <div className="auth-body">
            {registrationSuccess && activeTab === 'login' && (
              <div style={{padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '16px', border: '1px solid #c3e6cb'}}>
                Registration successful! Please login with your credentials.
              </div>
            )}
            {activeTab === 'login' ? (
              <LoginForm login={login} />
            ) : (
              <RegisterForm onSuccess={() => {
                setRegistrationSuccess(true);
                setActiveTab('login');
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ login }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const data = await window.apiLogin(formData.email, formData.password);

      if (data) {
        const userData = {
          id: data.donor_id,
          name: data.donor_name,
          email: data.email,
        };
        
        login(userData);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Error connecting to server. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Email or Phone</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter your email or phone"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <div className="form-checkbox">
          <input
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Register Form Component
const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    institution: '',
    year_class: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.institution) newErrors.institution = 'Institution is required';
    if (!formData.year_class) newErrors.year_class = 'Year/Class is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await window.registerDonor({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          institution: formData.institution,
          year_class: formData.year_class,
          address: formData.address,
          password: formData.password
        });
        onSuccess();
      } catch (error) {
        setError(error.message || 'Registration failed. Please try again.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'error' : ''}`}
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className={`form-control ${errors.email ? 'error' : ''}`}
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Phone</label>
        <input
          type="tel"
          className={`form-control ${errors.phone ? 'error' : ''}`}
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
        {errors.phone && <div className="form-error">{errors.phone}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className={`form-control ${errors.password ? 'error' : ''}`}
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        {errors.password && <div className="form-error">{errors.password}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <input
          type="password"
          className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        />
        {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Institution</label>
        <input
          type="text"
          className={`form-control ${errors.institution ? 'error' : ''}`}
          placeholder="Enter your institution"
          value={formData.institution}
          onChange={(e) => setFormData({...formData, institution: e.target.value})}
        />
        {errors.institution && <div className="form-error">{errors.institution}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Year/Class</label>
        <input
          type="text"
          className={`form-control ${errors.year_class ? 'error' : ''}`}
          placeholder="e.g., First Year, Second Year, Class 12"
          value={formData.year_class}
          onChange={(e) => setFormData({...formData, year_class: e.target.value})}
        />
        {errors.year_class && <div className="form-error">{errors.year_class}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea
          className={`form-control ${errors.address ? 'error' : ''}`}
          placeholder="Enter your address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
        {errors.address && <div className="form-error">{errors.address}</div>}
      </div>
      
      {error && <div className="form-error">{error}</div>}
      
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

// Navigation Bar
const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🎓 Donor Portal
      </div>
      <div className="navbar-menu">
        <button
          className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentPage('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-link ${currentPage === 'donate' ? 'active' : ''}`}
          onClick={() => setCurrentPage('donate')}
        >
          Donate
        </button>
        <button
          className={`nav-link ${currentPage === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentPage('history')}
        >
          History
        </button>
        <button
          className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentPage('profile')}
        >
          Profile
        </button>
        <span style={{color: '#666', marginLeft: '12px', marginRight: '8px'}}>
          {user?.name}
        </span>
        <button className="btn btn-sm btn-outline" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

// Dashboard Component
const Dashboard = ({ onNavigate, onDonate }) => {
  const { user } = useAuth();
  const [recentDonations, setRecentDonations] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    recipientsHelped: 0,
    totalBatches: 0,
    impactPoints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Fetch donation history
        const data = await window.getDonationHistory(user.id);
        const donations = data.donations || [];
        setRecentDonations(donations.slice(0, 5));
        
        // Calculate stats from donations
        const distributed = donations.filter(d => d.status === 'distributed').length;
        setStats({
          totalItems: donations.length,
          recipientsHelped: distributed,
          totalBatches: donations.length > 0 ? Math.ceil(donations.length / 3) : 0,
          impactPoints: donations.length * 10
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusBadge = (status) => {
    const badges = {
      distributed: { text: 'DISTRIBUTED', class: 'completed' },
      available: { text: 'AVAILABLE', class: 'pending' },
      reserved: { text: 'RESERVED', class: 'warning' }
    };
    return badges[status] || { text: status?.toUpperCase() || 'UNKNOWN', class: 'pending' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <button className="btn btn-primary" onClick={onDonate}>
          + Donate Items
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-value">{stats.totalItems}</div>
              <div className="stat-card-label">Total Items Donated</div>
            </div>
            <div className="stat-card-icon">📦</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-value">{stats.recipientsHelped}</div>
              <div className="stat-card-label">Items Distributed</div>
            </div>
            <div className="stat-card-icon">👥</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-value">{stats.totalBatches}</div>
              <div className="stat-card-label">Total Batches</div>
            </div>
            <div className="stat-card-icon">📋</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-value">{stats.impactPoints}</div>
              <div className="stat-card-label">Impact Points</div>
            </div>
            <div className="stat-card-icon">⭐</div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '24px'}}>
        <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 className="card-title">Recent Donations</h3>
          <button className="btn btn-sm btn-outline" onClick={onNavigate}>View All</button>
        </div>
        <div className="card-body" style={{padding: '0'}}>
          {loading ? (
            <div style={{padding: '24px', textAlign: 'center'}}>Loading...</div>
          ) : recentDonations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No donations yet</div>
              <div className="empty-state-message">Start making a difference by donating items!</div>
              <button className="btn btn-primary" style={{marginTop: '16px'}} onClick={onDonate}>
                Donate Now
              </button>
            </div>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '1px solid #e5e5e5', backgroundColor: '#f9f9f9'}}>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Item</th>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Category</th>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Date</th>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((donation) => {
                  const statusBadge = getStatusBadge(donation.status);
                  return (
                    <tr key={donation.id} style={{borderBottom: '1px solid #e5e5e5'}}>
                      <td style={{padding: '16px', fontWeight: '600'}}>{donation.items || donation.item_name}</td>
                      <td style={{padding: '16px'}}>{donation.category || 'General'}</td>
                      <td style={{padding: '16px'}}>{formatDate(donation.date)}</td>
                      <td style={{padding: '16px'}}>
                        <span className={`badge badge-${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// Donate Items Component
const DonateItems = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'books',
    subcategory: '',
    condition: 'good',
    size_info: '',
    description: '',
    estimated_value: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  // Categories must match database ENUM: 'clothes', 'books', 'electronics', 'toys', 'stationery', 'others'
  const categories = [
    { value: 'books', label: 'Books' },
    { value: 'stationery', label: 'Stationery' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothes', label: 'Clothing' },
    { value: 'toys', label: 'Toys' },
    { value: 'others', label: 'Other' }
  ];

  // Conditions must match database ENUM: 'excellent', 'good', 'fair', 'poor'
  const conditions = [
    { value: 'excellent', label: 'Excellent/New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user?.id) return;
      
      try {
        const data = await window.getDonationHistory(user.id);
        setDonations(data.donations || []);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoadingDonations(false);
      }
    };

    fetchDonations();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.item_name || !formData.category) {
      setError('Item name and category are required');
      return;
    }

    setLoading(true);
    try {
      await window.donateItem(user.id, {
        item_name: formData.item_name,
        category: formData.category,
        subcategory: formData.subcategory || null,
        condition_status: formData.condition,
        size_info: formData.size_info || null,
        description: formData.description || null,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null
      });

      setSuccess('Item donated successfully! Thank you for your contribution.');
      setFormData({
        item_name: '',
        category: 'books',
        subcategory: '',
        condition: 'good',
        size_info: '',
        description: '',
        estimated_value: ''
      });

      // Refresh donations list
      const data = await window.getDonationHistory(user.id);
      setDonations(data.donations || []);
    } catch (error) {
      setError(error.message || 'Failed to donate item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      distributed: { text: 'DISTRIBUTED', class: 'completed' },
      available: { text: 'AVAILABLE', class: 'pending' },
      reserved: { text: 'RESERVED', class: 'warning' }
    };
    return badges[status] || { text: status?.toUpperCase() || 'UNKNOWN', class: 'pending' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Donate Items</h1>
        <p className="dashboard-subtitle">Share your resources with those in need</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
        {/* Donation Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">New Donation</h3>
          </div>
          <div className="card-body">
            {success && (
              <div style={{padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '16px', border: '1px solid #c3e6cb'}}>
                {success}
              </div>
            )}
            {error && <div className="form-error" style={{marginBottom: '16px'}}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Physics Textbook, Winter Jacket"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subcategory</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Class 12, Science"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Condition</label>
                <select
                  className="form-control"
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                >
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Size Information</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Medium, 32, A4 size"
                  value={formData.size_info}
                  onChange={(e) => setFormData({...formData, size_info: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Describe the item..."
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Value (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g., 500"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData({...formData, estimated_value: e.target.value})}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Submitting...' : 'Donate Item'}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Donations</h3>
          </div>
          <div className="card-body" style={{padding: '0', maxHeight: '600px', overflowY: 'auto'}}>
            {loadingDonations ? (
              <div style={{padding: '24px', textAlign: 'center'}}>Loading...</div>
            ) : donations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-title">No donations yet</div>
                <div className="empty-state-message">Your donated items will appear here</div>
              </div>
            ) : (
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid #e5e5e5', backgroundColor: '#f9f9f9'}}>
                    <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Item</th>
                    <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Date</th>
                    <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => {
                    const statusBadge = getStatusBadge(donation.status);
                    return (
                      <tr key={donation.id} style={{borderBottom: '1px solid #e5e5e5'}}>
                        <td style={{padding: '12px 16px'}}>{donation.items || donation.item_name}</td>
                        <td style={{padding: '12px 16px'}}>{formatDate(donation.date)}</td>
                        <td style={{padding: '12px 16px'}}>
                          <span className={`badge badge-${statusBadge.class}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Donation History Component
const DonationHistory = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user?.id) return;
      
      try {
        const data = await window.getDonationHistory(user.id);
        setDonations(data.donations || []);
      } catch (error) {
        console.error('Error fetching donation history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [user]);

  const getStatusBadge = (status) => {
    const badges = {
      distributed: { text: 'DISTRIBUTED', class: 'completed' },
      available: { text: 'AVAILABLE', class: 'pending' },
      reserved: { text: 'RESERVED', class: 'warning' }
    };
    return badges[status] || { text: status?.toUpperCase() || 'UNKNOWN', class: 'pending' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredDonations = donations.filter(donation => {
    const matchesFilter = filter === 'all' || donation.status === filter;
    const matchesSearch = !searchQuery || 
      (donation.items || donation.item_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Donation History</h1>
        <p className="dashboard-subtitle">Track all your donations and their impact</p>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom: '24px'}}>
        <div className="card-body" style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by item name..."
            style={{maxWidth: '300px'}}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="form-control"
            style={{maxWidth: '200px'}}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="distributed">Distributed</option>
          </select>
          <span style={{color: '#666'}}>
            Showing {filteredDonations.length} of {donations.length} donations
          </span>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body" style={{padding: '0'}}>
          {loading ? (
            <div style={{padding: '24px', textAlign: 'center'}}>Loading...</div>
          ) : filteredDonations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No donations found</div>
              <div className="empty-state-message">
                {donations.length === 0 
                  ? 'Start making a difference by donating items!'
                  : 'No donations match your filter criteria'
                }
              </div>
            </div>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '1px solid #e5e5e5', backgroundColor: '#f9f9f9'}}>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>ID</th>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Item</th>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Category</th>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Date</th>
                  <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => {
                  const statusBadge = getStatusBadge(donation.status);
                  return (
                    <tr key={donation.id} style={{borderBottom: '1px solid #e5e5e5'}}>
                      <td style={{padding: '16px', color: '#666'}}>#{donation.id}</td>
                      <td style={{padding: '16px', fontWeight: '600'}}>{donation.items || donation.item_name}</td>
                      <td style={{padding: '16px'}}>{donation.category || 'General'}</td>
                      <td style={{padding: '16px'}}>{formatDate(donation.date)}</td>
                      <td style={{padding: '16px'}}>
                        <span className={`badge badge-${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// Profile Component
const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institution: user?.institution || '',
    address: user?.address || ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await window.getDonorProfile(user.id);
        setFormData({
          name: profile.full_name || user.name,
          email: profile.email || user.email,
          phone: profile.phone || '',
          institution: profile.institution || '',
          address: profile.address || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await window.updateDonorProfile(user.id, {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        address: formData.address
      });

      setUser({...user, name: formData.name, email: formData.email});
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Profile</h1>
        <p className="dashboard-subtitle">Manage your account settings</p>
      </div>
      
      <div className="card">
        <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 className="card-title">Personal Information</h3>
          {!editing ? (
            <button className="btn btn-sm btn-outline" onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : (
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="btn btn-sm btn-outline" onClick={() => setEditing(false)} disabled={loading}>
                Cancel
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        <div className="card-body">
          {success && (
            <div style={{padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '16px', border: '1px solid #c3e6cb'}}>
              {success}
            </div>
          )}
          {error && <div className="form-error" style={{marginBottom: '16px'}}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            {editing ? (
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            ) : (
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.name || 'Not set'}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            {editing ? (
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            ) : (
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.email || 'Not set'}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone</label>
            {editing ? (
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            ) : (
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.phone || 'Not set'}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Institution</label>
            {editing ? (
              <input
                type="text"
                className="form-control"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
              />
            ) : (
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.institution || 'Not set'}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Address</label>
            {editing ? (
              <textarea
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            ) : (
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.address || 'Not set'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="container">
        {currentPage === 'dashboard' && (
          <Dashboard 
            onNavigate={() => setCurrentPage('history')} 
            onDonate={() => setCurrentPage('donate')}
          />
        )}
        {currentPage === 'donate' && <DonateItems />}
        {currentPage === 'history' && <DonationHistory />}
        {currentPage === 'profile' && <ProfilePage />}
      </div>
    </div>
  );
};

// Render App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
