-- ===================================================================
-- BDSM - Demo Data for Testing
-- ===================================================================
-- Run this file after setting up the database to add demo accounts
-- ===================================================================

USE donation_system;

-- ===================================================================
-- DEMO RECIPIENT
-- Login with Phone: 9876543210
-- ===================================================================
INSERT INTO RECIPIENTS (full_name, age, gender, guardian_name, guardian_contact, address, needs_description, verification_status) 
VALUES ('Demo Student', 15, 'Male', 'Demo Guardian', '9876543210', '123 Demo Street, Test City', 'Demo account for testing the recipient portal', 'verified')
ON DUPLICATE KEY UPDATE guardian_contact = guardian_contact;

-- ===================================================================
-- DEMO DONOR  
-- Login with Email: donor@demo.com, Password: password123
-- ===================================================================
-- First, generate a proper bcrypt hash for 'password123'
-- The hash below is for 'password123'
INSERT INTO DONORS (full_name, email, phone, institution, year_class, address, password, status)
VALUES ('Demo Donor', 'donor@demo.com', '9876543211', 'Demo University', 'Final Year', '456 Demo Avenue, Test City', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active')
ON DUPLICATE KEY UPDATE email = email;

-- ===================================================================
-- DEMO ADMIN
-- Login with Email: admin@demo.com, Password: password123
-- ===================================================================
INSERT INTO ADMINS (full_name, email, password, role, status)
VALUES ('Demo Admin', 'admin@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'active')
ON DUPLICATE KEY UPDATE email = email;

-- ===================================================================
-- DEMO ITEMS (donated by demo donor)
-- ===================================================================
INSERT INTO ITEMS (donor_id, item_name, category, subcategory, condition_status, description, estimated_value, availability_status)
SELECT donor_id, 'Physics Textbook Class 12', 'books', 'Science', 'good', 'NCERT Physics textbook for class 12', 350.00, 'available'
FROM DONORS WHERE email = 'donor@demo.com' LIMIT 1;

INSERT INTO ITEMS (donor_id, item_name, category, subcategory, condition_status, description, estimated_value, availability_status)
SELECT donor_id, 'Winter Jacket - Medium', 'clothes', 'Winter Wear', 'excellent', 'Blue winter jacket, size medium', 800.00, 'available'
FROM DONORS WHERE email = 'donor@demo.com' LIMIT 1;

INSERT INTO ITEMS (donor_id, item_name, category, subcategory, condition_status, description, estimated_value, availability_status)
SELECT donor_id, 'Scientific Calculator', 'stationery', 'Calculator', 'good', 'Casio fx-991ES scientific calculator', 600.00, 'available'
FROM DONORS WHERE email = 'donor@demo.com' LIMIT 1;

-- ===================================================================
-- SUMMARY
-- ===================================================================
SELECT '=== Demo Data Inserted Successfully ===' AS Status;
SELECT 'Recipient Portal Login: Phone 9876543210' AS Demo_Login;
SELECT 'Donor Portal Login: donor@demo.com / password123' AS Demo_Login;
SELECT 'Admin Portal Login: admin@demo.com / password123' AS Demo_Login;
