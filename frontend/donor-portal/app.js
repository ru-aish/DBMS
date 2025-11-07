import { login as apiLogin, getDonationHistory } from './api.js';

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

  const register = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      registrationDate: new Date().toISOString().split('T')[0],
      verificationStatus: "pending",
      level: "Bronze",
      points: 0
    };
    
    const userDataClean = { ...newUser };
    delete userDataClean.password;
    setUser(userDataClean);
    setIsAuthenticated(true);
    window.sessionUser = userDataClean;
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    window.sessionUser = null;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, setUser, setIsAuthenticated }}>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const data = await apiLogin(formData.email, formData.password);

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
      setError('Error connecting to server. Please try again.');
      console.error('Error:', error);
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
      
      <button type="submit" className="btn btn-primary btn-block">Login</button>
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
      try {
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            institution: formData.institution,
            year_class: formData.year_class,
            address: formData.address,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          onSuccess();
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        setError('Error connecting to server. Please try again.');
        console.error('Error:', error);
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
          className="form-control"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
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
      
      <button type="submit" className="btn btn-primary btn-block">Register</button>
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
        <button className="btn btn-sm btn-outline" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

// Dashboard Component
const Dashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [recentDonations, setRecentDonations] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await getDonationHistory(user.id);
        setRecentDonations(data.donations);
      } catch (error) {
        console.error('Error fetching donation history:', error);
      }
    };

    if (user && user.id) {
      fetchDonations();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const badges = {
      completed: { text: 'COMPLETED', class: 'completed' },
      pending: { text: 'PENDING', class: 'pending' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}! 👋</h1>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-value">0</div>
              <div className="stat-card-label">Total Items Donated</div>
            </div>
            <div className="stat-card-icon">📦</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-value">0</div>
              <div className="stat-card-label">Recipients Helped</div>
            </div>
            <div className="stat-card-icon">👥</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-value">0</div>
              <div className="stat-card-label">Total Batches</div>
            </div>
            <div className="stat-card-icon">📋</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-value">0</div>
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
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #e5e5e5', backgroundColor: '#f9f9f9'}}>
                <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Batch ID</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Items</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Date</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentDonations.map((donation) => {
                const statusBadge = getStatusBadge(donation.status);
                return (
                  <tr key={donation.id} style={{borderBottom: '1px solid #e5e5e5'}}>
                    <td style={{padding: '16px', fontWeight: '600'}}>{donation.id}</td>
                    <td style={{padding: '16px'}}>{donation.items} items</td>
                    <td style={{padding: '16px'}}>{donation.date}</td>
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
        </div>
      </div>
    </div>
  );
};

// Donation History Component
const DonationHistory = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Donation History</h1>
        <p className="dashboard-subtitle">Track all your donations and their impact</p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No donations yet</div>
            <div className="empty-state-message">Start making a difference by donating items!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Component
const ProfilePage = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    institution: user.institution,
    address: user.address
  });

  const handleSave = () => {
    Object.assign(user, formData);
    setEditing(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Profile</h1>
        <p className="dashboard-subtitle">Manage your account settings</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Personal Information</h3>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => editing ? handleSave() : setEditing(true)}
          >
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>
        <div className="card-body">
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
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.name}</div>
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
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.email}</div>
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
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.phone}</div>
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
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.institution}</div>
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
              <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>{formData.address}</div>
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
        {currentPage === 'dashboard' && <Dashboard onNavigate={() => setCurrentPage('history')} />}
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
