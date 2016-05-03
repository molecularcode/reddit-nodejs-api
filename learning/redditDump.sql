-- MySQL dump 10.13  Distrib 5.5.47, for debian-linux-gnu (x86_64)
--
-- Host: 0.0.0.0    Database: reddit
-- ------------------------------------------------------
-- Server version	5.5.47-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment` varchar(10000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `postId` int(11) DEFAULT NULL,
  `parentId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `userId` (`userId`),
  KEY `postId` (`postId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'awesome',11,6,NULL,'2016-04-29 14:29:11','2016-04-29 14:29:11'),(3,'awesome',11,6,NULL,'2016-04-29 14:36:58','2016-04-29 14:36:58'),(5,'that was interesting',11,6,NULL,'2016-04-29 14:41:06','2016-04-29 14:41:06'),(6,'that was interesting',11,6,NULL,'2016-04-29 14:41:24','2016-04-29 14:41:24'),(7,'that was interesting',11,6,NULL,'2016-04-29 14:41:56','2016-04-29 14:41:56'),(8,'that was interesting',11,6,NULL,'2016-04-29 14:43:17','2016-04-29 14:43:17'),(9,'that was interesting',11,6,7,'2016-04-29 15:15:53','2016-04-29 15:15:53'),(10,'that was interesting',11,6,7,'2016-04-29 15:16:04','2016-04-29 15:16:04'),(11,'third level comment',11,6,9,'2016-04-29 19:45:48','2016-04-29 19:45:48');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `subredditId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `subredditId` (`subredditId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`subredditId`) REFERENCES `subreddits` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'hi reddit!','https://www.reddit.com',1,'2016-04-28 17:34:45','2016-04-28 17:34:45',NULL),(2,'hi reddit!','https://www.reddit.com',3,'2016-04-28 17:47:45','2016-04-28 17:47:45',NULL),(3,'hi reddit!','https://www.reddit.com',6,'2016-04-28 17:48:15','2016-04-28 17:48:15',NULL),(4,'hi reddit!','https://www.reddit.com',11,'2016-04-28 18:17:19','2016-04-28 18:17:19',NULL),(5,'hi reddit!','https://www.reddit.com',12,'2016-04-28 23:08:55','2016-04-28 23:08:55',NULL),(6,'hi reddit!','https://www.reddit.com',14,'2016-04-28 23:21:07','2016-04-28 23:21:07',NULL),(7,'hi reddit!','https://www.reddit.com',15,'2016-04-28 23:21:52','2016-04-28 23:21:52',NULL),(8,'hi reddit!','https://www.reddit.com',17,'2016-04-28 23:23:10','2016-04-28 23:23:10',4),(9,'my post','https://www.google.com',1,'2016-05-02 19:58:44','2016-05-02 19:58:44',4),(10,'my other post','https://www.fred.com',1,'2016-05-02 19:59:01','2016-05-02 19:59:01',4),(11,'awesome stuff','https://nodejs.com',1,'2016-05-02 19:59:23','2016-05-02 19:59:23',6),(14,'something cool','https://csstricks.com',1,'2016-05-02 20:00:15','2016-05-02 20:00:15',6);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subreddits`
--

DROP TABLE IF EXISTS `subreddits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subreddits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subreddits`
--

LOCK TABLES `subreddits` WRITE;
/*!40000 ALTER TABLE `subreddits` DISABLE KEYS */;
INSERT INTO `subreddits` VALUES (1,'mySubreddit',NULL,'it\'s awesome','2016-04-28 22:34:00','2016-04-28 22:34:00'),(4,'mySecondSubreddit',NULL,'it\'s awesome','2016-04-28 22:43:40','2016-04-28 22:43:40'),(6,'myThirdSubreddit',NULL,'it\'s awesome','2016-04-28 22:44:56','2016-04-28 22:44:56'),(8,'myFourthSubreddit',NULL,'it\'s awesome','2016-04-28 22:45:56','2016-04-28 22:45:56'),(9,'myFifthSubreddit',NULL,NULL,'2016-04-28 22:48:45','2016-04-28 22:48:45');
/*!40000 ALTER TABLE `subreddits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'hello23','$2a$10$CCGXiW7mpuSqH3pgCth8nee85wUulOVpiQ0A8teTYav6qCvOPSOy2','2016-04-28 17:34:45','2016-04-28 17:34:45'),(3,'hello234','$2a$10$oHMczQlmUAqJmQHgg.ojXe96HdZesz1PkxTj/knFHsIKPW.fjqkQi','2016-04-28 17:47:45','2016-04-28 17:47:45'),(6,'hello2345','$2a$10$IfJitAL2GR644G8boDcPM.q9SQeawbxWh8ddMQYCvxia/5l3Sl7Jy','2016-04-28 17:48:15','2016-04-28 17:48:15'),(11,'hello234567','$2a$10$P1YWtNE6dWvTiBhoJycMwOtmLj7eVKqhai6vrsX4aQGn7QpO/TX6S','2016-04-28 18:17:19','2016-04-28 18:17:19'),(12,'hello2','$2a$10$66TulDvop7NckZmOofW.5.pi0mvvLnjD78SP77uD7fD6HL9NPvP9.','2016-04-28 23:08:55','2016-04-28 23:08:55'),(14,'hello3','$2a$10$YAFYrNbiBC3AI3fcxE2P3unDZpPgmJsifZP85x4alkMc6jHGz9jMa','2016-04-28 23:21:07','2016-04-28 23:21:07'),(15,'hello4','$2a$10$e6iQsy4RcnJQ8qezqGyVC.XRI7DIK/qqGilX5.XqrqgZHlpDovJyq','2016-04-28 23:21:52','2016-04-28 23:21:52'),(17,'hello5','$2a$10$sEaLv4C11uBT55y18Gg/weQ1NeUw5XP2CI9/GrSic1qFuR4GehC6C','2016-04-28 23:23:10','2016-04-28 23:23:10');
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

-- Dump completed on 2016-05-02 20:01:01
