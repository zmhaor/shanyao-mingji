-- 为 study_progress 表添加 custom_groups 字段
-- 用于存储自定义背诵组数据

ALTER TABLE `study_progress` 
ADD COLUMN `custom_groups` LONGTEXT NULL COMMENT 'JSON 格式的自定义背诵组数据' AFTER `hidden_map`;
