-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: quickwash
-- ------------------------------------------------------
-- Server version	8.0.45

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
  `userId` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `referenceId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notification_userId` (`userId`),
  KEY `idx_notification_read` (`isRead`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (3,31,'LIMIT_ALERT',NULL,'Remaining Limit Alert','Your remaining limit is 4. Please recharge to continue using the service.',0,'2026-07-08 11:47:44','2026-07-08 11:47:44'),(4,31,'LIMIT_ALERT',NULL,'Remaining Limit Alert','Your remaining limit is 1. Please recharge to continue using the service.',0,'2026-07-09 06:28:17','2026-07-09 06:28:17'),(6,3,'NONWASHABLE',5,'Non Washable Item','An item requires your approval.',0,'2026-07-16 07:38:30','2026-07-16 07:38:30'),(9,31,'LIMIT_ALERT',NULL,'Remaining Limit Alert','Your remaining limit is 0. Please recharge to continue using the service.',0,'2026-07-17 11:07:50','2026-07-17 11:07:50'),(10,31,'LIMIT_ALERT',NULL,'Remaining Limit Alert','Your remaining limit is 0. Please recharge to continue using the service.',0,'2026-07-17 11:08:25','2026-07-17 11:08:25'),(11,31,'LIMIT_ALERT',NULL,'Remaining Limit Alert','Your remaining limit is 0. Please recharge to continue using the service.',0,'2026-07-17 11:08:27','2026-07-17 11:08:27'),(12,31,'LIMIT_ALERT',NULL,'Remaining Limit Alert','Your remaining limit is 0. Please recharge to continue using the service.',0,'2026-07-17 11:10:15','2026-07-17 11:10:15'),(14,31,'LIMIT_ALERT',NULL,'Remaining Limit Alert','Your remaining limit is 0. Please recharge to continue using the service.',0,'2026-07-28 12:32:25','2026-07-28 12:32:25');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:19:24
