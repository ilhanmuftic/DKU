-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 25, 2024 at 12:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dku`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `Id` varchar(36) NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Hours` int(11) DEFAULT NULL,
  `Info` text DEFAULT NULL,
  `User_id` int(11) DEFAULT NULL,
  `Date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`Id`, `Name`, `Hours`, `Info`, `User_id`, `Date`) VALUES
('01e0e9a4-2c6e-414d-a411-cec63c8e8441', 'Test', 2, 'Ovo je test, kako bismo vidjeli dokle smo dosli jer je mule zaboravio sta je radio prije neki dan. Maslo i kurta ne rade nista.... standardno\r\n', 2, '2024-02-28'),
('0dfc1c82-9792-4834-9904-48b837d81860', 'Participate test', 2, 'Ovo je test participacije assignmentu pri kreaciji', 2, '2024-02-28'),
('998d7518-dc4d-4b2b-acc0-60bc348fd0b5', 'Profa', 2, 'Ovo pokazujemo profi', 2, '2024-02-28'),
('c4545adc-48e0-4f97-8286-23c71ef151dc', 'Test', 1, 'Ovo je test.', 2, '2012-12-12');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `Id` int(11) NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Professor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`Id`, `Name`, `Professor_id`) VALUES
(1, 'IV-f', 1);

-- --------------------------------------------------------

--
-- Table structure for table `participate`
--

CREATE TABLE `participate` (
  `Id` int(11) NOT NULL,
  `Assignment_id` varchar(36) DEFAULT NULL,
  `Student_id` int(11) DEFAULT NULL,
  `State` enum('Approved','Denied','Pending') DEFAULT 'Pending',
  `Date` date DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;

--
-- Dumping data for table `participate`
--

INSERT INTO `participate` (`Id`, `Assignment_id`, `Student_id`, `State`, `Date`) VALUES
(3, '0dfc1c82-9792-4834-9904-48b837d81860', 1, 'Pending', '2024-02-28'),
(4, '998d7518-dc4d-4b2b-acc0-60bc348fd0b5', 1, 'Pending', '2024-02-28');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `Id` int(11) NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Hours` int(11) DEFAULT NULL,
  `Class_id` int(11) DEFAULT NULL,
  `User_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`Id`, `Name`, `Hours`, `Class_id`, `User_id`) VALUES
(1, 'Test', 0, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id` int(11) NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `Type` enum('Professor','Student') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id`, `Email`, `Password`, `Type`) VALUES
(1, 'professor@test.ba', 'test', 'Professor'),
(2, 'student@test.ba', 'test', 'Student');

-- --------------------------------------------------------

--
-- Table structure for table `visibility`
--

CREATE TABLE `visibility` (
  `Id` int(11) NOT NULL,
  `Assignment_id` varchar(36) DEFAULT NULL,
  `Class` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_croatian_ci;

--
-- Dumping data for table `visibility`
--

INSERT INTO `visibility` (`Id`, `Assignment_id`, `Class`) VALUES
(1, 'c4545adc-48e0-4f97-8286-23c71ef151dc', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `User_id` (`User_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Professor_id` (`Professor_id`);

--
-- Indexes for table `participate`
--
ALTER TABLE `participate`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Assignment_id` (`Assignment_id`),
  ADD KEY `Student_id` (`Student_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `uk_id` (`User_id`),
  ADD KEY `Class_id` (`Class_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `visibility`
--
ALTER TABLE `visibility`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Assignment_id` (`Assignment_id`),
  ADD KEY `Class` (`Class`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `participate`
--
ALTER TABLE `participate`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `visibility`
--
ALTER TABLE `visibility`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `users` (`Id`);

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`Professor_id`) REFERENCES `users` (`Id`);

--
-- Constraints for table `participate`
--
ALTER TABLE `participate`
  ADD CONSTRAINT `participate_ibfk_2` FOREIGN KEY (`Student_id`) REFERENCES `students` (`Id`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`Class_id`) REFERENCES `classes` (`Id`),
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`User_id`) REFERENCES `users` (`Id`);

--
-- Constraints for table `visibility`
--
ALTER TABLE `visibility`
  ADD CONSTRAINT `visibility_ibfk_2` FOREIGN KEY (`Class`) REFERENCES `classes` (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
