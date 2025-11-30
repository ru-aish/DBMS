const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the frontend directory
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'donation_system',
  socketPath: '/opt/lampp/var/mysql/mysql.sock',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ============================================================================
// DONOR PORTAL ENDPOINTS
// ============================================================================

// Donor login
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/ID and password are required' });
    }

    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      'SELECT donor_id, full_name, email, password, status FROM DONORS WHERE (email = ? OR donor_id = ?) AND status = "active"',
      [identifier, identifier]
    );

    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email/ID or account inactive' });
    }

    const donor = rows[0];

    if (!donor.password || donor.password === '') {
      return res.status(401).json({ message: 'Account password not set. Please contact support.' });
    }

    const isPasswordValid = await bcrypt.compare(password, donor.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.json({
      message: 'Login successful',
      donor_id: donor.donor_id,
      donor_name: donor.full_name,
      email: donor.email
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Donor registration
app.post('/api/register', async (req, res) => {
  try {
    const { full_name, email, phone, institution, password } = req.body;

    if (!full_name || !email || !phone || !institution || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const connection = await pool.getConnection();

    const [existingUsers] = await connection.execute(
      'SELECT donor_id FROM DONORS WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.execute(
      'INSERT INTO DONORS (full_name, email, phone, institution, password, status) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, phone, institution, hashedPassword, 'active']
    );

    connection.release();

    return res.status(201).json({
      message: 'Registration successful',
      donor_id: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get donor's donations
app.get('/api/donor/:donorId/donations', async (req, res) => {
  try {
    const { donorId } = req.params;
    const connection = await pool.getConnection();
    const [donations] = await connection.execute(
      `SELECT item_id as id, item_name as items, donation_date as date, availability_status as status
       FROM ITEMS
       WHERE donor_id = ?
       ORDER BY donation_date DESC`,
      [donorId]
    );
    connection.release();
    return res.json({ donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

// Get public statistics for landing page
app.get('/api/public/stats', async (_req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get total items available
    const [itemsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM ITEMS WHERE availability_status = "available"'
    );
    
    // Get active donors
    const [donorsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM DONORS WHERE status = "active"'
    );
    
    // Get recipients helped (verified recipients)
    const [recipientsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM RECIPIENTS WHERE verification_status = "verified"'
    );
    
    // Get partner institutions (unique institutions from donors)
    const [institutionsResult] = await connection.execute(
      'SELECT COUNT(DISTINCT institution) as total FROM DONORS WHERE institution IS NOT NULL'
    );
    
    connection.release();
    
    return res.json({
      totalItemsAvailable: itemsResult[0].total,
      activeDonors: donorsResult[0].total,
      recipientsHelped: recipientsResult[0].total,
      partnerInstitutions: institutionsResult[0].total
    });
    
  } catch (error) {
    console.error('Public stats error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get public testimonials for landing page
app.get('/api/public/testimonials', async (_req, res) => {
  try {
    // Static testimonials (can be made dynamic later)
    const testimonials = [
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
    ];
    
    return res.json({ testimonials });
    
  } catch (error) {
    console.error('Public testimonials error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// RECIPIENT PORTAL ENDPOINTS
// ============================================================================

// Recipient login - using recipient_code (generated after admin approval)
app.post('/api/recipient/login', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: 'Recipient code required' });
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT recipient_id, org_name, org_type, contact_person, phone, email, address,
              verification_status, recipient_code, registration_date
       FROM RECIPIENTS 
       WHERE recipient_code = ? AND verification_status = 'verified'`,
      [identifier]
    );
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid recipient code or account not approved yet' });
    }

    const recipient = rows[0];
    return res.json({
      message: 'Login successful',
      recipient_id: recipient.recipient_id,
      name: recipient.org_name,
      phone: recipient.phone,
      email: recipient.email || recipient.phone,
      recipientCode: recipient.recipient_code,
      registrationDate: recipient.registration_date
    });
  } catch (error) {
    console.error('Recipient login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Recipient registration
app.post('/api/recipient/register', async (req, res) => {
  try {
    const { full_name, guardian_name, guardian_contact, address, application_letter } = req.body;

    // Map old field names to new schema
    const org_name = full_name;
    const contact_person = guardian_name;
    const phone = guardian_contact;

    if (!org_name || !contact_person || !phone || !address) {
      return res.status(400).json({ message: 'Organization name, contact person, phone, and address are required' });
    }

    const connection = await pool.getConnection();
    const [existingUsers] = await connection.execute(
      'SELECT recipient_id FROM RECIPIENTS WHERE phone = ?',
      [phone]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'This phone number is already registered. Please use a different number or login with your existing account.' });
    }

    const [result] = await connection.execute(
      'INSERT INTO RECIPIENTS (org_name, contact_person, phone, address, application_letter, verification_status) VALUES (?, ?, ?, ?, ?, ?)',
      [org_name, contact_person, phone, address, application_letter || null, 'pending']
    );
    connection.release();

    return res.status(201).json({
      message: 'Application submitted successfully. Your application is pending admin approval.',
      recipient_id: result.insertId
    });
  } catch (error) {
    console.error('Recipient registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get available items
app.get('/api/items/available', async (_req, res) => {
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.execute(
      `SELECT i.item_id, i.item_name, i.category, i.condition_status, i.description, 
              i.estimated_value, i.quantity, d.full_name as donor_name
       FROM ITEMS i
       LEFT JOIN DONORS d ON i.donor_id = d.donor_id
       WHERE i.availability_status = "available" 
       ORDER BY i.donation_date DESC`
    );
    connection.release();
    return res.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Submit item request - AUTO-ALLOCATES if item is available
app.post('/api/recipient/request', async (req, res) => {
  try {
    const { recipient_id, item_id, request_reason, quantity } = req.body;

    if (!recipient_id || !item_id) {
      return res.status(400).json({ message: 'Recipient ID and Item ID required' });
    }

    const connection = await pool.getConnection();
    const [item] = await connection.execute(
      'SELECT availability_status, item_name FROM ITEMS WHERE item_id = ?',
      [item_id]
    );

    if (item.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item[0].availability_status !== 'available') {
      connection.release();
      return res.status(400).json({ message: 'Item is not available' });
    }

    // Auto-allocate: Create request as 'approved' and create distribution
    const [requestResult] = await connection.execute(
      'INSERT INTO ITEM_REQUESTS (recipient_id, item_id, request_reason, quantity_requested, request_status) VALUES (?, ?, ?, ?, ?)',
      [recipient_id, item_id, request_reason || null, quantity || 1, 'approved']
    );

    // Create distribution record
    await connection.execute(
      'INSERT INTO DISTRIBUTIONS (item_id, recipient_id, quantity, notes) VALUES (?, ?, ?, ?)',
      [item_id, recipient_id, quantity || 1, `Auto-allocated: ${request_reason || 'Item requested'}`]
    );

    // Update item status to distributed
    await connection.execute(
      'UPDATE ITEMS SET availability_status = "distributed" WHERE item_id = ?',
      [item_id]
    );
    
    connection.release();

    return res.status(201).json({
      message: `Item "${item[0].item_name}" has been allocated to you!`,
      request_id: requestResult.insertId,
      status: 'approved'
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get recipient requests
app.get('/api/recipient/:recipientId/requests', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const connection = await pool.getConnection();
    const [requests] = await connection.execute(
      `SELECT ir.request_id, ir.request_date, ir.request_status, ir.request_reason, ir.quantity_requested,
        i.item_name, i.category, i.estimated_value 
        FROM ITEM_REQUESTS ir 
        JOIN ITEMS i ON ir.item_id = i.item_id 
        WHERE ir.recipient_id = ? 
        ORDER BY ir.request_date DESC`,
      [recipientId]
    );
    connection.release();
    return res.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Cancel request
app.delete('/api/recipient/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const connection = await pool.getConnection();
    const [request] = await connection.execute(
      'SELECT item_id, request_status FROM ITEM_REQUESTS WHERE request_id = ?',
      [requestId]
    );

    if (request.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request[0].request_status !== 'pending') {
      connection.release();
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    await connection.execute('DELETE FROM ITEM_REQUESTS WHERE request_id = ?', [requestId]);
    await connection.execute(
      'UPDATE ITEMS SET availability_status = "available" WHERE item_id = ?',
      [request[0].item_id]
    );
    connection.release();
    return res.json({ message: 'Request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get received items (distributions)
app.get('/api/recipient/:recipientId/distributions', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const connection = await pool.getConnection();
    const [distributions] = await connection.execute(
      `SELECT d.distribution_id, d.distribution_date, d.quantity,
       d.satisfaction_rating as rating, d.recipient_feedback, d.notes,
       i.item_name, i.category, i.estimated_value, i.condition_status,
       i.donor_id
       FROM DISTRIBUTIONS d 
       JOIN ITEMS i ON d.item_id = i.item_id 
       WHERE d.recipient_id = ? 
       ORDER BY d.distribution_date DESC`,
      [recipientId]
    );
    connection.release();
    return res.json({ distributions });
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Submit rating
app.post('/api/recipient/distribution/:distributionId/rate', async (req, res) => {
  try {
    const { distributionId } = req.params;
    const { satisfaction_rating, recipient_feedback, rating, feedback } = req.body;
    
    const ratingValue = rating || satisfaction_rating;
    const feedbackValue = feedback || recipient_feedback;

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE DISTRIBUTIONS SET satisfaction_rating = ?, recipient_feedback = ? WHERE distribution_id = ?',
      [ratingValue, feedbackValue || null, distributionId]
    );
    connection.release();
    return res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
app.get('/api/recipient/:recipientId/dashboard', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const connection = await pool.getConnection();

    // Items received by this recipient
    const [itemsReceived] = await connection.execute(
      'SELECT COUNT(*) as count FROM DISTRIBUTIONS WHERE recipient_id = ?',
      [recipientId]
    );

    // Total available items in the system
    const [availableItems] = await connection.execute(
      'SELECT COUNT(*) as count FROM ITEMS WHERE availability_status = "available"'
    );

    // Total value of items received
    const [totalValue] = await connection.execute(
      `SELECT COALESCE(SUM(i.estimated_value), 0) as total 
       FROM DISTRIBUTIONS d 
       JOIN ITEMS i ON d.item_id = i.item_id 
       WHERE d.recipient_id = ?`,
      [recipientId]
    );

    connection.release();

    return res.json({
      stats: {
        itemsReceived: itemsReceived[0].count,
        availableItems: availableItems[0].count,
        totalValue: totalValue[0].total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get profile
app.get('/api/recipient/:recipientId/profile', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const connection = await pool.getConnection();
    const [profile] = await connection.execute(
      `SELECT recipient_id, org_name as full_name, org_type, contact_person as guardian_name, 
              phone as guardian_contact, email, address, application_letter as needs_description, 
              registration_date, verification_status
       FROM RECIPIENTS WHERE recipient_id = ?`,
      [recipientId]
    );
    connection.release();
    
    if (profile.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    return res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
app.put('/api/recipient/:recipientId/profile', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { full_name, guardian_contact, address } = req.body;

    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE RECIPIENTS SET org_name = ?, phone = ?, address = ? WHERE recipient_id = ?',
      [full_name, guardian_contact, address, recipientId]
    );
    connection.release();
    return res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// ADMIN PORTAL ENDPOINTS
// ============================================================================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT admin_id, full_name, email, password, status FROM ADMINS WHERE email = ? AND status = "active"',
      [email]
    );
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or account inactive' });
    }

    const admin = rows[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Update last login
    await pool.execute('UPDATE ADMINS SET last_login = NOW() WHERE admin_id = ?', [admin.admin_id]);

    return res.json({
      message: 'Login successful',
      admin_id: admin.admin_id,
      name: admin.full_name,
      email: admin.email,
      role: 'admin'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Admin Dashboard Stats
app.get('/api/admin/dashboard', async (_req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get total active donors
    const [activeDonors] = await connection.execute(
      'SELECT COUNT(*) as count FROM DONORS WHERE status = "active"'
    );

    // Get total verified communities (recipients)
    const [verifiedCommunities] = await connection.execute(
      'SELECT COUNT(*) as count FROM RECIPIENTS WHERE verification_status = "verified"'
    );

    // Get total items in stock
    const [itemsInStock] = await connection.execute(
      'SELECT COUNT(*) as count FROM ITEMS WHERE availability_status = "available"'
    );

    // Get pending requests
    const [pendingRequests] = await connection.execute(
      'SELECT COUNT(*) as count FROM ITEM_REQUESTS WHERE request_status = "pending"'
    );

    // Get recent donors with their last donation info
    const [recentDonors] = await connection.execute(
      `SELECT d.donor_id, d.full_name as name, d.institution, d.email, d.phone,
       MAX(i.donation_date) as last_donation_date,
       COUNT(i.item_id) as total_items_donated,
       d.status
       FROM DONORS d
       LEFT JOIN ITEMS i ON d.donor_id = i.donor_id
       GROUP BY d.donor_id
       ORDER BY MAX(i.donation_date) DESC
       LIMIT 5`
    );

    // Get pending item requests queue
    const [requestQueue] = await connection.execute(
      `SELECT ir.request_id, r.org_name as community_name, ir.request_date as date_requested,
       ir.request_status as status, ir.quantity_requested as items_total, 
       i.item_name, i.category
       FROM ITEM_REQUESTS ir
       JOIN RECIPIENTS r ON ir.recipient_id = r.recipient_id
       JOIN ITEMS i ON ir.item_id = i.item_id
       WHERE ir.request_status = 'pending'
       ORDER BY ir.request_date ASC
       LIMIT 5`
    );

    // Get completed requests (last 7 days)
    const [completedRequests] = await connection.execute(
      `SELECT ir.request_id, r.org_name as community_name, ir.quantity_requested as items_count,
       ir.request_date as completion_date, 'Finished' as status
       FROM ITEM_REQUESTS ir
       JOIN RECIPIENTS r ON ir.recipient_id = r.recipient_id
       WHERE ir.request_status IN ('approved', 'fulfilled') 
       AND ir.request_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY ir.request_date DESC
       LIMIT 5`
    );

    // Get last 5 items donated
    const [recentItems] = await connection.execute(
      `SELECT i.item_id, i.item_name, i.category, i.condition_status as \`condition\`,
       i.donation_date as date_added, d.full_name as donor_name, i.availability_status as stock_status
       FROM ITEMS i
       JOIN DONORS d ON i.donor_id = d.donor_id
       ORDER BY i.donation_date DESC
       LIMIT 5`
    );

    // Get time-based stats (7, 30, 90 days)
    const [stats7Days] = await connection.execute(
      `SELECT 
        (SELECT COUNT(*) FROM ITEMS WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as items_donated,
        (SELECT COUNT(*) FROM DISTRIBUTIONS WHERE distribution_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as items_distributed,
        (SELECT COUNT(*) FROM ITEM_REQUESTS WHERE request_status IN ('approved', 'fulfilled') AND request_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as requests_fulfilled,
        (SELECT COUNT(*) FROM ITEM_REQUESTS WHERE request_status = 'pending' AND request_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as requests_pending`
    );

    const [stats30Days] = await connection.execute(
      `SELECT 
        (SELECT COUNT(*) FROM ITEMS WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as items_donated,
        (SELECT COUNT(*) FROM DISTRIBUTIONS WHERE distribution_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as items_distributed,
        (SELECT COUNT(*) FROM ITEM_REQUESTS WHERE request_status IN ('approved', 'fulfilled') AND request_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as requests_fulfilled,
        (SELECT COUNT(*) FROM ITEM_REQUESTS WHERE request_status = 'pending' AND request_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as requests_pending`
    );

    const [stats90Days] = await connection.execute(
      `SELECT 
        (SELECT COUNT(*) FROM ITEMS WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)) as items_donated,
        (SELECT COUNT(*) FROM DISTRIBUTIONS WHERE distribution_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)) as items_distributed,
        (SELECT COUNT(*) FROM ITEM_REQUESTS WHERE request_status IN ('approved', 'fulfilled') AND request_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)) as requests_fulfilled,
        (SELECT COUNT(*) FROM ITEM_REQUESTS WHERE request_status = 'pending' AND request_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)) as requests_pending`
    );

    connection.release();

    return res.json({
      stats: {
        total_active_donors: activeDonors[0].count,
        total_communities: verifiedCommunities[0].count,
        total_items_in_stock: itemsInStock[0].count,
        pending_requests: pendingRequests[0].count
      },
      recentDonors,
      pendingRequests: requestQueue,
      requestQueue,
      completedRequests,
      recentItems,
      timeReports: {
        last_7_days: stats7Days[0],
        last_30_days: stats30Days[0],
        last_90_days: stats90Days[0]
      },
      recentTimeReports: {
        last7Days: stats7Days[0],
        last30Days: stats30Days[0],
        last90Days: stats90Days[0]
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all donors with pagination and filters
app.get('/api/admin/donors', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, institution, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT d.donor_id, d.full_name as name, d.institution, d.email, d.phone,
                 MAX(i.donation_date) as last_donation_date,
                 COUNT(i.item_id) as total_items_donated,
                 d.status
                 FROM DONORS d
                 LEFT JOIN ITEMS i ON d.donor_id = i.donor_id
                 WHERE 1=1`;
    
    const params = [];

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    if (institution) {
      query += ' AND d.institution LIKE ?';
      params.push(`%${institution}%`);
    }

    if (search) {
      query += ' AND (d.full_name LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY d.donor_id ORDER BY MAX(i.donation_date) DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const connection = await pool.getConnection();
    const [donors] = await connection.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT d.donor_id) as total FROM DONORS d WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countQuery += ' AND d.status = ?';
      countParams.push(status);
    }
    if (institution) {
      countQuery += ' AND d.institution LIKE ?';
      countParams.push(`%${institution}%`);
    }
    if (search) {
      countQuery += ' AND (d.full_name LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [totalResult] = await connection.execute(countQuery, countParams);
    connection.release();

    return res.json({
      donors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all communities/recipients
app.get('/api/admin/communities', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, verification_status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT r.recipient_id as community_id, r.org_name as name, r.org_type as type, 
                 r.contact_person, r.email, r.phone, r.address, r.verification_status,
                 COUNT(DISTINCT ir.request_id) as total_requests,
                 COALESCE(COUNT(DISTINCT d.distribution_id), 0) as items_received,
                 r.registration_date
                 FROM RECIPIENTS r
                 LEFT JOIN ITEM_REQUESTS ir ON r.recipient_id = ir.recipient_id
                 LEFT JOIN DISTRIBUTIONS d ON r.recipient_id = d.recipient_id
                 WHERE 1=1`;
    
    const params = [];

    if (type) {
      query += ' AND r.org_type = ?';
      params.push(type);
    }

    if (verification_status) {
      query += ' AND r.verification_status = ?';
      params.push(verification_status);
    }

    if (search) {
      query += ' AND (r.org_name LIKE ? OR r.contact_person LIKE ? OR r.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY r.recipient_id ORDER BY r.registration_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const connection = await pool.getConnection();
    const [communities] = await connection.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM RECIPIENTS r WHERE 1=1';
    const countParams = [];
    
    if (type) {
      countQuery += ' AND r.org_type = ?';
      countParams.push(type);
    }
    if (verification_status) {
      countQuery += ' AND r.verification_status = ?';
      countParams.push(verification_status);
    }
    if (search) {
      countQuery += ' AND (r.org_name LIKE ? OR r.contact_person LIKE ? OR r.email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [totalResult] = await connection.execute(countQuery, countParams);
    connection.release();

    return res.json({
      communities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests
app.get('/api/admin/requests', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT ir.request_id, ir.recipient_id as community_id, 
                 r.org_name as community_name, ir.request_date as date_requested, ir.request_status as status,
                 ir.quantity_requested as items_total, i.item_name, i.category,
                 i.estimated_value
                 FROM ITEM_REQUESTS ir
                 JOIN RECIPIENTS r ON ir.recipient_id = r.recipient_id
                 JOIN ITEMS i ON ir.item_id = i.item_id
                 WHERE 1=1`;
    
    const params = [];

    if (status) {
      query += ' AND ir.request_status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (r.org_name LIKE ? OR i.item_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY ir.request_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const connection = await pool.getConnection();
    const [requests] = await connection.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM ITEM_REQUESTS ir 
                      JOIN RECIPIENTS r ON ir.recipient_id = r.recipient_id
                      JOIN ITEMS i ON ir.item_id = i.item_id WHERE 1=1`;
    const countParams = [];
    
    if (status) {
      countQuery += ' AND ir.request_status = ?';
      countParams.push(status);
    }
    if (search) {
      countQuery += ' AND (r.org_name LIKE ? OR i.item_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [totalResult] = await connection.execute(countQuery, countParams);
    connection.release();

    return res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject request
app.put('/api/admin/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'rejected', 'fulfilled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await pool.getConnection();

    await connection.execute(
      'UPDATE ITEM_REQUESTS SET request_status = ? WHERE request_id = ?',
      [status, requestId]
    );

    // If approved, create distribution and update item
    if (status === 'approved') {
      const [request] = await connection.execute(
        'SELECT item_id, recipient_id, quantity_requested, request_reason FROM ITEM_REQUESTS WHERE request_id = ?',
        [requestId]
      );

      if (request.length > 0) {
        await connection.execute(
          'INSERT INTO DISTRIBUTIONS (item_id, recipient_id, quantity, notes) VALUES (?, ?, ?, ?)',
          [request[0].item_id, request[0].recipient_id, request[0].quantity_requested, `Approved: ${request[0].request_reason || 'Request approved'}`]
        );

        await connection.execute(
          'UPDATE ITEMS SET availability_status = "distributed" WHERE item_id = ?',
          [request[0].item_id]
        );
      }
    }

    connection.release();

    return res.json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Error updating request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all items
app.get('/api/admin/items', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, condition, stock_status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT i.item_id, i.item_name as description, i.category, 
                 d.donor_id, d.full_name as donor_name,
                 i.condition_status as \`condition\`, i.estimated_value,
                 i.availability_status as stock_status, i.donation_date as date_added
                 FROM ITEMS i
                 JOIN DONORS d ON i.donor_id = d.donor_id
                 WHERE 1=1`;
    
    const params = [];

    if (category) {
      query += ' AND i.category = ?';
      params.push(category);
    }

    if (condition) {
      query += ' AND i.condition_status = ?';
      params.push(condition);
    }

    if (stock_status) {
      query += ' AND i.availability_status = ?';
      params.push(stock_status);
    }

    if (search) {
      query += ' AND (i.item_name LIKE ? OR d.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY i.donation_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const connection = await pool.getConnection();
    const [items] = await connection.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM ITEMS i WHERE 1=1';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND i.category = ?';
      countParams.push(category);
    }
    if (condition) {
      countQuery += ' AND i.condition_status = ?';
      countParams.push(condition);
    }
    if (stock_status) {
      countQuery += ' AND i.availability_status = ?';
      countParams.push(stock_status);
    }
    if (search) {
      countQuery += ' AND (i.item_name LIKE ? OR EXISTS(SELECT 1 FROM DONORS d WHERE d.donor_id = i.donor_id AND d.full_name LIKE ?))';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [totalResult] = await connection.execute(countQuery, countParams);
    connection.release();

    return res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all distributions
app.get('/api/admin/distributions', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT d.distribution_id, d.item_id, d.recipient_id as community_id,
                 r.org_name as community_name, d.distribution_date, d.quantity as items_count,
                 d.satisfaction_rating, d.recipient_feedback, d.notes,
                 i.item_name, i.category
                 FROM DISTRIBUTIONS d
                 JOIN RECIPIENTS r ON d.recipient_id = r.recipient_id
                 JOIN ITEMS i ON d.item_id = i.item_id
                 WHERE 1=1`;
    
    const params = [];

    if (search) {
      query += ' AND (r.org_name LIKE ? OR i.item_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY d.distribution_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const connection = await pool.getConnection();
    const [distributions] = await connection.execute(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM DISTRIBUTIONS d 
                      JOIN RECIPIENTS r ON d.recipient_id = r.recipient_id 
                      JOIN ITEMS i ON d.item_id = i.item_id WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ' AND (r.org_name LIKE ? OR i.item_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [totalResult] = await connection.execute(countQuery, countParams);
    connection.release();

    return res.json({
      distributions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get pending recipients for approval
app.get('/api/admin/recipients', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'pending', search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT r.recipient_id, r.org_name as full_name, r.org_type, r.contact_person as guardian_name,
                 r.phone as guardian_contact, r.email, r.address, r.application_letter as needs_description,
                 r.verification_status, r.recipient_code, r.registration_date
                 FROM RECIPIENTS r
                 WHERE 1=1`;
    
    const params = [];

    if (status && status !== 'all') {
      query += ' AND r.verification_status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (r.org_name LIKE ? OR r.phone LIKE ? OR r.contact_person LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.registration_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const connection = await pool.getConnection();
    const [recipients] = await connection.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM RECIPIENTS r WHERE 1=1';
    const countParams = [];
    
    if (status && status !== 'all') {
      countQuery += ' AND r.verification_status = ?';
      countParams.push(status);
    }
    if (search) {
      countQuery += ' AND (r.org_name LIKE ? OR r.phone LIKE ? OR r.contact_person LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [totalResult] = await connection.execute(countQuery, countParams);
    connection.release();

    return res.json({
      recipients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Approve recipient and generate credentials
app.post('/api/admin/recipients/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }

    const connection = await pool.getConnection();
    
    // Check if recipient exists and is pending
    const [recipient] = await connection.execute(
      'SELECT recipient_id, org_name, phone, verification_status FROM RECIPIENTS WHERE recipient_id = ?',
      [id]
    );

    if (recipient.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (recipient[0].verification_status !== 'pending') {
      connection.release();
      return res.status(400).json({ message: 'Recipient is not in pending status' });
    }

    // Generate recipient code (RCP + 6 digits)
    const recipientCode = 'RCP' + Math.floor(100000 + Math.random() * 900000);

    // Update recipient with approval and save the recipient code
    await connection.execute(
      `UPDATE RECIPIENTS 
       SET verification_status = 'verified',
           recipient_code = ?
       WHERE recipient_id = ?`,
      [recipientCode, id]
    );

    connection.release();

    // Return credentials to display to admin (so they can share with recipient)
    return res.json({
      message: 'Recipient approved successfully',
      credentials: {
        recipientCode,
        fullName: recipient[0].org_name,
        contact: recipient[0].phone
      }
    });
  } catch (error) {
    console.error('Error approving recipient:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reject recipient application
app.post('/api/admin/recipients/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, reason } = req.body;

    if (!adminId || !reason) {
      return res.status(400).json({ message: 'Admin ID and rejection reason are required' });
    }

    const connection = await pool.getConnection();
    
    // Check if recipient exists and is pending
    const [recipient] = await connection.execute(
      'SELECT recipient_id, org_name, verification_status FROM RECIPIENTS WHERE recipient_id = ?',
      [id]
    );

    if (recipient.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (recipient[0].verification_status !== 'pending') {
      connection.release();
      return res.status(400).json({ message: 'Recipient is not in pending status' });
    }

    // Update recipient with rejection
    await connection.execute(
      `UPDATE RECIPIENTS 
       SET verification_status = 'rejected'
       WHERE recipient_id = ?`,
      [id]
    );

    connection.release();

    return res.json({ 
      message: 'Recipient application rejected',
      reason: reason 
    });
  } catch (error) {
    console.error('Error rejecting recipient:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get admin profile
app.get('/api/admin/:adminId/profile', async (req, res) => {
  try {
    const { adminId } = req.params;
    const connection = await pool.getConnection();
    const [profile] = await connection.execute(
      'SELECT admin_id, full_name, email, status, created_at, last_login FROM ADMINS WHERE admin_id = ?',
      [adminId]
    );
    connection.release();
    
    if (profile.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    return res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update admin profile
app.put('/api/admin/:adminId/profile', async (req, res) => {
  try {
    const { adminId } = req.params;
    const { full_name, email, current_password, new_password } = req.body;

    const connection = await pool.getConnection();

    // If changing password, verify current password first
    if (new_password) {
      const [admin] = await connection.execute(
        'SELECT password FROM ADMINS WHERE admin_id = ?',
        [adminId]
      );

      if (admin.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'Admin not found' });
      }

      const isPasswordValid = await bcrypt.compare(current_password, admin[0].password);
      if (!isPasswordValid) {
        connection.release();
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await connection.execute(
        'UPDATE ADMINS SET full_name = ?, email = ?, password = ? WHERE admin_id = ?',
        [full_name, email, hashedPassword, adminId]
      );
    } else {
      await connection.execute(
        'UPDATE ADMINS SET full_name = ?, email = ? WHERE admin_id = ?',
        [full_name, email, adminId]
      );
    }

    connection.release();
    return res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// DONOR PORTAL - Donate Item
// ============================================================================
app.post('/api/donor/:donorId/donate', async (req, res) => {
  try {
    const { donorId } = req.params;
    const { item_name, category, condition_status, description, estimated_value, quantity } = req.body;

    if (!item_name || !category || !condition_status) {
      return res.status(400).json({ message: 'Item name, category, and condition are required' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      `INSERT INTO ITEMS (item_name, category, condition_status, description, estimated_value, quantity, donor_id, availability_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`,
      [item_name, category, condition_status, description || null, estimated_value || 0, quantity || 1, donorId]
    );

    connection.release();

    return res.status(201).json({
      message: 'Item donated successfully',
      item_id: result.insertId
    });
  } catch (error) {
    console.error('Error donating item:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get donor profile
app.get('/api/donor/:donorId/profile', async (req, res) => {
  try {
    const { donorId } = req.params;
    const connection = await pool.getConnection();
    const [profile] = await connection.execute(
      'SELECT donor_id, full_name, email, phone, institution, registration_date, status FROM DONORS WHERE donor_id = ?',
      [donorId]
    );
    connection.release();
    
    if (profile.length === 0) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    
    return res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update donor profile
app.put('/api/donor/:donorId/profile', async (req, res) => {
  try {
    const { donorId } = req.params;
    const { full_name, phone, institution } = req.body;

    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE DONORS SET full_name = ?, phone = ?, institution = ? WHERE donor_id = ?',
      [full_name, phone, institution, donorId]
    );
    connection.release();
    return res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating donor profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get donor dashboard stats
app.get('/api/donor/:donorId/dashboard', async (req, res) => {
  try {
    const { donorId } = req.params;
    const connection = await pool.getConnection();

    // Total items donated
    const [totalItems] = await connection.execute(
      'SELECT COUNT(*) as count FROM ITEMS WHERE donor_id = ?',
      [donorId]
    );

    // Items distributed (helped someone)
    const [distributedItems] = await connection.execute(
      'SELECT COUNT(*) as count FROM ITEMS WHERE donor_id = ? AND availability_status = "distributed"',
      [donorId]
    );

    // Total value donated
    const [totalValue] = await connection.execute(
      'SELECT COALESCE(SUM(estimated_value), 0) as total FROM ITEMS WHERE donor_id = ?',
      [donorId]
    );

    connection.release();

    return res.json({
      stats: {
        totalDonations: totalItems[0].count,
        itemsDistributed: distributedItems[0].count,
        totalValue: totalValue[0].total
      }
    });
  } catch (error) {
    console.error('Error fetching donor dashboard:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
