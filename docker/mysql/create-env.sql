CREATE DATABASE  IF NOT EXISTS `mydata` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mydata`;
-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mydata
-- ------------------------------------------------------
-- Server version	8.0.27

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
-- Table structure for table `issuer_info`
--

DROP TABLE IF EXISTS `issuer_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issuer_info` (
  `issuer_id` int NOT NULL AUTO_INCREMENT,
  `issuer_name` varchar(45) NOT NULL,
  `issuer_pubkey` varchar(42) NOT NULL,
  `issuer_contract_num` varchar(42) NOT NULL,
  PRIMARY KEY (`issuer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issuer_info`
--

LOCK TABLES `issuer_info` WRITE;
/*!40000 ALTER TABLE `issuer_info` DISABLE KEYS */;
INSERT INTO `issuer_info` VALUES (1,'speca','1','1');
/*!40000 ALTER TABLE `issuer_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_cert_info`
--

DROP TABLE IF EXISTS `user_cert_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_cert_info` (
  `cert_num` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `cert_addr` varchar(42) NOT NULL,
  `cert_effective_date` datetime NOT NULL,
  `cert_expiration_date` datetime NOT NULL,
  `cert_id` char(66) NOT NULL,
  PRIMARY KEY (`cert_num`),
  KEY `fk_USER_CERT_INFO_USER_INFO1_idx` (`user_id`),
  CONSTRAINT `fk_USER_CERT_INFO_USER_INFO1` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_cert_info`
--

LOCK TABLES `user_cert_info` WRITE;
/*!40000 ALTER TABLE `user_cert_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_cert_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_info`
--

DROP TABLE IF EXISTS `user_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_info` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `issuer_id` int NOT NULL,
  `user_name` varchar(45) NOT NULL,
  `user_birth` varchar(50) NOT NULL,
  `user_pubkey` varchar(42) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `fk_USER_INFO_ISSUER_INFO_idx` (`issuer_id`),
  CONSTRAINT `fk_USER_INFO_ISSUER_INFO` FOREIGN KEY (`issuer_id`) REFERENCES `issuer_info` (`issuer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_info`
--

LOCK TABLES `user_info` WRITE;
/*!40000 ALTER TABLE `user_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'mydata'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-16 21:23:00
    	
    	
DROP PROCEDURE IF EXISTS whileProc;

DELIMITER $$ 
CREATE PROCEDURE whileProc()
BEGIN
	DECLARE i INT;
	SET i = 1;
	WHILE (i < 111) DO
		insert into users (id, pw, balance) value (i, i, 100000);   
		SET i = i+1;
	END WHILE;
END$$

DELIMITER ;

call whileProc();

select * from users;
