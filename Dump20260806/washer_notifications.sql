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
-- Table structure for table `washer_notifications`
--

DROP TABLE IF EXISTS `washer_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `washer_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `washerId` int NOT NULL,
  `type` enum('ORDER','DEFECT','ISSUE','MISMATCH','CHEMICAL','GENERAL') NOT NULL,
  `referenceId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_washer_notifications_washer` (`washerId`),
  CONSTRAINT `fk_washer_notifications_washer` FOREIGN KEY (`washerId`) REFERENCES `washers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `washer_notifications`
--

LOCK TABLES `washer_notifications` WRITE;
/*!40000 ALTER TABLE `washer_notifications` DISABLE KEYS */;
INSERT INTO `washer_notifications` VALUES (1,1,'DEFECT',1,'defect approved','approved',1,'2026-07-08 10:47:40','2026-07-08 05:25:25'),(2,1,'DEFECT',55,'DEFECT APPROVED','Customer has approved the defect for Order #55 (shirt).',0,'2026-07-10 08:12:55','2026-07-10 08:12:55'),(3,1,'MISMATCH',42,'MISMATCH APPROVED','Customer has approved the mismatch for Order #42 (shirt).',0,'2026-07-10 09:44:37','2026-07-10 09:44:37'),(4,1,'MISMATCH',126,'MISMATCH APPROVED','Customer has approved the mismatch for Order #126 (shirt).',0,'2026-07-16 11:49:47','2026-07-16 11:49:47'),(5,1,'MISMATCH',126,'MISMATCH APPROVED','Customer has approved the mismatch for Order #126 (shirt).',0,'2026-07-16 11:53:34','2026-07-16 11:53:34'),(6,1,'MISMATCH',126,'MISMATCH APPROVED','Customer has approved the mismatch for Order #126 (shirt).',0,'2026-07-16 11:55:47','2026-07-16 11:55:47'),(7,1,'MISMATCH',126,'MISMATCH APPROVED','Customer has approved the mismatch for Order #126 (shirt).',0,'2026-07-16 11:59:38','2026-07-16 11:59:38'),(8,1,'MISMATCH',126,'MISMATCH APPROVED','Customer has approved the mismatch for Order #126 (shirt).',0,'2026-07-16 12:01:26','2026-07-16 12:01:26'),(9,1,'MISMATCH',126,'MISMATCH APPROVED','Customer has approved the mismatch for Order #126 (shirt).',0,'2026-07-16 12:08:26','2026-07-16 12:08:26');
/*!40000 ALTER TABLE `washer_notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:19:23
