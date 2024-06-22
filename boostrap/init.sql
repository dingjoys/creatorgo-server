drop table if exists proposals;
CREATE TABLE `proposals` (
  `id` int auto_increment primary key,
  `space` varchar(128),
  `author` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `body` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `choices` json NOT NULL,
  `start` int NOT NULL,
  `end` int NOT NULL,
  `strategies` json,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

drop table if exists votings;
CREATE TABLE `votings` (
  `id` int auto_increment primary key,
  `proposal_id` int not null, 
  `voter` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `choice` json NOT NULL,
  `msg` text,
  `sig` text,
  due bigint,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  UNIQUE KEY unique_key_name (voter, proposal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
 