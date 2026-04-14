USE woh_attendance;

CREATE TABLE IF NOT EXISTS members (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  first_name           VARCHAR(100) NOT NULL,
  last_name            VARCHAR(100) NOT NULL,
  ministry             ENUM('Multimedia','Praise and Worship','Medical','Children','Young Professional','Pastor','Youth Alive') NOT NULL,
  status               ENUM('visitor','active') NOT NULL DEFAULT 'visitor',
  first_attendance_date DATE NULL,
  qr_code              VARCHAR(255) NOT NULL UNIQUE,
  registered_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);
