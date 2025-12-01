// Recipient Portal - React Application
const { useState, useContext, createContext, useEffect } = React;

// ============= MOCK DATA =============
const MOCK_DATA = {
  preLoginStats: {
    totalItemsAvailable: 487,
    activeDonors: 1250,
    recipientsHelped: 3200,
    partnerInstitutions: 156
  },

  testimonials: [
    {
      id: 1,
      message: "The laptop I received helped me complete my online classes during lockdown. Forever grateful to the donors!",
      author: "Rahul Kumar",
      role: "Class 12 Student"
    },
    {
      id: 2,
      message: "The textbooks and study materials changed my academic journey. Now I'm preparing for engineering entrance!",
      author: "Priya Singh",
      role: "College Student"
    },
    {
      id: 3,
      message: "Winter clothes for my children came at the perfect time. Thank you to all generous donors!",
      author: "Sunita Devi",
      role: "Parent/Guardian"
    }
  ]
};

// ============= AUTH CONTEXT =============
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

  const login = async (identifier) => {
    try {
      const response = await fetch('http://localhost:5000/api/recipient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier })
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.recipient_id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          registrationDate: data.registrationDate
        };
        setUser(userData);
        setIsAuthenticated(true);
        window.sessionUser = userData;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/recipient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: userData.name,
          guardian_name: userData.guardianName || 'Guardian',
          guardian_contact: userData.phone,
          address: userData.address || 'Not provided',
          application_letter: userData.needs || userData.applicationLetter || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = {
          id: data.recipient_id,
          name: userData.name,
          email: userData.phone,
          phone: userData.phone,
          registrationDate: new Date().toISOString().split('T')[0]
        };
        setUser(newUser);
        setIsAuthenticated(true);
        window.sessionUser = newUser;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    window.sessionUser = null;
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, isAuthenticated, login, register, logout } },
    children
  );
};

// ============= MAIN APP COMPONENT =============
function RecipientPortal() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [theme, setTheme] = useState('light');
  const { isAuthenticated, logout } = useContext(AuthContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!isAuthenticated) {
    if (currentPage === 'login') {
      return React.createElement(LoginPage, { setCurrentPage, toggleTheme, theme });
    }
    if (currentPage === 'register') {
      return React.createElement(RegisterPage, { setCurrentPage, toggleTheme, theme });
    }
    return React.createElement(LandingPage, { setCurrentPage, toggleTheme, theme });
  }

  return React.createElement(
    'div',
    { style: { display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' } },
    React.createElement(Sidebar, { currentPage, setCurrentPage, logout }),
    React.createElement(
      'main',
      { style: { flex: 1 } },
      React.createElement(Header, { toggleTheme, theme }),
      React.createElement(
        'div',
        { style: { padding: '24px' } },
        currentPage === 'dashboard' && React.createElement(Dashboard),
        currentPage === 'browse' && React.createElement(BrowseItems),
        currentPage === 'requests' && React.createElement(MyRequests),
        currentPage === 'received' && React.createElement(ReceivedItems),
        currentPage === 'profile' && React.createElement(ProfileSettings)
      )
    )
  );
}

// ============= LANDING PAGE =============
function LandingPage({ setCurrentPage, toggleTheme, theme }) {
  const [stats, setStats] = useState({ totalItemsAvailable: 0, activeDonors: 0, recipientsHelped: 0, partnerInstitutions: 0 });
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, testimonialsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/public/stats'),
          fetch('http://localhost:5000/api/public/testimonials')
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        if (testimonialsResponse.ok) {
          const testimonialsData = await testimonialsResponse.json();
          setTestimonials(testimonialsData.testimonials);
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return React.createElement(
    'div',
    { className: 'landing-page', style: { minHeight: '100vh', backgroundColor: 'var(--color-background)' } },
    React.createElement(
      'header',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' } },
      React.createElement('h1', { style: { margin: 0, color: 'var(--color-primary)' } }, 'Recipient Portal'),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '12px' } },
        React.createElement('button', { className: 'btn btn--secondary', onClick: toggleTheme }, theme === 'light' ? '🌙 Dark' : '☀️ Light'),
        React.createElement('button', { className: 'btn btn--primary', onClick: () => setCurrentPage('login') }, 'Login')
      )
    ),
    React.createElement(
      'div',
      { style: { padding: '60px 24px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' } },
      React.createElement('h2', { style: { fontSize: '48px', marginBottom: '16px' } }, 'Access Resources That Change Lives'),
      React.createElement('p', { style: { fontSize: '18px', color: 'var(--color-text-secondary)', marginBottom: '40px' } }, 'Request items donated by generous donors and improve your life'),
      React.createElement(
        'div',
        { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', margin: '40px 0' } },
        React.createElement(
          'div',
          { className: 'card', style: { textAlign: 'center', padding: '24px' } },
          React.createElement('h3', { style: { fontSize: '32px', margin: '0 0 8px 0' } }, stats.totalItemsAvailable),
          React.createElement('p', { style: { color: 'var(--color-text-secondary)' } }, 'Items Available')
        ),
        React.createElement(
          'div',
          { className: 'card', style: { textAlign: 'center', padding: '24px' } },
          React.createElement('h3', { style: { fontSize: '32px', margin: '0 0 8px 0' } }, stats.activeDonors),
          React.createElement('p', { style: { color: 'var(--color-text-secondary)' } }, 'Active Donors')
        ),
        React.createElement(
          'div',
          { className: 'card', style: { textAlign: 'center', padding: '24px' } },
          React.createElement('h3', { style: { fontSize: '32px', margin: '0 0 8px 0' } }, stats.recipientsHelped),
          React.createElement('p', { style: { color: 'var(--color-text-secondary)' } }, 'Recipients Helped')
        ),
        React.createElement(
          'div',
          { className: 'card', style: { textAlign: 'center', padding: '24px' } },
          React.createElement('h3', { style: { fontSize: '32px', margin: '0 0 8px 0' } }, stats.partnerInstitutions),
          React.createElement('p', { style: { color: 'var(--color-text-secondary)' } }, 'Partner Institutions')
        )
      ),
      React.createElement(
        'div',
        { style: { margin: '40px 0' } },
        React.createElement('h3', { style: { fontSize: '28px', marginBottom: '24px' } }, 'Success Stories'),
        React.createElement(
          'div',
          { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' } },
          testimonials.map(testimonial =>
            React.createElement(
              'div',
              { key: testimonial.id, className: 'card', style: { padding: '24px', textAlign: 'left' } },
              React.createElement('p', { style: { fontStyle: 'italic', marginBottom: '16px' } }, `"${testimonial.message}"`),
              React.createElement('p', { style: { fontWeight: 'bold', margin: '0 0 4px 0' } }, testimonial.author),
              React.createElement('p', { style: { color: 'var(--color-text-secondary)', margin: 0 } }, testimonial.role)
            )
          )
        )
      ),
      React.createElement(
        'div',
        { style: { margin: '40px 0' } },
        React.createElement('button', { className: 'btn btn--primary btn--lg', onClick: () => setCurrentPage('register'), style: { marginRight: '12px' } }, 'Request Resources'),
        React.createElement('button', { className: 'btn btn--secondary btn--lg', onClick: () => setCurrentPage('login') }, 'Login')
      )
    )
  );
}

// ============= LOGIN PAGE =============
function LoginPage({ setCurrentPage, toggleTheme, theme }) {
  const [recipientCode, setRecipientCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!recipientCode) {
      setError('Recipient Code is required');
      return;
    }
    setLoading(true);
    setError('');
    const success = await login(recipientCode);
    setLoading(false);
    if (success) {
      setCurrentPage('dashboard');
    } else {
      setError('Invalid recipient code or account not approved yet.');
    }
  };

  return React.createElement(
    'div',
    { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)', padding: '24px' } },
    React.createElement(
      'div',
      { style: { maxWidth: '400px', width: '100%' } },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
        React.createElement('h1', { style: { margin: 0, fontSize: '28px', color: 'var(--color-primary)' } }, 'Recipient Login'),
        React.createElement('button', { className: 'btn btn--secondary', onClick: toggleTheme }, theme === 'light' ? '🌙' : '☀️')
      ),
      React.createElement(
        'div',
        { className: 'card', style: { padding: '32px' } },
        React.createElement(
          'form',
          { onSubmit: handleLogin },
          error && React.createElement('div', { style: { color: 'var(--color-error)', marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(192, 21, 47, 0.1)', borderRadius: '6px' } }, error),
          React.createElement(
            'div',
            { style: { marginBottom: '24px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Recipient Code'),
            React.createElement('input', { 
              type: 'text', 
              className: 'form-control', 
              value: recipientCode, 
              onChange: (e) => setRecipientCode(e.target.value.toUpperCase()), 
              placeholder: 'Enter your recipient code (e.g., RCP123456)',
              style: { fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px' }
            }),
            React.createElement('p', { style: { fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' } }, 
              'The code you received after admin approval'
            )
          ),
          React.createElement('button', { 
            type: 'submit', 
            className: 'btn btn--primary btn--full-width', 
            style: { marginBottom: '16px' },
            disabled: loading
          }, loading ? 'Logging in...' : 'Login'),
          React.createElement(
            'p',
            { style: { textAlign: 'center', color: 'var(--color-text-secondary)' } },
            'Don\'t have an account? ',
            React.createElement('button', { type: 'button', className: 'btn btn--outline', style: { padding: 0, border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }, onClick: () => setCurrentPage('register') }, 'Register here')
          )
        )
      ),
      React.createElement(
        'div',
        { style: { textAlign: 'center', marginTop: '16px' } },
        React.createElement('button', { 
          type: 'button', 
          className: 'btn btn--outline', 
          onClick: () => setCurrentPage('landing'),
          style: { fontSize: '13px' }
        }, '← Back to Home')
      )
    )
  );
}

// ============= REGISTER PAGE =============
function RegisterPage({ setCurrentPage, toggleTheme, theme }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    organizationName: '', 
    contactPerson: '', 
    phone: '', 
    email: '', 
    address: '',
    applicationLetter: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.txt')) {
        setErrors(prev => ({ ...prev, applicationLetter: 'Only .txt files are allowed' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, applicationLetter: event.target.result }));
        setErrors(prev => ({ ...prev, applicationLetter: '' }));
      };
      reader.readAsText(file);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.organizationName || formData.organizationName.length < 3) newErrors.organizationName = 'Organization name must be at least 3 characters';
    if (!formData.contactPerson || formData.contactPerson.length < 3) newErrors.contactPerson = 'Contact person name is required';
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone.replace(/[\s\-\+]/g, '').slice(-10))) newErrors.phone = 'Valid 10-digit phone is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.address || formData.address.length < 10) newErrors.address = 'Address must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('http://localhost:5000/api/recipient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.organizationName,
          guardian_name: formData.contactPerson,
          guardian_contact: formData.phone.replace(/[\s\-\+]/g, '').slice(-10),
          address: formData.address,
          application_letter: formData.applicationLetter || null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubmitSuccess(true);
      } else {
        setErrors({ submit: data.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitSuccess) {
    return React.createElement(
      'div',
      { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)', padding: '24px' } },
      React.createElement(
        'div',
        { className: 'card', style: { maxWidth: '450px', width: '100%', padding: '48px 32px', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: '64px', marginBottom: '24px' } }, '✅'),
        React.createElement('h1', { style: { margin: '0 0 16px 0', color: '#22c55e' } }, 'Application Submitted!'),
        React.createElement('p', { style: { color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' } }, 
          'Your community application has been submitted successfully. An administrator will review your application and contact you once approved.'
        ),
        React.createElement('p', { style: { color: 'var(--color-text-secondary)', marginBottom: '32px', fontSize: '14px' } }, 
          'Upon approval, you will receive a unique Recipient Code that you can use to login and request resources.'
        ),
        React.createElement('button', { 
          className: 'btn btn--primary', 
          onClick: () => setCurrentPage('login'),
          style: { padding: '12px 32px' }
        }, 'Go to Login →')
      )
    );
  }

  return React.createElement(
    'div',
    { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)', padding: '24px' } },
    React.createElement(
      'div',
      { style: { maxWidth: '500px', width: '100%' } },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
        React.createElement('h1', { style: { margin: 0, fontSize: '24px', color: 'var(--color-primary)' } }, 
          step === 1 ? 'Register Your Community' : 'Application Letter'
        ),
        React.createElement('button', { className: 'btn btn--secondary', onClick: toggleTheme, style: { padding: '8px' } }, theme === 'light' ? '🌙' : '☀️')
      ),
      
      // Step indicator
      React.createElement(
        'div',
        { style: { display: 'flex', marginBottom: '24px', gap: '8px' } },
        React.createElement('div', { style: { flex: 1, height: '4px', borderRadius: '2px', backgroundColor: 'var(--color-primary)' } }),
        React.createElement('div', { style: { flex: 1, height: '4px', borderRadius: '2px', backgroundColor: step === 2 ? 'var(--color-primary)' : 'var(--color-card-border)' } })
      ),

      React.createElement(
        'div',
        { className: 'card', style: { padding: '32px' } },
        
        errors.submit && React.createElement('div', { 
          style: { color: '#dc2626', marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' } 
        }, errors.submit),

        // Step 1: Basic Information
        step === 1 && React.createElement(
          'form',
          { onSubmit: handleNext },
          React.createElement(
            'div',
            { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Organization Name *'),
            React.createElement('input', { 
              type: 'text', name: 'organizationName', className: 'form-control', 
              value: formData.organizationName, onChange: handleChange, 
              placeholder: 'e.g., Sunshine Orphanage, ABC School' 
            }),
            errors.organizationName && React.createElement('p', { style: { color: '#dc2626', fontSize: '12px', marginTop: '4px' } }, errors.organizationName)
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Contact Person Name *'),
            React.createElement('input', { 
              type: 'text', name: 'contactPerson', className: 'form-control', 
              value: formData.contactPerson, onChange: handleChange, 
              placeholder: 'Name of authorized representative' 
            }),
            errors.contactPerson && React.createElement('p', { style: { color: '#dc2626', fontSize: '12px', marginTop: '4px' } }, errors.contactPerson)
          ),
          React.createElement(
            'div',
            { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' } },
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Phone *'),
              React.createElement('input', { 
                type: 'tel', name: 'phone', className: 'form-control', 
                value: formData.phone, onChange: handleChange, 
                placeholder: '9876543210' 
              }),
              errors.phone && React.createElement('p', { style: { color: '#dc2626', fontSize: '12px', marginTop: '4px' } }, errors.phone)
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Email (Optional)'),
              React.createElement('input', { 
                type: 'email', name: 'email', className: 'form-control', 
                value: formData.email, onChange: handleChange, 
                placeholder: 'email@org.com' 
              }),
              errors.email && React.createElement('p', { style: { color: '#dc2626', fontSize: '12px', marginTop: '4px' } }, errors.email)
            )
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '24px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Address *'),
            React.createElement('textarea', { 
              name: 'address', className: 'form-control', 
              value: formData.address, onChange: handleChange, 
              placeholder: 'Full address with city, state, and pin code',
              style: { minHeight: '80px', resize: 'vertical' }
            }),
            errors.address && React.createElement('p', { style: { color: '#dc2626', fontSize: '12px', marginTop: '4px' } }, errors.address)
          ),
          React.createElement('button', { 
            type: 'submit', className: 'btn btn--primary btn--full-width', 
            style: { marginBottom: '16px', padding: '12px' } 
          }, 'Next →'),
          React.createElement(
            'p',
            { style: { textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' } },
            'Already registered? ',
            React.createElement('button', { 
              type: 'button', 
              style: { padding: 0, border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }, 
              onClick: () => setCurrentPage('login') 
            }, 'Login here')
          )
        ),

        // Step 2: Application Letter
        step === 2 && React.createElement(
          'form',
          { onSubmit: handleSubmit },
          React.createElement('p', { style: { marginBottom: '16px', color: 'var(--color-text-secondary)', fontSize: '14px' } }, 
            'Write an application explaining why your organization needs resources. This helps us understand your needs better. (Optional)'
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Application Letter'),
            React.createElement('textarea', { 
              name: 'applicationLetter', className: 'form-control', 
              value: formData.applicationLetter, onChange: handleChange, 
              placeholder: 'Dear Sir/Madam,\n\nWe are writing on behalf of [Organization Name] to request resources for our beneficiaries...\n\nOur organization serves [X] children/people who...\n\nWe would greatly appreciate support in the form of...\n\nThank you for your consideration.\n\nRegards,\n[Your Name]',
              style: { minHeight: '250px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }
            }),
            React.createElement('p', { style: { fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' } }, 
              formData.applicationLetter.length > 0 ? `${formData.applicationLetter.length} characters` : 'Optional - you can skip this'
            ),
            errors.applicationLetter && React.createElement('p', { style: { color: '#dc2626', fontSize: '12px', marginTop: '4px' } }, errors.applicationLetter)
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px dashed var(--color-card-border)' } },
            React.createElement('p', { style: { margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' } }, 'OR Upload a .txt file:'),
            React.createElement('input', { 
              type: 'file', 
              accept: '.txt',
              onChange: handleFileUpload,
              style: { fontSize: '14px' }
            })
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '12px' } },
            React.createElement('button', { 
              type: 'button', className: 'btn btn--secondary', 
              onClick: handleBack, 
              style: { flex: 1, padding: '12px' } 
            }, '← Back'),
            React.createElement('button', { 
              type: 'submit', className: 'btn btn--primary', 
              disabled: loading,
              style: { flex: 2, padding: '12px' } 
            }, loading ? 'Submitting...' : 'Submit Application')
          )
        )
      ),
      
      React.createElement(
        'div',
        { style: { textAlign: 'center', marginTop: '16px' } },
        React.createElement('button', { 
          type: 'button', 
          style: { padding: 0, border: 'none', background: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '13px' }, 
          onClick: () => setCurrentPage('landing')
        }, '← Back to Home')
      )
    )
  );
}

// ============= DASHBOARD =============
function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ itemsReceived: 0, availableItems: 0, totalValue: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsResponse, requestsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/recipient/${user.id}/dashboard`),
          fetch(`http://localhost:5000/api/recipient/${user.id}/requests`)
        ]);

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats({
            itemsReceived: data.stats.itemsReceived || 0,
            availableItems: data.stats.availableItems || 0,
            totalValue: data.stats.totalValue || 0
          });
        }

        if (requestsResponse.ok) {
          const data = await requestsResponse.json();
          setRecentRequests((data.requests || []).slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user.id]);

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '48px' } }, 'Loading...');
  }

  const getStatusBadgeStyle = (status) => {
    const baseStyle = { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' };
    switch(status) {
      case 'approved': return { ...baseStyle, backgroundColor: '#D1FAE5', color: '#065F46' };
      case 'pending': return { ...baseStyle, backgroundColor: '#FEF3C7', color: '#92400E' };
      case 'rejected': return { ...baseStyle, backgroundColor: '#FEE2E2', color: '#991B1B' };
      default: return { ...baseStyle, backgroundColor: '#F3F4F6', color: '#1F2937' };
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'approved': return 'Received';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return React.createElement(
    'div',
    { style: { maxWidth: '1200px', margin: '0 auto' } },
    React.createElement('h1', { style: { marginBottom: '24px' } }, `Welcome back, ${user.name}!`),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' } },
      React.createElement(
        'div',
        { className: 'card', style: { padding: '24px', textAlign: 'center' } },
        React.createElement('h3', { style: { fontSize: '32px', margin: '0 0 8px 0', color: '#22c55e' } }, stats.itemsReceived),
        React.createElement('p', { style: { color: 'var(--color-text-secondary)', margin: 0 } }, 'Items Received')
      ),
      React.createElement(
        'div',
        { className: 'card', style: { padding: '24px', textAlign: 'center' } },
        React.createElement('h3', { style: { fontSize: '32px', margin: '0 0 8px 0', color: 'var(--color-primary)' } }, stats.availableItems),
        React.createElement('p', { style: { color: 'var(--color-text-secondary)', margin: 0 } }, 'Items Available')
      ),
       React.createElement(
         'div',
         { className: 'card', style: { padding: '24px', textAlign: 'center' } },
         React.createElement('h3', { style: { fontSize: '32px', margin: '0 0 8px 0', color: 'var(--color-primary)' } }, `₹${parseFloat(stats.totalValue).toFixed(2)}`),
         React.createElement('p', { style: { color: 'var(--color-text-secondary)', margin: 0 } }, 'Total Value Received')
       )
    ),
    React.createElement(
      'div',
      { className: 'card', style: { padding: '24px' } },
      React.createElement('h2', { style: { marginBottom: '16px', fontSize: '20px', fontWeight: '600' } }, 'Your Request History'),
      recentRequests.length > 0 ? React.createElement(
        'div',
        { style: { overflowX: 'auto' } },
        React.createElement(
          'table',
          { style: { width: '100%', borderCollapse: 'collapse' } },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              { style: { borderBottom: '2px solid var(--color-card-border)' } },
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-secondary)', fontSize: '14px' } }, 'Item Name'),
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-secondary)', fontSize: '14px' } }, 'Category'),
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-secondary)', fontSize: '14px' } }, 'Request Date'),
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-secondary)', fontSize: '14px' } }, 'Status')
            )
          ),
          React.createElement(
            'tbody',
            null,
            recentRequests.map(req => React.createElement(
              'tr',
              { key: req.request_id, style: { borderBottom: '1px solid var(--color-card-border)' } },
              React.createElement('td', { style: { padding: '12px', fontSize: '14px' } }, req.item_name),
              React.createElement('td', { style: { padding: '12px', fontSize: '14px' } }, req.category),
              React.createElement('td', { style: { padding: '12px', fontSize: '14px' } }, new Date(req.request_date).toLocaleDateString()),
              React.createElement('td', { style: { padding: '12px' } }, 
                React.createElement('span', { style: getStatusBadgeStyle(req.request_status) }, getStatusLabel(req.request_status))
              )
            ))
          )
        )
      ) : React.createElement(
        'p',
        { style: { textAlign: 'center', color: 'var(--color-text-secondary)', padding: '32px' } },
        'No requests yet. Browse available items to make your first request!'
      )
    )
  );
}

// ============= BROWSE ITEMS =============
function BrowseItems() {
  const { user } = useContext(AuthContext);
  const [filters, setFilters] = useState({ category: '', condition: '', search: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/items/available');
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    (!filters.category || item.category === filters.category) &&
    (!filters.condition || item.condition_status === filters.condition) &&
    (!filters.search || item.item_name.toLowerCase().includes(filters.search.toLowerCase()))
  );

  const handleRequestItem = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setShowModal(true);
  };

  const handleSubmitRequest = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recipient/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: user.id,
          item_id: selectedItem.item_id,
          quantity: quantity
        })
      });
      if (response.ok) {
        setShowModal(false);
        alert('Request submitted successfully!');
        // Refresh items list to show updated availability
        const itemsResponse = await fetch('http://localhost:5000/api/items/available');
        if (itemsResponse.ok) {
          const data = await itemsResponse.json();
          setItems(data.items || []);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request');
    }
  };

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '48px' } }, 'Loading...');
  }

  return React.createElement(
    'div',
    { style: { maxWidth: '1200px', margin: '0 auto' } },
    React.createElement('h1', { style: { marginBottom: '24px' } }, 'Browse Available Items'),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' } },
      React.createElement(
        'div',
        null,
        React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Category'),
        React.createElement(
          'select',
          { className: 'form-control', value: filters.category, onChange: (e) => setFilters({ ...filters, category: e.target.value }) },
          React.createElement('option', { value: '' }, 'All Categories'),
          React.createElement('option', { value: 'Books' }, 'Books'),
          React.createElement('option', { value: 'Electronics' }, 'Electronics'),
          React.createElement('option', { value: 'Clothes' }, 'Clothes'),
          React.createElement('option', { value: 'Stationery' }, 'Stationery'),
          React.createElement('option', { value: 'Accessories' }, 'Accessories')
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Condition'),
        React.createElement(
          'select',
          { className: 'form-control', value: filters.condition, onChange: (e) => setFilters({ ...filters, condition: e.target.value }) },
          React.createElement('option', { value: '' }, 'All Conditions'),
          React.createElement('option', { value: 'New' }, 'New'),
          React.createElement('option', { value: 'Excellent' }, 'Excellent'),
          React.createElement('option', { value: 'Good' }, 'Good'),
          React.createElement('option', { value: 'Fair' }, 'Fair')
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Search'),
        React.createElement('input', { type: 'text', className: 'form-control', placeholder: 'Search items...', value: filters.search, onChange: (e) => setFilters({ ...filters, search: e.target.value }) })
      )
    ),
    filteredItems.length > 0 ? React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' } },
      filteredItems.map(item =>
        React.createElement(
          'div',
          { key: item.item_id, className: 'card', style: { padding: '20px' } },
          React.createElement('h3', { style: { margin: '0 0 8px 0', fontSize: '18px' } }, item.item_name),
          React.createElement('p', { style: { color: 'var(--color-text-secondary)', fontSize: '14px' } }, `Category: ${item.category}`),
          React.createElement('p', { style: { color: 'var(--color-text-secondary)', fontSize: '14px' } }, `Condition: ${item.condition_status}`),
          React.createElement('p', { style: { color: 'var(--color-text-secondary)', fontSize: '14px' } }, `Value: ₹${item.estimated_value}`),
          React.createElement('p', { style: { color: 'var(--color-text-secondary)', fontSize: '12px' } }, `Donor: ${item.donor_name || 'Anonymous'}`),
          React.createElement('button', { className: 'btn btn--primary btn--full-width', style: { marginTop: '12px' }, onClick: () => handleRequestItem(item) }, 'Request Item')
        )
      )
    ) : React.createElement(
      'div',
      { className: 'card', style: { padding: '48px', textAlign: 'center' } },
      React.createElement('h2', { style: { marginBottom: '16px', color: 'var(--color-text-secondary)' } }, 'No Items Available'),
      React.createElement('p', { style: { color: 'var(--color-text-secondary)' } }, 'There are currently no items matching your filters. Please check back later or try adjusting your filters.')
    ),
    showModal && React.createElement(
      'div',
      { className: 'modal-overlay', onClick: () => setShowModal(false) },
      React.createElement(
        'div',
        { className: 'modal', onClick: (e) => e.stopPropagation() },
        React.createElement(
          'div',
          { className: 'modal-header' },
          React.createElement('h2', { className: 'modal-title' }, 'Request Item'),
          React.createElement('button', { className: 'modal-close', onClick: () => setShowModal(false) }, '×')
        ),
        React.createElement(
          'div',
          { className: 'modal-body' },
          React.createElement(
            'div',
            { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Item Name'),
            React.createElement('input', { type: 'text', className: 'form-control', value: selectedItem.item_name, disabled: true })
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Category'),
            React.createElement('input', { type: 'text', className: 'form-control', value: selectedItem.category, disabled: true })
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Quantity Required'),
            React.createElement('input', { type: 'number', className: 'form-control', value: quantity, onChange: (e) => setQuantity(Math.min(selectedItem.quantity, Math.max(1, parseInt(e.target.value) || 1))), min: 1, max: selectedItem.quantity })
          )
        ),
        React.createElement(
          'div',
          { className: 'modal-footer' },
          React.createElement('button', { className: 'btn btn--secondary', onClick: () => setShowModal(false) }, 'Cancel'),
          React.createElement('button', { className: 'btn btn--primary', onClick: handleSubmitRequest }, 'Submit Request')
        )
      )
    )
  );
}

// ============= MY REQUESTS =============
function MyRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipient/${user.id}/requests`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user.id]);

  const handleCancelRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipient/request/${requestId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Request cancelled');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '48px' } }, 'Loading...');
  }

  return React.createElement(
    'div',
    { style: { maxWidth: '1200px', margin: '0 auto' } },
    React.createElement('h1', { style: { marginBottom: '24px' } }, 'My Requests'),
    requests.length > 0 ? React.createElement(
      'div',
      { style: { overflowX: 'auto' } },
      React.createElement(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { style: { borderBottom: '1px solid var(--color-card-border)' } },
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Request ID'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Item Name'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Quantity'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Requested Date'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Status'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Actions')
          )
        ),
        React.createElement(
          'tbody',
          null,
          requests.map(request =>
            React.createElement(
              'tr',
              { key: request.request_id, style: { borderBottom: '1px solid var(--color-card-border)' } },
              React.createElement('td', { style: { padding: '12px' } }, request.request_id),
              React.createElement('td', { style: { padding: '12px' } }, request.item_name),
              React.createElement('td', { style: { padding: '12px' } }, request.quantity_requested || 1),
              React.createElement('td', { style: { padding: '12px' } }, new Date(request.request_date).toLocaleDateString()),
              React.createElement('td', { style: { padding: '12px' } },
                React.createElement(
                  'span',
                  { style: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                      backgroundColor: request.request_status === 'pending' ? 'rgba(251, 191, 36, 0.1)' :
                        request.request_status === 'approved' ? 'rgba(16, 185, 129, 0.1)' :
                        request.request_status === 'fulfilled' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(192, 21, 47, 0.1)',
                      color: request.request_status === 'pending' ? '#d97706' :
                        request.request_status === 'approved' ? '#059669' :
                        request.request_status === 'fulfilled' ? '#2563eb' : '#dc2626'
                    } },
                  request.request_status.charAt(0).toUpperCase() + request.request_status.slice(1)
                )
              ),
              React.createElement(
                'td',
                { style: { padding: '12px' } },
                request.request_status === 'pending' && React.createElement('button', { className: 'btn btn--sm btn--secondary', onClick: () => handleCancelRequest(request.request_id) }, 'Cancel')
              )
            )
          )
        )
      )
    ) : React.createElement(
      'div',
      { className: 'card', style: { padding: '48px', textAlign: 'center' } },
      React.createElement('h2', { style: { marginBottom: '16px', color: 'var(--color-text-secondary)' } }, 'No Requests Yet'),
      React.createElement('p', { style: { color: 'var(--color-text-secondary)' } }, 'You haven\'t made any item requests yet. Browse available items to get started!')
    )
  );
}

// ============= RECEIVED ITEMS =============
function ReceivedItems() {
  const { user } = useContext(AuthContext);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingItem, setRatingItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchDistributions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipient/${user.id}/distributions`);
      if (response.ok) {
        const data = await response.json();
        setDistributions(data.distributions || []);
      }
    } catch (error) {
      console.error('Error fetching distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, [user.id]);

  const handleSubmitRating = async () => {
    if (ratingItem) {
      try {
        const response = await fetch(`http://localhost:5000/api/recipient/distribution/${ratingItem.distribution_id}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, feedback })
        });
        if (response.ok) {
          setShowModal(false);
          alert('Rating submitted!');
          fetchDistributions();
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
      }
    }
  };

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '48px' } }, 'Loading...');
  }

  return React.createElement(
    'div',
    { style: { maxWidth: '1200px', margin: '0 auto' } },
    React.createElement('h1', { style: { marginBottom: '24px' } }, 'Received Items'),
    distributions.length > 0 ? React.createElement(
      'div',
      { style: { overflowX: 'auto' } },
      React.createElement(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { style: { borderBottom: '1px solid var(--color-card-border)' } },
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Distribution ID'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Item Name'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Received Date'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Quantity'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Rating'),
            React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: '600' } }, 'Action')
          )
        ),
        React.createElement(
          'tbody',
          null,
          distributions.map(item =>
            React.createElement(
              'tr',
              { key: item.distribution_id, style: { borderBottom: '1px solid var(--color-card-border)' } },
              React.createElement('td', { style: { padding: '12px' } }, item.distribution_id),
              React.createElement('td', { style: { padding: '12px' } }, item.item_name),
              React.createElement('td', { style: { padding: '12px' } }, new Date(item.distribution_date).toLocaleDateString()),
              React.createElement('td', { style: { padding: '12px' } }, item.quantity),
              React.createElement('td', { style: { padding: '12px' } },
                item.rating ? React.createElement('span', null, '⭐ '.repeat(item.rating)) : React.createElement('span', { style: { color: 'var(--color-text-secondary)' } }, 'Not rated')
              ),
              React.createElement('td', { style: { padding: '12px' } },
                !item.rating && React.createElement('button', { className: 'btn btn--sm btn--primary', onClick: () => { setRatingItem(item); setRating(5); setFeedback(''); setShowModal(true); } }, 'Rate')
              )
            )
          )
        )
      )
    ) : React.createElement(
      'div',
      { className: 'card', style: { padding: '48px', textAlign: 'center' } },
      React.createElement('h2', { style: { marginBottom: '16px', color: 'var(--color-text-secondary)' } }, 'No Items Received Yet'),
      React.createElement('p', { style: { color: 'var(--color-text-secondary)' } }, 'You haven\'t received any items yet. Once your requests are approved and items are distributed, they will appear here.')
    ),
    showModal && React.createElement(
      'div',
      { className: 'modal-overlay', onClick: () => setShowModal(false) },
      React.createElement(
        'div',
        { className: 'modal', onClick: (e) => e.stopPropagation() },
        React.createElement(
          'div',
          { className: 'modal-header' },
          React.createElement('h2', { className: 'modal-title' }, 'Rate Item'),
          React.createElement('button', { className: 'modal-close', onClick: () => setShowModal(false) }, '×')
        ),
        React.createElement(
          'div',
          { className: 'modal-body' },
          React.createElement('p', { style: { marginBottom: '16px' } }, `Item: ${ratingItem?.item_name}`),
          React.createElement(
            'div',
            { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Rating'),
            React.createElement(
              'div',
              { style: { display: 'flex', gap: '8px' } },
              [1, 2, 3, 4, 5].map(star =>
                React.createElement('button', {
                  key: star,
                  style: {
                    fontSize: '32px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    opacity: star <= rating ? 1 : 0.3,
                    transition: 'opacity 0.2s'
                  },
                  onClick: () => setRating(star)
                }, '⭐')
              )
            )
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Feedback'),
            React.createElement('textarea', { className: 'form-control', value: feedback, onChange: (e) => setFeedback(e.target.value), placeholder: 'Share your experience...', style: { minHeight: '100px' } })
          )
        ),
        React.createElement(
          'div',
          { className: 'modal-footer' },
          React.createElement('button', { className: 'btn btn--secondary', onClick: () => setShowModal(false) }, 'Cancel'),
          React.createElement('button', { className: 'btn btn--primary', onClick: handleSubmitRating }, 'Submit Rating')
        )
      )
    )
  );
}

// ============= PROFILE SETTINGS =============
function ProfileSettings() {
  const { user, logout } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email, phone: user.phone });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipient/${user.id}/profile`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFormData({
            name: data.full_name,
            email: data.phone,
            phone: data.guardian_contact
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipient/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          guardian_contact: formData.phone
        })
      });
      if (response.ok) {
        Object.assign(user, { name: formData.name, phone: formData.phone });
        window.sessionUser = user;
        setEditMode(false);
        alert('Profile updated!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '48px' } }, 'Loading...');
  }

  return React.createElement(
    'div',
    { style: { maxWidth: '600px', margin: '0 auto' } },
    React.createElement('h1', { style: { marginBottom: '24px' } }, 'Profile Settings'),
    React.createElement(
      'div',
      { className: 'card', style: { padding: '24px', marginBottom: '24px' } },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-card-border)' } },
        React.createElement('h2', { style: { margin: 0 } }, 'Personal Information'),
        React.createElement('button', { className: 'btn btn--secondary', onClick: () => setEditMode(!editMode) }, editMode ? 'Cancel' : 'Edit')
      ),
      editMode ? React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Name'),
          React.createElement('input', { type: 'text', className: 'form-control', value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) })
        ),
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Guardian Contact'),
          React.createElement('input', { type: 'tel', className: 'form-control', value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }) })
        ),
        React.createElement('button', { className: 'btn btn--primary btn--full-width', onClick: handleSave }, 'Save Changes')
      ) : React.createElement(
        React.Fragment,
        null,
        React.createElement('p', { style: { marginBottom: '12px' } }, React.createElement('strong', null, 'Name: '), profile?.full_name),
        React.createElement('p', { style: { marginBottom: '12px' } }, React.createElement('strong', null, 'Age: '), profile?.age),
        React.createElement('p', { style: { marginBottom: '12px' } }, React.createElement('strong', null, 'Gender: '), profile?.gender),
        React.createElement('p', { style: { marginBottom: '12px' } }, React.createElement('strong', null, 'Guardian: '), profile?.guardian_name),
        React.createElement('p', { style: { marginBottom: '12px' } }, React.createElement('strong', null, 'Guardian Contact: '), profile?.guardian_contact),
        React.createElement('p', { style: { marginBottom: '12px' } }, React.createElement('strong', null, 'Address: '), profile?.address),
        React.createElement('p', null, React.createElement('strong', null, 'Registration Date: '), profile ? new Date(profile.registration_date).toLocaleDateString() : '')
      )
    ),
    React.createElement(
      'div',
      { style: { textAlign: 'center' } },
      React.createElement('button', { className: 'btn btn--secondary btn--lg', onClick: logout }, 'Logout')
    )
  );
}

// ============= SIDEBAR COMPONENT =============
function Sidebar({ currentPage, setCurrentPage, logout }) {
  return React.createElement(
    'aside',
    { style: { width: '280px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-card-border)', padding: '24px', overflowY: 'auto', maxHeight: '100vh' } },
    React.createElement('h2', { style: { margin: '0 0 24px 0', fontSize: '20px', color: 'var(--color-primary)' } }, 'Menu'),
    React.createElement(
      'nav',
      { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      ['dashboard', 'browse', 'requests', 'received', 'profile'].map(page =>
        React.createElement(
          'button',
          {
            key: page,
            className: 'btn btn--secondary',
            style: {
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: currentPage === page ? 'var(--color-primary)' : 'transparent',
              color: currentPage === page ? 'white' : 'var(--color-text)'
            },
            onClick: () => setCurrentPage(page)
          },
          page === 'dashboard' && '📊 Dashboard',
          page === 'browse' && '🛍️ Browse Items',
          page === 'requests' && '📝 My Requests',
          page === 'received' && '📦 Received Items',
          page === 'profile' && '⚙️ Profile'
        )
      )
    )
  );
}

// ============= HEADER COMPONENT =============
function Header({ toggleTheme, theme }) {
  return React.createElement(
    'header',
    { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--color-card-border)', backgroundColor: 'var(--color-surface)' } },
    React.createElement('h1', { style: { margin: 0, fontSize: '24px', color: 'var(--color-primary)' } }, 'Recipient Portal'),
    React.createElement('button', { className: 'btn btn--secondary', onClick: toggleTheme }, theme === 'light' ? '🌙 Dark' : '☀️ Light')
  );
}

// ============= APP INITIALIZATION =============
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(AuthProvider, null, React.createElement(RecipientPortal)));
