-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2026 at 12:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `loan_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ipAddress` varchar(10) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `userId`, `action`, `entity`, `entityId`, `details`, `ipAddress`, `createdAt`) VALUES
('cmojvzsmv006412n7l3g5shc1', 'cmojvzsjy000012n74qdet1om', 'CREATE', 'Loan', 'cmojvzsl4000p12n78ij9z2j6', '{\"loanNumber\":\"LN202401001\",\"amount\":30000}', NULL, '2026-04-29 10:03:01.688'),
('cmojvzsmv006512n7ftnqzogc', 'cmojvzsjy000012n74qdet1om', 'CREATE', 'Party', 'cmojvzskv000k12n7baf2hb68', '{\"name\":\"Ramesh Verma\"}', NULL, '2026-04-29 10:03:01.688'),
('cmojvzsmv006612n7kesa3567', 'cmojvzske000212n7gdeiteoj', 'PAYMENT', 'Payment', NULL, '{\"amount\":400,\"loan\":\"LN202401001\"}', NULL, '2026-04-29 10:03:01.688'),
('cmojw0ow40001eh2y446ygjd4', 'cmojvzsjy000012n74qdet1om', 'LOGIN', 'User', 'cmojvzsjy000012n74qdet1om', '{\"email\":\"admin@example.com\",\"role\":\"ADMIN\"}', NULL, '2026-04-29 10:03:43.493'),
('cmojw3cqe0005eh2yokmw0r22', 'cmojvzsjy000012n74qdet1om', 'PAYMENT', 'Payment', 'cmojw3cq10003eh2yhlaxbllc', '{\"receiptNumber\":\"RCP57147688\",\"amount\":3100,\"loanId\":\"cmojvzsm8005212n703x2jl0x\"}', NULL, '2026-04-29 10:05:47.702'),
('cmojw5woj0009eh2yvsgu6q1m', 'cmojvzsjy000012n74qdet1om', 'PAYMENT', 'Payment', 'cmojw5wo80007eh2yeijdpctm', '{\"receiptNumber\":\"RCP57266855\",\"amount\":200,\"loanId\":\"cmojvzslu002812n7iksf3p2l\"}', NULL, '2026-04-29 10:07:46.867'),
('cmojwbsgg0003krtx0j56nrv3', 'cmojvzsjy000012n74qdet1om', 'LOGIN', 'User', 'cmojvzsjy000012n74qdet1om', '{\"email\":\"admin@example.com\",\"role\":\"ADMIN\"}', NULL, '2026-04-29 10:12:21.329'),
('cmojwbuth0005krtxnldvijnf', 'cmojvzsjy000012n74qdet1om', 'LOGIN', 'User', 'cmojvzsjy000012n74qdet1om', '{\"email\":\"admin@example.com\",\"role\":\"ADMIN\"}', NULL, '2026-04-29 10:12:24.390'),
('cmojwfn64000ieh2y5p4c640j', 'cmojvzske000212n7gdeiteoj', 'LOGIN', 'User', 'cmojvzske000212n7gdeiteoj', '{\"email\":\"agent1@example.com\",\"role\":\"AGENT\"}', NULL, '2026-04-29 10:15:21.100');

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` varchar(191) NOT NULL,
  `loanNumber` varchar(191) NOT NULL,
  `loanType` enum('SIMPLE','MONTHLY_INTEREST','RECURRING') NOT NULL,
  `status` enum('ACTIVE','CLOSED','OVERDUE','PENDING') NOT NULL DEFAULT 'ACTIVE',
  `partyId` varchar(191) NOT NULL,
  `agentId` varchar(191) DEFAULT NULL,
  `loanAmount` decimal(15,2) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `fileCharges` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `purpose` varchar(191) DEFAULT NULL,
  `witnessName` varchar(191) DEFAULT NULL,
  `witnessAddress` varchar(191) DEFAULT NULL,
  `installmentType` enum('DAILY','WEEKLY','MONTHLY','YEARLY') DEFAULT NULL,
  `installmentAmount` decimal(15,2) DEFAULT NULL,
  `totalInstallments` int(11) DEFAULT NULL,
  `lateFine` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalPayable` decimal(15,2) DEFAULT NULL,
  `monthlyInterest` decimal(15,2) DEFAULT NULL,
  `depositAmount` decimal(15,2) DEFAULT NULL,
  `returnPercent` decimal(5,2) DEFAULT NULL,
  `maturityAmount` decimal(15,2) DEFAULT NULL,
  `totalPaid` decimal(15,2) NOT NULL DEFAULT 0.00,
  `pendingAmount` decimal(15,2) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loans`
--

INSERT INTO `loans` (`id`, `loanNumber`, `loanType`, `status`, `partyId`, `agentId`, `loanAmount`, `startDate`, `endDate`, `fileCharges`, `remarks`, `purpose`, `witnessName`, `witnessAddress`, `installmentType`, `installmentAmount`, `totalInstallments`, `lateFine`, `totalPayable`, `monthlyInterest`, `depositAmount`, `returnPercent`, `maturityAmount`, `totalPaid`, `pendingAmount`, `createdAt`, `updatedAt`) VALUES
('cmojvzsl4000p12n78ij9z2j6', 'LN202401001', 'SIMPLE', 'ACTIVE', 'cmojvzskv000k12n7baf2hb68', NULL, 30000.00, '2026-04-04 10:03:01.623', NULL, 500.00, NULL, NULL, NULL, NULL, 'DAILY', 400.00, 30, 50.00, 12000.00, NULL, NULL, NULL, NULL, 10000.00, 2000.00, '2026-04-29 10:03:01.624', '2026-04-29 10:03:01.624'),
('cmojvzslf001l12n7a0zsif6c', 'LN202401002', 'SIMPLE', 'ACTIVE', 'cmojvzsku000d12n7knnl5hn1', NULL, 50000.00, '2026-01-29 10:03:01.623', NULL, 1000.00, NULL, NULL, NULL, NULL, 'MONTHLY', 5500.00, 12, 200.00, 66000.00, NULL, NULL, NULL, NULL, 16500.00, 49500.00, '2026-04-29 10:03:01.635', '2026-04-29 10:03:01.635'),
('cmojvzslo001z12n7qmq80aoy', 'LN202401003', 'MONTHLY_INTEREST', 'ACTIVE', 'cmojvzskv000j12n7ssyo3zn2', NULL, 200000.00, '2025-10-29 10:03:01.623', NULL, 2000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, NULL, 3000.00, NULL, NULL, NULL, 18000.00, NULL, '2026-04-29 10:03:01.644', '2026-04-29 10:03:01.644'),
('cmojvzslu002812n7iksf3p2l', 'LN202401004', 'RECURRING', 'ACTIVE', 'cmojvzskw000m12n7ndf728ei', NULL, 0.00, '2026-04-09 10:03:01.623', '2026-07-18 10:03:01.623', 0.00, NULL, NULL, NULL, NULL, 'DAILY', NULL, 100, 0.00, NULL, NULL, 200.00, 15.00, 23000.00, 4200.00, NULL, '2026-04-29 10:03:01.650', '2026-04-29 10:07:46.861'),
('cmojvzsm8005212n703x2jl0x', 'LN202401005', 'SIMPLE', 'ACTIVE', 'cmojvzskw000n12n76av68okc', NULL, 25000.00, '2026-03-04 10:03:01.623', NULL, 500.00, NULL, NULL, NULL, NULL, 'WEEKLY', 3000.00, 10, 100.00, 30000.00, NULL, NULL, NULL, NULL, 27100.00, 3000.00, '2026-04-29 10:03:01.664', '2026-04-29 10:05:47.697'),
('cmojvzsme005e12n76ewgema8', 'LN202401006', 'MONTHLY_INTEREST', 'ACTIVE', 'cmojvzskw000l12n76crorfhr', NULL, 100000.00, '2025-12-29 10:03:01.623', NULL, 1500.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, NULL, 1500.00, NULL, NULL, NULL, 6000.00, NULL, '2026-04-29 10:03:01.671', '2026-04-29 10:03:01.671');

-- --------------------------------------------------------

--
-- Table structure for table `loan_installments`
--

CREATE TABLE `loan_installments` (
  `id` varchar(191) NOT NULL,
  `loanId` varchar(191) NOT NULL,
  `installmentNo` int(11) NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('PENDING','PAID','OVERDUE','PARTIAL') NOT NULL DEFAULT 'PENDING',
  `paidAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `fineAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `paidDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loan_installments`
--

INSERT INTO `loan_installments` (`id`, `loanId`, `installmentNo`, `dueDate`, `amount`, `status`, `paidAmount`, `fineAmount`, `paidDate`, `createdAt`, `updatedAt`) VALUES
('cmojvzsl9000q12n7tfr49ml4', 'cmojvzsl4000p12n78ij9z2j6', 1, '2026-04-04 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-04 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000r12n76gvg9ujq', 'cmojvzsl4000p12n78ij9z2j6', 2, '2026-04-05 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-05 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000s12n7qqw6l437', 'cmojvzsl4000p12n78ij9z2j6', 3, '2026-04-06 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-06 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000t12n77uusw16p', 'cmojvzsl4000p12n78ij9z2j6', 4, '2026-04-07 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-07 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000u12n7ejptn0vd', 'cmojvzsl4000p12n78ij9z2j6', 5, '2026-04-08 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-08 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000v12n7pvy80lj6', 'cmojvzsl4000p12n78ij9z2j6', 6, '2026-04-09 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-09 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000w12n74ryvxl6m', 'cmojvzsl4000p12n78ij9z2j6', 7, '2026-04-10 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-10 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000x12n7b14i6xcd', 'cmojvzsl4000p12n78ij9z2j6', 8, '2026-04-11 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-11 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000y12n7xsd07prf', 'cmojvzsl4000p12n78ij9z2j6', 9, '2026-04-12 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-12 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9000z12n7w3tobsma', 'cmojvzsl4000p12n78ij9z2j6', 10, '2026-04-13 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-13 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001012n70x4fd3qh', 'cmojvzsl4000p12n78ij9z2j6', 11, '2026-04-14 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-14 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001112n7z3arrnmy', 'cmojvzsl4000p12n78ij9z2j6', 12, '2026-04-15 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-15 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001212n7kucr1b2c', 'cmojvzsl4000p12n78ij9z2j6', 13, '2026-04-16 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-16 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001312n7wafuxye5', 'cmojvzsl4000p12n78ij9z2j6', 14, '2026-04-17 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-17 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001412n76w5fzuca', 'cmojvzsl4000p12n78ij9z2j6', 15, '2026-04-18 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-18 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001512n77el8i33d', 'cmojvzsl4000p12n78ij9z2j6', 16, '2026-04-19 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-19 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001612n7q7y2fgpi', 'cmojvzsl4000p12n78ij9z2j6', 17, '2026-04-20 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-20 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001712n7ncdrvdmy', 'cmojvzsl4000p12n78ij9z2j6', 18, '2026-04-21 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-21 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001812n73lbnfgmg', 'cmojvzsl4000p12n78ij9z2j6', 19, '2026-04-22 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-22 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001912n78na9ruhp', 'cmojvzsl4000p12n78ij9z2j6', 20, '2026-04-23 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-23 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001a12n7ynmrfqpp', 'cmojvzsl4000p12n78ij9z2j6', 21, '2026-04-24 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-24 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001b12n7m3mvkbmv', 'cmojvzsl4000p12n78ij9z2j6', 22, '2026-04-25 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-25 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001c12n7a0ygqxp2', 'cmojvzsl4000p12n78ij9z2j6', 23, '2026-04-26 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-26 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001d12n7m6deov36', 'cmojvzsl4000p12n78ij9z2j6', 24, '2026-04-27 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-27 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001e12n7b3k2yeyg', 'cmojvzsl4000p12n78ij9z2j6', 25, '2026-04-28 10:03:01.623', 400.00, 'PAID', 400.00, 0.00, '2026-04-28 10:03:01.623', '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsl9001f12n7cibl8c0s', 'cmojvzsl4000p12n78ij9z2j6', 26, '2026-04-29 10:03:01.623', 400.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsla001g12n7os0i6wat', 'cmojvzsl4000p12n78ij9z2j6', 27, '2026-04-30 10:03:01.623', 400.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsla001h12n7l9jhxuma', 'cmojvzsl4000p12n78ij9z2j6', 28, '2026-05-01 10:03:01.623', 400.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsla001i12n7dziv7rv0', 'cmojvzsl4000p12n78ij9z2j6', 29, '2026-05-02 10:03:01.623', 400.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsla001j12n7az5dg7oa', 'cmojvzsl4000p12n78ij9z2j6', 30, '2026-05-03 10:03:01.623', 400.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.629', '2026-04-29 10:03:01.629'),
('cmojvzsll001m12n7liiusznx', 'cmojvzslf001l12n7a0zsif6c', 1, '2026-01-29 10:03:01.623', 5500.00, 'PAID', 5500.00, 0.00, '2026-01-29 10:03:01.623', '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001n12n7y9qwnm8a', 'cmojvzslf001l12n7a0zsif6c', 2, '2026-02-28 10:03:01.623', 5500.00, 'PAID', 5500.00, 0.00, '2026-02-28 10:03:01.623', '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001o12n7rb1lbk4p', 'cmojvzslf001l12n7a0zsif6c', 3, '2026-03-29 10:03:01.623', 5500.00, 'PAID', 5500.00, 0.00, '2026-03-29 10:03:01.623', '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001p12n7y8g9c7d7', 'cmojvzslf001l12n7a0zsif6c', 4, '2026-04-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001q12n7b9wvjyiu', 'cmojvzslf001l12n7a0zsif6c', 5, '2026-05-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001r12n7z4n59rkl', 'cmojvzslf001l12n7a0zsif6c', 6, '2026-06-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001s12n7j2zjp8iz', 'cmojvzslf001l12n7a0zsif6c', 7, '2026-07-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001t12n7xhcdyopt', 'cmojvzslf001l12n7a0zsif6c', 8, '2026-08-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001u12n78dty9z2r', 'cmojvzslf001l12n7a0zsif6c', 9, '2026-09-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001v12n7vyfwfttc', 'cmojvzslf001l12n7a0zsif6c', 10, '2026-10-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001w12n7s3k32rxx', 'cmojvzslf001l12n7a0zsif6c', 11, '2026-11-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzsll001x12n7tnzyl9w6', 'cmojvzslf001l12n7a0zsif6c', 12, '2026-12-29 10:03:01.623', 5500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.641', '2026-04-29 10:03:01.641'),
('cmojvzslr002012n7w34hf3yi', 'cmojvzslo001z12n7qmq80aoy', 1, '2025-10-29 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2025-10-29 10:03:01.623', '2026-04-29 10:03:01.647', '2026-04-29 10:03:01.647'),
('cmojvzslr002112n76ipehk1r', 'cmojvzslo001z12n7qmq80aoy', 2, '2025-11-29 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2025-11-29 10:03:01.623', '2026-04-29 10:03:01.647', '2026-04-29 10:03:01.647'),
('cmojvzslr002212n7jj2sdjm9', 'cmojvzslo001z12n7qmq80aoy', 3, '2025-12-29 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2025-12-29 10:03:01.623', '2026-04-29 10:03:01.647', '2026-04-29 10:03:01.647'),
('cmojvzslr002312n79mzltesx', 'cmojvzslo001z12n7qmq80aoy', 4, '2026-01-29 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-01-29 10:03:01.623', '2026-04-29 10:03:01.647', '2026-04-29 10:03:01.647'),
('cmojvzslr002412n7qk8kyj4v', 'cmojvzslo001z12n7qmq80aoy', 5, '2026-02-28 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-02-28 10:03:01.623', '2026-04-29 10:03:01.647', '2026-04-29 10:03:01.647'),
('cmojvzslr002512n7e9h476ei', 'cmojvzslo001z12n7qmq80aoy', 6, '2026-03-29 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-03-29 10:03:01.623', '2026-04-29 10:03:01.647', '2026-04-29 10:03:01.647'),
('cmojvzslr002612n7k3wae9au', 'cmojvzslo001z12n7qmq80aoy', 7, '2026-04-29 10:03:01.623', 3000.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.647', '2026-04-29 10:03:01.647'),
('cmojvzslz002912n7nyrnbvax', 'cmojvzslu002812n7iksf3p2l', 1, '2026-04-09 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-09 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002a12n7rxz9xvup', 'cmojvzslu002812n7iksf3p2l', 2, '2026-04-10 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-10 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002b12n7gvttsbgv', 'cmojvzslu002812n7iksf3p2l', 3, '2026-04-11 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-11 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002c12n76osbr4mo', 'cmojvzslu002812n7iksf3p2l', 4, '2026-04-12 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-12 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002d12n7bjfv536r', 'cmojvzslu002812n7iksf3p2l', 5, '2026-04-13 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-13 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002e12n7k6el75bv', 'cmojvzslu002812n7iksf3p2l', 6, '2026-04-14 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-14 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002f12n7rd9ytur0', 'cmojvzslu002812n7iksf3p2l', 7, '2026-04-15 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-15 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002g12n71o7g8wmd', 'cmojvzslu002812n7iksf3p2l', 8, '2026-04-16 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-16 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002h12n75bz0jso9', 'cmojvzslu002812n7iksf3p2l', 9, '2026-04-17 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-17 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002i12n7ali12t34', 'cmojvzslu002812n7iksf3p2l', 10, '2026-04-18 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-18 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002j12n76encljiv', 'cmojvzslu002812n7iksf3p2l', 11, '2026-04-19 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-19 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002k12n73vlvwd2c', 'cmojvzslu002812n7iksf3p2l', 12, '2026-04-20 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-20 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002l12n7s14io0p9', 'cmojvzslu002812n7iksf3p2l', 13, '2026-04-21 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-21 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002m12n7to15p0xq', 'cmojvzslu002812n7iksf3p2l', 14, '2026-04-22 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-22 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002n12n74sb5pzz4', 'cmojvzslu002812n7iksf3p2l', 15, '2026-04-23 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-23 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002o12n7q6qzgevj', 'cmojvzslu002812n7iksf3p2l', 16, '2026-04-24 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-24 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002p12n7h6agxgg1', 'cmojvzslu002812n7iksf3p2l', 17, '2026-04-25 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-25 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002q12n7edyskipk', 'cmojvzslu002812n7iksf3p2l', 18, '2026-04-26 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-26 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002r12n7nf6lde0y', 'cmojvzslu002812n7iksf3p2l', 19, '2026-04-27 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-27 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002s12n7vvyzcgiv', 'cmojvzslu002812n7iksf3p2l', 20, '2026-04-28 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-28 10:03:01.623', '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002t12n7haml8gb2', 'cmojvzslu002812n7iksf3p2l', 21, '2026-04-29 10:03:01.623', 200.00, 'PAID', 200.00, 0.00, '2026-04-29 10:07:46.858', '2026-04-29 10:03:01.655', '2026-04-29 10:07:46.859'),
('cmojvzslz002u12n7aqdkhpi4', 'cmojvzslu002812n7iksf3p2l', 22, '2026-04-30 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002v12n72x1zw63s', 'cmojvzslu002812n7iksf3p2l', 23, '2026-05-01 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002w12n7lf2d08l9', 'cmojvzslu002812n7iksf3p2l', 24, '2026-05-02 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002x12n7l4m40qjm', 'cmojvzslu002812n7iksf3p2l', 25, '2026-05-03 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002y12n7dlhv3gzq', 'cmojvzslu002812n7iksf3p2l', 26, '2026-05-04 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz002z12n71pyrwdum', 'cmojvzslu002812n7iksf3p2l', 27, '2026-05-05 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003012n7e5gufldx', 'cmojvzslu002812n7iksf3p2l', 28, '2026-05-06 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003112n7a9pmfzyf', 'cmojvzslu002812n7iksf3p2l', 29, '2026-05-07 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003212n7nl9yw0d0', 'cmojvzslu002812n7iksf3p2l', 30, '2026-05-08 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003312n7ploiszl1', 'cmojvzslu002812n7iksf3p2l', 31, '2026-05-09 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003412n7dfxonde2', 'cmojvzslu002812n7iksf3p2l', 32, '2026-05-10 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003512n7sl0wxmxh', 'cmojvzslu002812n7iksf3p2l', 33, '2026-05-11 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003612n7o588qem3', 'cmojvzslu002812n7iksf3p2l', 34, '2026-05-12 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003712n7q1zfe89a', 'cmojvzslu002812n7iksf3p2l', 35, '2026-05-13 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003812n7dwkpaxti', 'cmojvzslu002812n7iksf3p2l', 36, '2026-05-14 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003912n71abs57db', 'cmojvzslu002812n7iksf3p2l', 37, '2026-05-15 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003a12n78ivlwlhk', 'cmojvzslu002812n7iksf3p2l', 38, '2026-05-16 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003b12n7g1hozn01', 'cmojvzslu002812n7iksf3p2l', 39, '2026-05-17 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003c12n799nsd4qm', 'cmojvzslu002812n7iksf3p2l', 40, '2026-05-18 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003d12n73qxhcw4l', 'cmojvzslu002812n7iksf3p2l', 41, '2026-05-19 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003e12n7w2hrr43b', 'cmojvzslu002812n7iksf3p2l', 42, '2026-05-20 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003f12n7eofig6a0', 'cmojvzslu002812n7iksf3p2l', 43, '2026-05-21 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003g12n78wmjz1zn', 'cmojvzslu002812n7iksf3p2l', 44, '2026-05-22 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003h12n77pgoepux', 'cmojvzslu002812n7iksf3p2l', 45, '2026-05-23 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003i12n7ltejzpay', 'cmojvzslu002812n7iksf3p2l', 46, '2026-05-24 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003j12n7ll1tmwnu', 'cmojvzslu002812n7iksf3p2l', 47, '2026-05-25 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003k12n722sxowly', 'cmojvzslu002812n7iksf3p2l', 48, '2026-05-26 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003l12n7hlvaw9ca', 'cmojvzslu002812n7iksf3p2l', 49, '2026-05-27 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzslz003m12n743byg1s3', 'cmojvzslu002812n7iksf3p2l', 50, '2026-05-28 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003n12n7or10ti67', 'cmojvzslu002812n7iksf3p2l', 51, '2026-05-29 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003o12n70v7d2yl1', 'cmojvzslu002812n7iksf3p2l', 52, '2026-05-30 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003p12n79lrcyxkc', 'cmojvzslu002812n7iksf3p2l', 53, '2026-05-31 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003q12n70f4z7zky', 'cmojvzslu002812n7iksf3p2l', 54, '2026-06-01 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003r12n7od41f5sr', 'cmojvzslu002812n7iksf3p2l', 55, '2026-06-02 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003s12n7ni573c0y', 'cmojvzslu002812n7iksf3p2l', 56, '2026-06-03 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003t12n7be1aem13', 'cmojvzslu002812n7iksf3p2l', 57, '2026-06-04 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003u12n7nfseteom', 'cmojvzslu002812n7iksf3p2l', 58, '2026-06-05 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003v12n7ykfmlnhe', 'cmojvzslu002812n7iksf3p2l', 59, '2026-06-06 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003w12n7fapx6wx5', 'cmojvzslu002812n7iksf3p2l', 60, '2026-06-07 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003x12n7bwenc4n4', 'cmojvzslu002812n7iksf3p2l', 61, '2026-06-08 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003y12n791nd45px', 'cmojvzslu002812n7iksf3p2l', 62, '2026-06-09 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0003z12n701k4sr8n', 'cmojvzslu002812n7iksf3p2l', 63, '2026-06-10 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004012n70uvsl9v0', 'cmojvzslu002812n7iksf3p2l', 64, '2026-06-11 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004112n7sss2nxt3', 'cmojvzslu002812n7iksf3p2l', 65, '2026-06-12 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004212n78bb41ev1', 'cmojvzslu002812n7iksf3p2l', 66, '2026-06-13 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004312n7ta3ijwen', 'cmojvzslu002812n7iksf3p2l', 67, '2026-06-14 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004412n7be1uyikz', 'cmojvzslu002812n7iksf3p2l', 68, '2026-06-15 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004512n77p2f3jao', 'cmojvzslu002812n7iksf3p2l', 69, '2026-06-16 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004612n72fvxpqlx', 'cmojvzslu002812n7iksf3p2l', 70, '2026-06-17 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004712n7tkj0n1vh', 'cmojvzslu002812n7iksf3p2l', 71, '2026-06-18 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004812n7ecwqx9vw', 'cmojvzslu002812n7iksf3p2l', 72, '2026-06-19 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004912n7zgi4yjgb', 'cmojvzslu002812n7iksf3p2l', 73, '2026-06-20 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004a12n7vt6135jw', 'cmojvzslu002812n7iksf3p2l', 74, '2026-06-21 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004b12n7x6zgs6x1', 'cmojvzslu002812n7iksf3p2l', 75, '2026-06-22 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004c12n7olpjhbuo', 'cmojvzslu002812n7iksf3p2l', 76, '2026-06-23 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004d12n7zu3b1ffo', 'cmojvzslu002812n7iksf3p2l', 77, '2026-06-24 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004e12n7p4gd3tf5', 'cmojvzslu002812n7iksf3p2l', 78, '2026-06-25 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004f12n7cwtgnn13', 'cmojvzslu002812n7iksf3p2l', 79, '2026-06-26 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004g12n7q26fprkq', 'cmojvzslu002812n7iksf3p2l', 80, '2026-06-27 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004h12n79tk8eqgo', 'cmojvzslu002812n7iksf3p2l', 81, '2026-06-28 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004i12n7r74y6nu6', 'cmojvzslu002812n7iksf3p2l', 82, '2026-06-29 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004j12n7jdn799b9', 'cmojvzslu002812n7iksf3p2l', 83, '2026-06-30 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004k12n7epunsoly', 'cmojvzslu002812n7iksf3p2l', 84, '2026-07-01 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004l12n7zojkn6t5', 'cmojvzslu002812n7iksf3p2l', 85, '2026-07-02 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004m12n7w1vwv6eg', 'cmojvzslu002812n7iksf3p2l', 86, '2026-07-03 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004n12n7oonda4ft', 'cmojvzslu002812n7iksf3p2l', 87, '2026-07-04 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004o12n7r8ve5o4x', 'cmojvzslu002812n7iksf3p2l', 88, '2026-07-05 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004p12n7rm7m1hqy', 'cmojvzslu002812n7iksf3p2l', 89, '2026-07-06 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004q12n7vb6kcka0', 'cmojvzslu002812n7iksf3p2l', 90, '2026-07-07 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004r12n7088vo765', 'cmojvzslu002812n7iksf3p2l', 91, '2026-07-08 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004s12n71ygnfmad', 'cmojvzslu002812n7iksf3p2l', 92, '2026-07-09 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004t12n7detfd0d2', 'cmojvzslu002812n7iksf3p2l', 93, '2026-07-10 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004u12n7zt9ayxsg', 'cmojvzslu002812n7iksf3p2l', 94, '2026-07-11 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004v12n72t332qwh', 'cmojvzslu002812n7iksf3p2l', 95, '2026-07-12 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004w12n7wupvrcve', 'cmojvzslu002812n7iksf3p2l', 96, '2026-07-13 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004x12n7thb4w7an', 'cmojvzslu002812n7iksf3p2l', 97, '2026-07-14 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004y12n7eeourxua', 'cmojvzslu002812n7iksf3p2l', 98, '2026-07-15 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0004z12n7rhltb7bb', 'cmojvzslu002812n7iksf3p2l', 99, '2026-07-16 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsm0005012n70myjcjri', 'cmojvzslu002812n7iksf3p2l', 100, '2026-07-17 10:03:01.623', 200.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.655', '2026-04-29 10:03:01.655'),
('cmojvzsmc005312n741tfw3kf', 'cmojvzsm8005212n703x2jl0x', 1, '2026-03-04 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-03-04 10:03:01.623', '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmc005412n7o4v1np39', 'cmojvzsm8005212n703x2jl0x', 2, '2026-03-11 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-03-11 10:03:01.623', '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmc005512n73p5v1v5p', 'cmojvzsm8005212n703x2jl0x', 3, '2026-03-18 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-03-18 10:03:01.623', '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmc005612n7js715l3q', 'cmojvzsm8005212n703x2jl0x', 4, '2026-03-25 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-03-25 10:03:01.623', '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmc005712n70mvjwbi7', 'cmojvzsm8005212n703x2jl0x', 5, '2026-04-01 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-04-01 10:03:01.623', '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmc005812n7nai3d7d2', 'cmojvzsm8005212n703x2jl0x', 6, '2026-04-08 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-04-08 10:03:01.623', '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmc005912n7851ldsku', 'cmojvzsm8005212n703x2jl0x', 7, '2026-04-15 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-04-15 10:03:01.623', '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmc005a12n7fswsbojv', 'cmojvzsm8005212n703x2jl0x', 8, '2026-04-22 10:03:01.623', 3000.00, 'PAID', 3000.00, 0.00, '2026-04-22 10:03:01.623', '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmc005b12n741r4700e', 'cmojvzsm8005212n703x2jl0x', 9, '2026-04-29 10:03:01.623', 3000.00, 'PAID', 3000.00, 100.00, '2026-04-29 10:05:47.691', '2026-04-29 10:03:01.668', '2026-04-29 10:05:47.692'),
('cmojvzsmc005c12n7nyceo035', 'cmojvzsm8005212n703x2jl0x', 10, '2026-05-06 10:03:01.623', 3000.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.668', '2026-04-29 10:03:01.668'),
('cmojvzsmh005f12n7kpp5elys', 'cmojvzsme005e12n76ewgema8', 1, '2025-12-29 10:03:01.623', 1500.00, 'PAID', 1500.00, 0.00, '2025-12-29 10:03:01.623', '2026-04-29 10:03:01.673', '2026-04-29 10:03:01.673'),
('cmojvzsmh005g12n7jb1kzu8d', 'cmojvzsme005e12n76ewgema8', 2, '2026-01-29 10:03:01.623', 1500.00, 'PAID', 1500.00, 0.00, '2026-01-29 10:03:01.623', '2026-04-29 10:03:01.673', '2026-04-29 10:03:01.673'),
('cmojvzsmh005h12n708nlhpd2', 'cmojvzsme005e12n76ewgema8', 3, '2026-02-28 10:03:01.623', 1500.00, 'PAID', 1500.00, 0.00, '2026-02-28 10:03:01.623', '2026-04-29 10:03:01.673', '2026-04-29 10:03:01.673'),
('cmojvzsmh005i12n7p1u7kssq', 'cmojvzsme005e12n76ewgema8', 4, '2026-03-29 10:03:01.623', 1500.00, 'PAID', 1500.00, 0.00, '2026-03-29 10:03:01.623', '2026-04-29 10:03:01.673', '2026-04-29 10:03:01.673'),
('cmojvzsmh005j12n7s1erhxvp', 'cmojvzsme005e12n76ewgema8', 5, '2026-05-29 10:03:01.623', 1500.00, 'PENDING', 0.00, 0.00, NULL, '2026-04-29 10:03:01.673', '2026-04-29 10:03:01.673');

-- --------------------------------------------------------

--
-- Table structure for table `parties`
--

CREATE TABLE `parties` (
  `id` varchar(191) NOT NULL,
  `partyCode` varchar(191) NOT NULL,
  `customerId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `fatherName` varchar(191) DEFAULT NULL,
  `mobile1` varchar(191) NOT NULL,
  `mobile2` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `birthdate` datetime(3) DEFAULT NULL,
  `profileImage` varchar(191) DEFAULT NULL,
  `idProofType` varchar(191) DEFAULT NULL,
  `idProofNumber` varchar(191) DEFAULT NULL,
  `idProofImage` varchar(191) DEFAULT NULL,
  `addressProofType` varchar(191) DEFAULT NULL,
  `addressProofNumber` varchar(191) DEFAULT NULL,
  `addressProofImage` varchar(191) DEFAULT NULL,
  `area` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `state` varchar(191) DEFAULT NULL,
  `pincode` varchar(191) DEFAULT NULL,
  `pan` varchar(191) DEFAULT NULL,
  `aadhaar` varchar(191) DEFAULT NULL,
  `voterId` varchar(191) DEFAULT NULL,
  `occupation` varchar(191) DEFAULT NULL,
  `loanLimit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `agentId` varchar(191) DEFAULT NULL,
  `guarantor1Name` varchar(191) DEFAULT NULL,
  `guarantor1Mobile` varchar(191) DEFAULT NULL,
  `guarantor1Relation` varchar(191) DEFAULT NULL,
  `guarantor1Address` varchar(191) DEFAULT NULL,
  `guarantor1Pan` varchar(191) DEFAULT NULL,
  `guarantor1Aadhaar` varchar(191) DEFAULT NULL,
  `guarantor1VoterId` varchar(191) DEFAULT NULL,
  `guarantor2Name` varchar(191) DEFAULT NULL,
  `guarantor2Mobile` varchar(191) DEFAULT NULL,
  `guarantor2Relation` varchar(191) DEFAULT NULL,
  `guarantor2Address` varchar(191) DEFAULT NULL,
  `guarantor2Pan` varchar(191) DEFAULT NULL,
  `guarantor2Aadhaar` varchar(191) DEFAULT NULL,
  `guarantor2VoterId` varchar(191) DEFAULT NULL,
  `bankName` varchar(191) DEFAULT NULL,
  `bankIfsc` varchar(191) DEFAULT NULL,
  `bankAccountNo` varchar(191) DEFAULT NULL,
  `bankAccountHolder` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `parties`
--

INSERT INTO `parties` (`id`, `partyCode`, `customerId`, `name`, `fatherName`, `mobile1`, `mobile2`, `email`, `gender`, `birthdate`, `profileImage`, `idProofType`, `idProofNumber`, `idProofImage`, `addressProofType`, `addressProofNumber`, `addressProofImage`, `area`, `city`, `state`, `pincode`, `pan`, `aadhaar`, `voterId`, `occupation`, `loanLimit`, `balance`, `remarks`, `agentId`, `guarantor1Name`, `guarantor1Mobile`, `guarantor1Relation`, `guarantor1Address`, `guarantor1Pan`, `guarantor1Aadhaar`, `guarantor1VoterId`, `guarantor2Name`, `guarantor2Mobile`, `guarantor2Relation`, `guarantor2Address`, `guarantor2Pan`, `guarantor2Aadhaar`, `guarantor2VoterId`, `bankName`, `bankIfsc`, `bankAccountNo`, `bankAccountHolder`, `createdAt`, `updatedAt`) VALUES
('cmojvzsku000d12n7knnl5hn1', 'PC002', 'CUST0002', 'Sunita Devi', 'Rajendra Prasad', '9712345678', NULL, NULL, 'FEMALE', '1990-03-22 00:00:00.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Civil Lines', 'Bulandshahr', 'Uttar Pradesh', '203001', 'FGHIJ5678K', '2345-6789-0123', NULL, 'Homemaker', 200000.00, 0.00, NULL, 'cmojvzske000212n7gdeiteoj', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Punjab National Bank', 'PUNB0123456', '20234567890', 'Sunita Devi', '2026-04-29 10:03:01.613', '2026-04-29 10:03:01.613'),
('cmojvzskv000j12n7ssyo3zn2', 'PC003', 'CUST0003', 'Ajay Gupta', 'Vijay Gupta', '9723456789', NULL, 'ajay.gupta@yahoo.com', 'MALE', '1978-11-08 00:00:00.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Model Town', 'Delhi', 'Delhi', '110009', 'LMNOP9012Q', '3456-7890-1234', NULL, 'Shopkeeper', 1000000.00, 0.00, NULL, 'cmojvzskh000312n7klpttcdx', 'Sanjay Gupta', '9723456780', 'Father', 'Model Town, Delhi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'HDFC Bank', 'HDFC0001234', '30345678901', 'Ajay Gupta', '2026-04-29 10:03:01.613', '2026-04-29 10:03:01.613'),
('cmojvzskv000k12n7baf2hb68', 'PC001', 'CUST0001', 'Ramesh Verma', 'Suresh Verma', '9701234567', '9701234568', 'ramesh.verma@gmail.com', 'MALE', '1985-06-15 00:00:00.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sector 12', 'Noida', 'Uttar Pradesh', '201301', 'ABCDE1234F', '1234-5678-9012', NULL, 'Small Business Owner', 500000.00, 0.00, NULL, 'cmojvzske000212n7gdeiteoj', 'Mohan Verma', '9701234569', 'Brother', 'Sector 12, Noida', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'State Bank of India', 'SBIN0001234', '10123456789', 'Ramesh Verma', '2026-04-29 10:03:01.613', '2026-04-29 10:03:01.613'),
('cmojvzskw000l12n76crorfhr', 'PC006', 'CUST0006', 'Kavita Sharma', 'Gopal Sharma', '9756789012', NULL, 'kavita.sharma@gmail.com', 'FEMALE', '1988-09-12 00:00:00.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Gandhinagar', 'Ahmedabad', 'Gujarat', '382010', 'DEFGH2345I', '6789-0123-4567', NULL, 'Nurse', 400000.00, 0.00, NULL, 'cmojvzskj000412n7a52pitjk', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ICICI Bank', 'ICIC0001234', '60678901234', 'Kavita Sharma', '2026-04-29 10:03:01.613', '2026-04-29 10:03:01.613'),
('cmojvzskw000m12n7ndf728ei', 'PC004', 'CUST0004', 'Meena Kumari', 'Ratan Lal', '9734567890', NULL, NULL, 'FEMALE', '1992-07-18 00:00:00.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Lalbagh', 'Lucknow', 'Uttar Pradesh', '226001', 'RSTUV3456W', '4567-8901-2345', NULL, 'Teacher', 300000.00, 0.00, NULL, 'cmojvzskh000312n7klpttcdx', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Bank of Baroda', 'BARB0LUCKNW', '40456789012', 'Meena Kumari', '2026-04-29 10:03:01.613', '2026-04-29 10:03:01.613'),
('cmojvzskw000n12n76av68okc', 'PC005', 'CUST0005', 'Dinesh Yadav', 'Mahesh Yadav', '9745678901', NULL, NULL, 'MALE', '1982-01-25 00:00:00.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Vaishali Nagar', 'Jaipur', 'Rajasthan', '302021', 'XYZAB7890C', '5678-9012-3456', NULL, 'Farmer', 250000.00, 0.00, NULL, 'cmojvzskj000412n7a52pitjk', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Axis Bank', 'UTIB0001234', '50567890123', 'Dinesh Yadav', '2026-04-29 10:03:01.613', '2026-04-29 10:03:01.613');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(191) NOT NULL,
  `receiptNumber` varchar(191) NOT NULL,
  `loanId` varchar(191) NOT NULL,
  `installmentId` varchar(191) DEFAULT NULL,
  `agentId` varchar(191) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `fineAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalAmount` decimal(15,2) NOT NULL,
  `paymentDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `paymentMode` varchar(191) NOT NULL DEFAULT 'CASH',
  `notes` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `receiptNumber`, `loanId`, `installmentId`, `agentId`, `amount`, `fineAmount`, `totalAmount`, `paymentDate`, `paymentMode`, `notes`, `createdAt`, `updatedAt`) VALUES
('cmojvzsmp005k12n7kso27tyd', 'RCP000001', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000q12n7tfr49ml4', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-04 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmp005l12n7psjxzg16', 'RCP000003', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000r12n76gvg9ujq', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-05 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmp005m12n7wq0qdu1c', 'RCP000005', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000s12n7qqw6l437', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-06 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmp005n12n7onnp87o6', 'RCP000007', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000t12n77uusw16p', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-07 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmp005o12n7bipe5aey', 'RCP000009', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000u12n7ejptn0vd', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-08 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmp005p12n7kntqrp6b', 'RCP000011', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000v12n7pvy80lj6', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-09 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmp005q12n7jx9pz85z', 'RCP000013', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000w12n74ryvxl6m', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-10 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmp005r12n7lun36r6e', 'RCP000015', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000x12n7b14i6xcd', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-11 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmp005s12n7hkwqmfbp', 'RCP000017', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000y12n7xsd07prf', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-12 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq005t12n78u6vbzuf', 'RCP000019', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9000z12n7w3tobsma', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-13 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq005u12n7ovy3zxj5', 'RCP000021', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001012n70x4fd3qh', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-14 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq005v12n75yfnfeqa', 'RCP000023', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001112n7z3arrnmy', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-15 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq005w12n7o8xp982n', 'RCP000025', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001212n7kucr1b2c', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-16 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq005x12n7hdjrpv6b', 'RCP000027', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001312n7wafuxye5', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-17 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq005y12n7rdpubd6z', 'RCP000029', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001412n76w5fzuca', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-18 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq005z12n7ckl39dss', 'RCP000031', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001512n77el8i33d', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-19 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq006012n756radgti', 'RCP000033', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001612n7q7y2fgpi', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-20 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq006112n7sfkugt5a', 'RCP000035', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001712n7ncdrvdmy', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-21 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq006212n79s7h2tsj', 'RCP000037', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001812n73lbnfgmg', 'cmojvzske000212n7gdeiteoj', 400.00, 0.00, 400.00, '2026-04-22 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojvzsmq006312n7qejlnbox', 'RCP000039', 'cmojvzsl4000p12n78ij9z2j6', 'cmojvzsl9001912n78na9ruhp', 'cmojvzskh000312n7klpttcdx', 400.00, 0.00, 400.00, '2026-04-23 10:03:01.623', 'CASH', 'Payment collected at door', '2026-04-29 10:03:01.682', '2026-04-29 10:03:01.682'),
('cmojw3cq10003eh2yhlaxbllc', 'RCP57147688', 'cmojvzsm8005212n703x2jl0x', 'cmojvzsmc005b12n741r4700e', 'cmojvzsjy000012n74qdet1om', 3000.00, 100.00, 3100.00, '2026-04-29 00:00:00.000', 'CASH', '', '2026-04-29 10:05:47.689', '2026-04-29 10:05:47.689'),
('cmojw5wo80007eh2yeijdpctm', 'RCP57266855', 'cmojvzslu002812n7iksf3p2l', 'cmojvzslz002t12n7haml8gb2', 'cmojvzsjy000012n74qdet1om', 200.00, 0.00, 200.00, '2026-04-29 00:00:00.000', 'CASH', '', '2026-04-29 10:07:46.856', '2026-04-29 10:07:46.856');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `key`, `value`, `createdAt`, `updatedAt`) VALUES
('cmojvzskn000512n7se468v1r', 'company_name', 'MicroFinance Pro', '2026-04-29 10:03:01.607', '2026-04-29 10:15:15.599'),
('cmojvzskn000612n7dgpnvd23', 'company_address', 'Finance Street, Mumbai, Maharashtra 400001', '2026-04-29 10:03:01.607', '2026-04-29 10:15:15.599'),
('cmojvzskn000712n7glw2rnqc', 'company_phone', '1800-123-4567', '2026-04-29 10:03:01.607', '2026-04-29 10:15:15.599'),
('cmojvzskn000812n7sklmbqd9', 'company_email', 'info@microfinancepro.com', '2026-04-29 10:03:01.607', '2026-04-29 10:15:15.599'),
('cmojvzskn000912n769cmwoww', 'currency', '₹', '2026-04-29 10:03:01.607', '2026-04-29 10:15:15.600'),
('cmojvzskn000a12n7fmm9qzz7', 'smtp_host', 'smtp.gmail.com', '2026-04-29 10:03:01.607', '2026-04-29 10:15:15.599'),
('cmojvzskn000b12n7xc7gtxjj', 'smtp_port', '587', '2026-04-29 10:03:01.607', '2026-04-29 10:15:15.599');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('ADMIN','SUB_ADMIN','AGENT','USER') NOT NULL DEFAULT 'USER',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `profileImage` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `agentCode` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `isActive`, `profileImage`, `phone`, `agentCode`, `createdAt`, `updatedAt`) VALUES
('cmojvzsjy000012n74qdet1om', 'Super Admin', 'admin@example.com', '$2a$12$33g8wo8z7Y7xYyDMuvs3DefF3oiHAwHEBmGqr41KJNC.HXCtbqvgO', 'ADMIN', 1, NULL, '9800000001', NULL, '2026-04-29 10:03:01.582', '2026-04-29 10:03:01.582'),
('cmojvzsk8000112n78pm3uwhr', 'Rajan Sharma', 'subadmin@example.com', '$2a$12$33g8wo8z7Y7xYyDMuvs3DefF3oiHAwHEBmGqr41KJNC.HXCtbqvgO', 'SUB_ADMIN', 1, NULL, '9800000002', NULL, '2026-04-29 10:03:01.592', '2026-04-29 10:03:01.592'),
('cmojvzske000212n7gdeiteoj', 'Vikram Singh', 'agent1@example.com', '$2a$12$33g8wo8z7Y7xYyDMuvs3DefF3oiHAwHEBmGqr41KJNC.HXCtbqvgO', 'AGENT', 1, NULL, '9811111111', 'AGT001', '2026-04-29 10:03:01.599', '2026-04-29 10:03:01.599'),
('cmojvzskh000312n7klpttcdx', 'Priya Patel', 'agent2@example.com', '$2a$12$33g8wo8z7Y7xYyDMuvs3DefF3oiHAwHEBmGqr41KJNC.HXCtbqvgO', 'AGENT', 1, NULL, '9822222222', 'AGT002', '2026-04-29 10:03:01.602', '2026-04-29 10:03:01.602'),
('cmojvzskj000412n7a52pitjk', 'Suresh Kumar', 'agent3@example.com', '$2a$12$33g8wo8z7Y7xYyDMuvs3DefF3oiHAwHEBmGqr41KJNC.HXCtbqvgO', 'AGENT', 1, NULL, '9833333333', 'AGT003', '2026-04-29 10:03:01.604', '2026-04-29 10:03:01.604');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_userId_fkey` (`userId`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loans_loanNumber_key` (`loanNumber`),
  ADD KEY `loans_partyId_fkey` (`partyId`);

--
-- Indexes for table `loan_installments`
--
ALTER TABLE `loan_installments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_installments_loanId_fkey` (`loanId`);

--
-- Indexes for table `parties`
--
ALTER TABLE `parties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `parties_partyCode_key` (`partyCode`),
  ADD UNIQUE KEY `parties_customerId_key` (`customerId`),
  ADD KEY `parties_agentId_fkey` (`agentId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_receiptNumber_key` (`receiptNumber`),
  ADD KEY `payments_loanId_fkey` (`loanId`),
  ADD KEY `payments_installmentId_fkey` (`installmentId`),
  ADD KEY `payments_agentId_fkey` (`agentId`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `system_settings_key_key` (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_agentCode_key` (`agentCode`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `loans_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `parties` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `loan_installments`
--
ALTER TABLE `loan_installments`
  ADD CONSTRAINT `loan_installments_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `parties`
--
ALTER TABLE `parties`
  ADD CONSTRAINT `parties_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_installmentId_fkey` FOREIGN KEY (`installmentId`) REFERENCES `loan_installments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
