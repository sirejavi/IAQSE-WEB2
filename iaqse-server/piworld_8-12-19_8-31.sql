# ************************************************************
# Sequel Pro SQL dump
# Versión 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 139.59.131.136 (MySQL 5.7.26-0ubuntu0.18.04.1)
# Base de datos: iaqse
# Tiempo de Generación: 2019-12-08 07:31:47 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Volcado de tabla IAQSE_CLIENT
# ------------------------------------------------------------

DROP TABLE IF EXISTS `IAQSE_CLIENT`;

CREATE TABLE `IAQSE_CLIENT` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `IP` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `LATITUDE` float DEFAULT NULL,
  `LONGITUDE` float DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `IP_INDEX` (`IP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Volcado de tabla IAQSE_DOCUMENT
# ------------------------------------------------------------

DROP TABLE IF EXISTS `IAQSE_DOCUMENT`;

CREATE TABLE `IAQSE_DOCUMENT` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `URL` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `TIPUS` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`),
  KEY `URL_INDEX` (`URL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Volcado de tabla IAQSE_SESSION
# ------------------------------------------------------------

DROP TABLE IF EXISTS `IAQSE_SESSION`;

CREATE TABLE `IAQSE_SESSION` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `USER_ID` int(11) unsigned NOT NULL,
  `SESSION` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `CREATED` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `FK_SESSION_USER` (`USER_ID`),
  CONSTRAINT `FK_SESSION_USER` FOREIGN KEY (`USER_ID`) REFERENCES `IAQSE_USERS` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Volcado de tabla IAQSE_USERS
# ------------------------------------------------------------

DROP TABLE IF EXISTS `IAQSE_USERS`;

CREATE TABLE `IAQSE_USERS` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `USERNAME` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `PASSWORD` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `FULLNAME` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `USERNAME_UNIQUE` (`USERNAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Volcado de tabla IAQSE_VISITA
# ------------------------------------------------------------

DROP TABLE IF EXISTS `IAQSE_VISITA`;

CREATE TABLE `IAQSE_VISITA` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `DOCUMENT_ID` int(11) unsigned NOT NULL,
  `CLIENT_ID` int(11) unsigned NOT NULL,
  `FECHA` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `FK_VISITA_DOCUMENT` (`DOCUMENT_ID`),
  KEY `FK_VISITA_CLIENT` (`CLIENT_ID`),
  CONSTRAINT `FK_VISITA_CLIENT` FOREIGN KEY (`CLIENT_ID`) REFERENCES `IAQSE_CLIENT` (`ID`),
  CONSTRAINT `FK_VISITA_DOCUMENT` FOREIGN KEY (`DOCUMENT_ID`) REFERENCES `IAQSE_DOCUMENT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
