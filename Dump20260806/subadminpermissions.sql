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
-- Table structure for table `subadminpermissions`
--

DROP TABLE IF EXISTS `subadminpermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subadminpermissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subAdminId` int NOT NULL,
  `menuId` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `subMenuId` int DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_subadmin_menu_submenu` (`subAdminId`,`menuId`,`subMenuId`),
  KEY `fk_permission` (`menuId`),
  KEY `fk_subadminpermission_submenu` (`subMenuId`),
  CONSTRAINT `fk_permission` FOREIGN KEY (`menuId`) REFERENCES `menu` (`id`),
  CONSTRAINT `fk_subadmin` FOREIGN KEY (`subAdminId`) REFERENCES `admin` (`id`),
  CONSTRAINT `fk_subadminpermission_submenu` FOREIGN KEY (`subMenuId`) REFERENCES `submenu` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subadminpermissions`
--

LOCK TABLES `subadminpermissions` WRITE;
/*!40000 ALTER TABLE `subadminpermissions` DISABLE KEYS */;
INSERT INTO `subadminpermissions` VALUES (47,3,3,'2026-07-03 07:42:28','2026-07-03 07:42:28',NULL,1),(48,3,4,'2026-07-03 07:42:28','2026-07-03 07:42:28',4,1),(49,3,5,'2026-07-03 07:42:28','2026-07-03 07:42:28',NULL,1),(50,3,8,'2026-07-03 07:42:28','2026-07-03 07:42:28',NULL,1);
/*!40000 ALTER TABLE `subadminpermissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:19:28
