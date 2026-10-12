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
-- Table structure for table `washers`
--

DROP TABLE IF EXISTS `washers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `washers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loginId` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `organizationId` int DEFAULT NULL,
  `organizationType` enum('UNIVERSITY','HOSPITAL') DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `loginId` (`loginId`),
  KEY `fk_washers_org` (`organizationId`),
  CONSTRAINT `fk_washers_org` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `washers`
--

LOCK TABLES `washers` WRITE;
/*!40000 ALTER TABLE `washers` DISABLE KEYS */;
INSERT INTO `washers` VALUES (1,'washer001','randomfromfrontend','2026-04-02 05:49:02','2026-07-05 15:08:20',2,'UNIVERSITY','washerOne',NULL),(2,'washer2','password456','2026-04-02 05:49:02','2026-05-28 09:58:00',1,'UNIVERSITY',NULL,NULL),(3,'washer3','password789','2026-04-02 05:49:02','2026-04-02 05:49:02',NULL,NULL,NULL,NULL),(4,'washer4','password246','2026-04-21 10:40:32','2026-04-21 10:40:32',NULL,NULL,NULL,NULL),(7,'washer101','123456','2026-05-26 09:39:06','2026-05-26 09:39:06',4,'UNIVERSITY','washer one',NULL),(11,'washertest1','123456','2026-07-28 10:03:33','2026-07-28 10:03:33',7,'UNIVERSITY','washertest1',NULL),(12,'washertest2','123456','2026-07-28 10:03:33','2026-07-28 10:03:33',7,'UNIVERSITY','washertest2',NULL);
/*!40000 ALTER TABLE `washers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:19:26
