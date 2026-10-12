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
-- Table structure for table `appimages`
--

DROP TABLE IF EXISTS `appimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appimages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `subTitle` varchar(255) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appimages`
--

LOCK TABLES `appimages` WRITE;
/*!40000 ALTER TABLE `appimages` DISABLE KEYS */;
INSERT INTO `appimages` VALUES (1,'outer_1','1779276552809-Group 1597884415 (1).png','','','inactive','2026-05-04 08:11:29','2026-05-20 12:45:55'),(2,'inner_2','1779276560322-Group 1597884415 (1).png','','','active','2026-05-04 08:11:29','2026-05-20 12:15:28'),(3,'outer_2','1779276567415-Group 1597884415 (1).png','','','active','2026-05-04 08:11:29','2026-05-20 12:15:20'),(4,'inner_1','1777882956795-Frame 1597884552.png','','','active','2026-05-04 08:11:29','2026-05-04 08:22:36'),(5,'inner_2','1779276518345-Frame 1597884552.png','','','inactive','2026-05-04 08:11:29','2026-05-20 12:15:28'),(6,'inner_3','1779276533364-Frame 1597884552.png','','','active','2026-05-04 08:11:29','2026-05-20 11:28:53'),(7,'outer_1','1779278759328-Splash screen.png','changed outer 1','changed outer 1','inactive','2026-05-20 12:05:59','2026-05-20 12:15:10'),(8,'outer_1','1779278797896-Splash screen.png','chnged outer 3','chnged outer 3','active','2026-05-20 12:06:37','2026-05-20 12:45:55'),(9,'outer_3','1779281142416-Splash screen.png','changed','changed','active','2026-05-20 12:45:42','2026-05-20 12:45:42');
/*!40000 ALTER TABLE `appimages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:19:29
