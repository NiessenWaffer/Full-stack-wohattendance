USE woh_attendance;

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admins'
    AND COLUMN_NAME = 'role'
);

SET @sql = IF(@col_exists = 0,
  "ALTER TABLE admins ADD COLUMN role ENUM('admin','worker') NOT NULL DEFAULT 'admin' AFTER display_name",
  "SELECT 'role column already exists'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET SQL_SAFE_UPDATES = 0;
UPDATE admins SET role = 'admin' WHERE role IS NULL OR role = '';
SET SQL_SAFE_UPDATES = 1;
