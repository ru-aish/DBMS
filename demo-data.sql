-- ===================================================================
-- BDSM - Demo Data for Testing
-- ===================================================================
-- Run this file after setting up the database to add demo accounts
-- ===================================================================

USE donation_system;

-- ===================================================================
-- DEMO RECIPIENT (Community/Organization)
-- Login with Recipient Code: RCP100000
-- ===================================================================
INSERT INTO RECIPIENTS (org_name, org_type, contact_person, phone, email, address, application_letter, verification_status, recipient_code) 
VALUES ('Demo Community Center', 'Community Center', 'Demo Contact Person', '9876543210', 'demo@community.org', '123 Demo Street, Test City', 'Demo account for testing the recipient portal', 'verified', 'RCP100000')
ON DUPLICATE KEY UPDATE phone = phone;

-- ===================================================================
-- DEMO DONOR  
-- Login with Email: donor@demo.com, Password: password123
-- ===================================================================
-- First, generate a proper bcrypt hash for 'password123'
-- The hash below is for 'password123'
INSERT INTO DONORS (full_name, email, phone, institution, password, status)
VALUES ('Demo Donor', 'donor@demo.com', '9876543211', 'Demo University', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active')
ON DUPLICATE KEY UPDATE email = email;

-- ===================================================================
-- DEMO ADMIN
-- Login with Email: admin@demo.com, Password: password123
-- ===================================================================
INSERT INTO ADMINS (full_name, email, password, status)
VALUES ('Demo Admin', 'admin@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active')
ON DUPLICATE KEY UPDATE email = email;

-- ===================================================================
-- DEMO ITEMS (donated by demo donor)
-- ===================================================================
INSERT INTO ITEMS (donor_id, item_name, category, condition_status, description, estimated_value, availability_status)
SELECT donor_id, 'Physics Textbook Class 12', 'Books', 'Good', 'NCERT Physics textbook for class 12', 350.00, 'available'
FROM DONORS WHERE email = 'donor@demo.com' LIMIT 1;

INSERT INTO ITEMS (donor_id, item_name, category, condition_status, description, estimated_value, availability_status)
SELECT donor_id, 'Winter Jacket - Medium', 'Clothes', 'Excellent', 'Blue winter jacket, size medium', 800.00, 'available'
FROM DONORS WHERE email = 'donor@demo.com' LIMIT 1;

INSERT INTO ITEMS (donor_id, item_name, category, condition_status, description, estimated_value, availability_status)
SELECT donor_id, 'Scientific Calculator', 'Stationery', 'Good', 'Casio fx-991ES scientific calculator', 600.00, 'available'
FROM DONORS WHERE email = 'donor@demo.com' LIMIT 1;

-- ===================================================================
-- SUMMARY
-- ===================================================================
SELECT '=== Demo Data Inserted Successfully ===' AS Status;
SELECT 'Recipient Portal Login: RCP100000' AS Demo_Login;
SELECT 'Donor Portal Login: donor@demo.com / password123' AS Demo_Login;
SELECT 'Admin Portal Login: admin@demo.com / password123' AS Demo_Login;
