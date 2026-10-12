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
-- Table structure for table `limit_packages`
--

DROP TABLE IF EXISTS `limit_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `limit_packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `extraLimit` int NOT NULL,
  `price` int NOT NULL,
  `validityDays` int NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `organizationId` int NOT NULL,
  `distributionType` enum('FULL','MONTHLY') NOT NULL DEFAULT 'FULL',
  PRIMARY KEY (`id`),
  KEY `fk_limit_package_organization` (`organizationId`),
  CONSTRAINT `fk_limit_package_organization` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `limit_packages`
--

LOCK TABLES `limit_packages` WRITE;
/*!40000 ALTER TABLE `limit_packages` DISABLE KEYS */;
INSERT INTO `limit_packages` VALUES (1,'Basic',600,499,15,'active','2026-05-22 15:03:34','2026-07-17 15:28:16',1,'MONTHLY'),(2,'Standard',100,899,15,'active','2026-05-22 15:03:34','2026-07-03 12:50:35',1,'FULL'),(3,'Premium',200,1499,15,'active','2026-05-22 15:03:34','2026-07-03 12:50:41',1,'FULL'),(7,'Basic',250,500000,25,'active','2026-07-07 13:28:44','2026-07-07 13:28:44',2,'FULL'),(8,'test',15,200,30,'active','2026-07-07 13:07:53','2026-07-07 13:07:53',2,'FULL'),(9,'monthlydistribution',600,6000,365,'active','2026-07-09 13:08:08','2026-07-09 13:08:08',4,'MONTHLY');
/*!40000 ALTER TABLE `limit_packages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:19:30
