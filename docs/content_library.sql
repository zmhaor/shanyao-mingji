-- Ensure database charset uses utf8mb4 before running the DDL.
-- ALTER DATABASE `your_database_name` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `content_collections` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NOT NULL DEFAULT '',
  `item_schema` JSON NULL,
  `version` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_published_at` BIGINT NULL DEFAULT NULL,
  `create_time` BIGINT NOT NULL,
  `update_time` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_content_collections_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `content_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `collection_id` INT NOT NULL,
  `item_key` VARCHAR(100) NOT NULL DEFAULT '',
  `title` VARCHAR(255) NOT NULL DEFAULT '',
  `chapter` VARCHAR(255) NOT NULL DEFAULT '',
  `section` VARCHAR(255) NOT NULL DEFAULT '',
  `group_name` VARCHAR(255) NOT NULL DEFAULT '',
  `level` INT NULL DEFAULT NULL,
  `clause_num` VARCHAR(50) NOT NULL DEFAULT '',
  `textbook_order` INT NULL DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `content_json` JSON NOT NULL,
  `search_text` LONGTEXT NOT NULL,
  `create_time` BIGINT NOT NULL,
  `update_time` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_content_items_collection_item_key` (`collection_id`, `item_key`),
  KEY `idx_content_items_collection_id` (`collection_id`),
  KEY `idx_content_items_status` (`status`),
  KEY `idx_content_items_sort_order` (`sort_order`),
  KEY `idx_content_items_textbook_order` (`textbook_order`),
  KEY `idx_content_items_title` (`title`),
  CONSTRAINT `fk_content_items_collection`
    FOREIGN KEY (`collection_id`) REFERENCES `content_collections` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `content_collections`
(`key`, `name`, `description`, `version`, `is_active`, `last_published_at`, `create_time`, `update_time`)
VALUES
('shanghan', 'Shanghan', 'Shanghan content library', 1, 1, NULL, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('fangji', 'Fangji', 'Fangji content library', 1, 1, NULL, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('neijing', 'Neijing', 'Neijing content library', 1, 1, NULL, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('zhongyao', 'Zhongyao', 'Zhongyao content library', 1, 1, NULL, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('jinkui', 'Jinkui', 'Jinkui content library', 1, 1, NULL, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('wenbing', 'Wenbing', 'Wenbing content library', 1, 1, NULL, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE
`name` = VALUES(`name`),
`description` = VALUES(`description`),
`is_active` = VALUES(`is_active`),
`update_time` = VALUES(`update_time`);
