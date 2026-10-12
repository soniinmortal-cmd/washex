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
-- Table structure for table `washerman`
--

DROP TABLE IF EXISTS `washerman`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `washerman` (
  `id` int NOT NULL AUTO_INCREMENT,
  `washerId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('enable','disable') DEFAULT 'enable',
  `idProof` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `washerId` (`washerId`),
  CONSTRAINT `washerman_ibfk_1` FOREIGN KEY (`washerId`) REFERENCES `washers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `washerman`
--

LOCK TABLES `washerman` WRITE;
/*!40000 ALTER TABLE `washerman` DISABLE KEYS */;
INSERT INTO `washerman` VALUES (2,1,'changed','1779091938711-Splash screen.png','2026-04-30 08:58:35','2026-05-18 08:12:18','enable',NULL),(3,1,'Mohan','mohan.jpg','2026-04-30 08:58:35','2026-04-30 08:58:35','enable',NULL),(4,1,'Amit','amit.jpg','2026-04-30 08:58:35','2026-04-30 08:58:35','enable',NULL),(6,2,'Rahul','1777555460079-Chevron Right.png','2026-04-30 13:24:20','2026-04-30 13:24:20','enable',NULL),(8,2,'changed2','1777611737305-Chevron Right.png','2026-04-30 13:24:20','2026-05-01 05:02:17','enable',NULL),(9,1,'Added','1777612604034-iconamoon_arrow-up-2.png','2026-05-01 05:16:44','2026-05-01 05:16:44','enable',NULL),(10,1,'Rahul','1777976035947-Jacket.png','2026-05-05 10:13:55','2026-05-05 10:13:55','enable',NULL),(11,1,'Amit',NULL,'2026-05-05 10:13:55','2026-05-05 10:13:55','enable',NULL),(12,1,'Ravi','1777976035947-Chevron Right.png','2026-05-05 10:13:55','2026-05-05 10:13:55','enable',NULL),(13,4,'randomone',NULL,'2026-05-18 09:29:07','2026-05-18 09:29:07','enable',NULL),(14,4,'randomtwo','1779096547879-Group 1597884415 (1).png','2026-05-18 09:29:07','2026-05-18 09:29:07','enable',NULL),(15,4,'random',NULL,'2026-05-23 15:17:44','2026-05-23 15:17:44','enable',NULL),(16,4,'random',NULL,'2026-05-23 15:18:15','2026-05-23 15:18:15','enable',NULL),(17,4,'addednow',NULL,'2026-05-23 15:19:40','2026-05-23 15:19:40','enable',NULL),(18,4,'justnow',NULL,'2026-05-23 15:23:10','2026-05-23 15:24:25','enable','1779549865483-Group 1597884415 (1).png'),(19,4,'justnow',NULL,'2026-05-23 15:24:08','2026-05-23 15:24:08','enable','1779549848074-system_workflow.png');
/*!40000 ALTER TABLE `washerman` ENABLE KEYS */;
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
