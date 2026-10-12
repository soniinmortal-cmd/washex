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
-- Table structure for table `catalog`
--

DROP TABLE IF EXISTS `catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` int NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `productType` enum('MEN','WOMEN','UNISEX') NOT NULL DEFAULT 'UNISEX',
  `serviceType` enum('laundry','drycleaning','ironing') NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `organizationId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_catalog_organization` (`organizationId`),
  CONSTRAINT `fk_catalog_organization` FOREIGN KEY (`organizationId`) REFERENCES `organization` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalog`
--

LOCK TABLES `catalog` WRITE;
/*!40000 ALTER TABLE `catalog` DISABLE KEYS */;
INSERT INTO `catalog` VALUES (1,'shirt',10,'shirt.png','UNISEX','laundry','active',1),(2,'Jacket',10,'jacket.png','UNISEX','laundry','active',1),(3,'TShirt',10,'tshirt.png','UNISEX','laundry','active',1),(4,'Pant',10,'pant.png','UNISEX','laundry','active',1),(5,'Jogger',10,'jogger.png','MEN','laundry','active',1),(6,'Jeans',10,'jeans.png','UNISEX','laundry','active',1),(7,'Mix',10,'mix.png','UNISEX','laundry','active',1),(8,'kurti',10,'kurti.png','WOMEN','laundry','active',1),(9,'saree',10,'saree.png','WOMEN','laundry','active',1),(10,'Vest',10,'vest.png','MEN','laundry','active',1),(11,'Shirt',30,'shirt.png','UNISEX','drycleaning','active',1),(12,'T-Shirt',25,'tshirt.png','UNISEX','drycleaning','active',1),(13,'Jeans',40,'jeans.png','UNISEX','drycleaning','active',1),(14,'Jacket',80,'jacket.png','UNISEX','drycleaning','active',1),(15,'Kurta',35,'kurta.png','UNISEX','drycleaning','active',1),(16,'Kurti',55,'1777622380220-Kurti.png','UNISEX','drycleaning','active',1),(23,'Shirt',100,'shirt.png','UNISEX','ironing','active',1),(24,'T-Shirt',8,'tshirt.png','UNISEX','ironing','active',1),(25,'Jeans',12,'jeans.png','UNISEX','ironing','active',1),(26,'Pant',10,'pant.png','UNISEX','ironing','active',1),(27,'Jacket',20,'jacket.png','UNISEX','ironing','active',1),(28,'Kurta',15,'kurta.png','UNISEX','ironing','active',1),(29,'Kurti',15,'1777622380220-Kurti.png','UNISEX','ironing','active',1),(30,'Saree',25,'saree.png','UNISEX','ironing','active',1),(34,'Random Shirt Org1',0,NULL,'MEN','laundry','active',1),(35,'Random Blazer Org4',250,NULL,'UNISEX','drycleaning','active',4);
/*!40000 ALTER TABLE `catalog` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:19:25
