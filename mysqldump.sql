-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: property_db
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_id` int DEFAULT NULL,
  `message` text,
  `type` enum('new_launch','inquiry_response','property','system') DEFAULT NULL,
  `property_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  KEY `idx_notifications_recipient` (`recipient_id`,`is_read`),
  KEY `idx_recipient_type` (`recipient_id`,`type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`),
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (6,4,'Your property Senai project was rejected. Reason: Invalid REN number, please review it.','property',NULL,1,'2024-10-25 03:07:34'),(14,4,'Your property Taman Selesa Indah, Phase 3A has been approved','property',30,1,'2024-10-25 03:37:42'),(15,4,'Your property Austin has been approved','property',34,1,'2024-10-27 12:13:25'),(16,4,'Your property Suria Hills Iskandar Puteri has been approved','property',35,1,'2024-11-20 08:31:08'),(17,4,'Your property TownHouse was rejected. Reason: Not valid REN number','property',NULL,1,'2024-12-14 09:25:56'),(33,4,'Your property Duta was rejected. Reason: Invalid project','property',NULL,1,'2024-12-15 10:20:04'),(40,5,'New property submission requires approval: The Senai Garden in Senai','property',NULL,1,'2024-12-15 10:46:41'),(42,5,'New property submission requires approval: Citrine Hills Double in Kangkar Pulai','property',NULL,1,'2024-12-15 10:50:37'),(43,4,'Your property Citrine Hills Double has been approved','property',46,1,'2024-12-15 10:50:53'),(44,5,'New property submission requires approval: Suria Hills Iskandar Puteri in Iskandar Puteri','property',NULL,1,'2024-12-15 10:53:30'),(45,4,'Your property Suria Hills Iskandar Puteri has been approved','property',47,1,'2024-12-15 10:53:42'),(47,5,'New property submission requires approval: Southkey NADI Residences in Johor Bahru','property',NULL,1,'2024-12-19 06:41:05'),(48,4,'Your property Southkey NADI Residences has been approved','property',48,0,'2024-12-19 06:41:50'),(49,1,'New property matching your preferences: Suria Hills Iskandar Puteri in Iskandar Puteri - RM1,200,000.00','new_launch',35,1,'2025-01-01 06:41:50'),(50,5,'New property submission requires approval: Taman Johors in Tampoi','property',NULL,0,'2025-01-05 16:01:38');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pending_properties`
--

DROP TABLE IF EXISTS `pending_properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pending_properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `bedrooms` int DEFAULT NULL,
  `bathrooms` int DEFAULT NULL,
  `size` float DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `form_of_interest` varchar(50) DEFAULT NULL,
  `financing_options` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `submitted_by` int DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `description` text,
  `furnishing_status` varchar(50) DEFAULT NULL,
  `facing_direction` varchar(100) DEFAULT NULL,
  `year_built` int DEFAULT NULL,
  `facilities` text,
  PRIMARY KEY (`id`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_status` (`status`),
  CONSTRAINT `pending_properties_ibfk_1` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_properties`
--

LOCK TABLES `pending_properties` WRITE;
/*!40000 ALTER TABLE `pending_properties` DISABLE KEYS */;
INSERT INTO `pending_properties` VALUES (15,'Senai','Bungalow',5,5,1600,1200000.00,1.523889,103.650817,'Senai','Freehold','Bank Loan','rejected',4,'Invalid project','2024-10-25 03:07:34',NULL,NULL,NULL,NULL,NULL),(19,'TownHouse','Double storey terraced house',3,3,2300,500000.00,1.592828,103.773805,'Senai','Freehold','Bank Loan','rejected',4,'Not valid REN number','2024-12-14 09:25:56','testing','Fully Furnished','South',2026,'gym'),(20,'Duta','Cluster house',5,5,2366,688888.00,1.443379,103.650817,'Senai','Freehold','Bank Loan','rejected',4,'Wrong location','2024-12-15 10:20:04','haha','Fully Furnished','North West',2025,'gym'),(32,'Taman Johors','Single storey terraced house',3,5,1100,458000.00,1.513768,103.694103,'Tampoi','Freehold','Bank Loan','pending',4,NULL,NULL,'Landed Single Storey Terrace, nearby Paradigm Mall, easy access to Skudai Highway towards CIQ\r\n\r\nTaman Johor @ Jalan Ledang\r\n\r\nSingle Storey Terrace House\r\nLand Size : 22 x70 sqft\r\nBedrooms : 3\r\nBathrooms : 3\r\nFreehold\r\nIntermediate, Non-Bumi Lot\r\nDirection : South (slightly West)\r\n\r\nRenovation & Furnishing:\r\n- New Paint, Mossaic flooring, extended wet kitchen, table top','Partially Furnished','South',2023,'-');
/*!40000 ALTER TABLE `pending_properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `user_id` int NOT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `preferred_area` varchar(255) DEFAULT NULL,
  `preferred_property_type` varchar(255) DEFAULT NULL,
  `price_range_min` decimal(10,2) DEFAULT NULL,
  `price_range_max` decimal(10,2) DEFAULT NULL,
  `REN_id` varchar(100) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `verified_status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES (1,'Trainer','Iskandar Puteri','Bungalow',100.00,3200000.00,NULL,NULL,0),(3,NULL,'kulai1','flat1',1001.00,0.00,NULL,NULL,0),(4,NULL,NULL,NULL,NULL,NULL,'REN19385','RAA',1),(11,'Trainer','Senai','Bungalow',0.00,0.00,NULL,NULL,0),(12,'Trainer','Senai','Bungalow',0.00,0.00,NULL,NULL,0),(13,'Trainer','Senai','Bungalow',NULL,NULL,NULL,NULL,0),(14,'Trainer','Senai','Bungalow',NULL,NULL,NULL,NULL,0),(15,'Trainer','Senai','Bungalow',NULL,NULL,NULL,NULL,0),(16,'Trainer','Senai','Bungalow',NULL,NULL,NULL,NULL,0),(17,'Trainer','Senai','Bungalow',NULL,NULL,NULL,NULL,0),(18,'Trainer','Senai','Bungalow',NULL,NULL,NULL,NULL,0),(21,'Trainer','Senai','Bungalow',1.00,1689900.00,NULL,NULL,0),(22,NULL,NULL,NULL,NULL,NULL,'REN19842','ben',1),(23,'Trainer','Senai','Bungalow',1.00,123.00,NULL,NULL,0),(24,NULL,NULL,NULL,NULL,NULL,'REN17456','123',1),(25,NULL,NULL,NULL,NULL,NULL,'REN29265','12',1),(26,NULL,NULL,NULL,NULL,NULL,'REN12575','12',1),(27,NULL,NULL,NULL,NULL,NULL,'REN19623','',0);
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `bedrooms` int DEFAULT NULL,
  `bathrooms` int DEFAULT NULL,
  `size` float DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `form_of_interest` varchar(50) DEFAULT NULL,
  `financing_options` varchar(255) DEFAULT NULL,
  `submitted_by` int DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text,
  `furnishing_status` varchar(50) DEFAULT NULL,
  `facing_direction` varchar(100) DEFAULT NULL,
  `year_built` int DEFAULT NULL,
  `facilities` text,
  PRIMARY KEY (`id`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_status` (`status`),
  KEY `idx_area` (`area`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (1,'Austin Duta Phase 9B','Double storey terraced house',4,3,2006,651100.00,1.564803,103.778473,'Austin Heights','Freehold','Bank Loan',4,5,'approved','2024-10-24 11:24:45',NULL,'2024-10-24 12:22:06','2024-11-28 06:39:24','Why we recommend Austin Duta Phase 9B\r\nA mature neighborhood within the Tebrau corridor\r\nSurrounded by lifestyle ammenities, schools, and hospitals\r\nOpen concept for the living-dining-kitchen area to maximise space\r\nSpace for a garden at the back\r\n\r\nYour Home. Your Belonging\r\nAustin Duta is built for utmost spaciousness, together with a stylish elegance to suit every lifestyle. As an embodiment of perfect design together with a functional layout, this soothing living environment is the beginning of a good life.','Unfurnished','South',2025,'Jogging track, Playground'),(2,' Ponderosa Vista','Semi-detached house',4,4,4258,1800000.00,1.518218,103.775350,'Johor Bahru','Freehold','Bank Loan',4,5,'approved','2024-10-24 11:24:45',NULL,'2024-10-24 12:22:06','2024-11-28 06:43:28','Why we recommend Ponderosa Vista 2-Storey Semi-Detached\r\nConvenient access to amenities, 15-min drive to city center & JB CIQ\r\nGated & Guarded community with 24 hour security\r\n\r\nPonderosa Vista @ Taman Ponderosa\r\nDiscover Urban Connectivity and Convenience at Ponderosa Vista. Located at a premier location, Ponderosa Vista stands as a catalyst of urban connectivity. With its strategic positioning, everything you need is within easy reach. From bustling city centers to essential services, indulge in a lifestyle where convenience is at your doorstep.','Unfurnished','South',2025,'Perimeter Fencing, 24 hours security'),(3,'The Senai Garden','Apartment',3,2,968,430000.00,1.594574,103.648138,'Senai','Freehold','Bank Loan',4,5,'approved','2024-10-24 11:24:45',NULL,'2024-10-24 12:22:06','2025-01-05 07:04:46','Low Density\r\n392 Units Only\r\n\r\nKey features:\r\n-Freehold\r\n- Low density\r\n- Lush greenery garden concept\r\n- Multi-tier security system\r\n- Excellent facilities\r\n- Strategic location\r\n','Unfurnished','West',2025,'BBQ,Covered car park, Clubhouse,Gym,Jacuzzi,Lounge,Playground,Sauna,24 hours security,Swimming pool,Tennis courts'),(13,'Citrine Hills Double','Double storey terraced house',4,3,1845,518000.00,1.564396,103.574648,'Kangkar Pulai','Leasehold','Bank Loan',4,5,'approved','2024-10-24 11:24:45',NULL,'2024-10-24 12:22:06','2024-11-22 07:59:23','Bandar Baru Kangkar Pulai- Phase 2, Double Storey Terrace House\r\nShow Units ready for Viewing\r\n\r\nBandar Baru Kangkar Pulai (BBKP) is a serene nature-inspired mixed township development by Keck Seng Group constituting approximately 1,500 acres, and has the existing Skudai-Pontian Highway running through the township connecting BBKP to the new 2nd interchange at Pulai Jaya and the Second Link to Singapore; affording residents accessibility with ease to key catalyst developments in Iskandar Puteri and around Iskandar Malaysia like Puteri Harbour, EduCity, Legoland Malaysia, Columbia Asia Hospital, Johor Premium Outlets, Senai International Airport and Tuas, Singapore. BBKP also features Johor Bahru’s First and One-of-a-Kind 50-Acre Serene Hilltop Nature Park at 80 meters above sea level and an upcoming 60-Acre Business District known as BBKP Central (emulating our successful 35-Acre TD Central in Taman Daya) - hosting, in the near future, a New Econsave Hypermarket, Fast Food & F&B Outlets, Banks, Showrooms, and Lifestyle & Convenience Centers. Meanwhile, BBKP presently boasts a wealth of schools such as SJK(C) Woon Hwa (presently upgrading and expanding), SMK Kangkar Pulai, SK Kangkar Pulai and SJK(T) Kangkar Pulai; all amidst convenient nearby go-to destinations like the new Econsave Hypermarket Taman Teratai, Pulai Springs Resort, Universiti Teknologi Malaysia (UTM) and AEON Mall Taman Universiti.\r\n\r\nNearby to following amenities, institution centres and prominent landmarks:\r\n\r\n- 4.5KM to NEW 2nd Interchange at Pulai Jaya to Second Link Highway to Iskandar Puteri & Singapore\r\n- 4.5KM to NEW Econsave Hypermarket in Taman Teratai\r\n- 7.5KM to Pulai Springs Resort\r\n- 8.7KM to UTM\r\n- 9.2KM to AEON Mall Taman Universiti\r\n- 21KM to Senai International Airport\r\n- 23KM to Johor Premium Outlets\r\n- 2KM to upcoming 60-Acre Business District known as BBKP Central - hosting, in the near future, a New Econsave Hypermarket, Fast Food & F&B Outlets, Banks, Showrooms, and Lifestyle & Convenience Centers\r\n\r\nPhase 1 sold out.','Unfurnished','North',2024,'Perimeter Fencing, Playground, 24 hours security'),(14,'R&F Princess Cove','Apartment',1,1,548,580000.00,1.458931,103.769531,'Tanjung Puteri','Freehold','Bank Loan',4,5,'approved','2024-10-24 11:24:45',NULL,'2024-10-24 12:22:06','2024-11-28 06:35:35','Enjoy the Best of Both World by a Bridge so Near\r\nStraddling both sides of the causeway to Singapore, Princess Cove is a mixed development and prime waterfront project. strategically located in the CBD. It has an exclusive access to CIQ through the 650-meter linked bridge that connects to RTS Link. In the near future, publics can enjoy great connectivity between Johor Bahru & Singapore with just one stop away!\r\n\r\nR&F Princess Cove is well equipped with world-class amenities of Skypark Clubhouse, swimming pools, gym room, as well as Johor Bahru’s first opera house-Permaisuri Zarith Sofiah Opera House. With its significant location and distinctive design, it has become one of the most iconic masterpiece and landmark in Johor.\r\n\r\nR&F Marina Place offers a diverse range of amenities, including yacht clubs, special performing arts bars and stylish dining, creating a vibrant and sophisticated lifestyle experience.\r\n\r\nR&F Princess Cove not only within financial reach but also convenient for working professionals who travel to Singapore on a daily basis. Dual key units are perfect for retirees looking to live with their children who commutes to Singapore frequently, or for those seeking rental income while with the Dual Key Units, R&F giving you more spaces ,and more cohesion with your lovely family.','Unfurnished','North East',2024,'BBQ, Clubhouse, Gym, Jacuzzi, Jogging track, Landscaped Garden, Multi-purpose hall, Playground, 24 hours security, Swimming pool, Tennis courts, Yoga Room'),(15,'Nasa City - Desa Palma Phase 11A','Double storey terraced house',4,3,2006,880000.00,1.554658,103.726305,'Desa Palma','Freehold','Bank Loan',4,5,'approved','2024-10-24 11:24:45',NULL,'2024-10-24 12:22:06','2024-11-28 06:55:35','Easy access from the North-South Expressway\r\nFull height wall tiles for all bathrooms\r\n7ft backyard space for a garden\r\nWide Terrace (24′ x 70′)\r\n\r\nA stylish elegance to suit every lifestyle\r\nOnly BUMI units available\r\n\r\nThe meticulously designed layout of these homes ushers in a unique sense of warmth and comfort. Infused with natural light that fills every nook and cranny, these interiors exude a radiant and airy atmosphere, making them a delightful feature, especially on crisp, breezy days.','Unfurnished','North East',2025,'Parking,24 hours security'),(16,'Taman Selesa Indah, Phase 3A','Bungalow',4,4,1898,758000.00,1.443379,103.621060,'Skudai','Leasehold ','Bank Loan',4,5,'approved','2024-10-24 11:24:45',NULL,'2024-10-24 12:22:06','2025-01-03 06:54:10','The Ultimate Choice of Living\r\nWelcome to Taman Selesa Indah, Skudai\r\nNestled in the vibrant district of Skudai, Taman Selesa Indah offers a serene and inviting residential environment amidst the bustling cityscape. This neighborhood is celebrated for its blend of modern conveniences and natural beauty, making it a coveted location for families and individuals alike.','Partially Furnished','South',NULL,'Playground,24 hours security'),(18,'Greenwoods Residence @ Taman Daya','Cluster house',4,4,2114,838950.00,1.556429,103.762923,'Taman Daya','Freehold','Bank Loan',4,5,'approved','2024-10-24 11:24:45',NULL,'2024-10-24 12:22:06','2024-11-28 07:12:08','TD Point , TD Central, TD Sports Centre\r\nAEON Mall Tebrau City, Lotus Desa Tebrau, IKEA Tebrau, Toppen Shopping Centre\r\nAustin Heights Private & International Schools, Fairview International School, Sunway College Johor Bahru, Crescendo International College\r\nSultan Ismail Hospital, KPJ Bandar Baru Dato Onn Specialist Hospital.\r\n\r\nExclusive Nature Within Urban Living\r\nGreenwoods Residences espouses an “Exclusive Nature Within Urban Living” concept and comprises of 2-Storey Cluster, Semi-Detached, and Link Bungalow Homes in a Freehold, Low Density, and Gated and Guarded refined residential scheme. Buyers can look forward to open-concept floor plans, en-suite first floor bedrooms, and spacious living and dining areas in this legacy address from a branded developer.','Partially Furnished','South West',2026,'-'),(21,'Bukit Impian Residence @ Taman Impian Emas','Semi-detached house',4,5,3613,1700000.00,1.555538,103.680959,'Impian Emas','Freehold','Bank Loan',4,5,'approved','2024-10-25 02:55:42','2024-10-25 02:55:43','2024-10-25 02:55:43','2024-11-28 07:15:12','4 Bedrooms + 1 Study room + 5 Baths\r\nHuge car porch comfortably fits 4 cars, private green yard space\r\n32A isolator for EV charger\r\nSmart Home System: Digital locks, Smart Gateway, Switches.\r\n\r\nWhere Luxury Meets Serenity in Every Detail\r\nTaman Impian Emas – The Golden District, one of the Best Mega Township in Johor Bahru presents another exclusive collection of nature-inspired homes – Bukit Impian Residence. This dynamic township is a wellplanned, integrated and self-contained township that offers mixed developments of residential, commercial and industrial properties. Nestled within the harmonious haven of a verdant vista, Bukit Impian Residence is a gated and guarded community that is meticulously designed to exude tranquillity and create a sanctuary, specially for those looking to escape the hectic city life.\r\n\r\nEnclaved in Taman Impian Emas, Bukit Impian Residence is strategically located in Iskandar Malaysia, is about 20km North-West of Johor Bahru City Centre with convenient access to the Skudai Highway, North-South Highway, and Bukit Amber Interchange.\r\n\r\nFor daily necessities and retail therapies, residents of Bukit Impian Residence can head on to Paradigm Mall, Aeon, Lotus and Sutera Mall which are within a short distance from the development.','Partially Furnished','West',2026,'Basketball court,Perimeter Fencing,Playground,24 hours security'),(30,'Sunway Maple Residence','Double storey terraced house',4,4,2200,1220000.00,1.390794,103.639999,'Iskandar Puteri','Freehold','Bank Loan',4,5,'approved','2024-10-25 03:37:42','2024-10-25 03:37:42','2024-10-25 03:37:42','2024-11-28 07:22:56','Modern layout with a Semi-D Concept Terrace appeal\r\nLow density residence with only 156 units\r\nConnected to the Central Park with walking distance to surrounding amenities\r\n2 Master Bedrooms (Master and Master Jr with walk-in wardrobe space)\r\n\r\nThe First Freehold Landed Residence in Sunway City Iskandar Puteri\r\nSunway City Iskandar Puteri unveils its first freehold Semi-D Concept Terrace Homes, Sunway Maple Residence. Indulge in expansive layouts ranging from 30 x 60 to 90, set within a tranquil, low-density enclave of just 156 exclusive homes.\r\n\r\nEmbrace the perfect harmony of indoor and outdoor living, all while being seamlessly connected to the lively Central Park and the surrounding natural beauty.','Partially Furnished','South West',2027,'Perimeter Fencing,Jogging track,Multi-purpose hall,Outdoor Gym,Playground,24 hours security, Surau (Male & Female)'),(34,'Southkey NADI Residences','Apartment',1,1,649,422000.00,1.503936,103.777295,'Johor Bahru','Leasehold','Bank Loan',4,5,'approved','2024-10-27 12:13:25','2024-10-27 12:13:25','2024-10-27 12:13:25','2024-11-28 07:31:45','- Low-Density Development and Space-Efficient Design\r\n- Comfortable Living Environment\r\n- Natural Daylight and Ventilation\r\n- 3-Tier Security with Access Card\r\n\r\nSouthkey NADI Residences is the latest development in Southkey City Johor Bahru. Located across from The Mall, Mid Valley Southkey giving a convenient lifestyle into one address. Distinctly designed to meet the needs of modern lifestyle, Southkey NADI Residences is the perfect home for practicality, space and comfort.','Partially Furnished','North',2027,'Parking,Perimeter Fencing,Gym,Landscaped Garden,Lounge,Multi-Storey Car Park,Multi-purpose hall,Playground,24 hours security,Surau (Male & Female),Swimming pool,Wading pool'),(35,'Suria Hills Iskandar Puteri','Bungalow',5,6,5462,1200000.00,1.450495,103.648533,'Iskandar Puteri','Freehold','Bank Loan',4,5,'approved','2024-11-20 08:31:08','2024-11-20 08:31:08','2024-11-20 08:31:08','2024-11-20 08:31:07','Elegant Living in a Prestigious Community\r\nWelcome to Suria Hills, a prestigious, low-density bungalow development that seamlessly blends luxury, modern living, and natural beauty. Featuring two thoughtfully designed homes – Avalon (60\' x 93\') and Brixton (50\' x 83\') – this exclusive community offers spacious, versatile layouts tailored for modern families.\r\n\r\nEach home includes ensuite bedrooms, with living areas designed with high ceilings and elegant sliding doors that flood the interiors with natural light, while showcasing serene garden views. The seamless indoor-outdoor connection creates the perfect space for personal retreats, from study areas to peaceful corners for relaxation.\r\n\r\nBoth Avalon and Brixton feature solar-heated bathrooms, column-free car porches accommodating up to four vehicles, and EV charging points to meet the needs of today\'s eco-conscious lifestyle.\r\n\r\nSituated in a prime location, Suria Hills offers easy access to top schools like Marlborough College Malaysia and Raffles American School, medical centers like Gleneagles Hospital Medini, and popular shopping and leisure destinations including Legoland Malaysia. With excellent connectivity to major highways and proximity to the Tuas and Woodlands checkpoints, convenience is always within reach.\r\n\r\nExperience the refined elegance of Suria Hills, where modern architecture, natural beauty, and luxury converge to create a truly exceptional living experience.','Fully Furnished','North',2024,'Clubhouse,Gym, Landscaped Garden,Playground,Swimming pool,Multi-purpose hall,24 hours security'),(36,'Petrie Villa@Johor Bahru','Bungalow',5,8,4573,3700000.00,1.461265,103.736538,'Johor Bahru','Leasehold','Bank Loan',5,5,'approved','2024-11-28 07:43:14','2024-11-28 07:43:14','2024-11-28 07:43:14','2024-11-28 07:43:14',NULL,NULL,NULL,NULL,NULL),(37,'Horizon Hills','Semi-detached house',5,5,3441,2300000.00,1.451870,103.631159,'Iskandar Puteri','Freehold','Bank Loan',5,5,'approved','2024-12-13 08:59:32','2024-12-13 08:59:32','2024-12-13 08:59:32','2024-12-31 15:33:28','Horizon Hills\r\nLocated at Iskandar Puteri, Horizon Hills\r\n\r\nProperty Details...\r\nHorizon Hills,Iskandar Puteri, Nusajaya\r\n- 2 Storey Semi-D House\r\n- Land Area 40 x 80\r\n- Build Up 3441 sq.ft\r\n- 4+1 Bedrooms, 5 Bathrooms\r\n- Partial Furnished\r\n- Freehold & International Lot','Partially Furnished','North East',NULL,'gym'),(38,'M Condominium @ Larkin','Condominium',3,2,1067,460000.00,1.499865,103.746677,'Larkin','Leasehold','Bank Loan',4,5,'approved','2024-12-15 09:07:00','2024-12-15 09:07:00','2024-12-15 09:07:00','2024-12-31 15:37:22','High floor level\r\nMaster title\r\nNot Bumi Lot','Partially Furnished','South East',2026,'gym'),(39,'JALAN NUSA JAYA MAS','Double storey terraced house',4,3,1650,820000.00,1.491776,103.645284,'Iskandar Puteri','Freehold','Bank Loan',4,5,'approved','2024-12-15 09:37:38','2024-12-15 09:37:38','2024-12-15 09:37:38','2024-12-31 15:40:27','Individual title\r\nNot Bumi Lot','Unfurnished','East',2024,'Air-conditioning,Cooker hob/hood,Renovated,Water heater'),(40,'Desa Cemerlang Desas Cemerlangs','Double storey terraced house',4,3,2640,550000.00,1.563034,103.815605,'Desa Jaya','Freehold','Bank Loan',4,5,'approved','2024-12-15 09:50:57','2024-12-15 09:50:57','2024-12-15 09:50:57','2024-12-31 16:35:04','Not tenanted\r\nIndividual title\r\nNot Bumi Lot\r\n24 hours Gated and Guarded','Unfurnished','South West',2024,'24 hours Gated and Guarded'),(41,'D Ambience Residences (Pangsapuri Ikatan Flora)','Bungalow',2,2,830,335000.00,1.514511,103.822692,'Permas Jaya','Freehold','Bank Loan',4,5,'approved','2024-12-15 10:02:50','2024-12-15 10:02:50','2024-12-15 10:02:50','2025-01-01 10:14:00','Not tenanted\r\nStrata title\r\nNot Bumi Lot\r\n2 Car Park','Unfurnished','North',2024,'gym'),(42,'PARC Regency (Residensi Masai)','Apartment',2,2,1010,399000.00,1.520975,103.813836,'Molek','Freehold','Bank Loan',4,5,'approved','2024-12-15 10:12:56','2024-12-15 10:12:56','2024-12-15 10:12:56','2025-01-01 10:18:15','Parc Regency @ Plentong Mesai\r\nBlock D\r\nType: Service Apartment - Middle Floor\r\nUnit Type: Corner\r\nTenure : Freehold Non Bumi\r\nBedroom: 2\r\nBathroom: 2\r\nBuilt up: 1,010 sqft\r\nRenovation: Fully\r\n\r\nFurnishing: Partial (w/o : TV X 1,Fridge X 1,Washing Machine X1,Living room a/cond X 1)\r\n\r\nFacing: City & River view\r\nG&G: yes\r\nCar park: 2\r\nNeighbors: Chinese & Malay\r\nMaintenance Fee: RM295','Partially Furnished','North East',NULL,'gym'),(43,'Bungalow at Taman Stulang Laut','Bungalow',4,3,12643,1500000.00,1.470975,103.779605,'Taman Stulang Laut','Leasehold','Bank Loan',4,5,'approved','2024-12-15 10:28:07','2024-12-15 10:28:07','2024-12-15 10:28:07','2025-01-01 10:20:30','* 1.5storey bungalow\r\n* Located @ Stulang Laut, Johor Bahru, Johor.\r\n* ⁠Leasehold till 2069 February.\r\n* ⁠Need consent\r\n* ⁠Land area: 12,643sqft\r\n* ⁠ground floor: 4bedrooms + 2maid room & 3bathrooms + 1 maid bathroom.\r\n* ⁠1st floor: 1hall','Unfurnished','North East',2023,'-'),(44,'Royal Strand @ Country Garden Danga Bay','Condominium',2,2,816,480000.00,1.466215,103.726362,'Danga Bay','Freehold','Bank Loan',4,5,'approved','2024-12-15 10:42:35','2024-12-15 10:42:35','2024-12-15 10:42:35','2025-01-01 10:23:42','Bank Value: 530k (G.vision June 23)\r\nCode: DBC01\r\nFor Sale: 480k slightly Nego\r\nProperty Address: Block 12-B-xxxx, Country garden condo, persiaran danga, 80200 Johor Bahru\r\nType : Condo\r\nUnit Type: intermediate lot\r\nTenure: Freehold Non bumi lot\r\nBedroom : 2\r\nBathroom : 2\r\nBuilt up : 816 sqft\r\nRenovation : Partial renovated with Morsett, Tv Console, Tabletop and kitchen cabinet. Wardrobe.\r\nFurnishing : Fully furnished\r\nFacing: Condo\r\nG&G : Yes\r\nCar Park: 1 carpark (P6 272)\r\nMaintenance Fee : RM 250/month\r\nhouse year: 8 years','Fully Furnished','West',NULL,'24 hours security,Covered car park,Drop off point,Gym,Jacuzzi,Landscaped garden,Multi-purpose hall,Perimeter fencing,Playground,Surau (male & female),Swimming pool,Tennis courts,Wading pool'),(45,'Eco Spring','Cluster house',4,5,2360,1300000.00,1.588600,103.760212,'Taman Ekoflora','Freehold','Bank Loan',4,5,'approved','2024-12-15 10:46:51','2024-12-15 10:46:51','2024-12-15 10:46:51','2025-01-01 10:27:10','For Sale at Eco Spring Dover\r\n\r\n2 Storey Cluster House\r\nLand Size: 32x80 sqft\r\nBuilt Up: 2360 sqft\r\n4 Bedrooms 4 Bathrooms\r\nFreehold\r\nStrata Title\r\nIntermediate Lot\r\nNon-Bumi Lot\r\n','Unfurnished','East',2023,'Gated & Guarded'),(46,'D Pristine','Apartment',2,2,771,385000.00,1.429769,103.634430,'Medini Utara','Freehold','Bank Loan',4,5,'approved','2024-12-15 10:50:54','2024-12-15 10:50:54','2024-12-15 10:50:54','2025-01-01 10:30:21','644 SQFT\r\n1 Bedroom 1 Bathroom [ RM 330K ]\r\n\r\n771 SQFT\r\n2 Bedroom 2 Bathroom [ RM 385K ]\r\n\r\n1***** SQFT\r\nSQFT Dual Key [RM 550-658K ]','Partially Furnished','South West',2017,'-'),(47,'TAMPOI HEIGHTS','Single storey terraced house',3,2,950,379000.00,1.507195,103.656698,'Sutera Danga','Freehold','Bank Loan',4,5,'approved','2024-12-15 10:53:43','2024-12-15 10:53:43','2024-12-15 10:53:43','2025-01-01 10:33:12','[Monthly Instalment RM 16xx]\r\n-Zero Downpayment\r\n-Free Aircon\r\n-Free Kitchen Cabinet\r\n-Free Carpark\r\n-Free SPA Legal Fee\r\n-Free Loan Legal Fee\r\n-Free Stamp Duty\r\n-Free Shuttle Bus To CIQ\r\n\r\nBuilt Up :\r\n805 SQFT | 950 SQFT\r\n\r\n- Within 5 Minutes able to arrive bank, shopping malls, and schools\r\n- Golden Location, 15 minutes to CIQ or TUAS','Partially Furnished','South',NULL,'-'),(48,'Twin Galaxy (Dwi Galaksi)','Cluster house',2,2,936,688000.00,1.478431,103.762170,'Jalan Dato Abdullah Tahir','Freehold','Bank Loan',4,5,'approved','2024-12-19 06:41:51','2024-12-19 06:41:51','2024-12-19 06:41:51','2025-01-01 16:43:37','Twin Galaxy, Taman Abad fully furnished unit, shuttle bus available\r\nMid floor\r\nUnblock city view\r\nShuttle bus available','Fully Furnished','South West',NULL,'gym'),(49,'Taman Senai Utama','Single storey terraced house',3,2,1300,405000.00,1.611214,103.642625,'Senai','Freehold','Bank Loan',5,5,'approved','2025-01-03 07:02:02','2025-01-03 07:02:02','2025-01-03 07:02:02','2025-01-03 08:18:26','Selling Price: RM410K\r\n\r\n-Single Storey Terrace\r\n-Freehold\r\n-Non Bumi\r\n-3 Bedrooms\r\n-2 Bathrooms\r\n-Land Size: 1540sqft\r\n-Built Up: RM1300sqft\r\nRemarks: Renovated','Partially Furnished','North East',NULL,'-'),(50,'Setia Eco Cascadia','Cluster house',4,5,2938,1200000.00,1.583511,103.759951,'Mount Austin','Freehold','Bank Loan',5,5,'approved','2025-01-03 07:06:18','2025-01-03 07:06:18','2025-01-03 07:06:18','2025-01-03 08:19:54','Setia Eco Cascadia | Montana\r\nNearby Eco Spring\r\n\r\n- 2 Storey Cluster House For Sale\r\n- Land area : 32 X 80\r\n- Build up : 2,938 Sqft\r\n- 4 bedrooms 5 Bathrooms\r\n- Freehold strata title\r\n- Partial Furnished\r\n- Facing South\r\n- Gated and guarded\r\n- Club house','Partially Furnished','South',NULL,'Gated and guarded,Club house'),(51,'Horizon Hills','Double storey terraced house',4,3,2298,1450000.00,1.448811,103.638626,'Iskandar Puteri','Freehold','Bank Loan',5,5,'approved','2025-01-03 07:09:19','2025-01-03 07:09:19','2025-01-03 07:09:19','2025-01-03 08:20:44','For Sale\r\nHorizon Hills\r\nthe valley west 2\r\ndouble storey terrace house\r\nland size: 3,126 sqft (20x70+24 feet land)\r\nbuild up:2,298 sqft\r\noriginal unit\r\ncorner lot\r\nFacing: North\r\ninternational lot\r\n4 bedrooms 3 bathrooms','Unfurnished','North West',NULL,'-'),(52,'Eco Tropics','Single storey terraced house',4,3,1400,588000.00,1.490832,103.940062,'Kota Masai','Freehold','Bank Loan',5,5,'approved','2025-01-03 07:11:48','2025-01-03 07:11:48','2025-01-03 07:11:48','2025-01-03 08:22:52','pasir gudang , johor\r\nEco Tropics\r\ndouble storey terrace house\r\nMillsgate Nettleson\r\n屋身|Land Size:20x70\r\n房间|Bedrooms :4\r\n厕所|Bathrooms :3\r\n家私|Furniture: Sell with partial furnished\r\nLot type: Non bumi lot\r\n地契|Tenure: Freehold\r\n地契|Title type: Strata\r\n保安|GNG: Yes\r\n管理费|Maintenance: RM184\r\n装修|Renovations: Full renovation RM150k\r\n方向|Direction facing:North\r\n特别方向|Special facing:unblock and garden view\r\n屋龄|House Year:2019\r\n门牌|House add up got 4?: No\r\n️Weekend House️','Partially Furnished','North',NULL,'-'),(53,'Taman Uda utama','Single storey terraced house',3,2,1540,538000.00,1.499741,103.670323,'Uda Utama','Freehold','Bank Loan',5,5,'approved','2025-01-03 07:14:14','2025-01-03 07:14:14','2025-01-03 07:14:14','2025-01-03 08:24:36','Single storey\r\nJalan Uda Utama x/× Taman Uda Utama\r\n3bed 2bath\r\n22×70\r\nNorth\r\nSale with furnished Renovation unit\r\nAircon ×2\r\nWater heater ×2','Fully Furnished','North',NULL,'-'),(54,'Townhouse at Taman Tampoi Indah','Townhouse',3,2,1323,360000.00,1.507129,103.685000,'Tampoi Indah','Leasehold','Bank Loan',5,5,'approved','2025-01-03 07:16:52','2025-01-03 07:16:52','2025-01-03 07:16:52','2025-01-03 08:25:25','Rumah Harga RM360k,Rumah Bersa\r\nRumah Harga Full Loan\r\nBulanan Bayaran Bank 1650~1889\r\n\r\nRumah Jual Di Tampoi Indah,Pergi CIQ 23 Minit\r\n\r\nJalan titiwangsa 10, Taman Tampoi Indah, 81200 johor bahru\r\n\r\nDouble Storey Townhouse(Parking Private)\r\n~3Bedroom ~2bathroom\r\n~1323 sqft\r\n- 979 sqft build up\r\n~International lot\r\n~1st Floor\r\n~Leased hold{2092}','Partially Furnished','South East',NULL,'-'),(55,'The Seed','Townhouse',3,3,1240,638000.00,1.507632,103.673381,'Skudai','Freehold','Bank Loan',5,5,'approved','2025-01-03 07:19:15','2025-01-03 07:19:15','2025-01-03 07:19:15','2025-01-03 07:27:05','Address：Block ××- 02-××, The seed, Persisiran Sutera Danga, Taman Sutera Utama, 81300 skudai, Johor\r\nType : Double Storey Townhouse\r\nUnit Type: intermediate lot\r\nTenure: freehold\r\nBedroom : 3\r\nBathroom : 3\r\nLand size: 1240 sqft\r\nRenovation : Partial Renovated.\r\nFurnishing : Partial Furnished\r\nG&G : yes\r\nMaintainence fee: RM242/month\r\nCar Park: 1\r\nReason For Sale : investment','Partially Furnished','South',NULL,'-'),(56,'Medini Medini Medinis','Townhouse',1,1,474,294000.00,1.414810,103.627251,'Iskandar Puteri','Freehold','Bank Loan',5,5,'approved','2025-01-03 07:22:12','2025-01-03 07:22:12','2025-01-03 07:22:12','2025-01-03 07:26:25','For Sale\r\nMedini @ Iskandar Puteri, Johor ( near Eco Botanic, Horizon Hills )\r\n* Low Booking Fee, RM500 only\r\n* No Agent Fee\r\n* Free Legal Fee ( SPA & Loan Agreement )\r\n* Foreigners Eligible to Buy\r\n\r\n- Condominium ( Resort Lifestyle )\r\n- International Lot\r\n- Partially Furnished - Kitchen Cabinet, Kitchen Counter Top, Hood & Hod\r\n- 24 hours security - Gated and guarded\r\n\r\nNearby amenities & distance\r\n- Gleneagles Hospital, Legoland\r\n- 10 mins to Second Link CIQ\r\n- 12 mins to Aeon Mall Bukit Indah','Partially Furnished','South East',NULL,'24 hours security,Gated and guarded'),(57,'Leisures Farms','Townhouse',3,3,1000,600000.00,1.410075,103.609881,'Gelang Patah','Freehold','Bank Loan',5,5,'approved','2025-01-03 08:06:57','2025-01-03 08:06:57','2025-01-03 08:06:57','2025-01-03 08:14:01','Bayou Townhouse, Leisure Farm\r\nDouble Storey Townhouse\r\nLand Size : 20x70ft (1442sqft)\r\nFreehold\r\n3 Bedrooms\r\n3 Bathrooms\r\nRenovated\r\n\r\n','Unfurnished','East',NULL,'Gated & Guarded'),(58,'Nusa Villa @ Nusa Bestari','Townhouse',3,3,1516,505000.00,1.501649,103.651010,'Skudai','Freehold','Bank Loan',5,5,'approved','2025-01-03 08:29:04','2025-01-03 08:29:04','2025-01-03 08:29:04','2025-01-03 08:29:32','Nusa Villa Townhouse @ Nusa Bestari\r\n\r\n▪︎ Unblock view\r\n▪︎ 3 bedrooms , 3 bathrooms\r\n▪︎ 1516 sqft\r\n▪︎ International lot\r\n▪︎ Freehold\r\n▪︎ 1 Car Parks\r\n▪︎ 24 Hours Gated & Guarded Rm280++','Partially Furnished','West',NULL,'Swimming Pool, Gymnasium, Steam Room, BBQ Area'),(59,'The Astaka @ 1 Bukit Senyum','Condominium',3,4,2217,2350000.00,1.473717,103.765125,'Johor Bahru','Freehold','Bank Loan',5,5,'approved','2025-01-03 08:32:35','2025-01-03 08:32:35','2025-01-03 08:32:35','2025-01-03 08:32:35','Johor Bahru Landmark Condominium The Astaka Block A3 + 1 Bedrooms High Floor\r\n\r\nThe Astaka Condominium\r\nBlock A\r\nBuilt up: 2,217 sq ft\r\n3 + 1 Bedrooms & 4 Bathroom\r\nFully Renovated & Fully Furnished 全新装修 & 全新家具\r\nHigh floor / 高楼单位\r\nInternational Lot / 国际单位\r\nFreehold / 永久地契\r\nGated & Guarded / 围篱保安区','Fully Furnished','South East',2023,'Gated & Guarded'),(60,'D Suites','Condominium',3,2,1076,647000.00,1.448597,103.628925,'Horizon Hills','Freehold','Bank Loan',5,5,'approved','2025-01-03 08:37:38','2025-01-03 08:37:38','2025-01-03 08:37:38','2025-01-03 08:37:38','D Suite Condominium at Horizon Hills\r\n- Brand new renovated 3 Bedrooms\r\n- BUA: 1076 SF\r\n- 3 Bedrooms + 2 Bathrooms\r\n- Freehold\r\n- Non\r\n- Free 2 carparks\r\n- Fully furnished\r\n- Free legal fee & stamp duties','Fully Furnished','South West',NULL,'-'),(61,'TriTower Residence @ Johor Bahru Sentral','Condominium',2,2,980,560000.00,1.466708,103.765123,'Johor Bahru','Freehold','Bank Loan',5,5,'approved','2025-01-03 08:40:19','2025-01-03 08:40:19','2025-01-03 08:40:19','2025-01-03 08:40:19','Super Luxury Residence at Johor Bahru City Center\r\n\r\n2 Bedrooms, 2 Bathroom\r\n- Freehold\r\n- Spacious layout\r\n- Built-up area: 980 sqft\r\n- Renovated\r\n===========================================\r\nWhatsApp Bryan 0*****\r\nFor more information\r\n\r\nSurrounding amenities and facilities\r\n• Walk to RTS in future\r\n• Walk to CIQ 8 mins\r\n• Shopping mall\r\n• 24 hours Restaurant/Supermarket\r\n\r\nFirst come first serve, while stock last!\r\n\r\n**To protect owner/tenant privacy, pictures are for illustration purpose','Partially Furnished','South East',NULL,'Swimming pool, gym'),(62,'Austin Perdana','Semi-detached house',5,5,3200,1680000.00,1.545469,103.782659,'Mount Austin','Freehold','Bank Loan',5,5,'approved','2025-01-03 08:42:43','2025-01-03 08:42:43','2025-01-03 08:42:43','2025-01-03 08:42:43','FOR SALE/ 出售\r\n\r\nAUSTIN PERDANA 2 STOREY SEMI- D\r\n\r\n- 40x80\r\n- ⁠south direction\r\n- ⁠brand new renovated\r\n- ⁠renovated more than RM500k\r\n- ⁠G@G\r\n- ⁠Bank value（ori） RM1.2m， （reno） RM1.3m\r\n\r\n- ⁠selling RM1.68mil','Partially Furnished','South',NULL,'-'),(63,'Mont Callista','Semi-detached house',5,6,3837,1000000.00,1.541974,103.609759,'Skudai','Freehold','Bank Loan',5,5,'approved','2025-01-03 08:44:18','2025-01-03 08:44:18','2025-01-03 08:44:18','2025-01-03 08:44:18','Mont\' Callista @Taman Pulai Bayu\r\n刚里里外外粉刷美美的大房\r\n~next to Taman University within 5mins drive to Aeon\r\n~Estimated 10mins to Mutiara Rini; 14mins to Paradigm Mall\r\n\r\nFREEHOLD / NON Bumi Lot\r\nGated & Guarded️\r\nLow desinty\r\n* 3 Storeys Semi-D\r\n* Newly Painted like brand new\r\n* Partial Furnished\r\n* Open Courtyard on ground floor living\r\n* Lot Size: 40 x 80 (3,200sqft)\r\n* Build up: 3,837 sqft\r\n* 4 + 1 bedroom & 6 bathrooms\r\n* Direction: NW ( Side land on North East)\r\n* Monthly Maintenance fees RM250\r\n','Partially Furnished','North East',NULL,'-'),(64,'Taman Ehsan Jaya','Flat',3,2,710,148000.00,1.547756,103.813315,'Ulu Tiram','Leasehold','Bank Loan',5,5,'approved','2025-01-03 08:48:30','2025-01-03 08:48:30','2025-01-03 08:48:30','2025-01-03 08:48:30','Exclusive Unit\r\nFor Sale\r\nEhsan Jaya Flat\r\nRumah Pangsa Sri Orkid\r\nJalan EJ 8/2\r\nFor investment or ownstay, windy unit.\r\n\r\n✅Original Unit\r\n✅Partial Furnished\r\n✅5th Floor\r\n✅3B2b\r\n✅Strata Tittle\r\n✅Leasehold till 2911\r\n✅710sqft\r\n✅Unblock View\r\n✅Left side Chinese neighbour\r\n✅Right side is staircase','Partially Furnished','South East',NULL,'-'),(65,'Taman Tan Sri Yaacob','Flat',3,2,743,175000.00,1.495948,103.659788,'Skudai','Leasehold','Bank Loan',5,5,'approved','2025-01-03 08:49:54','2025-01-03 08:49:54','2025-01-03 08:49:54','2025-01-03 08:49:54','Flat for sales\r\nTaman Tan Sri Yaacob\r\nBlock B\r\n3 rooms 2 bath\r\nCorner unit\r\n743 sf\r\nFree hold\r\nNon Bumi','Unfurnished','South East',NULL,'-'),(66,'Taman Mutiara Rini','Flat',3,2,610,173000.00,1.515226,103.644456,'Skudai','Leasehold','Bank Loan',5,5,'approved','2025-01-03 08:51:50','2025-01-03 08:51:50','2025-01-03 08:51:50','2025-01-03 08:51:50','For Sales (Mutiara Rini Pangsapuri jasa Flat)\r\nCode: MRF10\r\nFor Sale: RM173k Nego\r\nProperty Address: Level 1 , Pangsapuri Jasa Mutiara rini flat ,Jalan hang Jebat, Taman Mutiara Rini, 81300 Skudai.\r\nType :Low cost flat\r\nUnit type: intermediate lot\r\nTenure: Leasehold 991 years\r\nBedroom : 3\r\nBathroom : 2\r\nsize: 610 sqft\r\nRenovation : Original\r\nFurnishing : No\r\nG&G : no\r\nMaintainence fee: RM30/month\r\nHouse year: 20 years\r\nReason For Sale : investment','Unfurnished','South East',NULL,'-'),(67,'Taman Melor','Flat',2,1,495,108000.00,1.505452,103.692272,'Tampoi','Leasehold','Bank Loan',5,5,'approved','2025-01-03 08:53:37','2025-01-03 08:53:37','2025-01-03 08:53:37','2025-01-03 08:53:37','For Sell\r\nFlat Taman Melor (Blok 13)\r\n2Room 1Bath\r\n495sqft\r\n4th Floor\r\nintermediate lot\r\nNon bumi lot\r\nleasehold (until 2084）\r\nRenovated unit （Fully Tiles , Kitchen Table Top）\r\nAsking Price :Rm108k\r\nBank Value : Rm130k\r\n\r\nGround Floor Have Kedai Mamak ,Kedai Runcit ,Beside have School , Walking 3min have Bus station','Partially Furnished','East',NULL,'-'),(68,'TAMAN PUTRI KULAI','Flat',2,1,500,100000.00,1.655709,103.577583,'Kulai','Freehold','Bank Loan',5,5,'approved','2025-01-03 08:55:03','2025-01-03 08:55:03','2025-01-03 08:55:03','2025-01-03 08:55:03','For Sale: High Rental Yield Flat at Taman Putri Kulai\r\n\r\nLocation: Taman Putri Kulai (古来公主城)\r\n\r\nProperty Details:\r\nType: Flat\r\nBedrooms: 2\r\nSize: 500 sqft\r\nLevel: 4\r\nTenure: Freehold\r\nOwnership: Non-Bumi, Chinese Owner\r\nCondition: Original Unit, Vacant Now\r\nRental Yield: Up to 4.8%\r\n\r\nAsking Price: RM100,000 Only!','Partially Furnished','South',NULL,'-');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_images`
--

DROP TABLE IF EXISTS `property_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pending_property_id` int DEFAULT NULL,
  `property_id` int DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pending_property_id` (`pending_property_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`pending_property_id`) REFERENCES `pending_properties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `property_images_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_images`
--

LOCK TABLES `property_images` WRITE;
/*!40000 ALTER TABLE `property_images` DISABLE KEYS */;
INSERT INTO `property_images` VALUES (25,NULL,35,'20241120_161134_1.jpg','2024-11-20 08:11:34'),(26,NULL,35,'20241120_161134_View_5_Type_A_View_2_04.jpg','2024-11-20 08:11:34'),(28,NULL,13,'20241122_155923_citrine_hills.jpg','2024-11-22 07:59:23'),(29,NULL,14,'20241128_143535_RF.jpg','2024-11-28 06:35:35'),(30,NULL,1,'20241128_143924_Austin_Duta_Phase_9B.jpeg','2024-11-28 06:39:24'),(31,NULL,2,'20241128_144328_Ponderosa_Vista.jpg','2024-11-28 06:43:28'),(32,NULL,2,'20241128_144328_Ponderosa_Vista1.jpg','2024-11-28 06:43:28'),(33,NULL,3,'20241128_144958_the_senai_garden.jpeg','2024-11-28 06:49:58'),(35,NULL,15,'20241128_145457_Nasa_City_-_Desa_Palma_Phase_11A.jpg','2024-11-28 06:54:57'),(36,NULL,15,'20241128_145511_Nasa_City_-_Desa_Palma_Phase_11A_1.jpg','2024-11-28 06:55:11'),(37,NULL,16,'20241128_150512_Taman_Selesa_Indah_Phase_3A.jpg','2024-11-28 07:05:12'),(38,NULL,18,'20241128_151147_greenwood.jpg','2024-11-28 07:11:47'),(39,NULL,21,'20241128_151512_Bukit_Impian_Residence_east.jpg','2024-11-28 07:15:12'),(40,NULL,30,'20241128_152256_Sunway_Maple_Residence.webp','2024-11-28 07:22:56'),(41,NULL,30,'20241128_152256_Sunway_Maple_Residence1.webp','2024-11-28 07:22:56'),(42,NULL,34,'20241128_153145_Southkey_NADI_Residences.jpeg','2024-11-28 07:31:45'),(43,NULL,34,'20241128_153145_Southkey_NADI_Residences1.jpg','2024-11-28 07:31:45'),(44,NULL,36,'20241128_154313_Petrie_Villa.jpg','2024-11-28 07:43:14'),(45,19,NULL,'20241214_172357_cute-hamster.jpg','2024-12-14 09:23:57'),(48,NULL,37,'20241231_232905_Horizon-Hills-Iskandar-Puteri-Nusajaya-Malaysia.jpg','2024-12-31 15:29:05'),(49,NULL,38,'20241231_233722_M_Condominium.jpg','2024-12-31 15:37:22'),(50,NULL,39,'20241231_234027_JALAN-NUSA-JAYA-MAS-Iskandar-Puteri-Nusajaya-Malaysia.jpg','2024-12-31 15:40:27'),(51,NULL,40,'20250101_003504_Desa-Cemerlang-Desas-Cemerlangs-Johor-Bahru-Malaysia.jpg','2024-12-31 16:35:04'),(52,NULL,41,'20250101_181400_D-Ambience-Residences-Pangsapuri-Ikatan-Flora-Permas-Jaya-Malaysia.jpg','2025-01-01 10:14:00'),(53,NULL,42,'20250101_181710_PARC_Regency.jpg','2025-01-01 10:17:10'),(54,NULL,43,'20250101_182030_UPHO.webp','2025-01-01 10:20:30'),(55,NULL,44,'20250101_182342_royal_strand.jpg','2025-01-01 10:23:42'),(56,NULL,45,'20250101_182710_Eco-Spring-Johor-Bahru-Malaysia.jpg','2025-01-01 10:27:10'),(57,NULL,46,'20250101_183001_d_pristine.jpg','2025-01-01 10:30:01'),(58,NULL,47,'20250101_183312_TAMPOI-HEIGHTS-Johor-Bahru-Malaysia.jpg','2025-01-01 10:33:12'),(59,NULL,48,'20250102_004337_twin_galaxy.jpg','2025-01-01 16:43:37'),(60,NULL,49,'20250103_150202_Taman-Senai-Utama-Kulai-Malaysia.jpg','2025-01-03 07:02:02'),(61,NULL,50,'20250103_150617_Setia-Eco-Cascadia-Tebrau-Malaysia.jpg','2025-01-03 07:06:18'),(62,NULL,51,'20250103_150918_Horizon-Hills-Iskandar-Puteri-Nusajaya-Malaysia_1.jpg','2025-01-03 07:09:19'),(63,NULL,51,'20250103_150918_Horizon-Hills-Iskandar-Puteri-Nusajaya-Malaysia_2.jpg','2025-01-03 07:09:19'),(64,NULL,52,'20250103_151147_Eco-Tropics-Pasir-Gudang-Malaysia_1.jpg','2025-01-03 07:11:48'),(65,NULL,52,'20250103_151147_Eco-Tropics-Pasir-Gudang-Malaysia.jpg','2025-01-03 07:11:48'),(66,NULL,53,'20250103_151414_Taman-Uda-utama-Johor-Bahru-Malaysia_1.jpg','2025-01-03 07:14:14'),(67,NULL,53,'20250103_151414_Taman-Uda-utama-Johor-Bahru-Malaysia.jpg','2025-01-03 07:14:14'),(68,NULL,54,'20250103_151652_Townhouse-at-Taman-Tampoi-Indah-Tampoi-Malaysia_1.jpg','2025-01-03 07:16:52'),(69,NULL,54,'20250103_151652_Townhouse-at-Taman-Tampoi-Indah-Tampoi-Malaysia.jpg','2025-01-03 07:16:52'),(70,NULL,55,'20250103_151915_The-Seed-Skudai-Malaysia_1.jpg','2025-01-03 07:19:15'),(71,NULL,55,'20250103_151915_The-Seed-Skudai-Malaysia.jpg','2025-01-03 07:19:15'),(72,NULL,56,'20250103_152212_Medini-Medini-Medinis-Iskandar-Puteri-Nusajaya-Malaysia_1.jpg','2025-01-03 07:22:12'),(73,NULL,56,'20250103_152212_Medini-Medini-Medinis-Iskandar-Puteri-Nusajaya-Malaysia.jpg','2025-01-03 07:22:12'),(74,NULL,57,'20250103_160657_leisures_farms.jpg','2025-01-03 08:06:57'),(75,NULL,58,'20250103_162903_Nusa-Villa-Nusa-Bestari-Johor-Bahru-Malaysia_1.jpg','2025-01-03 08:29:04'),(76,NULL,58,'20250103_162903_Nusa-Villa-Nusa-Bestari-Johor-Bahru-Malaysia.jpg','2025-01-03 08:29:04'),(77,NULL,59,'20250103_163235_The-Astaka-1-Bukit-Senyum-Johor-Bahru-Malaysia_1.jpg','2025-01-03 08:32:35'),(78,NULL,59,'20250103_163235_The-Astaka-1-Bukit-Senyum-Johor-Bahru-Malaysia.jpg','2025-01-03 08:32:35'),(79,NULL,60,'20250103_163738_D_Suite_Condominium_at_Horizon_Hills.jpg','2025-01-03 08:37:38'),(80,NULL,60,'20250103_163738_D-Suites-Horizon-Hills-Iskandar-Puteri-Nusajaya-Malaysia.jpg','2025-01-03 08:37:38'),(81,NULL,61,'20250103_164019_TriTower-Residence-Johor-Bahru-Sentral-Johor-Bahru-Malaysia_1.jpg','2025-01-03 08:40:19'),(82,NULL,61,'20250103_164019_TriTower-Residence-Johor-Bahru-Sentral-Johor-Bahru-Malaysia_2.jpg','2025-01-03 08:40:19'),(83,NULL,61,'20250103_164019_TriTower-Residence-Johor-Bahru-Sentral-Johor-Bahru-Malaysia_3.jpg','2025-01-03 08:40:19'),(84,NULL,61,'20250103_164019_TriTower-Residence-Johor-Bahru-Sentral-Johor-Bahru-Malaysia.jpg','2025-01-03 08:40:19'),(85,NULL,62,'20250103_164242_Austin-Perdana-Tebrau-Malaysia_1.jpg','2025-01-03 08:42:43'),(86,NULL,62,'20250103_164242_Austin-Perdana-Tebrau-Malaysia_2.jpg','2025-01-03 08:42:43'),(87,NULL,62,'20250103_164242_Austin-Perdana-Tebrau-Malaysia.jpg','2025-01-03 08:42:43'),(88,NULL,63,'20250103_164417_Mont-Callista-Skudai-Malaysia_1.jpg','2025-01-03 08:44:18'),(89,NULL,63,'20250103_164417_Mont-Callista-Skudai-Malaysia.jpg','2025-01-03 08:44:18'),(90,NULL,64,'20250103_164829_Taman-Ehsan-Jaya-Ulu-Tiram-Malaysia_1.jpg','2025-01-03 08:48:30'),(91,NULL,64,'20250103_164829_Taman-Ehsan-Jaya-Ulu-Tiram-Malaysia.jpg','2025-01-03 08:48:30'),(92,NULL,65,'20250103_164953_Taman-Tan-Sri-Yaacob-Skudai-Malaysia_1.jpg','2025-01-03 08:49:54'),(93,NULL,65,'20250103_164953_Taman-Tan-Sri-Yaacob-Skudai-Malaysia.jpg','2025-01-03 08:49:54'),(94,NULL,66,'20250103_165150_Taman-Mutiara-Rini-Skudai-Malaysia.jpg','2025-01-03 08:51:50'),(95,NULL,67,'20250103_165336_Taman-Melor-Tampoi-Malaysia_1.jpg','2025-01-03 08:53:37'),(96,NULL,67,'20250103_165336_Taman-Melor-Tampoi-Malaysia.jpg','2025-01-03 08:53:37'),(97,NULL,67,'20250103_165336_Melor.jpg','2025-01-03 08:53:37'),(98,NULL,68,'20250103_165503_TAMAN_PUTRI_KULAI.jpg','2025-01-03 08:55:03'),(99,32,NULL,'20250106_000137_Taman-Johor-Taman-Johors-Tampoi-Malaysia.jpg','2025-01-05 16:01:37');
/*!40000 ALTER TABLE `property_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_status_history`
--

DROP TABLE IF EXISTS `property_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int DEFAULT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `changed_by` int DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `property_status_history_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`),
  CONSTRAINT `property_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_status_history`
--

LOCK TABLES `property_status_history` WRITE;
/*!40000 ALTER TABLE `property_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `property_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `property_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_favorites_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6823 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (6788,4,16,'2024-11-03 07:18:45'),(6804,1,1,'2024-11-19 12:02:44'),(6805,1,2,'2024-11-19 12:09:53'),(6808,1,15,'2024-11-19 12:24:42'),(6810,4,3,'2024-11-19 12:33:29'),(6812,4,2,'2024-11-19 12:45:40'),(6815,4,1,'2024-12-05 05:37:09'),(6817,1,13,'2024-12-19 06:26:52'),(6819,1,3,'2025-01-05 08:48:29'),(6821,1,35,'2025-01-06 09:49:48');
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('user','REN','admin') NOT NULL,
  `status` enum('active','banned') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Low','$2b$12$78B9oUlv1dHzoO8C10UONet2e2XASdmqaV4hWHrpPr04iG41Lsk9i','low123@gmail.com',NULL,'user','active','2024-10-20 03:53:39'),(3,'Teresa','$2b$12$5IUtOLkIjS/j22xkHEoGGOzRcYWHME6pjOqwBV3RdMxzl9L4/Xb22','Teresa@gmail.com',NULL,'user','active','2024-10-20 03:56:46'),(4,'Ricky','$2b$12$7EVB5AN8dpbYqJC/MuKur.a9kut2aNawBnhvomjLIgQbhB9Vndswm','Ricky@gmail.com','0127945923','REN','active','2024-10-21 12:47:52'),(5,'admin','$2b$12$sA5p9WUJkzemIj1SfoFXeegEM9fiPTAcMq/r3rz.5Zhb2exd1WB6m','admin168@gmail.com','1234567890','admin','active','2024-10-21 15:37:51'),(11,'Ben','$2b$12$NkZnFXZ5fo7iU4IUTl/DzelTSgNNVcFlXsuRaek/AERe6i/jJV2k6','ben@gmail.com','','user','active','2024-12-06 08:28:54'),(12,'Gan','$2b$12$9IRCfDLZBAsZh3bDiKleeeZ6ACKSd3fF6LwHjta5gsgUGO2PoXVJi','gan1@gmial.com','','user','active','2024-12-06 08:29:51'),(13,'Ali','$2b$12$SvHa6rO9jZ/xr8y06wptueVxyzVrVW88fApFZHteIbTQA5bWfZwRK','ali2@gmial.com','','user','active','2024-12-06 08:38:51'),(14,'Lau He','$2b$12$PFRSIC8AeBDAQB54Winul.bUhRxJ4z5zovBafJ.R0CxPgvhpLj/DK','LauHe@gmaicl.o','','user','active','2024-12-06 08:44:24'),(15,'Benjamin','$2b$12$A5i/BI7W0lC5WFiLSTw4YODHA/8yXc5ZnHuzZpSjvUERJJ.Uwp80G','Benjamin@eg','','user','active','2024-12-06 08:48:06'),(16,'Jacely','$2b$12$V6w/7n5cVJuSFflB1DnvROUlDyBsJiI3JeLeuvblD83kzFDkzoItq','Jacely@gmail.com','','user','active','2024-12-06 08:49:25'),(17,'Jasmin','$2b$12$p1zq66nqAy.sYLQxzqcRBe4XVue4WSlnXQ3rQM2Yo6CtK/M300aSW','Jasmin@gmail.com','','user','active','2024-12-06 08:52:05'),(18,'Joe','$2b$12$rNdXWU3UbiicYwOcgHqyI.I4ZHtISmAdTQJnj78zvvz84QSKno.ka','Joe@gmail.com','','user','active','2024-12-06 08:53:43'),(21,'Kaka','$2b$12$ah5X2ZYA3rl1C8aaf3aNNOcYQvIbKzPGTZlAA1lngrljngz/W2SMO','kaka@gmail.com','','user','active','2024-12-06 09:00:56'),(22,'Wong','$2b$12$95b.h5su5f/Bk3GaMXJI/O9BlGiqFa0Jr8dF08sT.F1ny3LXQnpiG','Wong@gmail.com','01235315','REN','active','2024-12-06 09:02:48'),(23,'Maria','$2b$12$TUvMsmYr4XuDsOfEnHAVZe39BrDHS8AvkfmWnjuNt9PDr4eRDXzDK','maria@gmail.com','12351351','user','active','2024-12-06 09:03:39'),(24,'Jacky','$2b$12$qCGNxZ51OJJuzm32l6PV1.Sy7/O3AcQ9LegG7xgBrvzOaz6IpHwB6','jacky@gmail.com','123','REN','active','2024-12-06 09:04:29'),(25,'Kelvin','$2b$12$yP8RINePDxWPl7C52jwwUOMycFXRpKxJCWw7ENVWZcHUOxt4Gu3e6','kelvin@gmail.com','123','REN','active','2024-12-30 15:17:51'),(26,'Alwin','$2b$12$6hyqMrXBnMad9ghWv9kNNecoK/9ExTyYjER0TJVPIWA45pwWvTnkm','alwin@gmail.com','12','REN','banned','2024-12-30 15:22:02'),(27,'Arwin','$2b$12$JgDRB8hNIU4TAVysjG4/R.IB0sLwlEFJl8mjMmMqDmJKCBsXHvxry','arwin02@gmail.com','012-8735293','REN','active','2025-01-05 07:40:10');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-02  9:32:44
