USE woh_attendance;

CREATE TABLE IF NOT EXISTS admins (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role         ENUM('admin', 'worker') NOT NULL DEFAULT 'admin'
);

SET SQL_SAFE_UPDATES = 0;
DELETE FROM admins WHERE display_name = '' OR display_name IS NULL;
SET SQL_SAFE_UPDATES = 1;

INSERT IGNORE INTO admins (email, password, display_name, role)
VALUES ('admin@wordofhope.org', '$2a$10$1oneuJdzCIypzZPKI99eSubXUSnDWxulNNURwcHbstja/iSYVlY9.', 'Admin', 'admin');
