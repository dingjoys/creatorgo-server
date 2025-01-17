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
 

drop table if exists nft_transfer_2;
 CREATE TABLE `nft_transfer_2` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `from` binary(20) DEFAULT NULL,
  `to` binary(20) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `block_number` int DEFAULT '0',
  `hash` binary(32) DEFAULT NULL,
  `contract` binary(20) DEFAULT NULL,
  `token_id` varbinary(32) DEFAULT NULL,
  `amount` int,
  `log_index` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY contract_log (`hash`, log_index),
  KEY `index_from` (`from`),
  KEY `index_to` (`to`),
  KEY `index_contract` (`contract`),
  KEY `index_block_number`(`block_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

drop table if exists nft_contract_metadata;
CREATE TABLE `nft_contract_metadata` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract` binary(20) DEFAULT NULL,
  `name` varchar(255),
  `owner` binary(20),
  `metadataUrl` text,
  `supply` int,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY index_contract (`contract`),
  KEY `index_owner` (`owner`),
  KEY `index_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

drop table if exists nft_token_metadata;
CREATE TABLE `nft_token_metadata` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract` binary(20) DEFAULT NULL,
  `token_id` varbinary(32),
  `name` varchar(255),
  `metadataUrl` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY index_contract (`contract`, `token_id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


drop table if exists nft_mint_data;
CREATE TABLE `nft_mint_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract` binary(20) DEFAULT NULL,
  `mint_count` int,
  `max_token_id` bigint,
  `total_amount` int,
  `trace_id` bigint,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE `index_contract` (`contract`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table creator (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` binary(20) DEFAULT NULL,
  
  `score` int,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE `creator_address` (`address`)
);