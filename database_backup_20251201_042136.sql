-- Warning: column statistics not supported by the server.
-- MySQL dump 10.13  Distrib 8.4.0, for Linux (x86_64)
--
-- Host: localhost    Database: donation_system
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ACTIVITY_LOG`
--

DROP TABLE IF EXISTS `ACTIVITY_LOG`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ACTIVITY_LOG` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `action_type` enum('login','logout','approve_donor','approve_recipient','approve_request','reject_request','allocate_item','create_distribution','update_item','verify_institution','other') NOT NULL,
  `entity_type` enum('donor','recipient','item','request','distribution','institution','batch','system') DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `idx_log_admin` (`admin_id`),
  KEY `idx_log_action` (`action_type`),
  KEY `idx_log_entity` (`entity_type`,`entity_id`),
  KEY `idx_log_date` (`created_at`),
  CONSTRAINT `ACTIVITY_LOG_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `ADMINS` (`admin_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ACTIVITY_LOG`
--

LOCK TABLES `ACTIVITY_LOG` WRITE;
/*!40000 ALTER TABLE `ACTIVITY_LOG` DISABLE KEYS */;
/*!40000 ALTER TABLE `ACTIVITY_LOG` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ADMINS`
--

DROP TABLE IF EXISTS `ADMINS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ADMINS` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','moderator') DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_admin_email` (`email`),
  KEY `idx_admin_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ADMINS`
--

LOCK TABLES `ADMINS` WRITE;
/*!40000 ALTER TABLE `ADMINS` DISABLE KEYS */;
INSERT INTO `ADMINS` VALUES (1,'System Admin','admin@bdsm.com','$2b$10$a8EuGPMX3xYEs4NVwDXJr.n6f.foYrN3DlAL6/DD5dkgTe7j0EQzm','super_admin','2025-11-03 20:49:32','2025-11-03 21:00:24','active');
/*!40000 ALTER TABLE `ADMINS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `COMMUNITY_REQUESTS`
--

DROP TABLE IF EXISTS `COMMUNITY_REQUESTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `COMMUNITY_REQUESTS` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `institution_id` int(11) NOT NULL,
  `date_requested` datetime DEFAULT current_timestamp(),
  `status` enum('pending','in_fulfillment','approved','completed','rejected') DEFAULT 'pending',
  `priority_score` int(11) DEFAULT 0,
  `queue_position` int(11) DEFAULT NULL,
  `items_total` int(11) DEFAULT 0,
  `items_allocated` int(11) DEFAULT 0,
  `approval_date` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `completion_date` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_cr_institution` (`institution_id`),
  KEY `idx_cr_status` (`status`),
  KEY `idx_cr_date` (`date_requested`),
  KEY `idx_cr_queue` (`queue_position`),
  CONSTRAINT `COMMUNITY_REQUESTS_ibfk_1` FOREIGN KEY (`institution_id`) REFERENCES `INSTITUTIONS` (`institution_id`) ON DELETE CASCADE,
  CONSTRAINT `COMMUNITY_REQUESTS_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `ADMINS` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `COMMUNITY_REQUESTS`
--

LOCK TABLES `COMMUNITY_REQUESTS` WRITE;
/*!40000 ALTER TABLE `COMMUNITY_REQUESTS` DISABLE KEYS */;
/*!40000 ALTER TABLE `COMMUNITY_REQUESTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DISTRIBUTIONS`
--

DROP TABLE IF EXISTS `DISTRIBUTIONS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DISTRIBUTIONS` (
  `distribution_id` int(11) NOT NULL AUTO_INCREMENT,
  `community_request_id` int(11) DEFAULT NULL,
  `item_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `distribution_date` datetime DEFAULT current_timestamp(),
  `distributed_by` varchar(100) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `distribution_method` enum('direct_pickup','home_delivery','center_collection') NOT NULL,
  `recipient_feedback` text DEFAULT NULL,
  `distribution_notes` text DEFAULT NULL,
  `satisfaction_rating` int(11) DEFAULT NULL CHECK (`satisfaction_rating` >= 1 and `satisfaction_rating` <= 5),
  `quantity` int(11) DEFAULT 1,
  `status` enum('scheduled','in_transit','completed','cancelled') DEFAULT 'scheduled',
  PRIMARY KEY (`distribution_id`),
  KEY `idx_dist_item_id` (`item_id`),
  KEY `idx_dist_recipient_id` (`recipient_id`),
  KEY `idx_dist_date` (`distribution_date`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_dist_community_request` (`community_request_id`),
  KEY `idx_dist_status` (`status`),
  CONSTRAINT `DISTRIBUTIONS_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `ITEMS` (`item_id`),
  CONSTRAINT `DISTRIBUTIONS_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `RECIPIENTS` (`recipient_id`),
  CONSTRAINT `DISTRIBUTIONS_ibfk_3` FOREIGN KEY (`community_request_id`) REFERENCES `COMMUNITY_REQUESTS` (`request_id`) ON DELETE SET NULL,
  CONSTRAINT `DISTRIBUTIONS_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `ADMINS` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DISTRIBUTIONS`
--

LOCK TABLES `DISTRIBUTIONS` WRITE;
/*!40000 ALTER TABLE `DISTRIBUTIONS` DISABLE KEYS */;
INSERT INTO `DISTRIBUTIONS` VALUES (1,NULL,1,1,'2025-10-05 01:33:24','admin',NULL,'direct_pickup','Great quality laptop!',NULL,5,1,'scheduled'),(2,NULL,2,1,'2025-10-15 01:33:24','admin',NULL,'home_delivery','Books are helpful',NULL,4,1,'scheduled'),(3,NULL,3,1,'2025-10-25 01:33:24','admin',NULL,'direct_pickup',NULL,NULL,NULL,2,'scheduled'),(4,NULL,3,3,'2025-12-01 01:58:30','system-auto',NULL,'direct_pickup',NULL,NULL,NULL,1,'scheduled');
/*!40000 ALTER TABLE `DISTRIBUTIONS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DONATION_BATCHES`
--

DROP TABLE IF EXISTS `DONATION_BATCHES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DONATION_BATCHES` (
  `batch_id` int(11) NOT NULL AUTO_INCREMENT,
  `donor_id` int(11) NOT NULL,
  `donation_date` datetime DEFAULT current_timestamp(),
  `total_items` int(11) NOT NULL CHECK (`total_items` > 0),
  `pickup_required` tinyint(1) DEFAULT 0,
  `pickup_address` text DEFAULT NULL,
  `pickup_date` datetime DEFAULT NULL,
  `batch_notes` text DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`batch_id`),
  KEY `idx_batch_donor_id` (`donor_id`),
  KEY `idx_batch_approval_status` (`approval_status`),
  CONSTRAINT `DONATION_BATCHES_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `DONORS` (`donor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DONATION_BATCHES`
--

LOCK TABLES `DONATION_BATCHES` WRITE;
/*!40000 ALTER TABLE `DONATION_BATCHES` DISABLE KEYS */;
/*!40000 ALTER TABLE `DONATION_BATCHES` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DONORS`
--

DROP TABLE IF EXISTS `DONORS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DONORS` (
  `donor_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `institution` varchar(200) NOT NULL,
  `year_class` varchar(50) NOT NULL,
  `address` text NOT NULL,
  `registration_date` datetime DEFAULT current_timestamp(),
  `status` enum('active','inactive') DEFAULT 'active',
  `password` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`donor_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DONORS`
--

LOCK TABLES `DONORS` WRITE;
/*!40000 ALTER TABLE `DONORS` DISABLE KEYS */;
INSERT INTO `DONORS` VALUES (1,'Test User','test@example.com','9876543210','IIT Delhi','3rd Year','New Delhi, India','2025-11-01 01:09:20','active',''),(2,'Rudra','rudra@nothing.com','12345678','IIITDMJ','CSE','alkdfj\n','2025-11-01 02:37:48','active','$2b$10$0AqTS3lyiT7chHQHm0rkHOeetcK/DcpSPFKc1KuqDXKiKO8kC8PRO'),(3,'Dharm','Dharm@nothing.com','123456789','IIITDMJ','CSE','asdf','2025-11-01 02:42:03','active','$2b$10$YrXM/ACk4aWastVKGUV0fOhomVCchfwu7.34uYk6aHwRMBc6iqmvu'),(6,'Rudra Patel','rudra1@elevix.site','07574852372','IIIT','13','IIIT jabalpur\nDumna road','2025-11-30 23:37:52','active','$2b$10$8m6TwnGtByphvDRlSX3PuOvCqnoDI1/cGF0gtdf1JjQ7Byi.Lwq.q'),(7,'Rudra Patel','rudra2@elevix.site','07574852372','IIIT','25','IIIT jabalpur\nDumna road','2025-12-01 00:42:37','active','$2b$10$9FyesmA7LiFYo6mAqiGsDOw9tvc6OSW9u1q6xnAumyqAbzCAjW2hW');
/*!40000 ALTER TABLE `DONORS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `INSTITUTIONS`
--

DROP TABLE IF EXISTS `INSTITUTIONS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `INSTITUTIONS` (
  `institution_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `type` enum('School','Kindergarten','Orphanage','Community Center','Other') NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verification_notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_date` datetime DEFAULT NULL,
  `registration_date` datetime DEFAULT current_timestamp(),
  `total_requests` int(11) DEFAULT 0,
  `total_items_received` int(11) DEFAULT 0,
  PRIMARY KEY (`institution_id`),
  UNIQUE KEY `email` (`email`),
  KEY `verified_by` (`verified_by`),
  KEY `idx_institution_type` (`type`),
  KEY `idx_institution_verification` (`verification_status`),
  KEY `idx_institution_email` (`email`),
  CONSTRAINT `INSTITUTIONS_ibfk_1` FOREIGN KEY (`verified_by`) REFERENCES `ADMINS` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `INSTITUTIONS`
--

LOCK TABLES `INSTITUTIONS` WRITE;
/*!40000 ALTER TABLE `INSTITUTIONS` DISABLE KEYS */;
/*!40000 ALTER TABLE `INSTITUTIONS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ITEMS`
--

DROP TABLE IF EXISTS `ITEMS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ITEMS` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(200) NOT NULL,
  `category` enum('clothes','books','electronics','toys','stationery','others') NOT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `size_info` varchar(50) DEFAULT NULL,
  `condition_status` enum('excellent','good','fair','poor') NOT NULL,
  `description` text DEFAULT NULL,
  `estimated_value` decimal(10,2) DEFAULT NULL CHECK (`estimated_value` >= 0),
  `donor_id` int(11) NOT NULL,
  `donation_date` datetime DEFAULT current_timestamp(),
  `availability_status` enum('available','reserved','distributed','damaged') DEFAULT 'available',
  PRIMARY KEY (`item_id`),
  KEY `idx_category` (`category`),
  KEY `idx_availability_status` (`availability_status`),
  KEY `idx_donor_id` (`donor_id`),
  CONSTRAINT `ITEMS_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `DONORS` (`donor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ITEMS`
--

LOCK TABLES `ITEMS` WRITE;
/*!40000 ALTER TABLE `ITEMS` DISABLE KEYS */;
INSERT INTO `ITEMS` VALUES (1,'Mathematics Textbook - Class 10','books','Textbooks',NULL,'excellent','NCERT Mathematics textbook for Class 10, barely used',250.00,1,'2025-11-04 01:18:44','reserved'),(2,'Scientific Calculator','electronics','Calculators',NULL,'good','Casio FX-991EX scientific calculator, works perfectly',500.00,1,'2025-11-04 01:18:44','reserved'),(3,'School Bag','others','Bags',NULL,'good','Blue school bag with multiple compartments',350.00,2,'2025-11-04 01:18:44','distributed'),(4,'Set of 10 Notebooks','stationery','Notebooks',NULL,'excellent','Brand new set of ruled notebooks',100.00,2,'2025-11-04 01:18:44','reserved'),(5,'Winter Jacket - Size M','clothes','Winter wear',NULL,'good','Warm winter jacket suitable for age 12-14',800.00,3,'2025-11-04 01:18:44','reserved'),(6,'Test Book','books',NULL,NULL,'good',NULL,NULL,1,'2025-12-01 01:04:48','distributed'),(7,'Another Test','books',NULL,NULL,'good',NULL,NULL,1,'2025-12-01 01:04:55','reserved'),(8,'Phy','books','science','32','good','test',500.00,7,'2025-12-01 01:05:37','reserved');
/*!40000 ALTER TABLE `ITEMS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ITEM_REQUESTS`
--

DROP TABLE IF EXISTS `ITEM_REQUESTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ITEM_REQUESTS` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `community_request_id` int(11) DEFAULT NULL,
  `recipient_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `request_date` datetime DEFAULT current_timestamp(),
  `request_status` enum('pending','approved','rejected','fulfilled') DEFAULT 'pending',
  `allocated_by` int(11) DEFAULT NULL,
  `allocated_date` datetime DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `quantity_requested` int(11) DEFAULT 1,
  PRIMARY KEY (`request_id`),
  KEY `idx_request_recipient_id` (`recipient_id`),
  KEY `idx_request_item_id` (`item_id`),
  KEY `idx_request_status` (`request_status`),
  KEY `allocated_by` (`allocated_by`),
  KEY `idx_ir_community_request` (`community_request_id`),
  CONSTRAINT `ITEM_REQUESTS_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `RECIPIENTS` (`recipient_id`),
  CONSTRAINT `ITEM_REQUESTS_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `ITEMS` (`item_id`),
  CONSTRAINT `ITEM_REQUESTS_ibfk_3` FOREIGN KEY (`community_request_id`) REFERENCES `COMMUNITY_REQUESTS` (`request_id`) ON DELETE SET NULL,
  CONSTRAINT `ITEM_REQUESTS_ibfk_4` FOREIGN KEY (`allocated_by`) REFERENCES `ADMINS` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ITEM_REQUESTS`
--

LOCK TABLES `ITEM_REQUESTS` WRITE;
/*!40000 ALTER TABLE `ITEM_REQUESTS` DISABLE KEYS */;
INSERT INTO `ITEM_REQUESTS` VALUES (1,NULL,1,1,'2025-11-04 01:31:11','pending',NULL,NULL,NULL,1),(7,NULL,1,4,'2025-10-30 01:43:40','approved',NULL,NULL,'Need for school activities',1),(8,NULL,1,5,'2025-10-20 01:43:40','fulfilled',NULL,NULL,'Required for daily use',1),(9,NULL,1,2,'2025-10-27 01:43:40','rejected',NULL,NULL,'For studying',2),(10,NULL,1,3,'2025-11-02 01:43:40','pending',NULL,NULL,'Winter season',1),(11,NULL,1,2,'2025-11-04 01:47:11','pending',NULL,NULL,NULL,1),(12,NULL,6,4,'2025-11-30 23:32:11','pending',NULL,NULL,NULL,1),(13,NULL,3,8,'2025-12-01 01:08:18','pending',NULL,NULL,NULL,1),(14,NULL,3,7,'2025-12-01 01:56:32','pending',NULL,NULL,NULL,1),(15,NULL,3,6,'2025-12-01 01:56:56','fulfilled',NULL,NULL,NULL,1),(16,NULL,3,3,'2025-12-01 01:58:30','fulfilled',NULL,NULL,NULL,1),(17,NULL,12,5,'2025-12-01 03:43:49','pending',NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `ITEM_REQUESTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NOTIFICATIONS`
--

DROP TABLE IF EXISTS `NOTIFICATIONS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NOTIFICATIONS` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) DEFAULT NULL,
  `type` enum('new_donor','new_recipient','new_request','new_batch','low_stock','pending_approval','system_alert') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `related_entity_type` enum('donor','recipient','item','request','batch','institution') DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`),
  KEY `idx_notif_admin` (`admin_id`),
  KEY `idx_notif_read` (`is_read`),
  KEY `idx_notif_type` (`type`),
  KEY `idx_notif_date` (`created_at`),
  CONSTRAINT `NOTIFICATIONS_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `ADMINS` (`admin_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NOTIFICATIONS`
--

LOCK TABLES `NOTIFICATIONS` WRITE;
/*!40000 ALTER TABLE `NOTIFICATIONS` DISABLE KEYS */;
/*!40000 ALTER TABLE `NOTIFICATIONS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RECIPIENTS`
--

DROP TABLE IF EXISTS `RECIPIENTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RECIPIENTS` (
  `recipient_id` int(11) NOT NULL AUTO_INCREMENT,
  `institution_id` int(11) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `guardian_name` varchar(100) NOT NULL,
  `guardian_contact` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `needs_description` text DEFAULT NULL,
  `application_letter` text DEFAULT NULL,
  `registration_date` datetime DEFAULT current_timestamp(),
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `recipient_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`recipient_id`),
  UNIQUE KEY `recipient_code` (`recipient_code`),
  KEY `idx_guardian_contact` (`guardian_contact`),
  KEY `idx_verification_status` (`verification_status`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_recipient_institution` (`institution_id`),
  KEY `idx_recipient_code` (`recipient_code`),
  CONSTRAINT `RECIPIENTS_ibfk_1` FOREIGN KEY (`institution_id`) REFERENCES `INSTITUTIONS` (`institution_id`) ON DELETE SET NULL,
  CONSTRAINT `RECIPIENTS_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `ADMINS` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RECIPIENTS`
--

LOCK TABLES `RECIPIENTS` WRITE;
/*!40000 ALTER TABLE `RECIPIENTS` DISABLE KEYS */;
INSERT INTO `RECIPIENTS` VALUES (1,NULL,'Rudra',15,'Other','Guardian','+919998106207','Not provided',NULL,NULL,'2025-11-04 01:13:33','verified',NULL,NULL,NULL,NULL,NULL,NULL),(2,NULL,'Test Child',12,'Male','Test Guardian','1234567890','Test Address','School supplies',NULL,'2025-11-04 02:30:31','verified',NULL,NULL,NULL,NULL,NULL,NULL),(3,NULL,'Pending Child',10,'Female','Jane Guardian','9876543210','123 Test Street','Clothing and books',NULL,'2025-11-04 02:35:40','verified',NULL,NULL,NULL,NULL,NULL,NULL),(4,NULL,'Reject Test',8,'Male','Test Guardian','5555555555','Test Address',NULL,NULL,'2025-11-04 02:36:10','rejected',NULL,NULL,NULL,NULL,NULL,NULL),(5,NULL,'Emma Thompson',9,'Female','Sarah Thompson','9998887777','456 Oak Street, Delhi','School uniform and books',NULL,'2025-11-04 02:40:00','verified',NULL,NULL,NULL,NULL,NULL,NULL),(6,NULL,'dharm',15,'Other','Guardian','+91 123456789','Not provided',NULL,NULL,'2025-11-30 23:31:46','pending',NULL,NULL,NULL,NULL,NULL,NULL),(7,NULL,'ABC School',NULL,NULL,'Principal Kumar','8888777766','123 Education Lane, Knowledge City, 110001',NULL,NULL,'2025-12-01 03:18:59','pending',NULL,NULL,NULL,NULL,NULL,NULL),(8,NULL,'ABC School',NULL,NULL,'Dharm','+91 123456798','asdfadsgasdf','Beneficiaries: 100','2. Recipient Portal (frontend/recipient-portal/app.js)\nNew Multi-Step RegisterPage:\n- Step 1: Personal info (name, age, gender, guardian name, phone, address)\n- Step 2: Application letter (textarea with minimum 50 chars OR .txt file upload)\n- Progress indicator showing current step\n- Success page after submission with instructions\nUpdated LoginPage:\n- Now accepts Recipient Code as the primary login method\n- Shows better error messages for pending/rejected applications\n- Updated placeholder text\n3. Admin Portal (frontend/ADMIN/app.js)\nEnhanced CommunitiesManagement Page:\n- Added \"Recipient Applications\" section at the top with:\n  - Filter by status (Pending/Verified/Rejected/All)\n  - Search by name or phone\n  - Table with columns: ID, Name, Age/Gender, Guardian, Contact, Applied On, Status, Actions\n  - Action buttons: Preview (📄), Approve (✓), Reject (✗)\n  \n- Preview Modal: Shows full application details including:\n  - Personal information grid\n  - Full address\n  - Application letter in a highlighted box\n  - Approve/Reject buttons\n- Approval Success Modal: Shows:\n  - Success message\n  - Generated Recipient Code (prominent display)\n  - Instructions to share with recipient\n- Reject Modal:\n  - Textarea for rejection reason (required)\n  - Confirm/Cancel buttons\n---\nComplete Workflow\n1. Recipient applies via multi-step form → application goes to \"pending\" status\n2. Admin reviews in Communities/Recipients page → sees pending applications with badge count\n3. Admin previews full application including letter\n4. Admin approves → unique code generated (e.g., RCP-20251201-A7B3) → shown in modal\n5. Admin shares code with recipient (manually via phone/email)\n6. Recipient logs in using the code → can now browse and request items','2025-12-01 03:20:07','pending',NULL,NULL,NULL,NULL,NULL,NULL),(9,NULL,'XYZ Orphanage',NULL,NULL,'Caretaker Sharma','6666555544','789 Care Street, Help City 445566','Type: Orphanage, Beneficiaries: 50',NULL,'2025-12-01 03:25:48','pending',NULL,NULL,NULL,NULL,NULL,NULL),(10,NULL,'Hope Foundation',NULL,NULL,'Priya Patel','9988776655','789 Hope Street, Delhi 110001',NULL,'We need resources for 50 children.','2025-12-01 03:39:26','verified',NULL,NULL,NULL,NULL,NULL,NULL),(11,NULL,'Test NGO',NULL,NULL,'John Manager','9876522132','123 Test Street',NULL,'We need educational supplies for 50 children.','2025-12-01 03:41:22','verified',NULL,NULL,NULL,NULL,NULL,'RCP401679'),(12,NULL,'ABC School',NULL,NULL,'Dharm','1123456789','asdlkfjal;k',NULL,'2. Recipient Portal (frontend/recipient-portal/app.js)\nNew Multi-Step RegisterPage:\n- Step 1: Personal info (name, age, gender, guardian name, phone, address)\n- Step 2: Application letter (textarea with minimum 50 chars OR .txt file upload)\n- Progress indicator showing current step\n- Success page after submission with instructions\nUpdated LoginPage:\n- Now accepts Recipient Code as the primary login method\n- Shows better error messages for pending/rejected applications\n- Updated placeholder text\n3. Admin Portal (frontend/ADMIN/app.js)\nEnhanced CommunitiesManagement Page:\n- Added \"Recipient Applications\" section at the top with:\n  - Filter by status (Pending/Verified/Rejected/All)\n  - Search by name or phone\n  - Table with columns: ID, Name, Age/Gender, Guardian, Contact, Applied On, Status, Actions\n  - Action buttons: Preview (📄), Approve (✓), Reject (✗)\n  \n- Preview Modal: Shows full application details including:\n  - Personal information grid\n  - Full address\n  - Application letter in a highlighted box\n  - Approve/Reject buttons\n- Approval Success Modal: Shows:\n  - Success message\n  - Generated Recipient Code (prominent display)\n  - Instructions to share with recipient\n- Reject Modal:\n  - Textarea for rejection reason (required)\n  - Confirm/Cancel buttons\n---\nComplete Workflow\n1. Recipient applies via multi-step form → application goes to \"pending\" status\n2. Admin reviews in Communities/Recipients page → sees pending applications with badge count\n3. Admin previews full application including letter\n4. Admin approves → unique code generated (e.g., RCP-20251201-A7B3) → shown in modal\n5. Admin shares code with recipient (manually via phone/email)\n6. Recipient logs in using the code → can now browse and request items','2025-12-01 03:42:41','verified',NULL,NULL,NULL,NULL,NULL,'RCP642353'),(13,NULL,'BCD school',NULL,NULL,'Tanmay','1123456765','adsk;fadfjkaldfjdkal',NULL,'2. Recipient Portal (frontend/recipient-portal/app.js)\nNew Multi-Step RegisterPage:\n- Step 1: Personal info (name, age, gender, guardian name, phone, address)\n- Step 2: Application letter (textarea with minimum 50 chars OR .txt file upload)\n- Progress indicator showing current step\n- Success page after submission with instructions\nUpdated LoginPage:\n- Now accepts Recipient Code as the primary login method\n- Shows better error messages for pending/rejected applications\n- Updated placeholder text\n3. Admin Portal (frontend/ADMIN/app.js)\nEnhanced CommunitiesManagement Page:\n- Added \"Recipient Applications\" section at the top with:\n  - Filter by status (Pending/Verified/Rejected/All)\n  - Search by name or phone\n  - Table with columns: ID, Name, Age/Gender, Guardian, Contact, Applied On, Status, Actions\n  - Action buttons: Preview (📄), Approve (✓), Reject (✗)\n  \n- Preview Modal: Shows full application details including:\n  - Personal information grid\n  - Full address\n  - Application letter in a highlighted box\n  - Approve/Reject buttons\n- Approval Success Modal: Shows:\n  - Success message\n  - Generated Recipient Code (prominent display)\n  - Instructions to share with recipient\n- Reject Modal:\n  - Textarea for rejection reason (required)\n  - Confirm/Cancel buttons\n---\nComplete Workflow\n1. Recipient applies via multi-step form → application goes to \"pending\" status\n2. Admin reviews in Communities/Recipients page → sees pending applications with badge count\n3. Admin previews full application including letter\n4. Admin approves → unique code generated (e.g., RCP-20251201-A7B3) → shown in modal\n5. Admin shares code with recipient (manually via phone/email)\n6. Recipient logs in using the code → can now browse and request items','2025-12-01 03:52:00','verified',NULL,NULL,NULL,NULL,NULL,'RCP376404');
/*!40000 ALTER TABLE `RECIPIENTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `REQUEST_ITEMS`
--

DROP TABLE IF EXISTS `REQUEST_ITEMS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `REQUEST_ITEMS` (
  `request_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `community_request_id` int(11) NOT NULL,
  `category` enum('clothes','books','electronics','toys','stationery','others') NOT NULL,
  `quantity_requested` int(11) NOT NULL CHECK (`quantity_requested` > 0),
  `quantity_allocated` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`request_item_id`),
  KEY `idx_ri_request` (`community_request_id`),
  KEY `idx_ri_category` (`category`),
  CONSTRAINT `REQUEST_ITEMS_ibfk_1` FOREIGN KEY (`community_request_id`) REFERENCES `COMMUNITY_REQUESTS` (`request_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `REQUEST_ITEMS`
--

LOCK TABLES `REQUEST_ITEMS` WRITE;
/*!40000 ALTER TABLE `REQUEST_ITEMS` DISABLE KEYS */;
/*!40000 ALTER TABLE `REQUEST_ITEMS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SYSTEM_SETTINGS`
--

DROP TABLE IF EXISTS `SYSTEM_SETTINGS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SYSTEM_SETTINGS` (
  `setting_id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `SYSTEM_SETTINGS_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `ADMINS` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SYSTEM_SETTINGS`
--

LOCK TABLES `SYSTEM_SETTINGS` WRITE;
/*!40000 ALTER TABLE `SYSTEM_SETTINGS` DISABLE KEYS */;
INSERT INTO `SYSTEM_SETTINGS` VALUES (1,'auto_generate_recipient_code','true','Automatically generate recipient codes on approval',NULL,'2025-11-03 20:49:33'),(2,'recipient_code_prefix','REC','Prefix for recipient codes',NULL,'2025-11-03 20:49:33'),(3,'queue_auto_update','true','Automatically update request queue positions',NULL,'2025-11-03 20:49:33'),(4,'require_email_verification','false','Require email verification for new registrations',NULL,'2025-11-03 20:49:33'),(5,'max_items_per_request','50','Maximum items allowed per community request',NULL,'2025-11-03 20:49:33');
/*!40000 ALTER TABLE `SYSTEM_SETTINGS` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-01  4:21:36
