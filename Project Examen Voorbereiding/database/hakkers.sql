-- phpMyAdmin SQL Dump
-- version 4.9.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2020 at 10:25 AM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hakkers`
--

-- --------------------------------------------------------

--
-- Table structure for table `bevoegdheden`
--

CREATE TABLE `bevoegdheden` (
  `GebruikerId` varchar(36) NOT NULL,
  `Bevoegdheid` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `gebruikers`
--

CREATE TABLE `gebruikers` (
  `Id` varchar(36) NOT NULL,
  `Naam` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Wachtwoord` varchar(100) NOT NULL,
  `Rol` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `gebruikers`
--

INSERT INTO `gebruikers` (`Id`, `Naam`, `Email`, `Wachtwoord`, `Rol`) VALUES
('6DB49FA4-4B59-4DDD-AB76-A3A6AF31ED27', 'Timothy', 'tckuijpers@hotmail.com', '$2y$10$dX30SGBOtHx1yw.gkcoqKuZ4z02mH6bvGYMwD4W/XHhMqt/79Gdsm', 3),
('E76E2CA3-9009-407A-B8AA-4F132D1C2ED7', 'Henry', 'henry@gmail.com', 'Appelsap2@', 2),
('F888AF6B-5390-47D5-BE4E-5B11E90D1D72', 'Billy', 'billy@gmail.com', 'Appelsap2@', 1),
('C9C776EC-39B4-42F3-8B73-2345D6992447', 'Bruno', 'bruno@gmail.com', 'Appelsap2@', 2),
('009BED54-5FB6-4320-AF9A-6B4BD16F66B6', 'Arjan', 'arjan@gmail.com', '$2y$10$MCEfbQn4gIzqOVPmXsr4/uxJuo224eH1dtpmS5BJlFlVy.M2voo/e', 1);

-- --------------------------------------------------------

--
-- Table structure for table `klanten`
--

CREATE TABLE `klanten` (
  `Id` varchar(36) NOT NULL,
  `Voornaam` varchar(100) NOT NULL,
  `Achternaam` varchar(100) NOT NULL,
  `Tussenvoegsel` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Woonplaats` varchar(100) NOT NULL,
  `Straat` varchar(100) NOT NULL,
  `Huisnummer` varchar(10) NOT NULL,
  `Postcode` varchar(6) NOT NULL,
  `Telefoonnummer` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `klanten`
--

INSERT INTO `klanten` (`Id`, `Voornaam`, `Achternaam`, `Tussenvoegsel`, `Email`, `Woonplaats`, `Straat`, `Huisnummer`, `Postcode`, `Telefoonnummer`) VALUES
('7431F029-9DD9-4BCD-9CB1-9561EFAA509F', 'Ryder', 'Mackie', '', 'r.mackie@gmail.com', 'Arnhem', 'Zijpendaalseweg', '21', '3896dk', 692769476),
('B9AAE565-9956-482B-8016-2C2E95B73959', 'Billy', 'Jone', '', 'b.jone@gmail.com', 'Arnhem', 'Zijpendaalseweg', '2', '1234AB', 689376018),
('F924AC99-5CF6-4F07-A7BC-E48A612A710C', 'Glenn', 'Williamson', '', 'g.williamson@gmail.com', 'Arnhem', 'Zijpendaalseweg', '73', '5678as', 692756638);

-- --------------------------------------------------------

--
-- Table structure for table `werkzaamheden`
--

CREATE TABLE `werkzaamheden` (
  `Id` varchar(36) NOT NULL,
  `MonteurId` varchar(36) NOT NULL,
  `KlantId` varchar(36) NOT NULL,
  `Type` varchar(32) NOT NULL,
  `Datum` datetime NOT NULL,
  `LengteInMin` int(3) NOT NULL,
  `Toelichting` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `werkzaamheden`
--

INSERT INTO `werkzaamheden` (`Id`, `MonteurId`, `KlantId`, `Type`, `Datum`, `LengteInMin`, `Toelichting`) VALUES
('6DD1A581-F6FC-443E-9CE6-A5B2D249E725', '009BED54-5FB6-4320-AF9A-6B4BD16F66B6', 'B9AAE565-9956-482B-8016-2C2E95B73959', 'Installatie', '2020-05-27 09:00:00', 60, 'CV ketel installeren'),
('818844B0-0C1D-4AFB-9097-D07FB0C4930F', 'F888AF6B-5390-47D5-BE4E-5B11E90D1D72', '7431F029-9DD9-4BCD-9CB1-9561EFAA509F', 'Installatie', '2020-05-27 08:00:00', 60, 'Zonnepanelen installeren'),
('A400599A-F3DC-43C7-9417-35D0C29A3EAE', 'F888AF6B-5390-47D5-BE4E-5B11E90D1D72', '7431F029-9DD9-4BCD-9CB1-9561EFAA509F', 'Reparatie', '2020-05-29 15:00:00', 30, 'Zonnepanelen repareren'),
('ECACC47A-49BE-4D20-952B-4C5E5CB3FF3C', '009BED54-5FB6-4320-AF9A-6B4BD16F66B6', 'B9AAE565-9956-482B-8016-2C2E95B73959', 'Installatie', '2020-04-30 11:00:00', 60, 'CV ketel vervangen'),
('F0889226-C730-484C-98EB-57A2AB00F96D', 'F888AF6B-5390-47D5-BE4E-5B11E90D1D72', 'B9AAE565-9956-482B-8016-2C2E95B73959', 'Reparatie', '2020-05-28 16:00:00', 60, 'CV ketel repareren'),
('FA8565C5-9763-420A-8C85-8AD4E60E8EE6', 'F888AF6B-5390-47D5-BE4E-5B11E90D1D72', 'B9AAE565-9956-482B-8016-2C2E95B73959', 'Installatie', '2020-05-27 10:00:00', 60, 'Extra verwarming installeren');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `klanten`
--
ALTER TABLE `klanten`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `werkzaamheden`
--
ALTER TABLE `werkzaamheden`
  ADD PRIMARY KEY (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
