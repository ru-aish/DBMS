-- ===================================================================
-- BDSM - Database Migration Script
-- ===================================================================
-- This script adds the necessary tables and fields to support:
-- 1. Admin portal functionality
-- 2. Institution-centric request management
-- 3. Recipient approval workflow (no password on registration)
-- ===================================================================

USE donation_system;

-- ===================================================================
-- STEP 1: CREATE ADMINS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS ADMINS (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Add indexes for performance
CREATE INDEX idx_admin_email ON ADMINS(email);
CREATE INDEX idx_admin_status ON ADMINS(status);

-- Insert default admin account (password: admin123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO ADMINS (full_name, email, password, role) 
VALUES ('System Admin', 'admin@bdsm.com', '$2b$10$rKx5YJ5YvJZvXqYqF5H5H.YqF5H5H5H5H5H5H5H5H5H5H5H5H5H5HO', 'super_admin');
-- Note: In production, you'll need to hash this password properly using bcrypt

-- ===================================================================
-- STEP 2: CREATE INSTITUTIONS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS INSTITUTIONS (
    institution_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    type ENUM('School', 'Kindergarten', 'Orphanage', 'Community Center', 'Other') NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_notes TEXT,
    verified_by INT NULL,
    verified_date DATETIME NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_requests INT DEFAULT 0,
    total_items_received INT DEFAULT 0,
    FOREIGN KEY (verified_by) REFERENCES ADMINS(admin_id)
);

-- Add indexes
CREATE INDEX idx_institution_type ON INSTITUTIONS(type);
CREATE INDEX idx_institution_verification ON INSTITUTIONS(verification_status);
CREATE INDEX idx_institution_email ON INSTITUTIONS(email);

-- ===================================================================
-- STEP 3: CREATE COMMUNITY_REQUESTS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS COMMUNITY_REQUESTS (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL,
    date_requested DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'in_fulfillment', 'approved', 'completed', 'rejected') DEFAULT 'pending',
    priority_score INT DEFAULT 0,
    queue_position INT NULL,
    items_total INT DEFAULT 0,
    items_allocated INT DEFAULT 0,
    approval_date DATETIME NULL,
    approved_by INT NULL,
    completion_date DATETIME NULL,
    rejection_reason TEXT,
    admin_notes TEXT,
    FOREIGN KEY (institution_id) REFERENCES INSTITUTIONS(institution_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES ADMINS(admin_id)
);

-- Add indexes
CREATE INDEX idx_cr_institution ON COMMUNITY_REQUESTS(institution_id);
CREATE INDEX idx_cr_status ON COMMUNITY_REQUESTS(status);
CREATE INDEX idx_cr_date ON COMMUNITY_REQUESTS(date_requested);
CREATE INDEX idx_cr_queue ON COMMUNITY_REQUESTS(queue_position);

-- ===================================================================
-- STEP 4: CREATE REQUEST_ITEMS TABLE (breakdown of items in each community request)
-- ===================================================================
CREATE TABLE IF NOT EXISTS REQUEST_ITEMS (
    request_item_id INT PRIMARY KEY AUTO_INCREMENT,
    community_request_id INT NOT NULL,
    category ENUM('clothes', 'books', 'electronics', 'toys', 'stationery', 'others') NOT NULL,
    quantity_requested INT NOT NULL CHECK (quantity_requested > 0),
    quantity_allocated INT DEFAULT 0,
    description TEXT,
    FOREIGN KEY (community_request_id) REFERENCES COMMUNITY_REQUESTS(request_id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX idx_ri_request ON REQUEST_ITEMS(community_request_id);
CREATE INDEX idx_ri_category ON REQUEST_ITEMS(category);

-- ===================================================================
-- STEP 5: UPDATE RECIPIENTS TABLE
-- ===================================================================
-- Add institution relationship and credential fields
ALTER TABLE RECIPIENTS 
    ADD COLUMN institution_id INT NULL AFTER recipient_id,
    ADD COLUMN password VARCHAR(255) NULL AFTER verification_status,
    ADD COLUMN recipient_code VARCHAR(50) UNIQUE NULL AFTER password,
    ADD COLUMN approved_by INT NULL AFTER verification_status,
    ADD COLUMN approved_date DATETIME NULL AFTER approved_by,
    ADD COLUMN rejection_reason TEXT AFTER approved_date,
    ADD COLUMN last_login TIMESTAMP NULL AFTER rejection_reason,
    ADD FOREIGN KEY (institution_id) REFERENCES INSTITUTIONS(institution_id) ON DELETE SET NULL,
    ADD FOREIGN KEY (approved_by) REFERENCES ADMINS(admin_id);

-- Add indexes
CREATE INDEX idx_recipient_institution ON RECIPIENTS(institution_id);
CREATE INDEX idx_recipient_code ON RECIPIENTS(recipient_code);

-- ===================================================================
-- STEP 6: UPDATE ITEM_REQUESTS TABLE
-- ===================================================================
-- Link item requests to community requests
ALTER TABLE ITEM_REQUESTS 
    ADD COLUMN community_request_id INT NULL AFTER request_id,
    ADD COLUMN allocated_by INT NULL AFTER request_status,
    ADD COLUMN allocated_date DATETIME NULL AFTER allocated_by,
    ADD FOREIGN KEY (community_request_id) REFERENCES COMMUNITY_REQUESTS(request_id) ON DELETE SET NULL,
    ADD FOREIGN KEY (allocated_by) REFERENCES ADMINS(admin_id);

-- Add indexes
CREATE INDEX idx_ir_community_request ON ITEM_REQUESTS(community_request_id);

-- ===================================================================
-- STEP 7: UPDATE DISTRIBUTIONS TABLE
-- ===================================================================
-- Add community request link and admin tracking
ALTER TABLE DISTRIBUTIONS 
    ADD COLUMN community_request_id INT NULL AFTER distribution_id,
    ADD COLUMN approved_by INT NULL AFTER distributed_by,
    ADD COLUMN status ENUM('scheduled', 'in_transit', 'completed', 'cancelled') DEFAULT 'scheduled',
    ADD FOREIGN KEY (community_request_id) REFERENCES COMMUNITY_REQUESTS(request_id) ON DELETE SET NULL,
    ADD FOREIGN KEY (approved_by) REFERENCES ADMINS(admin_id);

-- Add index
CREATE INDEX idx_dist_community_request ON DISTRIBUTIONS(community_request_id);
CREATE INDEX idx_dist_status ON DISTRIBUTIONS(status);

-- ===================================================================
-- STEP 8: CREATE ACTIVITY_LOG TABLE (for admin audit trail)
-- ===================================================================
CREATE TABLE IF NOT EXISTS ACTIVITY_LOG (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type ENUM('login', 'logout', 'approve_donor', 'approve_recipient', 'approve_request', 
                     'reject_request', 'allocate_item', 'create_distribution', 'update_item', 
                     'verify_institution', 'other') NOT NULL,
    entity_type ENUM('donor', 'recipient', 'item', 'request', 'distribution', 'institution', 'batch', 'system'),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES ADMINS(admin_id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX idx_log_admin ON ACTIVITY_LOG(admin_id);
CREATE INDEX idx_log_action ON ACTIVITY_LOG(action_type);
CREATE INDEX idx_log_entity ON ACTIVITY_LOG(entity_type, entity_id);
CREATE INDEX idx_log_date ON ACTIVITY_LOG(created_at);

-- ===================================================================
-- STEP 9: CREATE NOTIFICATIONS TABLE (for admin alerts)
-- ===================================================================
CREATE TABLE IF NOT EXISTS NOTIFICATIONS (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NULL,
    type ENUM('new_donor', 'new_recipient', 'new_request', 'new_batch', 
              'low_stock', 'pending_approval', 'system_alert') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type ENUM('donor', 'recipient', 'item', 'request', 'batch', 'institution'),
    related_entity_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES ADMINS(admin_id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX idx_notif_admin ON NOTIFICATIONS(admin_id);
CREATE INDEX idx_notif_read ON NOTIFICATIONS(is_read);
CREATE INDEX idx_notif_type ON NOTIFICATIONS(type);
CREATE INDEX idx_notif_date ON NOTIFICATIONS(created_at);

-- ===================================================================
-- STEP 10: CREATE SYSTEM_SETTINGS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS SYSTEM_SETTINGS (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES ADMINS(admin_id)
);

-- Add default settings
INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value, description) VALUES
('auto_generate_recipient_code', 'true', 'Automatically generate recipient codes on approval'),
('recipient_code_prefix', 'REC', 'Prefix for recipient codes'),
('queue_auto_update', 'true', 'Automatically update request queue positions'),
('require_email_verification', 'false', 'Require email verification for new registrations'),
('max_items_per_request', '50', 'Maximum items allowed per community request');

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================

-- Display summary
SELECT 'Migration completed successfully!' AS Status;
SELECT 'New tables created:' AS Info;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'donation_system' 
ORDER BY TABLE_NAME;
